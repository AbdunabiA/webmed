import React, { useEffect, useState } from "react";
import { Box, Divider, Grid, Paper, Theme, Typography, colors, styled } from "@mui/material";
import { TimeIcon } from "@mui/x-date-pickers";
import Header from "../header/Header";
import Calendar from "./Calendar";
import { useTheme } from "@emotion/react";
import { getSelectedDoctor, getUser, saveSelectedDateTime } from "../../utils/storage";
import { BackButton, MainButton } from "@vkruglikov/react-telegram-web-app";
import { useNavigate, useParams } from "react-router-dom";
import { getDoctorsWorkTime } from "../../utils/api";


function generateTimeIntervals(): string[] {
	const startHour = 9;
	const endHour = 18;
	const timeIntervals: string[] = [];

	for (let hour = startHour; hour < endHour; hour++) {
		const startTime = `${hour.toString().padStart(2, "0")}:00`;
		const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`;

		const timeInterval = `${startTime} - ${endTime}`;
		timeIntervals.push(timeInterval);
	}

	return timeIntervals;
}

const SelectableItem = styled(Paper)(
	({ theme, selected }: { theme: Theme; selected: boolean }) => ({
		backgroundColor: selected
			? colors.blue[400]
			: theme.palette.mode === "dark"
			? "black"
			: "#fff",
		...theme.typography.body2,
		padding: "8px",
		paddingTop: "13px",
		paddingBottom: "13px",
		textAlign: "center",
		color: theme.palette.text.secondary,
		borderRadius: "50px",
		cursor: "pointer",
	})
)

const DateTimePicker = () => {
	const theme = useTheme();
	const navigate = useNavigate();
	const [selectedItem, setSelectedItem] = useState<number | null>(null);
	const [selectedDate, setSelectedDate] = useState<number>(
		new Date().getDate()
	);
	const [selectedMonth, setSelectedMonth] = useState<number>(
		new Date().getMonth()
	);
	const [selectedYear, setSelectedYear] = useState<number>(
		new Date().getFullYear()
	);

	const[timeSlots, setTimeSlots] = useState<string[]>([]);

	// const timeSlots = generateTimeIntervals();

	const {id: doctorId} = useParams();;
	const user = getUser();

	const fetchWorkingTime = async () => {
		try {
			const data = await getDoctorsWorkTime(Number(doctorId), user.id, selectedMonth + 1, selectedDate);
			const workTimeSlots: string[] = [];
			console.log(data.correct_date)
			data.correct_date.map((dateTime: string[]) => {
				workTimeSlots.push(dateTime[1]);
			})
			setTimeSlots(workTimeSlots);
		} catch (error: any) {
			console.error(error.message)
		}
	}

	useEffect(() => {
		fetchWorkingTime();
	}, [selectedDate, selectedMonth])

	const handleItemClick = (index: number) => {
		setSelectedItem(selectedItem === index ? null : index);
	};

	const handleContinue = () => {
		saveSelectedDateTime({ selectedDate, selectedTime: timeSlots[selectedItem as number], selectedMonth: selectedMonth + 1, selectedYear });
		navigate("/appointment");
	}

	return (
		<div style={{ paddingInline: "5px" }}>
			<BackButton onClick={() => navigate(-1)} />
			<Box sx={{ marginBottom: "25px" }}>
				<Header title="Дата и время" />
				<Divider sx={{ marginBottom: "20px" }} />
				<Calendar
					onSelectDate={setSelectedDate}
					onSelectedMonth={setSelectedMonth}
					onSelectedYear={setSelectedYear}
				/>
				<Box sx={{ marginTop: "-68px" }}>
					<Box sx={{ display: "flex", alignItems: "center" }}>
						<TimeIcon
							fontSize="small"
							sx={{ paddingRight: "3px" }}
						/>
						<h2>Выберите время</h2>
					</Box>
					<Divider
						variant="fullWidth"
						sx={{ marginBottom: "15px" }}
					/>
					<Grid
						container
						spacing={{ xs: 1, md: 2 }}
						columns={{ xs: 6, sm: 8, md: 12 }}
					>
						{timeSlots.length > 0 ? (
							timeSlots.map((time, index) => (
								<Grid item xs={2} sm={6} md={4} key={index}>
									<SelectableItem
										theme={theme as Theme}
										selected={selectedItem === index}
										onClick={() => handleItemClick(index)}
									>
										<Typography
											variant="caption"
											fontWeight="bold"
										>
											{time}
										</Typography>
									</SelectableItem>
								</Grid>
							))
						) : (
							<Grid item>
								<Typography>Ничего не найдено</Typography>
							</Grid>
						)}
					</Grid>
				</Box>
			</Box>
			<br />
			<br />
			{selectedDate && selectedItem !== null && (
				<MainButton
					text="Продолжать"
					onClick={() => handleContinue()}
				/>
			)}
		</div>
	);
};

export default DateTimePicker;
