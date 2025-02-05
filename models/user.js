const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    trim: true,
  },
  lastname: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
});

// Encrypt the password before

userSchema.pre("save", async function (next) {
  //only encrpyt if the password is being modified.

  if (!this.isModified("password")) return next();

  // encrypt the password
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//create model
const User = mongoose.model("User", userSchema);

module.exports = User;
