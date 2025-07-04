import User from "../models/User.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export const Register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // check if user not registered
    const checkRegistrationStatus = await User.findOne({ email });
    if (checkRegistrationStatus) {
      return res.status(409).json({
        status: false,
        message: "User already registered",
      });
    }

    // hash password
    const hashPassword = bcryptjs.hashSync(password, 10);

    const newRegistration = new User({
      username,
      email,
      password: hashPassword,
    });

    await newRegistration.save();

    res.status(200).json({
      status: true,
      message: "Registration success.",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).lean().exec();
    if (!user) {
      return res.status(403).json({
        status: false,
        message: "Invalid login credentials",
      });
    }

    const isVerifyPassword = await bcryptjs.compare(password, user.password);
    if (!isVerifyPassword) {
      return res.status(403).json({
        status: false,
        message: "Invalid login credentials.",
      });
    }

    delete user.password;

    const token = jwt.sign(user, process.env.JWT_SECRET);

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: true,
      message: "Login Success.",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Something went wrong",
    });
  }
};
