import React, { useState } from "react";
import { Box, Typography, colors } from "@mui/material";
import {
	ArrowBackIos,
	ArrowForwardIos,
	CalendarMonth,
} from "@mui/icons-material";

interface CalendarProps {
	onSelectDate: (day: number) => void;
	onSelectedMonth: (month: number) => void;
	onSelectedYear: (year: number) => void;
}

export const months = [
	"Январ",
	"Феврал",
	"Март",
	"Апрел",
	"Май",
	"Июн",
	"Июл",
	"Август",
	"Сентябр",
	"Октабр",
	"Ноябр",
	"Декабр",
];
export const weeksUz = ["Як", "Ду", "Се", "Чо", "Па", "Жу", "Ша"];
export const weeks = ["Во", "По", "Вт", "Ср", "Че", "Пя", "Су"]

const Calendar: React.FC<CalendarProps> = ({ onSelectDate, onSelectedMonth, onSelectedYear }) => {
	const currentDate = new Date();
	const [selectedDate, setSelectedDate] = useState<number | null>(
		new Date().getDate()
	);
	const [monthIndex, setMonthIndex] = useState<number>(
		currentDate.getMonth()
	);
	const [currentYear, setCurrentYear] = useState<number>(
		currentDate.getFullYear()
	);

	const month = months[monthIndex];
	const daysCount = new Date(currentYear, monthIndex + 1, 0).getDate();
	const startingDayIndex = new Date(currentYear, monthIndex, 1).getDay();

	const weekDays: number[][] = Array.from(Array(weeks.length), () =>
		Array(7).fill(0)
	);

	for (let i = 0; i < weeks.length; i++) {
		let sum = i - startingDayIndex;
		for (let j = 0; j < 7; j++) {
			weekDays[i][j] = sum >= 0 && sum < daysCount ? sum + 1 : 0;
			sum += 7;
		}
	}

	const isPastDay = (day: number) => {
		const today = new Date();
		const compareDate = new Date(currentYear, monthIndex, day + 1);
		return compareDate < today;
	};

	const isSundayOrSaturday = (day: number) => {
		const dayIndex = new Date(
			currentYear,
			monthIndex,
			day as number
		).getDay();
		return dayIndex === 0 || dayIndex === 6; // 0 is Sunday, 6 is Saturday
	};

	const handleDateClick = (day: number | null) => {
		if (day && !isPastDay(day) && !isSundayOrSaturday(day)) {
			onSelectDate(day);
			setSelectedDate(day);
		}
	};

	const navigateMonth = (delta: number) => {
		const newMonthIndex = monthIndex + delta;
		const newYear = currentYear + Math.floor(newMonthIndex / 12);
		const newMonth = ((newMonthIndex % 12) + 12) % 12; // Ensure the month is within [0, 11]

		if (newMonthIndex > 11) {
			setMonthIndex(0);
			setCurrentYear(newYear);
			onSelectedMonth(0);
			onSelectedYear(newYear)
		} else if (newMonthIndex === -1) {
			setMonthIndex(11);
			setCurrentYear((currYear) => currYear - 1);
			onSelectedYear(currentYear);
			onSelectedMonth(11);
		}
		else {
			setMonthIndex(newMonthIndex);
			setCurrentYear(newYear);
			onSelectedMonth(newMonthIndex);
		}
	};

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				marginTop: "10px",
				position: "relative",
				gap: "20px",
				padding: 0,
				minWidth: "320px"
			}}
		>
			<header
				style={{
					display: "flex",
					justifyContent: "space-between",
					position: "relative",
				}}
			>
				<ArrowBackIos onClick={() => navigateMonth(-1)} />
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						flexDirection: "row",
					}}
				>
					<CalendarMonth
						fontSize="small"
						sx={{ paddingRight: "3px" }}
					/>
					<Typography sx={{ fontWeight: 700 }} variant="h5">
						{month}
					</Typography>
				</Box>
				<ArrowForwardIos onClick={() => navigateMonth(1)} />
			</header>
			<Box
				sx={{
					marginTop: "10px",
					display: "flex",
					justifyContent: "space-between",
					padding: 0,
				}}
			>
				{weeks.map((week, weekIndex) => (
					<Box key={weekIndex}>
						<Typography sx={{ fontWeight: 700 }}>{week}</Typography>
						{weekDays[weekIndex].map((day, dayIndex) => (
							<Box key={dayIndex}>
								<p
									style={{
										width: "30px",
										height: "30px",
										fontWeight: 700,
										display: "flex",
										justifyContent: "center",
										alignItems: "center",
										cursor:
											isPastDay(day) ||
											isSundayOrSaturday(day)
												? "not-allowed"
												: "pointer",
										borderRadius: "50%",
										backgroundColor:
											day === selectedDate
												? colors.blue[400]
												: "transparent",
										color:
											isPastDay(day) ||
											isSundayOrSaturday(day)
												? colors.grey[600]
												: "inherit",
									}}
									onClick={() =>
										day !== 0 &&
										handleDateClick(day)
									}
								>
									{day !== 0 ? day : null}
								</p>
							</Box>
						))}
					</Box>
				))}
			</Box>
		</Box>
	);
};

export default Calendar;
