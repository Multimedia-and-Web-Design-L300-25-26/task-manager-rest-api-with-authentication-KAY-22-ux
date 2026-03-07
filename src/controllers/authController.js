import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";


const generateToken = (userId) => {
  return jwt.sign(
    { id: userId }, // Data to encode in token
    process.env.JWT_SECRET, // Secret key
    { expiresIn: "7d" } // Token expires in 7 days
  );
};


export const register = async (request, response) => {
  try {
    // Get data from request body
    const { name, email, password } = request.body;

    // Validate that all required fields are provided
    if (!name || !email || !password) {
      return response.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }



    // Check if email already exists
    const userExists = await User.findOne({
      email: email.toLowerCase(),
    });

    if (userExists) {
      return response.status(409).json({
        success: false,
        message: "Email already in use",
      });
    }

    // Hash the password using bcrypt
    // bcrypt.hash(password, saltRounds)
    // Higher saltRounds = more secure but slower
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Return response without password
    const userResponse = newUser.toObject();
    delete userResponse.password;

    response.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Register error:", error);
    response.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};


export const login = async (request, response) => {
  try {
    // Get email and password from request body
    const { email, password } = request.body;

    // Validate input
    if (!email || !password) {
      return response.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user by email
    // select("+password") is needed because password has select: false in schema
    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    // Check if user exists
    if (!user) {
      return response.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare provided password with hashed password in database
    // bcrypt.compare returns true if passwords match
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return response.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Return success response
    response.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    response.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};
