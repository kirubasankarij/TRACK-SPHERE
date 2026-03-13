import mongoose from 'mongoose';
import Redis from 'ioredis';
import twilio from 'twilio';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function verifyAll() {
    console.log('--- Infrastructure Verification Report ---\n');

    // 1. MongoDB
    console.log('[1] Testing MongoDB Atlas...');
    try {
        await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ MongoDB Connected successfully.');
        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ MongoDB Connection Failed:', err.message);
    }

    // 2. Redis
    console.log('\n[2] Testing Redis Cloud...');
    try {
        const redis = new Redis(process.env.REDIS_URL);
        await redis.set('test_key', 'it_works');
        const val = await redis.get('test_key');
        console.log(`✅ Redis Connected successfully. Test Key: ${val}`);
        await redis.quit();
    } catch (err) {
        console.error('❌ Redis Connection Failed:', err.message);
    }

    // 3. Twilio
    console.log('\n[3] Testing Twilio Account...');
    try {
        const twClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
        const account = await twClient.api.accounts(process.env.TWILIO_SID).fetch();
        console.log(`✅ Twilio Account Verified. Name: ${account.friendlyName}, Status: ${account.status}`);

        console.log('Testing WhatsApp Sender info...');
        try {
            const phoneNumber = await twClient.incomingPhoneNumbers.list({ phoneNumber: process.env.TWILIO_PHONE });
            if (phoneNumber.length > 0) {
                console.log(`✅ Phone Number ${process.env.TWILIO_PHONE} found in account.`);
            } else {
                console.log(`⚠ Phone Number ${process.env.TWILIO_PHONE} not found via direct list search. Might be a Trial/Sandbox number.`);
            }
        } catch (pnErr) {
            console.log('⚠ Could not retrieve phone number details:', pnErr.message);
        }
    } catch (err) {
        console.error('❌ Twilio Verification Failed:', err.message);
    }

    console.log('\n--- End of Report ---');
}

verifyAll();
