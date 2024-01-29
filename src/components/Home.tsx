import * as React from "react";
import Logo from "./common/Logo";
import { ArrowForward } from "@mui/icons-material";
import { Paper, Typography, Button, Container, colors, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
	const navigate = useNavigate();
	return (
		<Container
			sx={{
				display: "flex",
				alignItems: "center",
				flexDirection: "column",
			}}
		>
			<Logo />
			<Paper
				elevation={0}
				sx={{
					display: "flex",
					alignItems: "center",
					flexDirection: "column",
					padding: "20px",
					marginTop: "20px",
				}}
			>
				<Typography variant="h2" mb={2}>
					ТелеКур
				</Typography>
				<Typography sx={{ textAlign: "center" }}>
					Ваше благополучие является нашим главным приоритетом.
				</Typography>
				<button
					onClick={() => {
						navigate("/doctor");
					}}
					style={{
						margin: "20px",
						minWidth: "240px",
						minHeight: "50px",
						borderRadius: "50px",
						border: 0,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						color: colors.common.white,
						backgroundColor: colors.blue[400],
					}}
				>
					<Typography
						variant="h6"
						sx={{ fontWeight: "bold", marginRight: "5px" }}
					>
						Выбрать врача
					</Typography>{" "}
					<ArrowForward fontSize="small" />
				</button>
				{/* <Link
					to="/meeting/hello/a3xIMFtZbTxbfC9kVV5kfEkkMlskfXwvZFVeZHxbIkhtfC9kfEkkMlskfXxx"
					style={{
						color: colors.blue[400],
						fontSize: "23px",
						fontWeight: "bolder",
						textDecoration: "none",
					}}
				>
					Meeting
				</Link> */}
			</Paper>
		</Container>
	);
};

export default Home;
