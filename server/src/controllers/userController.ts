import userModel from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Transaction, User } from "../types/types";
import Razorpay from "razorpay";
import { Request, Response } from "express";
import transactionModel from "../models/transactionModel";

export const registerUser = async (req: any, res: any) => {
	try {
		const { name, email, password } = req.body;
		if (!name || !email || !password) {
			return res
				.status(400)
				.json({ success: false, message: "Please provide all fields" });
		}
		const user = await userModel.findOne({ email });
		if (user) {
			return res
				.status(400)
				.json({ success: false, message: "User already exists" });
		}
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		const userData: User = {
			name,
			email,
			password: hashedPassword,
		};
		const newUser = await userModel.create(userData);
		if (!process.env.JWT_SECRET) {
			return res
				.status(500)
				.json({ success: false, message: "JWT secret not set" });
		}
		const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
			expiresIn: "1d",
		});

		res.status(201).json({
			success: true,
			message: "User created successfully",
			token,
			user: {
				name: newUser.name,
			},
		});
	} catch (error) {
		console.log(error);

		res
			.status(500)
			.json({ success: false, message: "Error creating user", error });
	}
};

export const loginUser = async (req: any, res: any) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res
				.status(400)
				.json({ success: false, message: "Please provide all fields" });
		}
		const user = await userModel.findOne({ email });
		if (!user) {
			return res
				.status(400)
				.json({ success: false, message: "Invalid Details !" });
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return res
				.status(400)
				.json({ success: false, message: "Invalid Details !" });
		}
		if (!process.env.JWT_SECRET) {
			return res
				.status(500)
				.json({ success: false, message: "JWT secret not set" });
		}
		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: "1d",
		});

		res.status(200).json({
			success: true,
			message: "User logged in successfully",
			token,
			user: {
				name: user.name,
			},
		});
	} catch (error) {
		console.log(error);

		res
			.status(500)
			.json({ success: false, message: "Error logging in user", error });
	}
};

export const userCredits = async (req: any, res: any) => {
	try {
		const { userId } = req.body;

		const user = await userModel.findById(userId);
		if (!user) {
			return res
				.status(400)
				.json({ success: false, message: "Invalid Details !" });
		}
		res.status(200).json({
			success: true,
			message: "User credits fetched successfully",
			credits: user.creditBalance,
			user: {
				name: user.name,
			},
		});
	} catch (error) {
		console.log(error);
		res
			.status(500)
			.json({ success: false, message: "Error fetching user credits", error });
	}
};

var razorpayInstance = new Razorpay({
	key_id: process.env.RAZORPAY_KEY_ID || "",
	key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});
export const addCredits = async (req: Request, res: Response) => {
	try {
		const { userId, planId } = req.body;
		const user = await userModel.findById(userId);
		if (!user || !planId) {
			return res
				.status(400)
				.json({ success: false, message: "Invalid Details !" });
		}

		let plan, credits, amount;
		switch (planId) {
			case "Basic":
				plan = "Basic";
				credits = 100;
				amount = 10;
				break;
			case "Advanced":
				plan = "Advanced";
				credits = 500;
				amount = 50;
				break;
			case "Business":
				plan = "Business";
				credits = 5000;
				amount = 250;
				break;

			default:
				return res.status(400).json({
					success: false,
					message: "Invalid Plan",
				});
		}
		let date = new Date(Date.now());
		const transactionData: Transaction = {
			userId,
			plan,
			credits,
			amount,
			date,
		};
		const transaction = await transactionModel.create(transactionData);
		const options = {
			amount: amount * 100, // amount in smallest currency unit
			currency: process.env.RAZORPAY_CURRENCY || "INR",
			receipt: transaction._id.toString(),
			payment_capture: 1,
		};
		razorpayInstance.orders.create(options, (error, order) => {
			if (error) {
				console.log(error);

				return res.status(500).json({
					success: false,
					message: "Error creating order",
				});
			}
			return res.status(200).json({
				success: true,
				message: "Order created successfully",
				order,
			});
		});
	} catch (error) {
		console.log(error);
	}
};
