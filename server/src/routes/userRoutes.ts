import express, { NextFunction, Request, Response } from "express";
import {
	loginUser,
	paymentRazorpay,
	registerUser,
	userCredits,
	verifyRazorpay,
} from "../controllers/userController";
import { authenticateUser } from "../middlewares/authenticateUser";

const userRouter = express.Router();
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/credits", authenticateUser, userCredits);
userRouter.post(
	"/pay-razor",
	authenticateUser,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			await paymentRazorpay(req, res);
		} catch (error) {
			next(error);
		}
	}
);

userRouter.post(
	"/verify-razor",
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			await verifyRazorpay(req, res);
		} catch (error) {
			next(error);
		}
	}
);
export default userRouter;
