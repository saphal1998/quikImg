import mongoose, { Connection } from "mongoose";

function createDatabase(uri: string): Connection {
  mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error:"));
  return db;
}

export default createDatabase;
