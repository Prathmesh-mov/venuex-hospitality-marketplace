import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        // Hardcoded for hackathon demo to bypass .env load issues
        user: 'your.email@gmail.com', // ⚠️ Replace with your actual Gmail
        pass: 'your16characterpassword',     // ⚠️ Replace with your 16-character App Password (no spaces)
      },
    });

    const mailOptions = {
      from: `"VenueX Marketplace" <your.email@gmail.com>`, // ⚠️ Replace with your actual Gmail here too
      to: email,
      subject: 'Your VenueX Verification Code',
      html: `
        <div style="font-family: sans-serif; padding: 20px; background-color: #f8fafc; border-radius: 12px; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #0f172a; margin-bottom: 10px;">Welcome to VenueX</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.5;">Your secure B2B marketplace verification code is:</p>
          
          <div style="background-color: #ffffff; padding: 24px; border-radius: 8px; border: 2px dashed #cbd5e1; text-align: center; margin: 24px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #2563eb; font-family: monospace;">${otp}</span>
          </div>
          
          <p style="color: #475569; font-size: 14px; line-height: 1.5;">Enter this 6-digit code in the VenueX application to verify your business identity and access the marketplace.</p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">This is an automated message from the HackCelestial VenueX demo.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error('Email error:', error);
    return NextResponse.json({ error: 'Failed to send email. Check server console for details.' }, { status: 500 });
  }
}