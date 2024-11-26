import express, { Request, Response, NextFunction } from "express";
import { authenticateUser } from "../middlewares/authenticateUser";
import { generateImage } from "../controllers/imageController";

const imageRouter = express.Router();
// imageRouter.post("/generate-image", authenticateUser, generateImage);
imageRouter.post(
	"/generate-image",
	authenticateUser,
	(req: Request, res: Response, next: NextFunction) => {
		generateImage(req, res).catch(next);
	}
);

export default imageRouter;
