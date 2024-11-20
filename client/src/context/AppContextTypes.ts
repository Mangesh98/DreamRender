import { ReactNode } from "react";

export interface AppContextType {
	user: boolean | null;
	setUser: React.Dispatch<React.SetStateAction<boolean | null>>;
	showLogin: boolean;
	setShowLogin: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface AppContextProviderProps {
	children: ReactNode;
}
