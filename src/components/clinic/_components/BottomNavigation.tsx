import * as React from "react";
import { ButtonBase, Paper, colors } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { saveSelectedDoctor } from "../../../utils/storage";

interface NavigationProps {
    display: string;
    doctorName: string;
}

export default function SimpleBottomNavigation(props: NavigationProps) {
    const navigate = useNavigate();
	return (
		<ButtonBase
			component={Paper}
			sx={{
                display: props.display,
				position: "fixed",
				bottom: 0,
				left: 0,
				right: 0,
				backgroundColor: colors.blue[500],
			}}
			elevation={3}
			onClick={() => {
				saveSelectedDoctor(props.doctorName);
                navigate(`/doctor/${1}`);
			}}
		>
			<p>Book with {props.doctorName}</p>
		</ButtonBase>
	);
}
