const { MongoClient } = require("mongodb");
const mongoose = require("mongoose");
const uri =
  "mongodb+srv://manojshakya54:iXrwnqkXcQeQruWl@cluster0.5kpsa.mongodb.net/"; // replace with your MongoDB URI
  
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export default class DbConnection {
  constructor() {}
  connectToDatabase = async () => {
    console.log("dataBase");
    try {
      await client.connect();
      console.log("Connected successfully to MongoDB");

      const database = client.db("your_database_name");
      // You can now use the database object for queries
      return database;
    } catch (err) {
      console.error(err);
    }
  };
}
