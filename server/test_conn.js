import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

console.log('URI:', process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('SUCCESS: Connected to MongoDB');
        process.exit(0);
    })
    .catch(err => {
        console.error('FAILURE: Could not connect', err);
        process.exit(1);
    });
