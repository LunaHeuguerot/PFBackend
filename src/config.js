import path from 'path';

const config = {
    SERVER: 'local',
    PORT: 5050,
    DIRNAME: path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:\/)/, '$1')), // Win
    get UPLOAD_DIR() { return `${this.DIRNAME}/public/img` },
    // MONGODB_URI: 'mongodb+srv://dblunah:coderhouse123@cluster0.lnkenam.mongodb.net/', //local 
    MONGODB_URI: 'mongodb+srv://dblunah:coderhouse123@cluster0.lnkenam.mongodb.net/pf_coder', //remoto
    MONGODB_ID_REGEX: /^[a-fA-F0-9]{24}$/,
    GITHUB_CLIENT_ID: 'Iv23liHmJG1wVluLldGJ',
    GITHUB_CLIENT_SECRET: 'a7bbd9db8ec26eaa475b8d19a10475153f9c0659',
    GITHUB_CALLBACK_URL: 'https://localhost:5050/api/sessions/ghlogincallback'
}

export default config;