import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter;

const createTransporter = async () => {
  if (transporter) return transporter;

  const resendApiKey = process.env.RESEND_API_KEY;

  const isPlaceholder = (str) => {
    if (!str) return true;
    const s = str.trim();
    return s === '' || 
           s === 'your_resend_api_key_here';
  };

  // If a Resend API key is configured, use Resend SMTP
  if (resendApiKey && !isPlaceholder(resendApiKey)) {
    console.log('Configuring Resend.io SMTP transport');
    transporter = nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: resendApiKey.trim(),
      },
    });
  }
  // Mock transporter for local/dev without config
  else {
    console.log('No SMTP credentials found. Initializing mock mail transporter (logging to console).');
    transporter = {
      sendMail: async (options) => {
        console.log('\n==================================================');
        console.log('MOCK EMAIL SENT:');
        console.log(`To: ${options.to}`);
        console.log(`From: ${options.from}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Body:\n`);
        console.log(`--------------------------------------------------`);
        if (options.subject.includes('Verification Code')) {
          console.log(`Verification Code:`);
          const match = options.subject.match(/\d{6}/);
          const code = match ? match[0] : 'N/A';
          console.log(`\n       >>>  ${code}  <<<\n`);
        } else {
          console.log(options.text || 'Welcome message');
        }
        console.log(`--------------------------------------------------`);
        console.log('==================================================\n');
        return { messageId: 'mock-id-' + Date.now() };
      }
    };
  }

  return transporter;
};

/**
 * Sends a One-Time Password (OTP) email using a premium HTML template
 */
