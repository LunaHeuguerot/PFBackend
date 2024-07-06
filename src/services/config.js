import path from 'path';
import { Command } from 'commander';
import dotenv from 'dotenv';

dotenv.config();

const commandLine = new Command();
commandLine
    .option('--mode <mode>')
    .option('--port <port>')
commandLine.parse();
const clOptions = commandLine.opts();

const config = {
    SERVER: 'local',
    PORT: process.env.PORT || clOptions.port || 8080,
    DIRNAME: path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:\/)/, '$1')), // Win
    get UPLOAD_DIR() { return `${this.DIRNAME}/public/img` },
    // MONGODB_URI: 'mongodb+srv://dblunah:coderhouse123@cluster0.lnkenam.mongodb.net/', //local 
    MONGODB_URI: process.env.MONGODB_URI, //remoto
    MONGODB_ID_REGEX: /^[a-fA-F0-9]{24}$/,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL,
    SECRET: process.env.SECRET
}

export default config;