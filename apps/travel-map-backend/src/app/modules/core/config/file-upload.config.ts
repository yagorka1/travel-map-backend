import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request } from 'express';

export const avatarUploadConfig = {
  storage: diskStorage({
    destination: './uploads/avatars',
    filename: (req: Request, file: Express.Multer.File, callback) => {
      const userId = (req.user as any)?.userId || 'unknown';
      const uniqueSuffix = Date.now();
      const ext = extname(file.originalname);
      callback(null, `${userId}-${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (req: Request, file: Express.Multer.File, callback) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
};
