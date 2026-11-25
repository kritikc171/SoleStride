import multer from 'multer';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const uploadDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../uploads');
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']);

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDir),
  filename: (_req, file, callback) => callback(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`)
});

export default multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) {
      const error = new Error('Only JPEG, PNG, WebP, or SVG images are allowed');
      error.status = 400;
      return callback(error);
    }
    callback(null, true);
  }
});
