import userModel from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../types/user";

export const registerUser = async (req: any, res: any) => {
	console.log("Inside register user api: ", req.body);
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
