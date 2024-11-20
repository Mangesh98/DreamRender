import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Define allowed origins dynamically based on the environment
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
	"http://localhost:3000",
];

const corsOptions: cors.CorsOptions = {
	origin: (origin, callback) => {
		if (!origin || allowedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
};

// Middlewares
app.use(cors(corsOptions));
app.use(helmet()); 
app.use(express.json());

// Routes
app.get("/", (req: Request, res: Response) => {
	res.send("Dream Render Server is up and running!");
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	console.error(`[error]: ${err.message}`);
	res.status(500).json({ error: "Internal Server Error" });
});

// Start the server
const server = app.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
	console.log("SIGTERM signal received: closing server...");
	server.close(() => {
		console.log("Server closed gracefully.");
		process.exit(0);
	});
});
