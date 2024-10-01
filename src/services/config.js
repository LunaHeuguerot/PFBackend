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

const __dirname = path.resolve(path.dirname(''));

const config = {
    PERSISTENCE: process.env.PERSISTENCE || 'FS',
    SERVER: process.env.NODE_ENV === 'production' ? 'render' : 'local',
    PORT: process.env.PORT || clOptions.port || 8080,
    // STORAGE: 'cloud',
    DIRNAME: path.join(__dirname, 'src'),
    DIRNAME_STR: path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:\/)/, '$1')), // Win
    get UPLOAD_DIR() { return `${this.DIRNAME_STR}/public/img` },
    // MONGODB_URI: 'mongodb+srv://dblunah:coderhouse123@cluster0.lnkenam.mongodb.net/', //local 
    MONGODB_URI: process.env.MONGODB_URI, //remoto
    MONGODB_ID_REGEX: /^[a-fA-F0-9]{24}$/,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GITHUB_CALLBACK_URL: process.env.NODE_ENV === 'production' 
        ? process.env.GITHUB_CALLBACK_URL_RENDER
        : process.env.GITHUB_CALLBACK_URL,
    SECRET: process.env.SECRET,
    TWILIO_SID: process.env.TWILIO_SID,
    TWILIO_TOKEN: process.env.TWILIO_TOKEN,
    TWILIO_NUMBER: process.env.TWILIO_NUMBER,
    GMAIL_APP_PASS: process.env.GMAIL_APP_PASS,
    GMAIL_APP_USER: process.env.GMAIL_APP_USER,
    MODE: 'dev',
    JWT_SECRET: process.env.JWT_SECRET,
    // CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    // CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    // CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
}

export const errorsDictionary = {
    UNHANDLED_ERROR: { code: 0, status: 500, message: 'Error no identificado' },
    ROUTING_ERROR: { code: 1, status: 404, message: 'No se encuentra el endpoint solicitado' },
    FEW_PARAMETERS: { code: 2, status: 400, message: 'Faltan parámetros obligatorios o se enviaron vacíos' },
    INVALID_MONGOID_FORMAT: { code: 3, status: 400, message: 'El ID no contiene un formato válido de MongoDB' },
    INVALID_PARAMETER: { code: 4, status: 400, message: 'El parámetro ingresado no es válido' },
    INVALID_TYPE_ERROR: { code: 5, status: 400, message: 'No corresponde el tipo de dato' },
    ID_NOT_FOUND: { code: 6, status: 400, message: 'No existe registro con ese ID' },
    PAGE_NOT_FOUND: { code: 7, status: 404, message: 'No se encuentra la página solicitada' },
    DATABASE_ERROR: { code: 8, status: 500, message: 'No se puede conectar a la base de datos' },
    INTERNAL_ERROR: { code: 9, status: 500, message: 'Error interno de ejecución del servidor' },
    RECORD_CREATION_ERROR: { code: 10, status: 500, message: 'Error al intentar crear el registro' },
    RECORD_CREATION_OK: { code: 11, status: 200, message: 'Registro creado' },
    UNAUTHORIZED: { code: 12, status: 401, message: 'No autorizado: Necesitas estar autenticado para acceder a este recurso.' },
    FORBIDDEN: { code: 13, status: 403, message: 'Prohibido: No tienes los permisos necesarios para realizar esta acción.' },
    PRODUCT_NOT_FOUND: { code: 14, status: 404, message: 'Producto no encontrado' },
    PRODUCT_CREATE_ERROR: { code: 15, status: 500, message: 'Error al crear el producto' },
    PRODUCT_UPDATE_ERROR: { code: 16, status: 500, message: 'Error al actualizar el producto' },
    PRODUCT_DELETE_ERROR: { code: 17, status: 500, message: 'Error al eliminar el producto' },
    PRODUCTS_FETCH_ERROR: { code: 18, status: 500, message: 'Error al obtener los productos' },
    PRODUCTS_PAGINATION_ERROR: { code: 19, status: 500, message: 'Error al obtener productos paginados' },
    USER_NOT_FOUND: { code: 20, status: 404, message: 'Usuario no encontrado' },
    USER_CREATE_ERROR: { code: 21, status: 500, message: 'Error al crear el usuario' },
    USER_UPDATE_ERROR: { code: 22, status: 500, message: 'Error al actualizar el usuario' },
    USER_DELETE_ERROR: { code: 23, status: 500, message: 'Error al eliminar el usuario' },
    CART_NOT_FOUND: { code: 24, status: 404, message: 'Carrito no encontrado' },
    CART_UPDATE_ERROR: { code: 25, status: 500, message: 'Error al actualizar el carrito' },
    FILE_UPLOAD_ERROR: { code: 26, status: 400, message: 'Error al subir el archivo' },
    VALIDATION_ERROR: { code: 27, status: 400, message: 'Error de validación de datos' },
    EMAIL_ALREADY_EXISTS: { code: 28, status: 400, message: 'El email ya está en uso' },
    PASSWORD_INCORRECT: { code: 29, status: 401, message: 'Contraseña incorrecta' },
    TOKEN_EXPIRED: { code: 30, status: 401, message: 'El token ha expirado' },
    USER_ACCESS: { code: 31, status: 403, message: 'No tiene permisos para acceder al recurso' }
};

export default config;