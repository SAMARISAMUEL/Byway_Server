const User = require("../models/User"); // Bring in the user
const jwt = require("jsonwebtoken"); // for authenticating users
const bcrypt = require("bcryptjs");

// Request is coming from the frontend
// Response is the react of the backend to the request

// Operations to : Signup A User
const signup = async (req, res) => {
  try {
    // Get the data from the request body (coming from the frontend)
    const { firstname, lastname, username, email, password } = req.body;

    // check if firstname,lastname, username, email already exist. i.e if we already have a user with this information
    const existingUser = await User.findOne({
      $or: [{ firstname }, { lastname }, { username }, { email }], //queries the database and sort through the data inside the database for that value
    });

    if (existingUser) {
      if (
        existingUser.firstname === firstname &&
        existingUser.lastname === lastname
      ) {
        return res
          .status(400)
          .json({ success: false, message: "You already have an account" });
      }

      if (existingUser.username === username) {
        return res
          .status(400)
          .json({ success: false, message: "Username already exists" });
      }

      if (existingUser.email === email) {
        return res
          .status(400)
          .json({ success: false, message: "Email already exists" });
      }
    }

    // create new user
    const newUser = new User({
      firstname,
      lastname,
      username,
      password,
      email,
    });
    await newUser.save(); // the user's information is saved to the database "_id"

    res.status(201).json({
      success: true,
      message: "User Created Successfully",
      user: {
        id: newUser._id,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.log("Signup Error:", error);
    res.status(500).json({ message: "Error signing up users" });
  }
};

const signin = async (req, res) => {
  try {
    // Get the data from the request body (coming from the frontend)
    const { username, email, password } = req.body;

    // find the user by their username

    const user = await User.findOne({ username, email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Username or email" });
    }

    // check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Password" });
    }

    //generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // return success response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,

        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("Signin Error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

module.exports = { signup, signin };
