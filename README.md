# quikImg
Search for images in a repository using tags and images - PERSONAL PROJECT - I cannot be bothered with good docs for this one

I built this project because I just wanted to mess with some AWS stuff.

So, I used the following services - 
1. AWS Rekognition - For the meat and potatoes of the application, this API is used to identify entitites of an image
2. S3 Buckets - For storing images which are added to the platform
3. MongoDB Database - For storing labels, because AWS was expensive :/

## Workflow

### Adding to repository

1. Upload the images to the API endpoint `/add` - A max of 10 images can be uploaded at a time (The param name is rightly 'photos'
2. Wait for labels to be fetched

### Searching by tags and images
1. Have two different end points `/getSimiliarImages` and `/getByKeywords`
2. Uses the mongo DB database here to fetch the S3 urls here.


To run this project, just do
1. `yarn install`
2. Create an [equivalent environment file](https://github.com/saphal1998/quikImg/blob/main/.sample.env)
3. Run `yarn dev:watch` once to compile a dev build in watch mode
4. Run `yarn start:backend` to launch the server
