import React from "react";
import { Container, Typography, Button, Box, colors } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Link } from "react-router-dom";
import telegramWindow from "../../telegram-window";

const SuccessfulPage = () => {
	return (
		<Container maxWidth="sm" sx={{ textAlign: "center", mt: 4 }}>
			{/* MedSync logo */}
			{/* Add your MedSync logo image or component here */}

			<Box sx={{ mt: 4 }}>
				<CheckCircleIcon color="success" sx={{ fontSize: 80 }} />
			</Box>

			<Typography
				variant="h4"
				sx={{ mt: 2, color: colors.grey[400], fontWeight: 900 }}
			>
				Успешный
			</Typography>
			<Typography>
				Вы успешно записались на прием к врачу в ТелеКур
			</Typography>

			<Box sx={{ mt: 4 }}>
				<Button
					variant="contained"
					color="primary"
					sx={{
						mr: 2,
						borderRadius: "50px",
						minWidth: "200px",
						minHeight: "50px",
					}}
					onClick={() => {
						telegramWindow.Telegram &&
							telegramWindow.Telegram.WebApp.close();
					}}
				>
					Закрывать
				</Button>
				<br />
				<br />
				<Link
					to="/"
					style={{
						color: colors.blue[600],
						fontSize: "20px",
						fontWeight: "bolder",
						textDecoration: "none",
					}}
				>
					Запишитесь на другую встречу
				</Link>
			</Box>
		</Container>
	);
};

export default SuccessfulPage;
