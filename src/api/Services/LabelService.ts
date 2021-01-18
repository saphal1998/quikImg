import AWS from "aws-sdk";
import type { Rekognition } from "aws-sdk";
import type {
  DetectLabelsRequest,
  S3Object,
} from "aws-sdk/clients/rekognition";

export interface Labels {
  name: string;
  confidence: number;
}

export default class LabelService {
  client: AWS.Rekognition;
  maxLabelsPerImage: number;
  constructor(maxLabelsPerImage: number = 10) {
    this.client = new AWS.Rekognition();
    this.maxLabelsPerImage = maxLabelsPerImage;
  }

  detectLabelsFromBytes(image: Buffer): Promise<Labels[]> {
    const params: DetectLabelsRequest = {
      Image: {
        Bytes: image,
      },
      MaxLabels: this.maxLabelsPerImage,
    };
    return new Promise((resolve, reject) => {
      this.client.detectLabels(params, (error, data) => {
        if (error) {
          reject(error);
        }
        resolve(this.parseLabels(data));
      });
    });
  }

  detectLabelsFromS3Object(image: S3Object): Promise<Labels[]> {
    const params: DetectLabelsRequest = {
      Image: {
        S3Object: image,
      },
      MaxLabels: this.maxLabelsPerImage,
    };
    return new Promise((resolve, reject) => {
      this.client.detectLabels(params, (error, data) => {
        if (error) {
          reject(error);
        }
        resolve(this.parseLabels(data));
      });
    });
  }

  private parseLabels(response: Rekognition.DetectLabelsResponse): Labels[] {
    const flattenedLabels: Labels[] = [];
    if (response.Labels) {
      response.Labels.forEach((label) => {
        flattenedLabels.push({
          name: label.Name as string,
          confidence: (label.Confidence as number) / 100,
        });
      });
    }
    return flattenedLabels;
  }
}
