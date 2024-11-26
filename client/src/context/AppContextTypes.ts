import { ReactNode } from "react";
export interface User {
	name: string;
}
export interface GenerateImageResponse {
	success: boolean;
	imageUrl: string;
}
export interface AppContextType {
	user: User | null;
	setUser: React.Dispatch<React.SetStateAction<User | null>>;
	showLogin: boolean;
	setShowLogin: React.Dispatch<React.SetStateAction<boolean>>;
	backendUrl: string;
	token: string;
	setToken: React.Dispatch<React.SetStateAction<string>>;
	credit: number;
	setCredit: React.Dispatch<React.SetStateAction<number>>;
	loadCredit: () => Promise<void>;
	logout: () => void;
	generateImage: (prompt: string) => Promise<GenerateImageResponse>;
}

export interface AppContextProviderProps {
	children: ReactNode;
}
