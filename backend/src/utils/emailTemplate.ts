export const getVerificationEmailTemplate = (verificationLink: string, email: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Bulk Email Service</title>
     <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .logo {
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            backdrop-filter: blur(10px);
        }
        
        .logo svg {
            width: 30px;
            height: 30px;
            fill: white;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 300;
        }
        
        .content {
            padding: 50px 40px;
            text-align: center;
        }
        
        .welcome-text {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 16px;
        }
        
        .description {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 40px;
            line-height: 1.8;
        }
        
        .verify-button {
            display: inline-block;
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            text-decoration: none;
            padding: 16px 40px;
            border-radius: 50px;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 10px 25px rgba(79, 70, 229, 0.3);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .verify-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 35px rgba(79, 70, 229, 0.4);
        }
        
        .alternative-link {
            margin-top: 40px;
            padding: 20px;
            background: #f9fafb;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
        }
        
        .alternative-link p {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 12px;
        }
        
        .link-text {
            font-size: 12px;
            color: #4f46e5;
            word-break: break-all;
            background: white;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            font-family: 'Courier New', monospace;
        }
        
        .footer {
            background: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer p {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 8px;
        }
        
        .security-note {
            background: #fef3c7;
            border: 1px solid #fde68a;
            border-radius: 8px;
            padding: 16px;
            margin: 30px 0;
        }
        
        .security-note p {
            font-size: 14px;
            color: #92400e;
            margin: 0;
        }
        
        .security-icon {
            display: inline-block;
            margin-right: 8px;
            vertical-align: middle;
        }
        
        @media (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 12px;
            }
            
            .content {
                padding: 30px 25px;
            }
            
            .header {
                padding: 30px 25px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .welcome-text {
                font-size: 20px;
            }
            
            .verify-button {
                padding: 14px 30px;
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">
                <svg viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
            </div>
            <h1>Welcome to Bulk Email Service</h1>
            <p>Your account is almost ready!</p>
        </div>
        
        <div class="content">
            <h2 class="welcome-text">Please verify your email address</h2>
            <p class="description">
                Hi there! To complete your registration for <strong>${email}</strong> and start using our bulk email service, 
                please verify your email address by clicking the button below.
            </p>
            
            <a href="${verificationLink}" class="verify-button">
                Verify Email Address
            </a>
            
            <div class="security-note">
                <p>
                    <span class="security-icon">🔒</span>
                    <strong>Security Notice:</strong> This verification link will expire in 24 hours for your security.
                </p>
            </div>
            
            <div class="alternative-link">
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <div class="link-text">${verificationLink}</div>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Bulk Email Service</strong></p>
            <p>If you didn't create an account, you can safely ignore this email.</p>
            <p style="margin-top: 16px; font-size: 12px; color: #9ca3af;">
                This is an automated message, please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>
  `;
};