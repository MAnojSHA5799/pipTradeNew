import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import { Request, Response } from "express";
import { UserDataType } from "./type/type";
import { User } from "./schema/user";
import { Posts } from "./schema/post";

const app = express();
const port = 5000;

// MongoDB connection setup
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
  .catch((err: Error) => { // Explicitly typing 'err'
    console.error("Error connecting to MongoDB with mongoose:", err);
  });

// DbConnection class for handling mongoose-specific logic
class DbConnection {
  constructor() {}

  // Connect to the database
  connectToDatabase = async () => {
    console.log("Using mongoose for the connection");
    // Mongoose automatically handles the connection pool, no need to manually connect
    return mongoose.connection;
  };
}

const dbConnection = new DbConnection();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5001", // Allow only your front-end URL
  })
);
app.use(
  session({
    secret: "my-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);

// Basic route
app.get("/", async (req: any, res: any) => {
  console.log("dataBaseIndex1");
  try {
    const database = await dbConnection.connectToDatabase();
    const collections = await database.collections();
    res.status(200).send(collections);
  } catch (error: unknown) {
    res.status(500).send(error);
  }
});

app.post("/user/register", async (req: Request, res: Response) => {
  const userData: UserDataType = { ...req.body };
  try {
    const isAlreadyExist = !!(await User.find(userData));
    if (!isAlreadyExist) {
      await User.create(userData);
      res.status(201).json({ message: "Successfully registered" });
    } else {
      res.status(409).json({ message: "User already registered" });
    }
  } catch (error: any) {
    res.status(400).json({ message: error?.message });
  }
});

app.post("/user/login", async (req: any, res: any) => {
  const userData: UserDataType = { ...req.body };
  console.log(userData);
  try {
    const user = await User.findOne(userData);
    if (user) {
      req.session.userId = user?._id; // Set session identifier
      res.status(200).json(user);
    } else {
      res.status(401).json({ error: "Invalid username or password" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error?.message });
  }
});

// Continue with the rest of your routes
app.post("/request/send", async (req: any, res: any) => {
  const senderUserName = req.body.senderUsername;
  const recieverUserName = req.body.recieverUserName;
  try {
    const userRecievedRequest = await User.find(
      { username: recieverUserName },
      "friends friendRequests"
    );
    console.log(userRecievedRequest);
    if (
      userRecievedRequest[0].friends.find(
        (user: any) => user === senderUserName
      )
    ) {
      res.status(409).send("Already Friends");
    } else {
      await User.findOneAndUpdate(
        { username: recieverUserName },
        { $push: { friendRequests: senderUserName } }
      );
      res.status(200).send({ message: "Request Sent" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error?.message });
  }
});

app.post("/request/recieved/:action", async (req: any, res: any) => {
  try {
    const requestedUserName = req.body.requestedUserName;
    const activeUserName = req.body.activeUserName;
    let response = { message: "Action Not Found", statusCode: 404 };
    switch (req.params.action) {
      case "accept":
        const userAccept = await User.find(
          { username: activeUserName },
          "friends friendRequests"
        );
        if (
          userAccept[0].friendRequests.find(
            (username: string) => username === requestedUserName
          )
        ) {
          await User.findOneAndUpdate(
            { username: activeUserName },
            {
              $push: { friends: requestedUserName },
              $pull: { friendRequests: requestedUserName },
            }
          );
          response = { message: "Request Accepted", statusCode: 200 };
        } else {
          response = { message: "Request Not Found", statusCode: 404 };
        }
        break;
      case "reject":
        const userReject = await User.find(
          { username: activeUserName },
          "friends friendRequests"
        );
        if (
          userReject[0].friendRequests.find(
            (username: string) => username === requestedUserName
          )
        ) {
          await User.findOneAndUpdate(
            { username: activeUserName },
            { $pull: { friendRequests: requestedUserName } }
          );
          response = { message: "Request Rejected", statusCode: 200 };
        } else {
          response = { message: "Request Not Found", statusCode: 200 };
        }
        break;
      default:
        break;
    }
    res.status(response.statusCode).send(response.message);
  } catch (error: any) {
    res.status(500).json({ message: error?.message });
  }
});

app.post("/posts", async (req: any, res: any) => {
  const post = req.body.post;
  try {
    await Posts.create(post);
    res.status(201).json({ message: "Successfully Posted" });
  } catch (error: any) {
    res.status(500).json({ message: error?.message });
  }
});

app.post("/posts/comment/:action", async (req: any, res: any) => {
  try {
    const postId = req.body.postId;
    const comment = req.body.comment;
    let response = { message: "Post does not exist", statusCode: 500 };
    switch (req.params.action) {
      case "add":
        await Posts.findByIdAndUpdate(postId, { $push: { comments: comment } });
        response = { message: "Comment added", statusCode: 200 };
        break;
      default:
        response = { message: "Action Not Found", statusCode: 404 };
        break;
    }
    res.status(response.statusCode).send(response.message);
  } catch (error: any) {
    res.status(500).json({ message: error?.message });
  }
});

app.post("/posts/friendPosts", async (req: any, res: any) => {
  try {
    const activeUserName = req.body.activeUserName;
    const user = await User.find({ username: activeUserName }, "friends");
    const friends = user[0].friends;
    let allFriendsPosts: any[] = [];
    for (let friend of friends) {
      const post = await Posts.find({ postBy: friend });
      allFriendsPosts = [...allFriendsPosts, ...post];
    }
    res.status(200).send(allFriendsPosts);
  } catch (error: any) {
    res.status(500).json({ message: error?.message });
  }
});

app.post("/post/friendCommentedPosts", async (req: any, res: any) => {
  try {
    const activeUserName = req.body.activeUserName;
    const user = await User.find({ username: activeUserName }, "friends");
    const friends = user[0].friends;
    let allFriendsCommentedPosts: any[] = [];
    for (let friend of friends) {
      const post = await Posts.find({ "comments.username": friend });
      allFriendsCommentedPosts = [...allFriendsCommentedPosts, ...post];
    }
    res.status(200).send(allFriendsCommentedPosts);
  } catch (error: any) {
    res.status(500).json({ message: error?.message });
  }
});

app.post("/posts/like/:action", async (req: any, res: any) => {
  try {
    const postId = req.body.postId;
    const likedUsername = req.body.likedUsername;
    let response = { message: "Action Not Found", statusCode: 404 };
    switch (req.params.action) {
      case "add":
        await Posts.findByIdAndUpdate(postId, {
          $push: { like: likedUsername },
        });
        response = { message: "Liked", statusCode: 200 };
        break;
      default:
        break;
    }
    res.status(response.statusCode).send(response.message);
  } catch (error: any) {
    res.status(500).json({ message: error?.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
