import { CallEnd, Mic, Videocam, VoiceChat } from "@mui/icons-material";
import { Box, Button, ButtonGroup, Container, IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";

interface Props {
	handleWebcamButtonClick: () => void;
	handleCallButtonClick: () => void;
	handleAnswerButtonClick: () => void;
	webcamVideo: React.RefObject<HTMLVideoElement>;
	remoteVideo: React.RefObject<HTMLVideoElement>;
	hangupDisabled: boolean;
}

const Call: React.FC<Props> = ({ webcamVideo, remoteVideo, handleAnswerButtonClick, handleCallButtonClick, handleWebcamButtonClick, hangupDisabled }) => {
	const [dimensions, setDimensions] = useState({
		height: window.innerHeight,
		width: window.innerWidth,
	});

	useEffect(() => {
		const handleResize = () => {
			setDimensions({
				height: window.innerHeight,
				width: window.innerWidth,
			});
		};

		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	return (
		<div>
			<video
				ref={remoteVideo}
				style={{
					objectFit: "cover",
					height: `${dimensions.height}px`,
					width: `${dimensions.width}px`,
					margin: 0,
				}}
			></video>
			<ButtonGroup
				sx={{
					display: "flex",
					justifyContent: "space-between",
					position: "absolute",
					bottom: "20px",
					right: `${dimensions.width / 2}px`,
					width: "auto",
					height: "auto",
				}}
			>
				<Button
					onClick={handleWebcamButtonClick}
					disabled={!hangupDisabled}
				>
					Start Webcam
				</Button>
				<Button
					onClick={handleCallButtonClick}
					disabled={hangupDisabled}
				>
					Call
				</Button>
				<Button
					onClick={handleAnswerButtonClick}
					disabled={hangupDisabled}
				>
					Answer
				</Button>
				{/* //{" "}
				<IconButton color="error">
					// <CallEnd />
					//{" "}
				</IconButton>
				//{" "}
				<IconButton>
					// <Videocam />
					//{" "}
				</IconButton>
				//{" "}
				<IconButton>
					// <Mic />
					//{" "}
				</IconButton> */}
			</ButtonGroup>
			<video
				ref={webcamVideo}
				style={{
					position: "fixed",
					bottom: 0,
					right: 0,
					backgroundColor: "black",
					width: `${dimensions.width / 4}px`,
					height: `${dimensions.width / 3}px`,
				}}
				autoPlay
				playsInline
			>
				{/* Your video call content goes here */}
			</video>
		</div>
	);
};

export default Call;
