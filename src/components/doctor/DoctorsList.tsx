import { useEffect, useState } from "react";
import { Box, Button, CircularProgress, colors } from "@mui/material";
import SearchInput from "../common/SearchInput";
import DoctorCard from "./DoctorCard";
import { IDoctor } from "./types";
import Header from "../header/Header";
import { getDoctors } from "../../utils/api";
import { saveSelectedDoctor } from "../../utils/storage";
import { useNavigate } from "react-router-dom";
import { BackButton, MainButton } from "@vkruglikov/react-telegram-web-app";

const DoctorsList = () => {
  const [selectedButton, setSelectedButton] = useState<number | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<IDoctor | null>(null);
  const [doctorsList, setDoctorsList] = useState<IDoctor[]>();
  const [directionsList, setDirectionsList] = useState<string[]>();
  const [searchValue, setSearchValue] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctorsData = async () => {
      const { doctors, directions } = await getDoctors();
      setDirectionsList(directions);
      setDoctorsList(doctors);
    };
    fetchDoctorsData();
  }, []);

  const handleButtonClick = (index: number) => {
    if (selectedButton === index) {
      setSelectedButton(null);
    } else {
      setSelectedButton(index);
    }
  };

  const handleDoctorSelect = () => {
    saveSelectedDoctor(selectedDoctor);
    navigate(`/doctor/${selectedDoctor?.id}`);
  };

  const handleSearchValue = (value: string) => {
    setSearchValue(value);
  };

  return (
    <div>
      <BackButton onClick={() => navigate(-1)} />
      <Header title="Выбрать врача" />
      <SearchInput onChange={handleSearchValue} />
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          maxWidth: { xs: 350, sm: 480 },
          bgcolor: "background.paper",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "8px",
            overflowX: "auto",
            "& > *": {
              flex: "0 0 auto",
            },
          }}
        >
          {directionsList?.map((option, index) => (
            <Button
              key={index}
              style={{
                borderRadius: "50px",
                padding: "10px 20px",
                fontWeight: "600",
                height: "35px",
                textTransform: "none",
                marginRight: "5px",
                color: "white",
                border: ".5px solid black",
                backgroundColor:
                  selectedButton === index ? colors.blue[400] : "transparent",
              }}
              onClick={() => handleButtonClick(index)}
            >
              {option}
            </Button>
          ))}
        </Box>
      </Box>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: " center",
        }}
      >
        {directionsList && doctorsList ? (
          <Box sx={{ marginTop: "15px" }}>
            {doctorsList
              ?.filter((doctor) =>
                searchValue
                  ? doctor.full_name
                      .toLowerCase()
                      .includes(searchValue.toLowerCase())
                  : true
              )
              .map((doctor) => {
                if (
                  selectedButton !== null &&
                  directionsList &&
                  directionsList[selectedButton] === doctor.direction
                ) {
                  return (
                    <DoctorCard
                      key={doctor.id}
                      card={doctor}
                      isSelected={selectedDoctor?.id === doctor.id}
                      onSelect={() => {
                        if (selectedDoctor?.id === doctor.id) {
                          setSelectedDoctor(null);
                        } else {
                          setSelectedDoctor(doctor);
                        }
                      }}
                    />
                  );
                }
                if (selectedButton === null) {
                  return (
                    <DoctorCard
                      key={doctor.id}
                      card={doctor}
                      isSelected={selectedDoctor?.id === doctor.id}
                      onSelect={() => {
                        if (selectedDoctor?.id === doctor.id) {
                          setSelectedDoctor(null);
                        } else {
                          setSelectedDoctor(doctor);
                        }
                      }}
                    />
                  );
                }
              })}
          </Box>
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
      {selectedDoctor !== null && (
        <MainButton
          text={(selectedDoctor?.full_name + " билан давом етиш") as string}
          onClick={handleDoctorSelect}
        />
      )}
    </div>
  );
};

export default DoctorsList;
