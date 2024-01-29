export interface IAppointment {
	email: string;
	name: string;
	phoneNumber: string;
	surname: string;
	additionalInfo: string;
}

export interface ISelectedDateTime {
	selectedDate: number;
	selectedTime: string;
	selectedMonth: number;
	selectedYear: number;
}