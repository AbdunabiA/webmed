import React from "react";
import {
	Grid,
	Paper,
	Typography,
	Divider,
    colors,
    Box,
    Chip,
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import { LocationOn } from "@mui/icons-material";
import { TimeIcon } from "@mui/x-date-pickers";
import { useLocation, useNavigate } from "react-router-dom";
import { BACKEND_URL, makeAppointment } from "../../utils/api";
import { IDoctor } from "../doctor/types";
import { IAppointment, ISelectedDateTime } from "../appointment/types";
import { BackButton, MainButton } from "@vkruglikov/react-telegram-web-app";
import { getPatientInfo, getSelectedDateTime, getSelectedDoctor, getUser } from "../../utils/storage";
import { months } from "../appointment/Calendar";
import Header from "../header/Header";

const Summary = () => {
	const location = useLocation();
	const { appointmentData } = location.state || {
		appointmentData: {
			selectedDoctor: getSelectedDoctor(),
			patient: getPatientInfo(),
			selectedDateTime: getSelectedDateTime(),
			user_id: getUser().id,
		},
	};
	const selectedDoctor = appointmentData.selectedDoctor as IDoctor;
	const patient = appointmentData.patient as IAppointment;
	const selectedDateTime = getSelectedDateTime() as ISelectedDateTime
	const user_id = appointmentData.user_id

	const navigate = useNavigate();

	const handleConfirm = async () => {
		try {
			const response = await makeAppointment({
				user: user_id,
				full_name: patient.name + " " + patient.surname,
				phone_number: patient.phoneNumber,
				additional_information: patient.additionalInfo,
				conference_date: selectedDateTime,
				doctor_id: selectedDoctor.id.toString(),
			});
			console.log(response);
			navigate("/payment", {
		      state: {
		        paymentUrl: response.payment_url
		      },
		    });
		} catch (error: any) {
			console.error(error.message)
		}
	}
	return (
		<div style={{ width: "100%" }}>
			<BackButton onClick={() => navigate(-1)} />
			<Header title="Краткое содержание" />
			<Divider variant="fullWidth" />
			<Paper elevation={0} sx={{ p: 2, mt: 2 }}>
				<Typography
					variant="subtitle1"
					sx={{ fontWeight: "bold", color: colors.grey[400] }}
				>
					Информация о пациенте
				</Typography>
				<Typography>
					Имя Фамилия: {patient.name} {patient.surname}
				</Typography>
				<Typography>Номер телефона: {patient.phoneNumber}</Typography>
				<Typography>
					Дополнительная информация: {patient.additionalInfo}
				</Typography>
			</Paper>

			<Divider variant="fullWidth" sx={{ mt: 2 }} />

			<Paper elevation={0} sx={{ p: 2, mt: 2 }}>
				<Typography
					variant="subtitle1"
					sx={{ fontWeight: "bold", color: colors.grey[400] }}
				>
					Время посещения
				</Typography>
				<Typography>
					{selectedDateTime.selectedDate},{" "}
					{months[selectedDateTime.selectedMonth - 1]},{" "}
					{selectedDateTime.selectedYear}
				</Typography>
				<Typography>
					<Chip
						label={selectedDateTime.selectedTime}
						sx={{
							backgroundColor: colors.blue[500],
							height: "22px",
						}}
					/>
				</Typography>
			</Paper>

			<Paper elevation={0} sx={{ p: 2, mt: 2 }}>
				<Typography
					variant="subtitle1"
					sx={{ fontWeight: "bold", color: colors.grey[400] }}
				>
					Доктор по вашему выбору
				</Typography>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-around",
						alignItems: "center",
					}}
				>
					<img
						src={BACKEND_URL + selectedDoctor.avatar}
						style={{
							width: "70px",
							height: "70px",
							borderRadius: "15px",
							marginRight: "10px",
						}}
					/>
					<Box>
						<Typography
							variant="subtitle1"
							sx={{ fontWeight: "bold" }}
						>
							{selectedDoctor.full_name}
						</Typography>
						<Typography
							variant="subtitle2"
							sx={{ fontWeight: "bold", color: colors.grey[400] }}
						>
							{selectedDoctor.direction}
						</Typography>
						<br />
						<Typography
							variant="subtitle2"
							sx={{ fontWeight: "bold", color: colors.grey[400] }}
						>
							Цена: {selectedDoctor.price} UZS
						</Typography>
					</Box>
				</Box>
			</Paper>
			<br />
			<br />
			<br />
			<MainButton text="Подтверждать" onClick={handleConfirm} />
		</div>
	);
};

export default Summary;
