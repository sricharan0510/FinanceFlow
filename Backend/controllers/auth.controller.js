import { User } from "../models/user.model.js";
import { OAuth2Client } from "google-auth-library"; 
import crypto from "crypto";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
    const { credential } = req.body; 
    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name,
                email,
                password: crypto.randomBytes(16).toString('hex'), 
            });
        }

        const accessToken = user.generateAccessToken();
        const loggedInUser = await User.findById(user._id).select("-password");

        return res.status(200).json({
            message: "User logged in successfully via Google",
            user: loggedInUser,
            accessToken,
        });

    } catch (error) {
        console.error("Google login error:", error);
        res.status(401).json({ message: "Invalid Google token" });
    }
};

export const registerUser = async (req, res) => {
    const { name, email, password, savingTarget } = req.body;

    if ([name, email, password].some((field) => field?.trim() === "")) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" });
    }

    const user = await User.create({
        name,
        email,
        password,
        savingTarget,
    });

    const createdUser = await User.findById(user._id).select("-password");

    if (!createdUser) {
        return res.status(500).json({ message: "Something went wrong while registering the user" });
    }

    const accessToken = createdUser.generateAccessToken();

    return res.status(201).json({
        message: "User registered successfully",
        user: createdUser,
        accessToken,
    });
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: "User does not exist" });
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid user credentials" });
    }

    const accessToken = user.generateAccessToken();
    const loggedInUser = await User.findById(user._id).select("-password");

    return res.status(200).json({
        message: "User logged in successfully",
        user: loggedInUser,
        accessToken,
    });
};