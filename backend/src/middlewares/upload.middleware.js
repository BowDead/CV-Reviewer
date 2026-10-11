import multer from "multer";
import { HttpError } from "../errors/HttpError";
import e from "express";

export const MAx_FILE_SIZE_MB = 10;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAx_FILE_SIZE_MB * 1024 * 1024,
    files: 1,
  },
}).single("file");

export function uploadCvFile(req, res, next) {
  upload(req, res, (err) => {
    if (!err) {
      return next();
    }
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(
          new HttpError(
            413,
            `Plik jest za duży (limit to ${MAx_FILE_SIZE_MB} MB).`,
          ),
        );
      }
      return next(
        new HttpError(
          400,
          'Nieprawidłowe przesłanie pliku. Wyślij jeden plik w polu "file".',
        ),
      );
    }
    next(err);
  });
}
