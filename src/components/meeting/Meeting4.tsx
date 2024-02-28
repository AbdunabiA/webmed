import React, { useState, useRef, useEffect } from "react";
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

const servers: RTCConfiguration = {
  iceServers: [
    {
      urls: "stun:stun.relay.metered.ca:80",
    },
    {
      urls: "turn:standard.relay.metered.ca:80",
      username: "78d4fbcb3ad780de80e3dd03",
      credential: "vnk1R7jte8ZD2TOt",
    },
    {
      urls: "turn:standard.relay.metered.ca:80?transport=tcp",
      username: "78d4fbcb3ad780de80e3dd03",
      credential: "vnk1R7jte8ZD2TOt",
    },
    {
      urls: "turn:standard.relay.metered.ca:443",
      username: "78d4fbcb3ad780de80e3dd03",
      credential: "vnk1R7jte8ZD2TOt",
    },
    {
      urls: "turns:standard.relay.metered.ca:443?transport=tcp",
      username: "78d4fbcb3ad780de80e3dd03",
      credential: "vnk1R7jte8ZD2TOt",
    },
  ],
};

let localStream: MediaStream | null = null;
let remoteStream: MediaStream | null = null;

const Meeting4: React.FC = () => {
  const pc = useRef<RTCPeerConnection>(new RTCPeerConnection(servers));
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
  const [localStreamm, setLocalStreamm] = useState<MediaStream | null>(null);

  const socketPatient = useRef<WebSocket | null>(null);
  const socketDoctor = useRef<WebSocket | null>(null);
  const ws = useRef<WebSocket | null>(null);

  console.log("calldetails", callDetails);

  const isPatient = callDetails.type === "patient";
  const isDoctor = callDetails.type === "doctor";

  const sendSignalingData = (data: any) => {
    ws.current!.send(JSON.stringify(data));
  };
  const handleOffer = async (offer: any) => {
    pc.current.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.current.createAnswer();
    await pc.current.setLocalDescription(answer);
    sendSignalingData({ type: "answer", answer, senderId: clientId.current });
    // setTimeout(() => {
    pc.current.onicecandidate = (event) => {
      console.log("onicecandidate event patient", event);

      event.candidate &&
        ws.current &&
        ws.current.send(
          JSON.stringify({
            type: "candidate",
            candidate: event.candidate,
            senderId: clientId.current,
          })
        );
    };
    // }, 2000);
  };

  const handleAnswer = (answer: any) => {
    pc.current.setRemoteDescription(new RTCSessionDescription(answer));
    console.log("handle answer was called", answer);
  };

  const handleNewICECandidateMsg = (candidate: any) => {
    pc.current.addIceCandidate(new RTCIceCandidate(candidate));
  };

  const handleSignalingData = (data: any) => {
    switch (data.type) {
      case "offer":
        if (clientId.current !== data.senderId) {
          handleOffer(data.offer);
          console.log("handled offer", data.offer);
        }
        break;
      case "answer":
        console.log("answer is in the case", data);

        if (clientId.current !== data.senderId) {
          handleAnswer(data.answer);
          console.log("handled answer", data.answer);
        }
        break;
      case "candidate":
        if (clientId.current !== data.senderId) {
          handleNewICECandidateMsg(data.candidate);
          console.log("handled candidate", data.candidate);
        }
        break;
      case "patientConnected":
        if (clientId.current !== data.senderId) {
          pc.current
            .createOffer()
            .then((offer) => {
              console.log("offer", offer);
              pc.current.setLocalDescription(offer);
              sendSignalingData({
                type: "offer",
                offer: offer,
                senderId: clientId.current,
              });
            })
            .then(() => {
              // Send the offer to the remote peer via the signaling server
            });

          pc.current.onicecandidate = (event) => {
            event.candidate &&
              ws.current &&
              ws.current.send(
                JSON.stringify({
                  type: "candidate",
                  candidate: event.candidate,
                  senderId: clientId.current,
                })
              );
          };
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    // Initialize WebSocket connection
    const socket = new WebSocket(`${WEBSOCKET_API}video/${callId}/`);
    console.log("WEBSOCKET CONST", socket);

    ws.current = socket;
    // if(ws){

    socket.onopen = () => {
      console.log("WebSocket connection established");
      // Send a message or join a room if your server requires it
      if (callDetails.type === "patient") {
        socket.send(
          JSON.stringify({
            type: "patientConnected",
            senderId: clientId.current,
          })
        );
      }
    };
    socket.onmessage = (message) => {
      const msg = JSON.parse(message.data);
      console.log("WS Message", msg);

      handleSignalingData(msg);
    };
    // }

    // Cleanup on component unmount
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [callId]);

  localStorage.setItem("key", JSON.stringify({ key: "value" }));

  const fetchDoctorData = async () => {
    try {
      doctor.current = await getDoctor(callDetails.doctor);
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const fetchPatientData = async () => {
    try {
      patient.current = await getPatient(callDetails.patient);
    } catch (error: any) {
      console.error(error.message);
    }
  };
  useEffect(() => {
    if (isPatient) {
      fetchDoctorData();
    }
    if (isDoctor) {
      //   setCallStatus("outgoing");
      fetchPatientData();
    }
  }, [callId]);

  // const handleWebcamButtonClick = async () => {
  //   localStream = await navigator.mediaDevices.getUserMedia({
  //     video: true,
  //     audio: true,
  //   });
  //   setLocalStreamm(localStream);
  //   remoteStream = new MediaStream();
  //   if (webcamVideo.current) {
  //     webcamVideo.current.srcObject = localStream;
  //     console.log("webcamVideo.current.srcObject");
  //   }
  //   if (localStream) {
  //     localStream.getTracks().forEach((track) => {
  //       pc.current.addTrack(track, localStream!);
  //       console.log("local track is being added to track");
  //     });
  //   }

  //   pc.current.ontrack = (event) => {
  //     console.log("ontrack event", event);
  //     event.streams[0].getTracks().forEach((track) => {
  //       console.log("adding remotetrack", track);
  //       remoteStream!.addTrack(track);
  //     });
  //   };

  //   if (remoteVideo.current) {
  //     remoteVideo.current.srcObject = remoteStream;
  //   }

  //   // setLocalMediaRecorder(localMediaRecorde);
  //   // setRemoteMediaRecorder(remoteMediaRecorde);
  // };

  useEffect(() => {
    const getMedia = async () => {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStreamm(localStream);
        remoteStream = new MediaStream();
        if (webcamVideo.current) {
          webcamVideo.current.srcObject = localStream;
          console.log("webcamVideo.current.srcObject");
        }
        if (localStream) {
          localStream.getTracks().forEach((track) => {
            pc.current.addTrack(track, localStream!);
            console.log("local track is being added to track");
          });
        }
        pc.current.ontrack = (event) => {
          console.log("ontrack event", event);
          event.streams[0].getTracks().forEach((track) => {
            console.log("adding remotetrack", track);
            remoteStream!.addTrack(track);
          });
        };
        if (remoteVideo.current) {
          remoteVideo.current.srcObject = remoteStream;
        }
      } catch (error) {
        console.error(error);
      }
    };

    getMedia();
  }, []);

  const handleCall = async () => {
    await callToPatient({
      doctor_id: callDetails.doctor,
      patient_id: callDetails.patient,
      type: "patient",
    });

    console.log("[Calling...]");
  };

  const handleCallButtonClick = async () => {
    setOnCall(true);
    // handleWebcamButtonClick();
    // setConnectionStatus("connecting");

    setTimeout(() => {
      handleCall();
    }, 1000);
  };

  const handleAnswerCall = async () => {};
  console.log("websocket", ws.current);
  console.log("PC", pc.current);

  const handleAnswerButtonClick = () => {
    console.log("handleAnswerButtonClick function called");

    setOnCall(true);
    // handleWebcamButtonClick();
    setTimeout(() => {
      handleAnswerCall();
    }, 2000);
  };

  const createPatientResult = () => {
    navigate("/patient-result", {
      state: {
        patient: callDetails.patient,
        doctor: callDetails.doctor,
      },
    });
  };

  pc.current.oniceconnectionstatechange = (e) => {
    const connection = e.target as RTCPeerConnection;

    if (connection.iceConnectionState === "disconnected") {
      // handleHangupButtonClick();
      //   stopRecording();
    } else if (connection.iceConnectionState === "checking") {
      //   setConnectionStatus("connecting");
      console.log("checking");
    } else if (connection.iceConnectionState === "connected") {
      //   setConnectionStatus("connected");
      //   startRecording();
      console.log("connected");
    }

    console.log("[Connection Status]", connection.iceConnectionState);
  };
  pc.current.onicecandidateerror = (event) => {
    console.log("onicecandidateerror", event);
  };
  // const handleHangupButtonClick = () => {
  //   // stopRecording();
  //   setOnCall(false);

  //   if (socketPatient.current && socketDoctor.current) {
  //     socketDoctor.current.close();
  //     socketPatient.current.close();
  //   }

  //   if (localStream) {
  //     localStream.getTracks().forEach((track) => {
  //       track.stop();
  //       localStream?.removeTrack(track);
  //     });
  //   }

  //   if (remoteStream) {
  //     remoteStream.getTracks().forEach((track) => {
  //       track.stop();
  //       remoteStream?.removeTrack(track);
  //     });
  //   }

  //   if (webcamVideo.current) {
  //     webcamVideo.current.srcObject = null;
  //   }

  //   if (remoteVideo.current) {
  //     remoteVideo.current.srcObject = null;
  //   }

  //   pc.current.close();

  //   if (callId) {
  //     endCall(callId);
  //   }
  // };

  useEffect(() => {
    socketDoctor.current = new WebSocket(
      `wss://telecure.ru/ws/meeting-doctor/${callId}/`
    );

    socketDoctor.current.onopen = () => {
      console.log("Doctor[WebSocket connection established]");
    };
    // setSocketDoctor(socketDoctor);
    socketPatient.current = new WebSocket(
      `wss://telecure.ru/ws/meeting-patient/${callId}/`
    );

    socketPatient.current.onopen = () => {
      console.log("Patient[WebSocket connection established]");
    };
    // setSocketPatient(socketPatient);
  }, [callId]);

  console.log("remoteVideo", remoteVideo);
  console.log("localVideo", webcamVideo);

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
        {isPatient && !onCall && !remoteStream && (
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
        {isDoctor && !onCall && !remoteStream && (
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
  );
};

export default Meeting4;
