import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Container, colors } from "@mui/material";
import { PaletteMode } from "@mui/material";
import Home from "./components/Home";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import DoctorsList from "./components/doctor/DoctorsList";
import DoctorInfo from "./components/doctor/DoctorInfo";
import DateTimePicker from "./components/appointment/DateTimePicker";
import GetTested from "./components/clinic/GetTested";
import ClinicsList from "./components/clinic/ClinicsList";
import Summary from "./components/summary/Summary";
import SuccessfulPage from "./components/successful/SuccessfulBooking";
import {
  useHapticFeedback,
  useShowPopup,
} from "@vkruglikov/react-telegram-web-app";
import { useState, useEffect } from "react";
import telegramWindow from "./telegram-window";
import AppointmentPage from "./components/appointment/Appointment";
import { saveUser } from "./utils/storage";
import Meeting from "./components/meeting/Meeting";
import { AES, enc } from "crypto-js";
import PatientResult from "./components/patient/PatientResult";
import HalfRating from "./components/rating/HalfRating";
import MeetingObserver from "./components/meeting/MeetingObserver";
import Chat from "./components/chat/Chat";
import Payment from "./components/payment/Payment";
import Meeting2 from "./components/meeting/Meeting2";
import VideoCallPage from "./components/meeting/Meeting3";
import Meeting4 from "./components/meeting/Meeting4";

const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          // palette values for light mode
          primary: colors.amber,
          divider: colors.amber[200],
          text: {
            primary: colors.grey[900],
            secondary: colors.grey[800],
          },
        }
      : {
          // palette values for dark mode
          primary: colors.blue,
          divider: colors.blueGrey[700],
          background: {
            default: "#18222d",
            paper: "#18222d",
          },
          text: {
            primary: "#fff",
            secondary: "white",
          },
        }),
  },
  typography: {
    fontFamily: "Josefin Sans,sans-serif",
    fontWeight: 900,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
				@import url('https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;600;700&amp;family=Poppins:wght@400;500;600&amp;display=swap');
			`,
    },
  },
});

const darkModeTheme = createTheme(getDesignTokens("dark"));

function App() {
  const showPopup = useShowPopup();
  const [impactOccurred, notificationOccurred, selectionChanged] =
    useHapticFeedback();
  const [isInvalidVersion, setIsInvalidVersion] = useState(false);

  useEffect(() => {
    if (telegramWindow.Telegram && telegramWindow.Telegram.WebApp) {
      if (!telegramWindow.Telegram.WebApp.isVersionAtLeast("6.9")) {
        notificationOccurred("error");
        if (telegramWindow.Telegram.WebApp.isVersionAtLeast("6.2")) {
          showPopup({
            message:
              "Please update your Telegram app to the latest version to use this app.",
          });
        } else {
          console.log("the version is not supported");
          setIsInvalidVersion(true);
        }
      }
      // Alternatively to what can be set with react-telegram-web-app, you can directly set the following properties:
      try {
        telegramWindow.Telegram.WebApp.requestWriteAccess();
        const queryString = telegramWindow.Telegram.WebApp.initData;
        const params = new URLSearchParams(queryString);
        // Use the get method to retrieve values
        const queryId = params.get("query_id");
        const user = params.get("user");
        const authDate = params.get("auth_date");
        const hash = params.get("hash");
        saveUser(user);
      } catch (e) {
        console.log(e);
      }
      telegramWindow.Telegram.WebApp.expand();
    }
  }, []);
  return (
    <ThemeProvider theme={darkModeTheme}>
      <CssBaseline />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginRight: "10px",
          marginLeft: "10px",
        }}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/doctor" element={<DoctorsList />} />
            <Route path="/doctor/:id" element={<DoctorInfo />} />
            <Route path="/doctor/:id/pick-time" element={<DateTimePicker />} />
            <Route path="/get-tested" element={<GetTested />} />
            <Route path="/clinic/:id" element={<ClinicsList />} />
            {/* <Route path="/appointment" element={<AppointmentPage />} /> */}
            {/* <Route path="/summary" element={<Summary />} /> */}
            <Route path="/patient-result" element={<PatientResult />} />
            <Route path="/success" element={<SuccessfulPage />} />
            <Route path="/rating" element={<HalfRating />} />
            <Route path="/meeting/:callId/:callInfo" element={<Meeting4 />} />
            <Route path="/meeting_chat/:chatId/:chatInfo" element={<Chat />} />
            <Route path="/payment" element={<Payment />} />
            {/*<Route
							path="/meeting-observer/:callId"
							element={<MeetingObserver />}
						/>*/}
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;
