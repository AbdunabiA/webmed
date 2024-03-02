import { Box } from "@mui/material";
import React from "react";

interface HeaderProps {
    title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
    return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
                marginLeft: "5px",
                marginRight: "5px"
			}}
		>
			<h2>{title}</h2>
			<img
				src="logo.jpg"
				alt="logo"
				style={{
					width: "30px",
					height: "30px",
					borderRadius: "50%",
				}}
			/>
		</Box>
	);
}

export default Header;