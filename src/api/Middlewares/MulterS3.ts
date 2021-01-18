import multer from "multer";
import multerS3 from "multer-s3";

import type { S3 } from "aws-sdk";

function getUploadMiddleWare(s3: S3, bucketName: string, maxFileSize: number) {
  return multer({
    storage: multerS3({
      s3: s3,
      bucket: bucketName,
      key: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now()); //use Date.now() for unique file keys
      },
    }),
    limits: { fileSize: maxFileSize },
  });
}

export default getUploadMiddleWare;
