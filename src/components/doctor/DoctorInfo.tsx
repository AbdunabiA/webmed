import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Box,
  colors,
  Divider,
  CircularProgress,
  Typography,
} from "@mui/material";
import { IDoctor } from "./types";
import { BACKEND_URL, getDoctor } from "../../utils/api";
import Header from "../header/Header";
import { BackButton } from "@vkruglikov/react-telegram-web-app";

const DoctorInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<IDoctor>();

  useEffect(() => {
    (async () => {
      const doctor = await getDoctor(Number(id));
      setDoctor(doctor);
    })();
  }, []);

  const handleBookAppointment = () => {
    navigate("/appointment");
  };

  return (
    <div>
      <BackButton onClick={() => navigate(-1)} />
      <Header title="О докторе" />
      {doctor ? (
        <div>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <img
              src={"https://telecure.ru" + doctor?.avatar}
              alt="Doctor"
              style={{
                width: "180px",
                height: "180px",
                borderRadius: "50%",
              }}
            />
            <h2 style={{ margin: 0 }}>{doctor?.full_name}</h2>
            <p style={{ margin: 0 }}>{doctor?.direction}</p>
            <Box sx={{ marginTop: 2 }}>
              <Button
                fullWidth
                style={{
                  minWidth: `${window.innerWidth - 50}px`,
                  borderRadius: "50px",
                  padding: "10px 20px",
                  fontWeight: "600",
                  textTransform: "none",
                  marginRight: "5px",
                  color: "white",
                  fontSize: "20px",
                  height: "45px",
                  backgroundColor: colors.blue[400],
                }}
                onClick={handleBookAppointment}
              >
                <b>Запишитесь на прием</b>
              </Button>
            </Box>
          </Box>
          {/* Experience Section */}
          <Box sx={{ marginTop: "8px", marginBottom: "10px" }}>
            {/* <Box>
							<b>Тажриба</b>
							<Box>{doctor?.experience}</Box>
						</Box>
						<Divider
							sx={{ marginTop: "8px", marginBottom: "8px" }}
						/>
						<Box>
							<b>Хизматлар</b> <br />
							<Box style={{ marginLeft: "5px", marginTop: 0 }}>
								{doctor?.services}
							</Box>
						</Box> */}
            <Box>
              <p
                dangerouslySetInnerHTML={{
                  __html: doctor?.about,
                }}
              />
            </Box>
            <Divider sx={{ marginTop: "8px", marginBottom: "8px" }} />
            <Box>
              <b>Рабочее время</b>
              {doctor?.date.length !== 0 ? (
                <Box>
                  {doctor?.date.map((time) => (
                    <>
                      {time}
                      <br />
                    </>
                  ))}
                </Box>
              ) : (
                <Typography color="grey">Информация не найдена</Typography>
              )}
            </Box>
            <br />
            <br />
          </Box>
        </div>
      ) : (
        <CircularProgress
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      )}
    </div>
  );
};

export default DoctorInfo;
