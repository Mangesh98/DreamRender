import mongoose from "mongoose";
import { Transaction } from "../types/types";

const transactionSchema = new mongoose.Schema<Transaction>({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "user",
		required: true,
	},
	amount: {
		type: Number,
		required: true,
	},
	date: {
		type: Date,
		required: true,
	},
	credits: {
		type: Number,
		required: true,
	},
	plan: {
		type: String,
		required: true,
	},
	payment: {
		type: Boolean,
		default: false,
	},
});

const transactionModel =
	mongoose.models.transaction ||
	mongoose.model("transaction", transactionSchema);

export default transactionModel;
