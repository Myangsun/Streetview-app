import AWS from "aws-sdk";

const dynamoDB = new AWS.DynamoDB.DocumentClient({
  region: "us-east-2",
  accessKeyId: "AKIA4LHNCGVE7PY6KLHS",
  secretAccessKey: "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",
});

export default dynamoDB;
