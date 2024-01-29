import React, { useState, useRef, useEffect } from "react";
import { Button, Paper, ButtonGroup, IconButton } from "@mui/material";
import {
	VideoCall as VideoCallIcon,
	Call as CallIcon,
	CallReceived as CallReceivedIcon,
	CallEndRounded,
} from "@mui/icons-material";
import { useParams } from "react-router-dom";

const servers: RTCConfiguration = {
	iceServers: [
		{
			urls: [
				"stun:stun1.l.google.com:19302",
				"stun:stun2.l.google.com:19302",
			],
		},
	],
	iceCandidatePoolSize: 10,
};

const pc = new RTCPeerConnection(servers);
let localStream: MediaStream | null = null;
let remoteStream: MediaStream | null = null;

const SIGNALING_SERVER_URL = "ws://localhost:3001";

const App: React.FC = () => {
	const [pcs, setPcs] = useState<Record<string, RTCPeerConnection>>({});
	const webcamVideo = useRef<HTMLVideoElement>(null);
	const remoteVideo = useRef<HTMLVideoElement>(null);

	const { callId } = useParams();

	const [dimensions, setDimensions] = useState({
		height: window.innerHeight,
		width: window.innerWidth,
	});

	const ws = new WebSocket(SIGNALING_SERVER_URL + `/${callId}`);

	ws.addEventListener("open", () => {
		console.log("Connected to signaling server");
	});

	const sendSignal = (callId: string, signal: any) => {
		ws.send(JSON.stringify({ callId, signal }));
	};
	const createPeerConnection = () => {
		const newPC = new RTCPeerConnection(servers);

		// Set up event handlers, add tracks, etc.

		return newPC;
	};

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

	const [hangupDisabled, setHangupDisabled] = useState<boolean>(true);

	const handleWebcamButtonClick = async () => {
		localStream = await navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true,
		});
		remoteStream = new MediaStream();

		localStream.getTracks().forEach((track) => {
			pc.addTrack(track, localStream!);
		});

		pc.ontrack = (event) => {
			event.streams[0].getTracks().forEach((track) => {
				remoteStream!.addTrack(track);
			});
		};

		if (webcamVideo.current) {
			webcamVideo.current.srcObject = localStream;
		}
		if (remoteVideo.current) {
			remoteVideo.current.srcObject = remoteStream;
		}

		setHangupDisabled(false);
	};

	const handleCallButtonClick = async () => {
		const newPC = createPeerConnection();
		setPcs((prevPcs) => ({
			...prevPcs,
			[String(callId)]: newPC,
		}));

		newPC.onicecandidate = (event) => {
			event.candidate &&
				sendSignal(String(callId), {
					type: "ice-candidate",
					candidate: event.candidate.toJSON(),
				});
		};

		const offerDescription = await newPC.createOffer();
		await newPC.setLocalDescription(offerDescription);

		const offer = {
			sdp: offerDescription.sdp,
			type: offerDescription.type,
		};

		sendSignal(String(callId), offer);
	};

	const handleAnswerButtonClick = async () => {
		try {
			const response = await fetch(
				`http://localhost:3001/offer/${callId}`
			);
			if (response.ok) {
				const { offer } = await response.json();

				const newPC = createPeerConnection();
				setPcs((prevPcs) => ({
					...prevPcs,
					[String(callId)]: newPC,
				}));

				newPC.onicecandidate = (event) => {
					event.candidate &&
						sendSignal(String(callId), {
							type: "ice-candidate",
							candidate: event.candidate.toJSON(),
						});
				};

				await newPC.setRemoteDescription(
					new RTCSessionDescription(offer)
				);

				const answerDescription = await newPC.createAnswer();
				await newPC.setLocalDescription(answerDescription);

				const answer = {
					type: answerDescription.type,
					sdp: answerDescription.sdp,
				};

				sendSignal(String(callId), answer);
			} else {
				console.error(
					"Failed to retrieve offer description:",
					response.statusText
				);
			}
		} catch (error) {
			console.error("Error during handleAnswerButtonClick:", error);
		}
	};

	const handleHangupButtonClick = () => {
		// Implement hangup functionality
		const currentPC = pcs[String(callId)];
		if (currentPC) {
			currentPC.close();
			setPcs((prevPcs) => {
				const { [String(callId)]: removedPC, ...rest } = prevPcs;
				return rest;
			});
		}
	};

	ws.addEventListener("message", async (event) => {
		const message = JSON.parse(event.data);
		const { signal } = message;
		const currentPC = pcs[String(callId)];
		if (currentPC) {
			if (signal.type === "offer") {
				const { signal: offer } = message;
				console.log("Offer received", offer);
				const offerDescription = new RTCSessionDescription(offer);
				try {
					await currentPC.setRemoteDescription(offerDescription);
					const answerDescription = await currentPC.createAnswer();
					await currentPC.setLocalDescription(answerDescription);
					const answer = {
						type: answerDescription.type,
						sdp: answerDescription.sdp,
					};
					sendSignal(String(callId), answer);
				} catch (error) {
					console.error("Error handling offer:", error);
				}
			} else if (signal.type === "answer") {
				const { signal: answer } = message;
				console.log("Answer", answer);
				const answerDescription = new RTCSessionDescription(answer);
				try {
					await currentPC.setRemoteDescription(answerDescription);
				} catch (error) {
					console.error("Error handling answer:", error);
				}
			} else if (signal.type === "ice-candidate") {
				const { signal } = message;
				const candidate = new RTCIceCandidate(signal.candidate);
				try {
					await currentPC.addIceCandidate(candidate);
				} catch (error) {
					console.error("Error handling ice candidate:", error);
				}
			}
		}
	});
	// Close the WebSocket connection when the component unmounts
	useEffect(() => {
		return () => {
			ws.close();
		};
	}, []);

	return (
		<div>
			<Paper elevation={3}>
				<video
					style={{
						objectFit: "cover",
						height: `${dimensions.height}px`,
						width: `${dimensions.width}px`,
						margin: 0,
					}}
					id="webcamVideo"
					ref={webcamVideo}
					autoPlay
					playsInline
				></video>
				<br />
				<ButtonGroup
					sx={{
						display: "flex",
						justifyContent: "space-between",
						position: "absolute",
						bottom: "20px",
						left: `${dimensions.width / 4}px`,
						width: "auto",
						height: "auto",
					}}
				>
					<IconButton
						color="primary"
						onClick={handleWebcamButtonClick}
						disabled={!hangupDisabled}
					>
						<VideoCallIcon />
					</IconButton>
					<IconButton
						sx={{ backgroundColor: "green" }}
						onClick={handleCallButtonClick}
						disabled={hangupDisabled}
					>
						<CallIcon />
					</IconButton>
					<IconButton
						color="primary"
						onClick={handleAnswerButtonClick}
						disabled={hangupDisabled}
					>
						<CallReceivedIcon />
					</IconButton>
					<br />
					<video
						style={{
							position: "fixed",
							bottom: 0,
							right: 0,
							backgroundColor: "black",
							width: `${dimensions.width / 4}px`,
							height: `${dimensions.width / 3}px`,
						}}
						id="remoteVideo"
						ref={remoteVideo}
						autoPlay
						playsInline
					></video>
					<br />
					<IconButton
						sx={{ backgroundColor: "red" }}
						onClick={handleHangupButtonClick}
						disabled={hangupDisabled}
					>
						<CallEndRounded />
					</IconButton>
				</ButtonGroup>
			</Paper>
		</div>
	);
};

export default App;
