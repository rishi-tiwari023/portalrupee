import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter;

const createTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true';

  const isPlaceholder = (str) => {
    if (!str) return true;
    const s = str.trim();
    return s === '' || 
           s === 'your_smtp_username' || 
           s === 'your_smtp_password' ||
           s === 'your_gmail_address@gmail.com' ||
           s === 'your_gmail_app_password';
  };

  if (user && pass && !isPlaceholder(user) && !isPlaceholder(pass)) {
    console.log(`Configuring SMTP transport with ${host}:${port}`);
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: user.trim(),
        pass: pass.trim(),
      },
    });
  } else {
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
        console.log(`Verification Code:`);
        const match = options.subject.match(/\d{6}/);
        const code = match ? match[0] : 'N/A';
        console.log(`\n       >>>  ${code}  <<<\n`);
        console.log(`--------------------------------------------------`);
        console.log('==================================================\n');
        return { messageId: 'mock-id-' + Date.now() };
      }
    };
  }

  return transporter;
};

export const sendOTPMail = async (email, otp) => {
  const mailTransporter = await createTransporter();
  const from = process.env.EMAIL_FROM || 'noreply@portalrupee.com';

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px;">
        <h2 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">PortalRupee</h2>
        <span style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Secure Verification</span>
      </div>
      <p style="color: #334155; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">Hello,</p>
      <p style="color: #334155; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">Please use the following One-Time Password (OTP) to verify your request. This OTP is valid for <strong>5 minutes</strong>.</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="display: inline-block; font-size: 36px; font-weight: 900; letter-spacing: 0.25em; color: #4f46e5; background-color: #f5f3ff; padding: 15px 30px; border-radius: 16px; border: 2px solid #ddd6fe; text-align: center;">
          ${otp}
        </span>
      </div>
      <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
        If you did not initiate this request, please ignore this email or secure your account.
      </p>
      <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 11px;">
        &copy; ${new Date().getFullYear()} PortalRupee. All rights reserved.
      </div>
    </div>
  `;

  const mailOptions = {
    from,
    to: email,
    subject: `PortalRupee Verification Code: ${otp}`,
    text: `Your PortalRupee verification code is ${otp}. It will expire in 5 minutes.`,
    html: htmlContent,
  };

  return await mailTransporter.sendMail(mailOptions);
};
