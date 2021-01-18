import { Schema, model } from "mongoose";

const s3FileUploadSchema = new Schema({
  fieldname: {
    type: "String",
  },
  originalname: {
    type: "String",
  },
  encoding: {
    type: "String",
  },
  mimetype: {
    type: "String",
  },
  size: {
    type: "Number",
  },
  bucket: {
    type: "String",
  },
  key: {
    type: "String",
  },
  acl: {
    type: "String",
  },
  contentType: {
    type: "String",
  },
  contentDisposition: {
    type: "Mixed",
  },
  storageClass: {
    type: "String",
  },
  serverSideEncryption: {
    type: "Mixed",
  },
  metadata: {
    type: "Mixed",
  },
  location: {
    type: "String",
  },
  etag: {
    type: "String",
  },
});

const labelsSchema = new Schema({
  name: {
    type: "String",
  },
  confidence: {
    type: "Number",
  },
});

const documentSchema = new Schema({
  s3File: {
    type: s3FileUploadSchema,
  },
  labels: {
    type: [labelsSchema],
  },
});

const documentModel = model("quikImg", documentSchema);

export default documentModel;
