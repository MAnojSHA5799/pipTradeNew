import mongoose from 'mongoose';

const uri = "mongodb+srv://manojshakya54:iXrwnqkXcQeQruWl@cluster0.5kpsa.mongodb.net/"; // replace with your MongoDB URI

// Define Mongoose options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Connect to the MongoDB database with Mongoose
mongoose.connect(uri)
  .then(() => {
    console.log("Connected to MongoDB with mongoose");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB with mongoose:", err);
  });

export default class DbConnection {
  constructor() {}
  
  // This class can handle mongoose-specific logic if needed
  connectToDatabase = async () => {
    console.log("Using mongoose for the connection");
    // Mongoose automatically handles the connection pool, no need to manually connect
    return mongoose.connection;
  };
}
