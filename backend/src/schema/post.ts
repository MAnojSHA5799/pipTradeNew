import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  username: String,
  comment: String,
});
const postSChema = new mongoose.Schema({
  content: { type: String, reuired: true },
  postBy: { type: String, reuired: true },
  comments: [commentSchema],
  like: Array,
});

export const Posts = mongoose.model("Posts", postSChema);
