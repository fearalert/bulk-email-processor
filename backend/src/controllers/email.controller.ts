import type { Response } from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';
import { EmailService } from '../services/email.service';
import type { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/errors';

const upload = multer({ 
  dest: 'uploads/', 
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE) || 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'text/csv',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/octet-stream'
    ];
    
    const allowedExtensions = ['.csv', '.txt', '.xls', '.xlsx'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV, TXT, XLS, and XLSX files are allowed.'));
    }
  }
});

const emailService = EmailService.getInstance();

export class EmailController {
  private static instance: EmailController;

  private constructor() {}

  public static getInstance(): EmailController {
    if (!EmailController.instance) {
      EmailController.instance = new EmailController();
    }
    return EmailController.instance;
  }

  public uploadMiddleware = upload.single('file');

  private parseEmailsFromFile(filePath: string, originalName: string): string[] {
    const fileExt = path.extname(originalName).toLowerCase();
    logger.debug(`Parsing emails from file`, `filePath=${filePath}, extension=${fileExt}`);

    try {
      switch (fileExt) {
        case '.xlsx':
        case '.xls':
          return this.parseExcelFile(filePath);
        
        case '.csv':
          return this.parseCsvFile(filePath);
        
        case '.txt':
        default:
          return this.parseTextFile(filePath);
      }
    } catch (err: any) {
      logger.error(`Failed to parse file`, `filePath=${filePath}, extension=${fileExt}, error=${err.message || err}`);
      throw new AppError(`Failed to parse ${fileExt} file: ${err.message}`, 400);
    }
  }

  private parseExcelFile(filePath: string): string[] {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]!];
    if (!sheet) {
      throw new AppError('Excel file appears to be empty or corrupted', 400);
    }

    const rows: { [key: string]: any }[] = xlsx.utils.sheet_to_json(sheet);
    
    const emailColumns = ['email', 'Email', 'EMAIL', 'e-mail', 'E-mail', 'mail'];
    let emails: string[] = [];

    for (const colName of emailColumns) {
      emails = rows
        .map(row => row[colName])
        .filter((email): email is string => typeof email === 'string' && email.trim().length > 0);
      
      if (emails.length > 0) break;
    }

    if (emails.length === 0) {
      emails = rows.flatMap(row => 
        Object.values(row)
          .filter((value): value is string => typeof value === 'string')
          .filter(value => value.includes('@'))
      );
    }

    return emails;
  }

  private parseCsvFile(filePath: string): string[] {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]!];
    if (!sheet) {
      throw new AppError('CSV file appears to be empty or corrupted', 400);
    }

    const rows: { [key: string]: any }[] = xlsx.utils.sheet_to_json(sheet);
    
    const emailColumns = ['email', 'Email', 'EMAIL', 'e-mail', 'E-mail', 'mail'];
    let emails: string[] = [];

    for (const colName of emailColumns) {
      emails = rows
        .map(row => row[colName])
        .filter((email): email is string => typeof email === 'string' && email.trim().length > 0);
      
      if (emails.length > 0) break;
    }

    if (emails.length === 0) {
      emails = rows.flatMap(row => 
        Object.values(row)
          .filter((value): value is string => typeof value === 'string')
          .filter(value => value.includes('@'))
      );
    }

    return emails;
  }

  private parseTextFile(filePath: string): string[] {
    const content = fs.readFileSync(filePath, 'utf8');
    
    const lines = content.split(/[\r\n,;|\t]+/);
    const emails = lines
      .map(line => line.trim())
      .filter(line => line.length > 0 && line.includes('@'));

    return emails;
  }

  private parseEmailsFromText(text: string): string[] {
    const emails = text
      .split(/[\s,;|\n\r\t]+/)
      .map(email => email.trim())
      .filter(email => email.length > 0 && email.includes('@'));
    
    return emails;
  }

  public async sendBulkEmails(req: AuthRequest, res: Response) {
    let filePath: string | undefined;

    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const userId = req.user.userId;
      const templateId = Number(req.body.templateId);
      const subject = req.body.subject;
      const body = req.body.body;
      const plainTextEmails = req.body.emails;

      let emails: string[] = [];

      if (plainTextEmails && typeof plainTextEmails === 'string' && plainTextEmails.trim()) {
        logger.info(`Processing plain text emails`, `userId=${userId}, textLength=${plainTextEmails.length}`);
        emails = this.parseEmailsFromText(plainTextEmails);
      }
      else if (req.file) {
        filePath = req.file.path;
        const originalName = req.file.originalname;
        logger.info(`Processing bulk email file`, `userId=${userId}, fileName=${originalName}, fileSize=${req.file.size}`);
        emails = this.parseEmailsFromFile(filePath, originalName);
      }
      else {
        throw new AppError('Either file upload (CSV, TXT, XLS, XLSX) or plain text emails are required', 400);
      }

      if (emails.length === 0) {
        throw new AppError('No valid emails found. Make sure to provide valid email addresses.', 400);
      }

      const result = await emailService.queueBulkEmails(userId, emails, templateId, subject, body);

      res.status(200).json({
        message: 'Emails queued successfully',
        total: result.total,
        valid: result.valid,
        invalidEmails: result.invalid,
        source: plainTextEmails ? 'text' : 'file'
      });

    } catch (err: any) {
      logger.error(`Failed bulk email`, `userId=${req.user?.userId}, error=${err.message || err}`);
      res.status(err.statusCode || 500).json({ 
        error: err.message || 'Failed to queue emails' 
      });
    } finally {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) {
            logger.error(`Failed to delete uploaded file`, `filePath=${filePath}, error=${err.message || err}`);
          } else {
            logger.debug(`Uploaded file deleted`, `filePath=${filePath}`);
          }
        });
      }
    }
  }

  public async getLogs(req: AuthRequest, res: Response) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const userId = Number(req.params.userId);
      if (isNaN(userId)) throw new AppError('Invalid userId', 400);

      const logs = await emailService.getLogs(userId);
      res.status(200).json(logs);

    } catch (err: any) {
      logger.error(`Failed to fetch email logs`, `userId=${req.params.userId}, error=${err.message || err}`);
      res.status(err.statusCode || 500).json({ 
        error: err.message || 'Failed to fetch logs' 
      });
    }
  }

  public async getTemplates(req: AuthRequest, res: Response) {
  try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const templates = await emailService.getAllTemplates();
      res.status(200).json({ templates });
      } catch (err: any) {
        logger.error(`Failed to fetch templates`, `userId=${req.user?.userId}, error=${err.message || err}`);
        res.status(err.statusCode || 500).json({ error: err.message || 'Failed to fetch templates' });
      }
    }

}