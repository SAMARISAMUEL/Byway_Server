const User = require("../models/User"); // Bring in the user
const jwt = require("jsonwebtoken"); // for authenticating users
const bcrypt = require("bcryptjs");
const { check } = require("express-validator");

// Request is coming from the frontend
// Response is the react of the backend to the request

// Operations to : Signup A User
const signup = async (req, res) => {
  try {
    // // Get the data from the request body (coming from the frontend)
    // const { firstname, lastname, username, email, password } = req.body;

    // // check if firstname,lastname, username, email already exist. i.e if we already have a user with this information
    // const existingUser = await User.findOne({
    //   $or: [{ firstname }, { lastname }, { username }, { email }], //queries the database and sort through the data inside the database for that value
    // });

    // if (existingUser) {
    //   if (
    //     existingUser.firstname === firstname &&
    //     existingUser.lastname === lastname
    //   ) {
    //     return res
    //       .status(400)
    //       .json({ success: false, message: "You already have an account" });
    //   }

    //   if (existingUser.username === username) {
    //     return res
    //       .status(400)
    //       .json({ success: false, message: "Username already exists" });
    //   }

    //   if (existingUser.email === email) {
    //     return res
    //       .status(400)
    //       .json({ success: false, message: "Email already exists" });
    //   }
    // }

    // Because firstname and lastname are not unique. So what you did up there is okay but it's not the best way to do it.
    // Below is a better way to attempt it.
    const { firstname, lastname, username, email, password } = req.body;

    // Check if email or username already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });


    // so now we check, if the user exists, we return a response dynamic enough to tell us if it's user name or password
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.username === username
          ? "Username already exists"
          : "Email already exists",
      });
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

// const signin = async (req, res) => {
//   try {
//     // Get the data from the request body (coming from the frontend)
//     const { username, email, password } = req.body; // destructuring
//     // find the user by their username
//     const user = await User.findOne({ username, email });

//     if (!user) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid Username or email" });
//     }

//     // check if the password is correct
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid Password" });
//     }

//     //generate token
//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "1d",
//     });

//     // return success response
//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,

//         username: user.username,
//         email: user.email,
//       },
//     });
//   } catch (error) {
//     console.log("Signin Error:", error);
//     res.status(500).json({ message: "Server error during login" });
//   }
// };

// i have issues with the signin function
const signin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Ensure username or email is provided
    if (!username && !email) {
      return res.status(400).json({
        success: false,
        message: "Please provide a username or email.",
      });
    }

    // Find the user by email OR username
    const user = await User.findOne({
      $or: [{ username }, { email }],
    });

    // If user not found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or email.",
      });
    }

    // Compare entered password with hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password.",
      });
    }

    // Success response (Generate a JWT token if needed)
    res.status(200).json({
      success: true,
      message: "Login successful!",
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
      error: error.message,
    });
  }
};


module.exports = { signup, signin };
