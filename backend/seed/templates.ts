import db from "../src/db/pgClient";
import logger from "../src/utils/logger";

const emailTemplates = [
  {
    name: "Welcome Email",
    subject: "Welcome to {{company_name}}, {{name}}!",
    body: `
<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; background-color: #f7f9fc; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; padding: 24px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
      h1 { color: #333333; font-size: 22px; }
      p { color: #555555; line-height: 1.5; }
      .btn { display: inline-block; background: #4f46e5; color: #fff; padding: 10px 18px; border-radius: 6px; text-decoration: none; margin-top: 16px; }
      .footer { font-size: 12px; color: #999999; margin-top: 24px; text-align: center; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Welcome, {{name}} 🎉</h1>
      <p>We’re excited to have you at <b>{{company_name}}</b>. Get ready to explore our platform and start your journey with us!</p>
      <a href="{{login_url}}" class="btn">Get Started</a>
      <div class="footer">If you did not sign up, you can ignore this email.</div>
    </div>
  </body>
</html>
    `
  },
  {
    name: "Password Reset",
    subject: "Reset Your Password",
    body: `
<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; background: #f7f9fc; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 20px auto; background: #ffffff; padding: 24px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
      h1 { font-size: 20px; color: #333333; }
      p { color: #555555; line-height: 1.5; }
      .btn { display: inline-block; background: #dc2626; color: #fff; padding: 10px 18px; border-radius: 6px; text-decoration: none; margin-top: 16px; }
      .footer { font-size: 12px; color: #999999; margin-top: 24px; text-align: center; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Password Reset Requested</h1>
      <p>Hello {{name}}, we received a request to reset your password.</p>
      <a href="{{reset_link}}" class="btn">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
      <div class="footer">This link will expire in 1 hour.</div>
    </div>
  </body>
</html>
    `
  },
  {
    name: "Newsletter",
    subject: "Your Weekly Newsletter from {{company_name}}",
    body: `
<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; background: #fafafa; margin: 0; padding: 0; }
      .container { max-width: 700px; margin: 20px auto; background: #ffffff; padding: 24px; border-radius: 8px; }
      h1 { font-size: 24px; color: #111827; }
      h2 { font-size: 18px; color: #374151; margin-top: 20px; }
      p { color: #4b5563; line-height: 1.6; }
      .footer { font-size: 12px; color: #9ca3af; margin-top: 24px; text-align: center; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Hello {{name}},</h1>
      <p>Here are the latest updates from <b>{{company_name}}</b>:</p>
      <div>{{newsletter_content}}</div>
      <div class="footer">You’re receiving this because you subscribed to {{company_name}}’s newsletter.</div>
    </div>
  </body>
</html>
    `
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
