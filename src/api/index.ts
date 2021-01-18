// Node packages
import fs from "fs";
import { promisify } from "util";

const unlinkAsync = promisify(fs.unlink);
const readFileAsync = promisify(fs.readFile);

// Third Party packages
import express from "express";
import type { S3Object } from "aws-sdk/clients/rekognition";

// Service imports
import LabelService from "./Services/LabelService";
import type { Labels } from "./Services/LabelService";
import StorageService from "./Services/StorageService";
import gets3UploadMiddleWare from "./Middlewares/MulterS3";
import getUploadMiddleware from "./Middlewares/Multer";

// Adding support for environment variables
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Get environment variables
const { BUCKET_NAME, MAX_FILE_SIZE } = process.env;

const labelService = new LabelService();
const storageService = new StorageService();

// Uploading to S3 Middleware
const s3Upload = gets3UploadMiddleWare(
  storageService.getS3Object(),
  BUCKET_NAME as string,
  Number(MAX_FILE_SIZE)
);

// Uploading to server middleware
const upload = getUploadMiddleware(Number(MAX_FILE_SIZE));

app.get("/", async (_, res) => {
  res
    .send({ message: "Welcome to quikImg Image Recognition Server" })
    .status(200);
});

// Upto 10 files at a time can be uploaded
app.post("/add", s3Upload.array("photo", 10), async (req, res) => {
  try {
    // Get image as a  buffer or S3 params, depending on type param (LOCAL or S3)
    const completeS3Info = req.files as Express.MulterS3.File[];

    await Promise.all(
      completeS3Info.map(async (s3File) => {
        const s3Object: S3Object = { Name: s3File.key, Bucket: s3File.bucket };
        const labels: Labels[] = await labelService.detectLabelsFromS3Object(
          s3Object
        );
        const document = { s3File, labels };
        storageService.addToDatabase(document);
      })
    );

    res
      .send({
        message: "Photos uploaded successfully",
        completeS3Info,
      })
      .status(200);
  } catch (error) {
    res.send({ message: "Request failed", error }).status(400);
  }
});

app.post("/getSimiliarImages", upload.single("photo"), async (req, res) => {
  try {
    const file = req.file;
    const fileContents = await readFileAsync(file.path);
    const fileLabels = await labelService.detectLabelsFromBytes(fileContents);
    const matchingFiles = await storageService.getMatches(fileLabels);
    await unlinkAsync(file.path);
    res
      .send({ message: "Labels obtained for file", matchingFiles, fileLabels })
      .status(200);
  } catch (error) {
    res.send({ message: "Request failed", error }).status(400);
  }
});

app.get("/getByKeywords", async (req, res) => {
  try {
    const { keywords } = req.body;
    const matchingFiles = await storageService.getMatches(keywords);
    res
      .send({ message: "Files obtained successfully", matchingFiles })
      .status(200);
  } catch (error) {
    res.send({ message: "Request failed", error }).status(400);
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server started at ${process.env.PORT}`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM Received, performing shutdown tasks");
  storageService.getDBObject().close();
});
