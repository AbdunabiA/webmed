import React, { useEffect, useState } from "react";
import {
	TextField,
	Box,
	Divider,
} from "@mui/material";
import Header from "../header/Header";
import { tgSecondaryBgColor } from "../../utils/colors";
import { useNavigate } from "react-router-dom";
import {
	enableSaveDataForever,
	getPatientInfo,
	getSaveDataForeverEnabled,
	getSelectedDateTime,
	getSelectedDoctor,
	getUser,
	savePatientInfo,
} from "../../utils/storage";
import { BackButton, MainButton, useShowPopup } from "@vkruglikov/react-telegram-web-app";
import { IAppointment } from "./types";

const AppointmentPage = () => {
	const [formData, setFormData] = useState<IAppointment>({
		name: "",
		surname: "",
		phoneNumber: "",
		email: "",
		additionalInfo: "",
	});

	const [filled, setFilled] = useState<boolean>(false);
	const showPopup = useShowPopup();

	const navigate = useNavigate();

	const selectedDoctor = getSelectedDoctor();
	// const selectedDateTime = getSelectedDateTime();
	const patientInfo = getPatientInfo();
	const { id: user_id } = getUser()

	useEffect(() => {
		if (patientInfo && !filled) {
			setFormData(patientInfo);
		}
	}, []);

	useEffect(() => {
		setFilled(
			formData.name.length > 0 &&
				formData.surname.length > 0 &&
				formData.phoneNumber.length > 0
		);
	}, [formData])

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { id, value } = event.target;
		setFormData((prevFormData) => ({
			...prevFormData,
			[id]: value,
		}));
	};

	const handleContinue = async () => {
		const isSaveDataForeverEnabled = getSaveDataForeverEnabled();
		if (!isSaveDataForeverEnabled) {
			const buttonId = await showPopup({
				message: "Do you want to save your data for later?",
				buttons: [
					{
						text: "Yes",
						id: "yes",
						type: "ok",
					},
					{
						text: "No",
						id: "no",
						type: "destructive",
					},
					{
						text: "Save and don't ask again",
						id: "save",
						type: "default",
					},
				],
			});
			if (buttonId === "yes") {
				savePatientInfo(formData);
			}
			if (buttonId === "save") {
				savePatientInfo(formData);
				enableSaveDataForever();
			}
		}

		if (isSaveDataForeverEnabled) {
			savePatientInfo(formData);
		}
		navigate("/summary", {
			state: {
				appointmentData: {
					patient: formData,
					user_id,
					selectedDoctor,
					// selectedDateTime,
				},
			},
		});
	};

	return (
		<div style={{ textAlign: "center" }}>
			<Header title="Информация о пациенте" />
			<BackButton onClick={() => navigate(-1)} />
			<Divider variant="fullWidth" />
			<Box mt={2} component="form">
				<TextField
					id="name"
					label="Имя"
					variant="filled"
					fullWidth
					margin="normal"
					value={formData.name}
					onChange={handleChange}
					sx={{ background: tgSecondaryBgColor }}
				/>

				<TextField
					id="surname"
					label="Фамиля"
					variant="filled"
					fullWidth
					margin="normal"
					value={formData.surname}
					onChange={handleChange}
					sx={{ background: tgSecondaryBgColor }}
				/>

				<TextField
					id="phoneNumber"
					label="Номер телефона"
					variant="filled"
					fullWidth
					margin="normal"
					value={formData.phoneNumber}
					onChange={handleChange}
					sx={{ background: tgSecondaryBgColor }}
				/>

				<TextField
					id="additionalInfo"
					label="Дополнительная информация"
					variant="filled"
					fullWidth
					multiline
					rows={4}
					margin="normal"
					value={formData.additionalInfo}
					onChange={handleChange}
					sx={{ background: tgSecondaryBgColor }}
				/>
			</Box>
			{filled && (
				<MainButton
					text="Продолжать"
					onClick={() => handleContinue()}
				/>
			)}
		</div>
	);
};

export default AppointmentPage;
