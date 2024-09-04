import multer from 'multer';
import config from './config.js';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET
});

const cloudStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => ({
        folder: path.basename(req.path),
        allowed_formats: ['jpg', 'png', 'pdf', 'docx'],  
        transformation: [{ width: 640 }],
        public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
    })
});

const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const subFolder = path.basename(req.path);
        cb(null, `${config.UPLOAD_DIR}/${subFolder}/`);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

export const uploader = multer({ storage: config.STORAGE === 'cloud' ? cloudStorage : localStorage });
