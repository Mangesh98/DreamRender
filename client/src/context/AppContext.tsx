import React, { createContext, useState } from "react";
import { AppContextType, AppContextProviderProps } from "./AppContextTypes";

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext<AppContextType | undefined>(undefined);

const AppContextProvider: React.FC<AppContextProviderProps> = ({
	children,
}) => {
	const [user, setUser] = useState<boolean | null>(null);
	const [showLogin, setShowLogin] = useState<boolean>(false);

	const value = {
		user,
		setUser,
		showLogin,
		setShowLogin,
	};

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
