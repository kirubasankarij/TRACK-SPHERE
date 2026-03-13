import twilio from 'twilio';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('Config Status:');
console.log('SID Loaded:', !!process.env.TWILIO_SID);
console.log('Token Loaded:', !!process.env.TWILIO_AUTH_TOKEN);
console.log('Phone Loaded:', !!process.env.TWILIO_PHONE);

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const sendWhatsAppTest = async () => {
    const to = 'whatsapp:+919360069455';
    const fromCandidates = [
        `whatsapp:${process.env.TWILIO_PHONE}`,
        'whatsapp:+14155238886'
    ];

    for (const from of fromCandidates) {
        try {
            console.log(`\nAttempting to send from ${from} to ${to}...`);
            const message = await client.messages.create({
                from: from,
                body: 'Hello from TrackFlow! Your shipment alert system is working perfectly. 🚀',
                to: to
            });
            console.log('Success! Message SID:', message.sid);
            console.log('Status:', message.status);
            return;
        } catch (error) {
            console.error(`Attempt with ${from} failed: ${error.message}`);
            if (error.code === 21608) {
                console.warn('\nTIP: Recipient must join the sandbox first.');
            }
        }
    }
};

sendWhatsAppTest();
