import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { Readable } from "stream";
import crypto from "crypto";

import ErrorHandler from "./errorHandling";
import path from "path";
import { getMongoClient } from "../models/mongodb";
import { GridFSBucketReadStream, ObjectId } from "mongodb";

/**
 * Filters uploaded files to allow only jpeg, jpg, and png formats.
 * @param {Request} _req - The request object.
 * @param {Express.Multer.File} file - The uploaded file object.
 * @param {multer.FileFilterCallback} cb - The callback function to be called after filtering.
 */
export const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const fileTypes = /jpeg|jpg|png/;
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);
  if (mimeType && extName) return cb(null, true);

  cb(new Error("filetype"));
};

/**
 * Multer configuration for uploading posts with image files.
 */
const posts = multer({
  fileFilter: fileFilter,
});

/**
 * Middleware for uploading posts with image files.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next function to be called in the middleware stack.
 */
export function uploadPosts(req: Request, res: Response, next: NextFunction) {
  const upload = posts.single("postimage");

  upload(req, res, function (err) {
    if (err) {
      if (err instanceof multer.MulterError) {
        return next(new ErrorHandler("Invalid image file", 406, err));
      } else if (err instanceof Error && err.message === "filetype") {
        return next(new ErrorHandler("Only jpeg,jpg,png image", 406));
      } else {
        return next(new ErrorHandler("Invalid image file", 406, err));
      }
    }

    next();
  });
}

/**
 * Uploads a post file to the MongoDB GridFS bucket with a randomly generated filename and returns the file information.
 * @param {Request} req - The request object.
 * @param {Express.Multer.File} file - The uploaded file object.
 * @returns {Promise<{ id: ObjectId | undefined; filename: string | undefined }>} A promise resolving to an object containing the ID and filename of the uploaded file.
 */
export const getUploadPostofFile = async (
  req: Request,
  file: Express.Multer.File
): Promise<{ id: ObjectId | undefined; filename: string | undefined }> => {
  const fileInfo = await randomCryptoFilename(req, file);
  if (fileInfo.filename === undefined || fileInfo.filename === "") {
    return {
      id: undefined,
      filename: undefined,
    };
  }

  const { bucket } = await getMongoClient();
  const readStream = Readable.from(file.buffer);
  const uploadStream = bucket.openUploadStream(fileInfo.filename, {
    metadata: fileInfo.metaData,
  });

  return await new Promise<{ id: ObjectId; filename: string }>(
    (resolve, reject) => {
      readStream
        .pipe(uploadStream)
        .on("error", (err) => {
          console.log(err);
          reject(err);
        })
        .on("finish", () => {
          resolve({ id: uploadStream.id, filename: uploadStream.filename });
        });
    }
  );
};

/**
 * Converts a stream from GridFSBucketReadStream to a Buffer.
 * @param {GridFSBucketReadStream} stream - The stream to convert.
 * @returns {Promise<Buffer>} A promise resolving to the converted Buffer.
 */
export function streamToBuffer(
  stream: GridFSBucketReadStream
): Promise<Buffer> {
  return new Promise((resolve: (value: Buffer) => void, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on("data", (chunk: Uint8Array) => chunks.push(chunk));
    stream.on("errror", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

/**
 * Generates a random filename for uploaded files using crypto.
 * @param {Request} req - The request object.
 * @param {Express.Multer.File} file - The uploaded file object.
 * @returns {Promise<{filename: string; metaData: { mimeType: string; user: ObjectId }}>} A promise resolving to an object containing the generated filename and metadata.
 */
export const randomCryptoFilename = (
  req: Request,
  file: Express.Multer.File
): Promise<{
  filename: string;
  metaData: { mimeType: string; user: ObjectId };
}> => {
  return new Promise<{
    filename: string;
    metaData: { mimeType: string; user: ObjectId };
  }>((resolve, reject) => {
    crypto.randomBytes(24, (err, buf) => {
      if (err) return reject(err);

      const fileName =
        buf.toString("hex") + `.${file.originalname.split(".")[1]}`;
      const fileInfo = {
        filename: fileName,
        metaData: {
          mimeType: file.mimetype,
          user: req.user._id,
        },
      };

      resolve(fileInfo);
    });
  });
};
