import crypto from 'crypto';
import twilio from 'twilio';
import nodemailer from 'nodemailer';

class OTPService {
    /**
     * Generate a 6-digit numeric OTP
     */
    static generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Send OTP via SMS
     */
    static async sendOTP(phoneNumber, otp) {
        console.log(`[SMS] Sending OTP ${otp} to ${phoneNumber}`);
        if (!process.env.TWILIO_SID || !process.env.TWILIO_AUTH_TOKEN) {
            console.warn('Twilio credentials not found. Skipping real SMS.');
            return true;
        }

        try {
            const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

            // Check if it's a dummy phone number or valid
            const isDummy = phoneNumber === 'CUSTOMER_PHONE' || !phoneNumber.match(/^\+?[1-9]\d{1,14}$/);
            const targetPhone = isDummy ? process.env.TWILIO_PHONE : phoneNumber;

            await client.messages.create({
                body: `Your TrackFlow Delivery OTP is: ${otp}`,
                from: process.env.TWILIO_PHONE,
                to: targetPhone // fallback to sender or skip
            });
            console.log('Real SMS sent successfully.');
            return true;
        } catch (err) {
            console.error('Twilio Error:', err.message);
            return false;
        }
    }

    /**
     * Send OTP via Email
     */
    static async sendOTPEmail(email, otp) {
        console.log(`[Email] Sending OTP ${otp} to ${email}`);
        if (!process.env.SENDGRID_API_KEY) {
            console.warn('SendGrid credentials not found. Skipping real email.');
            return true;
        }

        try {
            const transporter = nodemailer.createTransport({
                host: 'smtp.sendgrid.net',
                port: 587,
                auth: {
                    user: 'apikey',
                    pass: process.env.SENDGRID_API_KEY
                }
            });

            await transporter.sendMail({
                from: process.env.EMAIL_FROM || 'noreply@smartlogix.com',
                to: email,
                subject: 'Your TrackFlow Delivery OTP',
                text: `Your delivery secure OTP code is: ${otp}`,
                html: `<p>Your delivery secure OTP code is: <strong>${otp}</strong></p>`
            });
            console.log('Real Email sent successfully.');
            return true;
        } catch (err) {
            console.error('SendGrid Error:', err.message);
            return false;
        }
    }
}

export default OTPService;
