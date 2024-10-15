const mongoose = require("mongoose");

const userSChema = new mongoose.Schema({
  email: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: String,
  age: Number,
  friends: Array,
  friendRequests: Array,
});
const userLoginSChema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});
// export const UserLogin = mongoose.model("User", userLoginSChema);
export const User = mongoose.model("User", userSChema);
