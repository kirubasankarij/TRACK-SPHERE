import twilio from 'twilio';
import nodemailer from 'nodemailer';
import admin from '../config/firebase.js';

let twilioClient;
let mailTransporter;

const getTwilioClient = () => {
    if (!twilioClient && process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN) {
        try {
            twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
        } catch (err) {
            console.error('Failed to initialize Twilio:', err.message);
        }
    }
    return twilioClient;
};

const getMailTransporter = () => {
    if (!mailTransporter) {
        if (process.env.SENDGRID_API_KEY) {
            try {
                mailTransporter = nodemailer.createTransport({
                    service: 'SendGrid',
                    auth: {
                        user: 'apikey',
                        pass: process.env.SENDGRID_API_KEY
                    }
                });
            } catch (err) {
                console.error('Failed to initialize SendGrid:', err.message);
            }
        } else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            try {
                mailTransporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });
            } catch (err) {
                console.error('Failed to initialize Gmail:', err.message);
            }
        }
    }
    return mailTransporter;
};

export const sendSMS = async (to, body) => {
    try {
        const client = getTwilioClient();
        if (!client) {
            console.log(`[DEMO] SMS would be sent to ${to}: ${body}`);
            return;
        }
        await client.messages.create({
            body,
            from: process.env.TWILIO_PHONE,
            to
        });
        console.log(`SMS sent to ${to}`);
    } catch (err) {
        console.error('Twilio Error:', err.message);
    }
};

export const sendVoiceCall = async (to, message) => {
    try {
        const client = getTwilioClient();
        if (!client) {
            console.log(`[DEMO] Voice Call would be made to ${to}: ${message}`);
            return;
        }
        await client.calls.create({
            twiml: `<Response><Say>${message}</Say></Response>`,
            to,
            from: process.env.TWILIO_PHONE
        });
        console.log(`Voice call initiated to ${to}`);
    } catch (err) {
        console.error('Twilio Voice Error:', err.message);
    }
};

export const sendEmail = async (to, subject, text) => {
    try {
        const transporter = getMailTransporter();
        if (!transporter) {
            console.log(`[DEMO] Email would be sent to ${to}: ${subject}`);
            return;
        }
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to,
            subject,
            text
        });
        console.log(`Email sent to ${to}`);
    } catch (err) {
        console.error('Email Error:', err.message);
    }
};

export const sendPushNotification = async (token, title, body) => {
    try {
        const message = {
            notification: { title, body },
            token
        };
        await admin.messaging().send(message);
        console.log('Push notification sent');
    } catch (err) {
        console.error('Firebase Error:', err.message);
    }
};

export const sendNotification = async ({ userId, type, title, message, metadata }) => {
    try {
        console.log(`[DISPATCH] Sending ${type} to ${userId}: ${message}`);
        
        if (!userId) {
            console.warn(`[NOTIFICATION] Skipping notification dispatch: No userId provided.`);
            return;
        }

        let recipient;
        if (process.env.DEMO_MODE === 'true') {
            const { MockUser } = await import('../models/mocks.js');
            recipient = await MockUser.findById(userId);
        } else {
            const User = (await import('../models/User.js')).default;
            recipient = await User.findById(userId);
        }

        if (recipient) {
            if (recipient.phone) {
                await sendSMS(recipient.phone, `${title}: ${message}`);
            }
            if (recipient.email) {
                await sendEmail(recipient.email, title, message);
            }
        }

        // Also notify the admin for critical events like delays
        if (type === 'DELAY_REPORT' || type === 'DELAY_PREDICTION') {
            const adminEmail = process.env.ADMIN_EMAIL || 'admin@smartlogix.com';
            const adminPhone = process.env.ADMIN_PHONE || '+919999999999';
            await sendEmail(adminEmail, `ADMIN ALERT: ${title}`, `Tracking: ${metadata?.trackingNumber}\n${message}`);
            await sendSMS(adminPhone, `ADMIN: ${title} for ${metadata?.trackingNumber}`);
        }

    } catch (err) {
        console.error('Notification Dispatch Error:', err.message);
    }
};

const NotificationService = {
    sendSMS,
    sendVoiceCall,
    sendEmail,
    sendPushNotification,
    sendNotification
};

export default NotificationService;
