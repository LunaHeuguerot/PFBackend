import multer from 'multer';
import config from './config.js';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         // cb(null, `${config.DIRNAME}/${config.UPLOAD_DIR}`)
//         cb(null, config.UPLOAD_DIR)
//     },

//     filename: (req, file, cb) => {
//         cb(null, file.originalname)
//     }
// });

cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET
});

const cloudStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: path.basename(req.path),
        allowed_formats: ['jpg', 'pang'],
        transformations: [{ width: 640 }],
        public_id: (req, file) => `${Date.now()}-${file.originalname.split('.')[0]}`
    }
});

const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const subFolder = path.basename(req.path);
        cb(null, `${config.UPLOAD_DIR}/${subFolder}/`);
    },

    filename: (req, file, cb) => {
        // cb(null, file.originalname);
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

export const uploader = multer({ storage: config.STORAGE === 'cloud' ? cloudStorage: localStorage });