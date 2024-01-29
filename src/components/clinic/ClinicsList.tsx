import React, { useEffect, useState } from "react";
import { Box, useTheme } from "@mui/material";
import SearchInput from "../common/SearchInput";
import ClinicCard from "../clinic/ClinicCard"; // Assuming you have a ClinicCard component
import SimpleBottomNavigation from "./_components/BottomNavigation";
import { CardData } from "./types";

const ClinicsList = () => {
	const [selectedClinic, setSelectedClinic] = useState<CardData | null>(null);
	const [clinicsList, setClinicsList] = useState<CardData[]>([
		{
			id: 1,
			title: "clinic1",
			doctor: "dsd",
			imageUrl:
				"https://www.woodlandshospital.in/images/doctor-img/Soutik-Panda-New1.jpg",
			direction: "Nevrolog",
		},
		// ... other clinic entries
	]);

	const theme = useTheme();

	useEffect(() => {
		const fetchClinicsData = async () => {
			// const response = await api.getClinics()
			// setClinicsList(response.data);
		};
		fetchClinicsData();
	}, [clinicsList, selectedClinic]);

	const handleClinicSelect = (clinic: CardData) => {
		setSelectedClinic(clinic);
	};

	const handleSearchValue = (value: string) => {
		console.log(value);
	};

	return (
		<div style={{ minWidth: `${window.innerWidth - 25}px` }}>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<h2>Select a Clinic</h2>
				<img
					src="logo192.png"
					alt="logo"
					style={{
						width: "35px",
						height: "35px",
						borderRadius: "50%",
					}}
				/>
			</Box>
			<SearchInput onChange={handleSearchValue}/>
			<Box sx={{ marginTop: "15px" }}>
				{clinicsList?.map((clinic) => (
					<ClinicCard
						key={clinic.id}
						card={clinic}
						isSelected={selectedClinic?.id === clinic.id}
						onSelect={() => {
							if (selectedClinic?.id === clinic.id) {
								setSelectedClinic(null);
							} else {
								setSelectedClinic(clinic);
							}
						}}
					/>
				))}
			</Box>
			<SimpleBottomNavigation
				display={selectedClinic !== null ? "flex" : "none"}
				doctorName={selectedClinic?.doctor as string}
			/>
		</div>
	);
};

export default ClinicsList;
