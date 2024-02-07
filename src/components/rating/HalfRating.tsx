import * as React from "react";
import Rating from "@mui/material/Rating";
import Stack from "@mui/material/Stack";
import { Box, Divider, Typography } from "@mui/material";
import { MainButton } from "@vkruglikov/react-telegram-web-app";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../header/Header";
import { BACKEND_URL, rateDoctor } from "../../utils/api";
import telegramWindow from "../../telegram-window";

const HalfRating: React.FC = () => {
    const navigate = useNavigate();
    const [value, setValue] = React.useState<number>(0.0)

    const location = useLocation();
	const state = location.state;

    const handleValue = (
		event: React.SyntheticEvent<Element, Event>,
		value: number | null
	) => {
		if (value) {
            setValue(value);
        }
	};

    const handleFinish = async () => {
		try {
			const data = await rateDoctor({ doctor_id: state?.doctor?.id, rating: value })
		} catch (error: any) {
			console.error(error.message)
		} finally {
			telegramWindow.Telegram && telegramWindow.Telegram.WebApp.close();
		}
    }
	return (
    <div style={{ width: "100%" }}>
      <Header title="Оцените это" />
      <Divider />
      <Stack
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "80px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={"https://telecure.ru" + state?.doctor?.avatar}
            alt="Doctor"
            style={{
              width: "180px",
              height: "180px",
              borderRadius: "50%",
            }}
          />
          <Typography variant="h6" sx={{ marginTop: "5px" }}>
            {state?.doctor?.full_name}
          </Typography>
        </Box>
        <br />
        <br />
        <Rating
          name="half-rating"
          value={value}
          onChange={handleValue}
          precision={0.5}
          style={{ fontSize: "45px" }}
        />
        {value > 0.0 && <MainButton text="Тугатиш" onClick={handleFinish} />}
      </Stack>
    </div>
  );
}

export default HalfRating;