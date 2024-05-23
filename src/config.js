import path from 'path';

const config = {
    SERVER: 'local',
    PORT: 5050,
    DIRNAME: path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:\/)/, '$1')), // Win
    get UPLOAD_DIR() { return `${this.DIRNAME}/public/img` },
    // MONGODB_URI: 'mongodb+srv://dblunah:coderhouse123@cluster0.lnkenam.mongodb.net/', //local 
    MONGODB_URI: 'mongodb+srv://dblunah:coderhouse123@cluster0.lnkenam.mongodb.net/pf_coder', //remoto
    MONGODB_ID_REGEX: /^[a-fA-F0-9]{24}$/
}

export default config;