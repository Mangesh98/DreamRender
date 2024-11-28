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


interface PlanConfig {
	plan: string;
	credits: number;
	amount: number;
}

const PLAN_CONFIGS: Record<string, PlanConfig> = {
	Basic: { plan: "Basic", credits: 100, amount: 10 },
	Advanced: { plan: "Advanced", credits: 500, amount: 50 },
	Business: { plan: "Business", credits: 5000, amount: 250 },
};

const getRazorpayInstance = () =>
	new Razorpay({
		key_id: process.env.RAZORPAY_KEY_ID || "",
		key_secret: process.env.RAZORPAY_KEY_SECRET || "",
	});

export const paymentRazorpay = async (req: Request, res: Response) => {
	try {
		const { userId, planId } = req.body;
		const user = await userModel.findById(userId);

		if (!user || !planId) {
			return res.status(400).json({
				success: false,
				message: "Invalid user or plan details",
			});
		}

		const planConfig = PLAN_CONFIGS[planId];
		if (!planConfig) {
			return res.status(400).json({
				success: false,
				message: "Invalid Plan",
			});
		}

		const transactionData = {
			userId,
			...planConfig,
			date: new Date(),
		};

		const transaction = await transactionModel.create(transactionData);
		const razorpayInstance = getRazorpayInstance();

		const options = {
			amount: planConfig.amount * 100,
			currency: process.env.RAZORPAY_CURRENCY || "INR",
			receipt: transaction._id.toString(),
			payment_capture: 1,
		};

		const order = await new Promise<any>((resolve, reject) => {
			razorpayInstance.orders.create(options, (error, order) => {
				if (error) reject(error);
				else resolve(order);
			});
		});

		return res.status(200).json({
			success: true,
			message: "Order created successfully",
			order,
		});
	} catch (error) {
		console.error("Payment creation error:", error);
		return res.status(500).json({
			success: false,
			message: "Error creating order",
		});
	}
};

export const verifyRazorpay = async (req: Request, res: Response) => {
	try {
		const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
			req.body.response;

		if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
			return res.status(400).json({
				success: false,
				message: "Invalid payment details",
			});
		}

		const razorpayInstance = getRazorpayInstance();
		const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

		if (orderInfo.status !== "paid") {
			return res.status(400).json({
				success: false,
				message: "Order not paid",
			});
		}

		const transactionData = await transactionModel.findById(orderInfo.receipt);
		if (!transactionData) {
			return res.status(400).json({
				success: false,
				message: "Transaction not found",
			});
		}

		if (transactionData.payment) {
			return res.status(400).json({
				success: false,
				message: "Payment already verified",
			});
		}

		const user = await userModel.findById(transactionData.userId);
		if (!user) {
			return res.status(400).json({
				success: false,
				message: "User not found",
			});
		}

		user.creditBalance += transactionData.credits;
		await user.save();

		return res.status(200).json({
			success: true,
			message: "Payment verified successfully",
		});
	} catch (error) {
		console.error("Payment verification error:", error);
		return res.status(500).json({
			success: false,
			message: "Error verifying payment",
		});
	}
};
