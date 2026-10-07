import 'dotenv/config';

export const env = {
    port: Number(process.env.PORT) || 3001,
    groqApiKey: process.env.GROQ_API_KEY || '',
};