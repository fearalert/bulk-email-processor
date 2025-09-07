import db from "../src/db/pgClient";
import logger from "../src/utils/logger";

const emailTemplates = [
  {
    name: "Welcome Email",
    subject: "Welcome to {{company_name}}, {{name}}!",
    body: `Hi {{name}},\n\nThank you for joining {{company_name}}. We're excited to have you on board!\n\nBest regards,\nThe {{company_name}} Team`
  },
  {
    name: "Password Reset",
    subject: "Reset Your Password",
    body: `Click the link below to reset your password: {{reset_link}}`
  },
  {
    name: "Newsletter",
    subject: "Your Weekly Newsletter from {{company_name}}",
    body: `This is a placeholder for the newsletter template. Customize it as needed.`
  }
];

(async () => {
  try {
    for (const template of emailTemplates) {
      const existing = await db.query(
        "SELECT id FROM email_templates WHERE name=$1",
        [template.name]
      );

      if (existing.rows.length === 0) {
        await db.query(
          "INSERT INTO email_templates (name, subject, body) VALUES ($1, $2, $3)",
          [template.name, template.subject, template.body]
        );
        logger.info(`Seeded template: ${template.name}`);
      } else {
        logger.debug(`Template already exists: ${template.name}`);
      }
    }
    process.exit(0);
  } catch (err: any) {
    logger.error(`Template seeding failed`, `error=${err.message || err}`);
    process.exit(1);
  }
})();
