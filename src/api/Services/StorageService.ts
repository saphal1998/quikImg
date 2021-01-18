import AWS from "aws-sdk";
import type { Labels } from "./LabelService";
import DB from "../Database/Database";
import Document from "../Database/Models";
import type { Connection } from "mongoose";

interface S3Info {
  s3File: Express.MulterS3.File;
  labels: Labels[];
}

interface FileMatches {
  label: Labels;
  docs: S3Info[];
}

export default class StorageService {
  private s3Bucket: AWS.S3;
  private mongoUser: string;
  private mongoDBName: string;
  private DB: Connection;
  constructor() {
    this.s3Bucket = new AWS.S3();
    const { MONGODB_USER, MONGODB_DBNAME } = process.env;
    this.mongoUser = MONGODB_USER as string;
    this.mongoDBName = MONGODB_DBNAME as string;
    this.DB = DB(this.createURI());
  }

  getS3Object() {
    return this.s3Bucket;
  }

  getDBObject() {
    return this.DB;
  }

  addToDatabase(document: S3Info) {
    const newDocument = new Document(document);
    newDocument.save();
  }

  private createURI() {
    return `mongodb+srv://${this.mongoUser}:${process.env.MONGODB_PASSWORD}@democluster.kakxg.mongodb.net/${this.mongoDBName}?retryWrites=true&w=majority`;
  }

  async getMatches(labels: Labels[]): Promise<FileMatches[]> {
    const fileMatches = (
      await Promise.all(
        labels.map(async (label) => {
          const docs = await Document.find({
            labels: { $elemMatch: { name: { $regex: label, $options: "i" } } },
          });
          return { label, docs };
        })
      )
    ).filter((matchedFile) => matchedFile.docs.length > 0) as FileMatches[];

    return fileMatches.flat();
  }
}
