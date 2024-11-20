const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const BadRequestError = require("../../../../shared/errors/BadRequestError");
const UnauthorizedError = require("../../../../shared/errors/UnauthorizedError");
const {
  sendSuccess,
  sendError,
} = require("../../../../shared/utils/responseHandler");
const NotFoundError = require("../../../../shared/errors/NotFoundError");
const tokenBlacklist = new Set();

const registerUser = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new BadRequestError("Username, email, and password are required.");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new BadRequestError("User already exists...");
  }

  try {
    const user = new User({ username, email, password });
    await user.save();

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    sendSuccess(
      res,
      {
        data: {
          token,
          user: {
            _id: user._id,
            username: user.username,
            email: user.email,
          },
        },
        message: "User registered successfully",
      },
      201
    );
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Email and password are required.");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthorizedError("Invalid email or password.");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedError("Invalid email or password.");
  }

  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  sendSuccess(
    res,
    {
      data: { token ,user:{
        _id:user._id,
        username:user.username,
        email:user.email,
      }},
      message: "Logged in successfully",
    },
    200
  );
};

const logoutUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    tokenBlacklist.add(token);
    sendSuccess(
      res,
      {
        message: "Logged out successfully.",
      },
      200
    );
  } else {
    throw new BadRequestError("Authorization token not provided.");
  }
};

const getUserById = async (req, res, next) => {
  const { id } = req.params;

  if(id.toString()!==req.user.id.toString()){
    throw new NotFoundError("User not found");
  }
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(id)) {
    throw new BadRequestError("Invalid user ID format.");
  }

  const user = await User.findById(id).select("-password");
  if (!user) {
    throw new NotFoundError("User not found.");
  }
  sendSuccess(
    res,
    {
      data: { user},
      message: "User retrieved successfully.",
    },
    200
  );
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserById,
  tokenBlacklist,
};
