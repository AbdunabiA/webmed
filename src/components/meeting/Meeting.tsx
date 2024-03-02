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
import firebase from "firebase/app";
import "firebase/firestore";
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
  patientDidNotAnswer,
} from "../../utils/api";
import CennectionChecking from "./Connecting";
import RecordRTC, {
  RecordRTCPromisesHandler,
  invokeSaveAsDialog,
} from "recordrtc";
import html2canvas from "html2canvas";

const firebaseConfig = {
  apiKey: "AIzaSyAiuAWMLAFE8GtFNv0ZgtEaVCHWDd-8S00",
  authDomain: "video-call-d2238.firebaseapp.com",
  projectId: "video-call-d2238",
  storageBucket: "video-call-d2238.appspot.com",
  messagingSenderId: "333230397878",
  appId: "1:333230397878:web:7bc0ab1a255412d4b68917",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const firestore = firebase.firestore();

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
  iceCandidatePoolSize: 10,
};

const pc = new RTCPeerConnection(servers);
let localStream: MediaStream | null = null;
let remoteStream: MediaStream | null = null;

const Meeting: React.FC = () => {
  const navigate = useNavigate();
  const webcamVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });
  const [callStatus, setCallStatus] = useState<"incoming" | "outgoing">(
    "incoming"
  );
  const [connectionStatus, setConnectionStatus] = useState<
    "initial" | "connected" | "connecting" | "disconnected"
  >("initial");
  const [onCall, setOnCall] = useState<boolean>(false);
  const [videoCamOn, setVideoCamOn] = useState<boolean>(true);
  const [videoMicOn, setVideoMicOn] = useState<boolean>(true);
  const [doctor, setDoctor] = useState<IDoctor>();
  const [patient, setPatient] = useState<IPatient>();

  const [windowRecorder, setWindowRecorder] = useState<
    RecordRTC | RecordRTCPromisesHandler | null
  >(null);
  const [localMediaRecorder, setLocalMediaRecorder] =
    useState<MediaRecorder | null>(null);
  const [remoteMediaRecorder, setRemoteMediaRecorder] =
    useState<MediaRecorder | null>(null);
  const [recordingChunks, setRecordingChunks] = useState<{
    local: BlobPart[] | undefined;
    remote: BlobPart[] | undefined;
  }>();
  const [streamChunks, setStreamChunks] = useState<{
    local: string;
    remote: string;
  }>({
    local: "",
    remote: "",
  });
  const [streamSeconds, setStreamSeconds] = useState<number>(0);
  const [socketPatient, setSocketPatient] = useState<WebSocket>();
  const [socketDoctor, setSocketDoctor] = useState<WebSocket>();

  const [bufferData, setBufferData] = useState<{ local: any; remote: any }>();

  const { callId, callInfo } = useParams();
  const callDetails = decryptVideoCallId(String(callInfo));
  console.log("calldetails", callDetails);

  const isPatient = callDetails.type === "patient";
  const isDoctor = callDetails.type === "doctor";

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

  const fetchDoctorData = async () => {
    try {
      const data = await getDoctor(callDetails.doctor);
      setDoctor(data);
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const fetchPatientData = async () => {
    try {
      const data = await getPatient(callDetails.patient);
      setPatient(data);
    } catch (error: any) {
      console.error(error.message);
    }
  };
  useEffect(() => {
    if (isPatient) {
      fetchDoctorData();
    }
    if (isDoctor) {
      setCallStatus("outgoing");
      fetchPatientData();
    }
  }, [callId]);

  const handleWebcamButtonClick = async () => {
    // const mediaStream = await navigator.mediaDevices.getDisplayMedia({
    // 	video: {
    // 	  displaySurface: "monitor", // Type assertion to any
    // 	} as MediaTrackConstraints,
    // 	audio: {
    // 	  echoCancellation: true,
    // 	  noiseSuppression: true,
    // 	  sampleRate: 44100,
    // 	},
    //   });

    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    remoteStream = new MediaStream();

    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream!);
    });

    let options = { mimeType: "video/webm; codecs=vp9" };
    if (MediaRecorder.isTypeSupported("video/webm; codecs=vp9")) {
      options = { mimeType: "video/webm; codecs=vp9" };
    } else if (MediaRecorder.isTypeSupported("video/webm")) {
      options = { mimeType: "video/webm" };
    } else if (MediaRecorder.isTypeSupported("video/mp4")) {
      options = { mimeType: "video/mp4" };
    } else {
    }

    const localMediaRecorde = new MediaRecorder(localStream, options);
    const remoteMediaRecorde = new MediaRecorder(remoteStream, options);

    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream!.addTrack(track);
      });
    };

    if (webcamVideo.current) {
      webcamVideo.current.volume = 0;
      webcamVideo.current.srcObject = localStream;
    }
    if (remoteVideo.current) {
      // remoteVideo.current.volume = 1;
      remoteVideo.current.srcObject = remoteStream;
    }

    setLocalMediaRecorder(localMediaRecorde);
    setRemoteMediaRecorder(remoteMediaRecorde);
  };

  const handleCall = async () => {
    await callToPatient({
      doctor_id: callDetails.doctor,
      patient_id: callDetails.patient,
      type: "patient",
    });
    const callDoc = firestore.collection("calls").doc(callId);
    const offerCandidates = callDoc.collection("offerCandidates");
    const answerCandidates = callDoc.collection("answerCandidates");

    pc.onicecandidate = (event) => {
      event.candidate && offerCandidates.add(event.candidate.toJSON());
    };

    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await callDoc.set({ offer });

    callDoc.onSnapshot((snapshot) => {
      const data = snapshot.data();
      if (!pc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.setRemoteDescription(answerDescription);
      }
    });

    answerCandidates.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          const candidateData = change.doc.data();
          console.log("Received ICE candidate data:", candidateData);

          const candidate = new RTCIceCandidate(candidateData);
          if (pc.remoteDescription) {
            await pc.addIceCandidate(candidate).catch((error) => {
              console.error("Error adding ICE candidate:", error);
            });
          }
        }
      });
    });

    console.log("[Calling...]");
  };

  const handleCallButtonClick = async () => {
    setOnCall(true);
    handleWebcamButtonClick();
    setConnectionStatus("connecting");

    setTimeout(() => {
      handleCall();
    }, 5000);
  };

  const handleAnswerCall = async () => {
    const callDoc = firestore.collection("calls").doc(callId);
    const answerCandidates = callDoc.collection("answerCandidates");
    const offerCandidates = callDoc.collection("offerCandidates");

    pc.onicecandidate = (event) => {
      event.candidate && answerCandidates.add(event.candidate.toJSON());
    };

    const callData = (await callDoc.get()).data();
    const offerDescription = callData?.offer;

    if (offerDescription) {
      console.log("offerDescription", offerDescription);
      await pc.setRemoteDescription(
        new RTCSessionDescription(offerDescription)
      );
    }

    // Check if remoteDescription is set before proceeding
    if (pc.remoteDescription) {
      const answerDescription = await pc.createAnswer();
      await pc.setLocalDescription(answerDescription);

      const answer = {
        type: answerDescription.type,
        sdp: answerDescription.sdp,
      };

      await callDoc.update({ answer });

      offerCandidates.onSnapshot((snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === "added") {
            const data = change.doc.data();
            if (pc.remoteDescription) {
              await pc
                .addIceCandidate(new RTCIceCandidate(data))
                .catch((error) => {
                  console.error("Error adding ICE candidate:", error);
                });
            }
          }
        });
      });
    }
  };

  const handleAnswerButtonClick = () => {
    setOnCall(true);
    handleWebcamButtonClick();
    setTimeout(() => {
      handleAnswerCall();
    }, 5000);
  };

  const createPatientResult = () => {
    navigate("/patient-result", {
      state: {
        patient: callDetails.patient,
        doctor: callDetails.doctor,
      },
    });
  };

  pc.oniceconnectionstatechange = (e) => {
    const connection = e.target as RTCPeerConnection;
    if (connection.iceConnectionState === "disconnected") {
      handleHangupButtonClick();
      stopRecording();
    } else if (connection.iceConnectionState === "checking") {
      setConnectionStatus("connecting");
    } else if (connection.iceConnectionState === "connected") {
      setConnectionStatus("connected");
      startRecording();
    }

    console.log("[Connection Status]", connection.iceConnectionState);
  };
  console.log("pc connection", connectionStatus);

  const handleHangupButtonClick = () => {
    stopRecording();
    setOnCall(false);

    if (socketPatient && socketDoctor) {
      socketDoctor.close();
      socketPatient.close();
    }

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
        localStream?.removeTrack(track);
      });
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => {
        track.stop();
        remoteStream?.removeTrack(track);
      });
    }

    if (webcamVideo.current) {
      webcamVideo.current.srcObject = null;
    }

    if (remoteVideo.current) {
      remoteVideo.current.srcObject = null;
    }

    pc.close();
    if (
      isDoctor &&
      callStatus === "outgoing" &&
      connectionStatus === "connecting"
    ) {
      patientDidNotAnswer(callId as string);
    }

    if (isDoctor) {
      setConnectionStatus("disconnected");
      createPatientResult();
    }
    if (isPatient) {
      setConnectionStatus("disconnected");
      navigate("/rating", {
        state: {
          doctor,
        },
      });
    }

    if (callId) {
      endCall(callId);
    }
  };

  const handleVideoCam = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        // Toggle video track
        videoTracks[0].enabled = !videoCamOn;
        setVideoCamOn(!videoCamOn);
      }
    }
  };

  const handleVideoMic = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        // Toggle audio track
        audioTracks[0].enabled = !videoMicOn;
        setVideoMicOn(!videoMicOn);
      }
    }
  };

  useEffect(() => {
    const socketDoctor = new WebSocket(
      `wss://telecure.ru/ws/meeting-doctor/${callId}/`
    );

    socketDoctor.onopen = () => {
      console.log("[WebSocket connection established]");
    };
    setSocketDoctor(socketDoctor);
    const socketPatient = new WebSocket(
      `wss://telecure.ru/ws/meeting-patient/${callId}/`
    );

    socketPatient.onopen = () => {
      console.log("[WebSocket connection established]");
    };
    setSocketPatient(socketPatient);
  }, [callId]);

  // useEffect(() => {
  //   if (window.performance) {
  //     if (performance.navigation.type == 1) {
  //       if (callId) {
  //         endCall(callId);
  //       }
  //     }
  //   }
  // }, [])

  const startRecording = () => {
    console.log("[Recording started...]");
    if (localMediaRecorder && remoteMediaRecorder) {
      localMediaRecorder.ondataavailable = async (e) => {
        const blob = new Blob([e.data], {
          type: "video/webm",
        });
        const reader = new FileReader();

        reader.onload = function (event) {
          const audioDataArrayBuffer = event.target?.result;
          if (audioDataArrayBuffer) {
            socketDoctor?.send(audioDataArrayBuffer);
          }
        };

        // Read the contents of the Blob as ArrayBuffer
        reader.readAsArrayBuffer(blob);

        const url = URL.createObjectURL(blob);
        console.log("URL", url);

        // setRecordingChunks((prevChunks) => {
        //   const updatedChunks = {
        //     local: prevChunks?.local ? [...prevChunks.local, e.data] : [e.data],
        //     remote: prevChunks?.remote,
        //   };
        //   return updatedChunks;
        // });

        // const streamChunk = await e.data.text();
        // setStreamChunks((prevChunks) => {
        //   const updatedChunks = {
        //     local: prevChunks.local + streamChunk,
        //     remote: prevChunks.remote,
        //   };
        //   return updatedChunks;
        // });
      };

      remoteMediaRecorder.ondataavailable = async (e) => {
        const blob = new Blob([e.data], {
          type: "video/webm",
        });
        const reader = new FileReader();

        reader.onload = function (event) {
          const audioDataArrayBuffer = event.target?.result;
          if (audioDataArrayBuffer) {
            socketPatient?.send(audioDataArrayBuffer);
          }
        };

        // Read the contents of the Blob as ArrayBuffer
        reader.readAsArrayBuffer(blob);

        const url = URL.createObjectURL(blob);
        console.log("URL", url);

        // setRecordingChunks((prevChunks) => {
        //   const updatedChunks = {
        //     local: prevChunks?.local,
        //     remote: prevChunks?.remote
        //       ? [...prevChunks.remote, e.data]
        //       : [e.data],
        //   };
        //   return updatedChunks;
        // });

        // const streamChunk = await e.data.text();
        // setStreamChunks((prevChunks) => {
        //   const updatedChunks = {
        //     local: prevChunks.local,
        //     remote: prevChunks.remote + streamChunk,
        //   };
        //   return updatedChunks;
        // });
      };

      if (isDoctor) {
        localMediaRecorder.start(1000);
        remoteMediaRecorder.start(1000);
      }
      // setInterval(() => {
      //   setStreamSeconds((prev) => prev + 1);
      // }, 1000);
    }
  };

  const stopRecording = async () => {
    localMediaRecorder?.stop();
    remoteMediaRecorder?.stop();
    const res = windowRecorder?.stopRecording(() => {
      console.log(windowRecorder.getBlob());
    });
    console.log("[Result]", res);

    const localBlob = new Blob(recordingChunks?.local, { type: "video/webm" });
    const remoteBlob = new Blob(recordingChunks?.remote, {
      type: "video/webm",
    });

    // Create data URLs from blobs
    const localUrl = URL.createObjectURL(localBlob);
    const remoteUrl = URL.createObjectURL(remoteBlob);
  };

  return (
    <div>
      <div
        // elevation={4}
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "10px",
        }}
      >
        <video
          style={{
            objectFit: "cover",
            height: `${dimensions.height}px`,
            width: `${dimensions.width}px`,
            margin: 0,
            borderRadius: "10px",
          }}
          id="remoteVideo"
          ref={remoteVideo}
          autoPlay
          playsInline
        ></video>
        {isDoctor && connectionStatus === "disconnected" && (
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
        )}
        {isPatient && !onCall && !remoteStream && (
          <div
            style={{
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
              src={"https://telecure.ru" + doctor?.avatar}
              alt="Doctor"
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "50%",
              }}
            />
            <br />
            <h3 style={{ margin: 0 }}>{doctor?.full_name}</h3>
            <p style={{ margin: 0 }}>{doctor?.direction}</p>

            <Typography variant="caption">is calling....</Typography>
          </div>
        )}
        {isDoctor && !onCall && !remoteStream && (
          <div
            style={{
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
                {patient?.full_name.split(" ")[0][0]}
                {patient?.full_name.split(" ")[1][0]}
              </Typography>
            </Avatar>
            <br />
            <h3 style={{ margin: 0 }}>{patient?.full_name}</h3>
          </div>
        )}
        {connectionStatus === "connecting" && <CennectionChecking />}
        {connectionStatus !== "disconnected" && (
          <div
            style={{
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
                  className={callStatus === "incoming" ? "ringing-icon" : ""}
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
              {connectionStatus === "connecting" && isDoctor && (
                <audio controls={false} autoPlay loop>
                  <source
                    src="https://web.telegram.org/a/call_ringing.mp3"
                    type="audio/mpeg"
                  ></source>
                </audio>
              )}
              {connectionStatus === "connecting" && isPatient && (
                <audio controls={false} autoPlay loop>
                  <source
                    src="https://web.telegram.org/a/voicechat_connecting.mp3"
                    type="audio/mpeg"
                  ></source>
                </audio>
              )}
              {onCall && (
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
              )}
              {onCall ? (
                <IconButton
                  sx={{ backgroundColor: "red" }}
                  onClick={handleHangupButtonClick}
                  // disabled={onCall}
                >
                  <CallEndRounded />
                </IconButton>
              ) : null}
            </ButtonGroup>
          </div>
        )}
        {onCall && (
          <video
            width={dimensions.width / 4}
            height={dimensions.width / 3}
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
      </div>
    </div>
  );
};

export default Meeting;
