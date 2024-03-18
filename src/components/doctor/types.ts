export interface CardData {
	id: number;
	title: string;
	doctor: string;
	imageUrl: string;
    direction: string;
}

export interface IDoctor {
	id: number;
	full_name: string;
	avatar: string;
	direction: string;
	price: number;
	about: string;
	rating: number;
	// experience: string;
	// services: string;
	voted_patients:number;
	reviews: number;
	busy: boolean;
	activate_url: string;
	user: null; // You might want to define a separate interface for the 'user' property
	date: string[]; // Assuming the work_time property is an array of strings
}
