import { WebApp } from "@vkruglikov/react-telegram-web-app/lib/core/twa-types";

interface Window {
	Telegram?: {
		WebApp: {
			isVersionAtLeast: (version: string) => boolean;
			requestWriteAccess: () => void;
			expand: () => void;
			sendData: (data: unknown) => any;
		};
	};
}

const telegramWindow = window as Window & {
	Telegram?: {
		WebApp: WebApp;
	};
};

export default telegramWindow;