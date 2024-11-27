import express, { NextFunction, Request, Response } from "express";
import {
	addCredits,
	loginUser,
	registerUser,
	userCredits,
} from "../controllers/userController";
import { authenticateUser } from "../middlewares/authenticateUser";

const userRouter = express.Router();
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/credits", authenticateUser, userCredits);
userRouter.get(
	"/pay-razor",
	authenticateUser,
	(req: Request, res: Response, next: NextFunction) => {
		addCredits(req, res).catch(next);
	}
);

export default userRouter;
