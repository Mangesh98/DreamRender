import React, { createContext, useEffect, useState } from "react";
import {
	AppContextType,
	AppContextProviderProps,
	User,
} from "./AppContextTypes";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { GenerateImageResponse } from "./AppContextTypes";
// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext<AppContextType | undefined>(undefined);

const AppContextProvider: React.FC<AppContextProviderProps> = ({
	children,
}) => {
	const navigate = useNavigate();
	const [user, setUser] = useState<User | null>(null);
	const [showLogin, setShowLogin] = useState<boolean>(false);
	const [token, setToken] = useState(localStorage.getItem("token") || "");
	const [credit, setCredit] = useState<number>(0);

	const backendUrl = import.meta.env.VITE_BACKEND_URL;

	const generateImage = async (
		prompt: string
	): Promise<GenerateImageResponse> => {
		try {
			const { data } = await axios.post(
				`${backendUrl}/api/image/generate-image`,
				{ prompt },
				{
					headers: {
						token,
					},
					validateStatus: (status) => status < 500, // Only throw for 500+ status codes
				}
			);

			if (data.success) {
				loadCredit();
				return { success: true, imageUrl: data.image_url };
			} else {
				loadCredit();
				toast.error(data.message);

				if (data.creditBalance === 0) {
					navigate("/buy");
				}
				return { success: false, imageUrl: "" };
			}
		} catch (error) {
			// Handle Axios or other errors
			if (axios.isAxiosError(error)) {
				// Handle cases like network issues or 500+ errors
				const errorMessage =
					error.response?.data?.message || "An error occurred.";
				toast.error(errorMessage);
			} else {
				// Handle unexpected runtime errors
				toast.error("Something went wrong. Please try again.");
			}

			return { success: false, imageUrl: "" };
		}
	};

	const logout = () => {
		localStorage.removeItem("token");
		setToken("");
		setUser(null);
	};

	const loadCredit = async () => {
		try {
			const { data } = await axios.get(`${backendUrl}/api/user/credits`, {
				headers: {
					token,
				},
			});
			if (data.success) {
				setCredit(data.credits);
				setUser(data.user);
			}
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const axiosError = error as AxiosError<{ message: string }>;
				const errorMessage =
					axiosError.response?.data?.message ||
					"Server error. Please try again later.";
				toast.error(errorMessage);
			} else {
				toast.error("An unexpected error occurred. Please try again.");
			}
		}
	};
	useEffect(() => {
		if (token) {
			loadCredit();
		}
	}, [token]);

	const value = {
		user,
		setUser,
		showLogin,
		setShowLogin,
		backendUrl,
		token,
		setToken,
		credit,
		setCredit,
		loadCredit,
		logout,
		generateImage,
	};

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
