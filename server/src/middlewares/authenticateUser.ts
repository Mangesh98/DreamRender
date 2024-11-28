import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
	body: {
		userId?: string;
		[key: string]: any;
	};
}

interface TokenPayload {
	id: string;
	iat: number;
	exp: number;
}

class AuthenticationError extends Error {
	constructor(public statusCode: number, message: string) {
		super(message);
		this.name = "AuthenticationError";
	}
}

export const authenticateUser = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		const { token } = req.headers;

		if (!token) {
			throw new AuthenticationError(401, "No authentication token provided");
		}

		const jwtSecret = process.env.JWT_SECRET;
		if (!jwtSecret) {
			throw new AuthenticationError(500, "JWT configuration error");
		}

		const decodedToken = jwt.verify(token as string, jwtSecret) as TokenPayload;

		if (!decodedToken || !decodedToken.id) {
			throw new AuthenticationError(401, "Invalid token");
		}

		req.body.userId = decodedToken.id; // Assign only the string ID.

		next();
	} catch (error) {
		if (error instanceof AuthenticationError) {
			res.status(error.statusCode).json({
				success: false,
				message: error.message,
			});
			return;
		}

		if (error instanceof jwt.JsonWebTokenError) {
			res.status(401).json({
				success: false,
				message: "Invalid token",
			});
			return;
		}

		console.error("Authentication error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};
