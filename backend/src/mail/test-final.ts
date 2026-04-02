import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function test() {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: Number(process.env.MAIL_PORT) === 465,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_USER, // Send to self
      subject: 'Final configuration test',
      text: 'If you see this, the SMTP syntax error is fixed!',
    });
    console.log('✅ Success! Email sent:', info.messageId);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

test();
