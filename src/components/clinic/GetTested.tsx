import React, { useState } from "react";
import SearchInput from "../common/SearchInput";
import { Box, Card, CardContent, Grid, colors } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Header from "../header/Header";

const GetTested: React.FC = () => {
	const clinics = [
		{
			location_id: 1,
			name: "Medical Center A",
			address: "123 Main Street, City A",
			backgroundImage: "url('clinic.jpeg')", // Replace with actual image URL
		},
		{
			location_id: 2,
			name: "Health Clinic B",
			address: "456 Elm Street, City B",
			backgroundImage: "url('health_clinic_b.jpg')", // Replace with actual image URL
		},
		{
			location_id: 3,
			name: "Wellness Center C",
			address: "789 Oak Street, City C",
			backgroundImage: "url('logo192.jpg')", // Replace with actual image URL
		},
		{
			location_id: 4,
			name: "Family Health Center D",
			address: "101 Pine Street, City D",
			backgroundImage: "url('family_health_center_d.jpg')", // Replace with actual image URL
		},
		{
			location_id: 5,
			name: "Wellbeing Clinic E",
			address: "202 Maple Street, City E",
			backgroundImage: "url('wellbeing_clinic_e.jpg')", // Replace with actual image URL
		},
		// Add more clinic entries as needed
	];

    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    const navigate = useNavigate();

	const handleSearchValue = (value: string) => {
		console.log(value);
	};
    
	return (
		<div>
			<Header title="Get Tested"/>
			<SearchInput onChange={handleSearchValue}/>
			<Grid
				container
				rowSpacing={1}
				columnSpacing={{ xs: 2, sm: 2, md: 3 }}
				sx={{
					marginTop: "15px",
				}}
			>
				{clinics.map((clinic, index) => (
					<Grid
						item
						key={clinic.location_id}
						xs={6}
						sm={6}
						md={4}
						lg={3}
						sx={{
							height: "165px",
						}}
						onClick={() => navigate("/clinic/" + clinic.location_id)}
					>
						<Card
							sx={{
								backgroundImage: clinic.backgroundImage,
								backgroundColor: colors.grey[500],
								backgroundSize: "cover",
								color: "white",
								height: "150px",
								borderRadius: "15px",
								display: "flex",
								flexDirection: "column",
								justifyContent: "space-between",
								transition: "transform 0.2s ease-in-out",
								transform: `scale(${
									hoveredCard === index ? 1.1 : 1
								})`,
							}}
							onMouseEnter={() => setHoveredCard(index)}
							onMouseLeave={() => setHoveredCard(null)}
						>
							<CardContent>
								<h3>{clinic.name}</h3>
								<p>{clinic.address}</p>
							</CardContent>
							<CardContent>
								{/* Additional content if needed */}
							</CardContent>
						</Card>
					</Grid>
				))}
			</Grid>
			<Box sx={{ marginTop: "15px" }}></Box>
			{/* <SimpleBottomNavigation
          display={selectedDoctor !== null ? "flex" : "none"}
          doctorName={selectedDoctor?.doctor as string}
        /> */}
		</div>
	);
};

export default GetTested;
