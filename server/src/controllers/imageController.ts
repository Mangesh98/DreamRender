import FormData from "form-data";
import userModel from "../models/userModel";
import axios, { AxiosError } from "axios";
import { Request, Response } from "express";

interface GenerateImageRequest {
	userId: string;
	prompt: string;
}

export const generateImage = async (req: Request, res: Response) => {
	try {
		const { userId, prompt } = req.body as GenerateImageRequest;

		// Validate input
		if (!userId || !prompt) {
			return res.status(400).json({
				success: false,
				error: "Missing user ID or prompt",
			});
		}

		// Find user and validate
		const user = await userModel.findById(userId);
		if (!user) {
			return res.status(404).json({
				success: false,
				error: "User not found",
			});
		}

		// Check credit balance
		if (user.creditBalance <= 0) {
			return res.status(403).json({
				success: false,
				error: "Insufficient credit balance",
				creditBalance: user.creditBalance,
			});
		}

		// Prepare API request
		const formData = new FormData();
		formData.append("prompt", prompt);

		try {
			const { data } = await axios.post(
				"https://clipdrop-api.co/text-to-image/v1",
				formData,
				{
					headers: {
						...formData.getHeaders(),
						"x-api-key": process.env.CLIPDROP_API || "",
					},
					responseType: "arraybuffer",
				}
			);

			// Validate API response
			if (!data) {
				return res.status(500).json({
					success: false,
					error: "Failed to generate image",
				});
			}

			// Convert image to base64
			const base64Image = Buffer.from(data, "binary").toString("base64");
			const image_url = `data:image/png;base64,${base64Image}`;

			// Update user credit balance
			user.creditBalance -= 1;
			await user.save();

			// Respond with success
			return res.status(200).json({
				success: true,
				message: "Image generated successfully",
				creditBalance: user.creditBalance,
				image_url,
			});
		} catch (error) {
			// Detailed error handling for API call
			if (error instanceof AxiosError) {
				console.error("Clipdrop API Error:", {
					status: error.response?.status,
					data: error.response?.data,
					message: error.message,
				});

				return res.status(error.response?.status || 500).json({
					success: false,
					error: "Error communicating with image generation service",
				});
			}

			// Generic error handling
			console.error("Unexpected error:", error);
			return res.status(500).json({
				success: false,
				error: "Unexpected error occurred",
			});
		}
	} catch (error) {
		// Database or other unexpected errors
		console.error("Server error:", error);
		return res.status(500).json({
			success: false,
			error: "Internal server error",
		});
	}
};