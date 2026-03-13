import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000
        });
        console.log('MongoDB Connected successfully!');
    } catch (err) {
        console.error('Atlas database connection failed:', err.message);
        console.warn('Entering DEMO MODE with internal mock data...');
        process.env.DEMO_MODE = 'true';
    }
};

export default connectDB;
