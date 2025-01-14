import mongoose from 'mongoose';

export async function runDb(url: string) {
    try {
        await mongoose.connect(url);
        console.log('Connected successfully to mongoDB server');
    } catch (error) {
        console.log("Can't connect to mongo server", error);
        await mongoose.disconnect();
    }
}