import React from "react";
import {
	Box,
	Card,
	CardContent,
	Typography,
	colors,
} from "@mui/material";
import { CardData } from "./types";

interface ClinicCardProps {
	card: CardData;
	onSelect: (card: CardData) => void;
	isSelected: boolean;
}

const ClinicCard: React.FC<ClinicCardProps> = ({
	card,
	onSelect,
	isSelected,
}) => {
	return (
		<Box
			sx={{
				marginTop: "15px",
				cursor: "pointer",
			}}
			onClick={() => onSelect(card)}
		>
			<Card
				sx={{
					display: "flex",
					backgroundColor: isSelected ? colors.blue[500] : "transparent",
                    border: "3px solid black",
                    borderRadius: "10px"
				}}
			>
				<Box sx={{ display: "flex", flexDirection: "column" }}>
					<CardContent sx={{ flex: "1 0 auto" }}>
						<Typography component="div" variant="h5">
							{card.direction}
						</Typography>
						<Typography
							variant="subtitle1"
							color="text.secondary"
							component="div"
						>
							{card.doctor}
						</Typography>
					</CardContent>
				</Box>
			</Card>
		</Box>
	);
};

export default ClinicCard;
