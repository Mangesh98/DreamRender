import express from "express";
import {
	loginUser,
	registerUser,
	userCredits,
} from "../controllers/userController";
import { authenticateUser } from "../middlewares/authenticateUser";

const userRouter = express.Router();
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/credits", authenticateUser, userCredits);

export default userRouter;
