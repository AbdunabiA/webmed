import * as React from "react";
import { ButtonBase, Paper, colors } from "@mui/material";
import { MainButton } from "@vkruglikov/react-telegram-web-app";

interface NavigationProps {
    display: string;
	text: string;
	handleClick: () => void;
}

const SimpleBottomNavigation: React.FC<NavigationProps> = ({ display, text, handleClick }) => {
	return (
			<MainButton
				text={text}
				onClick={handleClick}
			/>
	);
}

export default SimpleBottomNavigation;