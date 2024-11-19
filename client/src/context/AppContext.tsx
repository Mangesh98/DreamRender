import React, { createContext, useState, ReactNode } from "react";

// Define the context value type
interface AppContextType {
	user: boolean | null;
	setUser: React.Dispatch<React.SetStateAction<boolean | null>>;
}

// Create the context with a default value of `undefined`
export const AppContext = createContext<AppContextType | undefined>(undefined);

// Define the props for the provider component
interface AppContextProviderProps {
	children: ReactNode;
}

const AppContextProvider: React.FC<AppContextProviderProps> = ({
	children,
}) => {
	const [user, setUser] = useState<boolean | null>(null);

	const value = {
		user,
		setUser,
	};

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
