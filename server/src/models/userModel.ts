import mongoose from "mongoose";
import { User } from "../types/types";

const userSchema = new mongoose.Schema<User>({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	creditBalance: {
		type: Number,
		default: 5,
	},
});

const userModel = mongoose.models.user || mongoose.model("User", userSchema);

export default userModel;
