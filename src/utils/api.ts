import axios, { AxiosResponse } from "axios";
import { IDoctor } from "../components/doctor/types";
import { ISelectedDateTime } from "../components/appointment/types";

export const BACKEND_URL = "https://telecure.ru/api/v1";

export const API_BASE_URL = "https://f372-83-222-7-184.ngrok-free.app/api/v1";

const api = axios.create({
	baseURL: API_BASE_URL,
});

export interface IPatient {
	user: number;
	full_name: string;
	phone_number: string;
	additional_information: string;
	doctor_id: string;
	conference_date: ISelectedDateTime;
}

interface IPatientResult {
	patient: number;
	doctor: number;
	result_text: string;
}

export const getDoctors = async (): Promise<{ doctors: IDoctor[], directions: string[] }> => {
	const response = await api.get("/doctor");
	return response.data;
};

export const getDoctor = async (id: number): Promise<IDoctor> => {
	const response = await api.get(`/doctor_info/?doctor_id=${id}`);
	return response.data.doctors;
};

export const getDoctorsWorkTime = async (doctor: number, user: number, month: number, day: number) => {
	const response = await api.get("/doctor_work_time", {
		params: {
			doctor,
			user,
			month,
			day
		}
	});
	return response.data;
}

export const getPatient = async (patient_id: number): Promise<IPatient> => {
	const response = await api.get("/single_patient/", {
		params: {
			patient_id,
		},
	});
	return response.data.patient;
};

export const callToPatient = async (data: any): Promise<any> => {
	const response = await api.post("/call/", data);
	return response.data
}

export const makeAppointment = async (data: IPatient) => {
	const response = await api.post("/patient/", data);
	return response.data;
};

export const createPatientResult = async (data: IPatientResult) => {
	const response = await api.post("/patient_result/", data);
	return response.data;
};

export const rateDoctor = async (data: {doctor_id: number | null, rating: number}) => {
	const response = await api.post("/doctor_rating/", data);
	return response.data;
}

export const endCall = async (room_name: string) => {
	const response = await api.get(`/end_record/?room_name=${room_name}`);
	return response.data;
} 
