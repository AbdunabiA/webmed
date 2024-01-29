import { Button, Card, Container, Divider, TextField, TextareaAutosize, styled } from "@mui/material";
import { grey, blue } from "@mui/material/colors";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPatientResult } from "../../utils/api";
import Header from "../header/Header";

const Textarea = styled(TextareaAutosize)(
	({ theme }) => `
    width: 100%;
    font-family: IBM Plex Sans, sans-serif;
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1.5;
    padding: 8px 12px;
    border-radius: 8px;
    color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
    background: ${theme.palette.mode === "dark" ? grey[900] : "#fff"};
    border: 1px solid ${theme.palette.mode === "dark" ? grey[700] : grey[200]};
    box-shadow: 0px 2px 2px ${
		theme.palette.mode === "dark" ? grey[900] : grey[50]
	};

    &:hover {
      border-color: ${blue[400]};
    }

    &:focus {
      border-color: ${blue[400]};
      box-shadow: 0 0 0 3px ${
			theme.palette.mode === "dark" ? blue[600] : blue[200]
		};
    }

    // firefox
    &:focus-visible {
      outline: 0;
    }
  `
);

const PatientResult = () => {
    const location = useLocation();
	  const state = location.state || {};
    const navigate = useNavigate();

    const handleSubmit = async (
		e:
			| React.BaseSyntheticEvent<HTMLFormElement>
			| React.SyntheticEvent<HTMLFormElement>
	) => {
		e.preventDefault();
		try {
            await createPatientResult({
                patient: state.patient,
                doctor: state.doctor,
                result_text: e.target[0].value
            })
            navigate("/");
        } catch (error: any) {
            console.error(error.message)
        }
	};
    return (
		<Container>
            <Header title="Краткое описание пациента"/>
            <Divider />
			<form
				onSubmit={handleSubmit}
				style={{
					width: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
                    marginTop: "120px"
				}}
			>
				<Textarea
					aria-label="minimum height"
					minRows={10}
                    sx={{
                        marginBottom: "20px"
                    }}
					placeholder="Оставить комментарий..."
				/>
				<Button fullWidth variant="contained" type="submit">
					Отправлять
				</Button>
			</form>
		</Container>
	);
}

export default PatientResult;