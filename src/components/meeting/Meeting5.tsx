import React, { useState, useRef, useEffect } from "react";
import SimplePeer from "simple-peer";
import {
  Paper,
  ButtonGroup,
  IconButton,
  Box,
  Button,
  Typography,
  Avatar,
} from "@mui/material";
import {
  Call as CallIcon,
  CallEndRounded,
  Mic,
  Videocam,
  VideocamOff,
  MicOff,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { decryptCallId, decryptVideoCallId } from "../../utils/decryption";
import { tgSecondaryBgColor } from "../../utils/colors";
import "./style.css";
import { IDoctor } from "../doctor/types";
import {
  BACKEND_URL,
  IPatient,
  callToPatient,
  getDoctor,
  getPatient,
  endCall,
  WEBSOCKET_API,
} from "../../utils/api";
import CennectionChecking from "./Connecting";
import RecordRTC, {
  RecordRTCPromisesHandler,
  invokeSaveAsDialog,
} from "recordrtc";

const Meeting5: React.FC = () => {
  const { callId, callInfo } = useParams();
  const callDetails = decryptVideoCallId(String(callInfo));
  const navigate = useNavigate();
  const webcamVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const clientId = useRef(
    callDetails.type === "patient" ? callDetails.patient : callDetails.doctor
  );

  const [onCall, setOnCall] = useState<boolean>(false);
  const doctor = useRef<IDoctor | null>(null);
  const patient = useRef<IPatient | null>(null);

  const socket = useRef<WebSocket | null>(null);
  const peer = useRef<SimplePeer.Instance | null>(null);

  const isPatient = callDetails.type === "patient";
  const isDoctor = callDetails.type === "doctor";

  useEffect(() => {
    // Initialize WebSocket connection
    socket.current = new WebSocket(`${WEBSOCKET_API}video/${callId}/`);

    socket.current.onopen = () => {
      console.log("WebSocket connection established");
      // Send a message or join a room if your server requires it
      if (isPatient) {
        socket.current?.send(
          JSON.stringify({
            type: "patientConnected",
            senderId: clientId.current,
          })
        );
      }
    };

    socket.current.onmessage = (message) => {
      const msg = JSON.parse(message.data);
      console.log("WS Message", msg);

      handleSignalingData(msg);
    };

    // Cleanup on component unmount
    return () => {
      if (socket.current) {
        socket.current.close();
      }
    };
  }, [callId]);

  const sendSignalingData = (data: any) => {
    socket.current?.send(JSON.stringify(data));
  };

  const handleOffer = async (offer: any) => {
    peer.current?.signal(offer);
  };

  const handleAnswer = async (answer: any) => {
    peer.current?.signal(answer);
  };

  const handleNewICECandidateMsg = (candidate: any) => {
    peer.current?.signal(candidate);
  };

  const handleSignalingData = (data: any) => {
    switch (data.type) {
      case "offer":
        if (clientId.current !== data.senderId) {
          handleOffer(data.offer);
        }
        break;
      case "answer":
        if (clientId.current !== data.senderId) {
          handleAnswer(data.answer);
        }
        break;
      case "candidate":
        if (clientId.current !== data.senderId) {
          handleNewICECandidateMsg(data.candidate);
        }
        break;
      case "patientConnected":
        if (clientId.current !== data.senderId) {
          peer.current = new SimplePeer({
            initiator: true,
            trickle: false,
          });

          peer.current.on("signal", (offer) => {
            sendSignalingData({
              type: "offer",
              offer: offer,
              senderId: clientId.current,
            });
          });

          peer.current.on("stream", (stream) => {
            if (remoteVideo.current) {
              remoteVideo.current.srcObject = stream;
            }
          });

          navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          }).then((localStream) => {
            if (webcamVideo.current) {
              webcamVideo.current.srcObject = localStream;
            }

            peer.current?.addStream(localStream);
          });
        }
        break;
      default:
        break;
    }
  };

  const handleCallButtonClick = async () => {
    setOnCall(true);
  };

  const handleAnswerButtonClick = () => {
    setOnCall(true);
  };

  return (
    <div>
      <Paper
        elevation={4}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "10px",
        }}
      >
        <video
          style={{
            objectFit: "cover",
            height: `100vh`,
            width: `100%`,
            margin: 0,
            borderRadius: "10px",
          }}
          id="remoteVideo"
          ref={remoteVideo}
          autoPlay
          playsInline
        ></video>
        {/* {isDoctor && connectionStatus === "disconnected" && (
          <Button
            variant="contained"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              flexDirection: "column",
              top: "180px",
              width: "auto",
              height: "auto",
              borderRadius: "15px",
            }}
          >
            Leave diagnostics
          </Button>
        )} */}
        {isPatient && !onCall && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              flexDirection: "column",
              top: "180px",
              width: "auto",
              height: "auto",
              borderRadius: "15px",
            }}
          >
            <audio controls={false} autoPlay loop>
              <source
                src="https://web.telegram.org/a/call_incoming.mp3"
                type="audio/mpeg"
              ></source>
            </audio>
            <img
              src={"https://telecure.ru" + doctor.current?.avatar}
              alt="Doctor"
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "50%",
              }}
            />
            <br />
            <h3 style={{ margin: 0 }}>{doctor.current?.full_name}</h3>
            <p style={{ margin: 0 }}>{doctor.current?.direction}</p>

            <Typography variant="caption">is calling....</Typography>
          </Box>
        )}
        {isDoctor && !onCall && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              flexDirection: "column",
              top: "180px",
              width: "auto",
              height: "auto",
              borderRadius: "15px",
            }}
          >
            <Avatar
              alt="Doctor"
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "50%",
              }}
            >
              <Typography variant="h4">
                {patient.current?.full_name.split(" ")[0][0]}
                {patient.current?.full_name.split(" ")[1][0]}
              </Typography>
            </Avatar>
            <br />
            <h3 style={{ margin: 0 }}>{patient.current?.full_name}</h3>
            {/* <p style={{ margin: 0 }}>{doctor?.direction}</p> */}

            {/* <Typography variant="caption">
							is calling....
						</Typography> */}
          </Box>
        )}
        {/* {connectionStatus === "connecting" && <CennectionChecking />} */}
        {/* {connectionStatus !== "disconnected" && ( */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            position: "absolute",
            bottom: "20px",
            width: "auto",
            height: "auto",
            borderRadius: "15px",
            background: tgSecondaryBgColor,
          }}
        >
          <ButtonGroup
            sx={{
              paddingRight: "20px",
              paddingLeft: "20px",
              paddingTop: "5px",
              paddingBottom: "5px",
            }}
          >
            {!onCall && (
              <IconButton
                //   className={callStatus === "incoming" ? "ringing-icon" : ""}
                sx={{
                  backgroundColor: "green",
                  marginRight: "40px",
                }}
                onClick={
                  isPatient ? handleAnswerButtonClick : handleCallButtonClick
                }
              >
                <CallIcon />
              </IconButton>
            )}
            {/* {connectionStatus === "connecting" && isDoctor && (
                <audio controls={false} autoPlay loop>
                  <source
                    src="https://web.telegram.org/a/call_ringing.mp3"
                    type="audio/mpeg"
                  ></source>
                </audio>
              )} */}
            {/* {connectionStatus === "connecting" && isPatient && (
                <audio controls={false} autoPlay loop>
                  <source
                    src="https://web.telegram.org/a/voicechat_connecting.mp3"
                    type="audio/mpeg"
                  ></source>
                </audio>
              )} */}
            {/* {onCall && (
                <>
                  <IconButton
                    sx={{
                      backgroundColor: "green",
                      marginRight: "40px",
                    }}
                    onClick={handleVideoCam}
                  >
                    {videoCamOn ? <Videocam /> : <VideocamOff />}
                  </IconButton>
                  <IconButton
                    sx={{
                      backgroundColor: "green",
                      marginRight: "40px",
                    }}
                    onClick={handleVideoMic}
                  >
                    {videoMicOn ? <Mic /> : <MicOff />}
                  </IconButton>
                </>
              )} */}

            <IconButton
              sx={{ backgroundColor: "red" }}
              // onClick={handleHangupButtonClick}
              disabled={!isPatient && !(isDoctor && onCall)}
            >
              <CallEndRounded />
            </IconButton>
          </ButtonGroup>
        </Box>
        {/* )} */}
        {onCall && (
          <video
            width={100}
            height={150}
            style={{
              position: "fixed",
              bottom: "90px",
              right: 10,
              borderRadius: "15px",
              backgroundColor: "black",
            }}
            id="webcamVideo"
            ref={webcamVideo}
            autoPlay
            playsInline
          ></video>
        )}
      </Paper>
    </div>
  )
}
export default Meeting5