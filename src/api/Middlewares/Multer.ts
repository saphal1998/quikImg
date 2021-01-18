import multer from "multer";

function getMulterUpload(maxFileSize: number) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads");
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + "-" + Date.now());
    },
  });
  return multer({ storage: storage, limits: { fileSize: maxFileSize } });
}

export default getMulterUpload;
