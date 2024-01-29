import { IAppointment } from "../components/appointment/types";

export const saveSelectedDoctor = (selectedDoctor: any) => {
    const stringData = JSON.stringify(selectedDoctor);
    localStorage.setItem('selectedDoctor', stringData)
}

export const getSelectedDoctor = () => {
	const doctorData = localStorage.getItem("selectedDoctor");
    if (doctorData){
        return JSON.parse(doctorData);
    }
    return null;
};

export const saveSelectedDateTime = (selectedDateTime: any) => {
	const stringData = JSON.stringify(selectedDateTime);
	localStorage.setItem("selectedDateTime", stringData);
};

export const getSelectedDateTime = () => {
	const doctorData = localStorage.getItem("selectedDateTime");
	if (doctorData) {
		return JSON.parse(doctorData);
	}
	return null;
};

export const saveUser = (user: any) => {
	const stringData = JSON.stringify(user);
	localStorage.setItem("user", stringData);
};

export const getUser = () => {
	const userData = localStorage.getItem("user");
	if (userData) {
		return JSON.parse(JSON.parse(userData));
	}
	return null;
};

export const enableSaveDataForever = () => {
	const stringData = JSON.stringify(true);
	localStorage.setItem("saveDataForever", stringData);
};

export const getSaveDataForeverEnabled = () => {
	const data = localStorage.getItem("saveDataForever");
	if (data) {
		return JSON.parse(data);
	}
	return null;
};

export const savePatientInfo = (patientInfo: IAppointment) => {
	const stringData = JSON.stringify(patientInfo);
	localStorage.setItem("patientInfo", stringData);
};

export const getPatientInfo = () => {
	const data = localStorage.getItem("patientInfo");
	if (data) {
		return JSON.parse(data);
	}
	return null;
};