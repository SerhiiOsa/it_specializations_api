import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

export const getClient = async () => {
    try {
        const client = await pool.connect();
        console.log('Connected to the database');
        return client;
    } catch (error) {
        console.error('Error getting a database client', error);
        throw error;
    }
};

export const releaseClient = (client) => {
    client.release();
    console.log('Client released');
};