export const sendOTPMail = async (email, otp, purpose = 'general') => {
  const mailTransporter = await createTransporter();
  const from = process.env.EMAIL_FROM;

  let title = 'One-Time Password (OTP)';
  let intro = 'Use the following code to verify your action on PortalRupee.';
  let cardBg = '#f5f3ff';
  let cardBorder = '#ddd6fe';
  let textColor = '#4f46e5';

  if (purpose === 'password_reset') {
    title = 'Password Reset Verification';
    intro = 'Use the following code to securely reset your password on PortalRupee.';
    cardBg = '#fee2e2';
    cardBorder = '#fecaca';
    textColor = '#dc2626';
  } else if (purpose === 'tpin_reset') {
    title = 'TPIN Reset Verification';
    intro = 'Use the following code to securely reset your Transaction PIN (TPIN).';
    cardBg = '#e0f2fe';
    cardBorder = '#bae6fd';
    textColor = '#0284c7';
  } else if (purpose === 'disable_2fa') {
    title = 'Disable 2FA Verification';
    intro = 'Use the following code to disable Two-Factor Authentication on your account.';
    cardBg = '#ffedd5';
    cardBorder = '#fed7aa';
    textColor = '#ea580c';
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>PortalRupee ${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        body {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #f8fafc;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }
        .container {
          max-width: 500px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          border: 1px solid #f1f5f9;
        }
        .header {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          color: #ffffff;
          font-family: 'Outfit', sans-serif;
          font-size: 28px;
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.03em;
        }
        .header p {
          color: #e0e7ff;
          font-size: 13px;
          margin: 6px 0 0 0;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .content {
          padding: 40px 30px;
          text-align: center;
        }
        .greeting {
          font-family: 'Outfit', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin-top: 0;
          margin-bottom: 12px;
          text-align: left;
        }
        .intro-text {
          font-size: 15px;
          line-height: 1.6;
          color: #475569;
          margin-bottom: 24px;
          text-align: left;
        }
        .otp-card {
          background: ${cardBg};
          border: 2px solid ${cardBorder};
          border-radius: 20px;
          padding: 24px;
          margin: 24px auto;
          display: inline-block;
        }
        .otp-code {
          font-family: 'Outfit', sans-serif;
          font-size: 38px;
          font-weight: 900;
          letter-spacing: 0.25em;
          color: ${textColor};
          margin: 0;
        }
        .alert-box {
          background: #fffbeb;
          border: 1px solid #fef3c7;
          border-radius: 12px;
          padding: 14px 16px;
          font-size: 13px;
          color: #b45309;
          text-align: left;
          line-height: 1.5;
          margin-top: 24px;
        }
        .footer {
          background: #f8fafc;
          padding: 24px 20px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
        }
        .footer-logo {
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          color: #4f46e5;
          font-size: 16px;
          margin-bottom: 6px;
        }
        .footer-text {
          font-size: 11px;
          color: #94a3b8;
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>PortalRupee</h1>
          <p>Secure Verification</p>
        </div>
        <div class="content">
          <h2 class="greeting">${title}</h2>
          <p class="intro-text">
            ${intro} This OTP is confidential and valid for <strong>5 minutes</strong>.
          </p>
          
          <div class="otp-card">
            <p class="otp-code">${otp}</p>
          </div>
          
          <div class="alert-box">
            <strong>⚠️ Security Alert:</strong> Never share this OTP with anyone, including PortalRupee staff. If you did not request this verification, please secure your account immediately.
          </div>
        </div>
        <div class="footer">
          <div class="footer-logo">PortalRupee</div>
          <p class="footer-text">
            &copy; ${new Date().getFullYear()} PortalRupee. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from,
    to: email,
    subject: `PortalRupee ${title}: ${otp}`,
    text: `Your PortalRupee ${title} code is ${otp}. It will expire in 5 minutes.`,
    html: htmlContent,
  };

  return await mailTransporter.sendMail(mailOptions);
};

/**
 * Sends a welcome email to a new user using a premium HTML template
 */
export const sendWelcomeMail = async (email, name) => {
  const mailTransporter = await createTransporter();
  const from = process.env.EMAIL_FROM;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to PortalRupee</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        body {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #f8fafc;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          border: 1px solid #f1f5f9;
        }
        .header {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          padding: 40px 20px;
          text-align: center;
          position: relative;
        }
        .header h1 {
          color: #ffffff;
          font-family: 'Outfit', sans-serif;
          font-size: 32px;
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.03em;
        }
        .header p {
          color: #e0e7ff;
          font-size: 16px;
          margin: 10px 0 0 0;
          font-weight: 500;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-family: 'Outfit', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
          margin-top: 0;
          margin-bottom: 16px;
        }
        .intro-text {
          font-size: 15px;
          line-height: 1.6;
          color: #475569;
          margin-bottom: 30px;
        }
        .features-grid {
          background: #f8fafc;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 32px;
          border: 1px dashed #e2e8f0;
        }
        .feature-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        .feature-item:last-child {
          margin-bottom: 0;
        }
        .feature-icon {
          background: #e0e7ff;
          color: #4f46e5;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: inline-block;
          text-align: center;
          line-height: 32px;
          font-weight: 700;
          margin-right: 14px;
          flex-shrink: 0;
        }
        .feature-text h4 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }
        .feature-text p {
          margin: 0;
          font-size: 13px;
          color: #64748b;
          line-height: 1.4;
        }
        .cta-container {
          text-align: center;
          margin-top: 30px;
          margin-bottom: 20px;
        }
        .btn {
          display: inline-block;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: #ffffff !important;
          text-decoration: none !important;
          padding: 16px 36px;
          border-radius: 14px;
          font-weight: 600;
          font-size: 15px;
          font-family: 'Outfit', sans-serif;
          box-shadow: 0 8px 16px rgba(79, 70, 229, 0.25);
        }
        .footer {
          background: #f8fafc;
          padding: 30px 20px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
        }
        .footer-logo {
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          color: #4f46e5;
          font-size: 18px;
          margin-bottom: 8px;
        }
        .footer-text {
          font-size: 12px;
          color: #94a3b8;
          line-height: 1.5;
        }
        .footer-links {
          margin-top: 16px;
        }
        .footer-links a {
          color: #64748b;
          text-decoration: none;
          font-size: 12px;
          margin: 0 10px;
          font-weight: 500;
        }
        .footer-links a:hover {
          color: #4f46e5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>PortalRupee</h1>
          <p>Your Portal to Secure & Effortless Banking</p>
        </div>
        <div class="content">
          <h2 class="greeting">Welcome to the family, ${name}!</h2>
          <p class="intro-text">
            We're thrilled to have you join PortalRupee. Our mission is to provide you with a frictionless, highly secure, and elegant digital banking experience. Here are a few key features available to you right out of the box:
          </p>
          
          <div class="features-grid">
            <div class="feature-item">
              <span class="feature-icon">🛡️</span>
              <div class="feature-text">
                <h4>Ironclad TPIN Security</h4>
                <p>Verify every transaction securely using your personalized 6-digit transaction PIN.</p>
              </div>
            </div>
            <div class="feature-item">
              <span class="feature-icon">⚡</span>
              <div class="feature-text">
                <h4>Instant P2P Transfers</h4>
                <p>Transfer funds instantly to other PortalRupee users with just a mobile number or email.</p>
              </div>
            </div>
            <div class="feature-item">
              <span class="feature-icon">💬</span>
              <div class="feature-text">
                <h4>Secure In-App Chat</h4>
                <p>Communicate directly with transacting users securely right from your transaction history page.</p>
              </div>
            </div>
          </div>
          
          <p class="intro-text" style="margin-bottom: 20px;">
            To get started, please log in to your account, complete your one-time KYC verification, and set up your secure TPIN.
          </p>
          
          <div class="cta-container">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="btn">Access Your Dashboard</a>
          </div>
        </div>
        <div class="footer">
          <div class="footer-logo">PortalRupee</div>
          <p class="footer-text">
            This email was sent to you because you registered an account on PortalRupee.<br>
            &copy; ${new Date().getFullYear()} PortalRupee. All rights reserved.
          </p>
          <div class="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Support Helpdesk</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from,
    to: email,
    subject: `Welcome to PortalRupee, ${name}!`,
    text: `Hello ${name}, welcome to PortalRupee! We are thrilled to have you. Please log in to complete your KYC and set up your TPIN.`,
    html: htmlContent,
  };

  return await mailTransporter.sendMail(mailOptions);
};
