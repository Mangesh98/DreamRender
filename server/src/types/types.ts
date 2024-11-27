import mongoose from "mongoose";

export interface User {
	name: string;
	email: string;
	password: string;
	creditBalance?: number;
}
// userId,
// 			plan,
// 			credits,
// 			amount,
// 			date,
export interface Transaction {
	userId: mongoose.Types.ObjectId;
	plan: string;
	credits: number;
	amount: number;
	date: Date;
	payment?: boolean;
}
