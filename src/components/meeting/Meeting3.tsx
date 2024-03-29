import React, { useEffect, useRef, useState } from "react";
import { WEBSOCKET_API, callToPatient } from "../../utils/api";
import { useParams } from "react-router-dom";
import { decryptVideoCallId } from "../../utils/decryption";

// const SIGNALING_SERVER_URL: string =
//   WEBSOCKET_API
const configuration: RTCConfiguration = {
  iceServers: [
    // Google's public STUN server
    {
      urls: "stun:stun.l.google.com:19302",
    },
    // Additional STUN server
    {
      urls: "stun:stun1.l.google.com:19302",
    },
  ],
};

const VideoCallPage: React.FC = () => {
  const { callId, callInfo } = useParams();
  const callDetails = decryptVideoCallId(String(callInfo));
  const clientId = useRef(
    callDetails.type === "patient" ? callDetails.patient : callDetails.doctor
  );
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [wsConnection, setWsConnection] = useState(false);
  const pc = useRef<RTCPeerConnection>(new RTCPeerConnection(configuration));
  const ws = useRef<WebSocket>(
    new WebSocket(`${WEBSOCKET_API}video/${callId}/`)
  );
  useEffect(() => {
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error(error);
      }
    };

    getMedia();
  }, []);

   
    ws.current.onopen = (event) => {
      console.log("Connection opened");

      // Define an async function inside the event handler
      const initializeConnection = async () => {
        try {
          const offer = await pc.current.createOffer();
          await pc.current.setLocalDescription(offer);
          ws.current.send(
            JSON.stringify({ type: "offer", offer, senderId: clientId.current })
          );
          console.log("offer sent", offer);

          // Once the connection is open, you can send messages to the server.
          ws.current.send("Hello, server!");
        } catch (error) {
          console.error("Failed to create or send offer:", error);
        }
      };

      // Call the async function
      if (callDetails.type === "doctor") initializeConnection();
    };
  


  useEffect(() => {
    if (!localStream) return;

    localStream.getTracks().forEach((track) => {
      console.log("adding local stream", track);

      pc.current.addTrack(track, localStream);
    });

    ws.current.onmessage = async (message: MessageEvent) => {
      const data = JSON.parse(message.data);
      console.log("websocket data", data);

  
      if (data.senderId === clientId.current) {
        console.log("ignored");
        return;
      }
      switch (data.type) {
        case "offer":
          await pc.current.setRemoteDescription(
            new RTCSessionDescription(data.offer)
          );
          console.log("got offer and set", data);

          const answer = await pc.current.createAnswer();
          await pc.current.setLocalDescription(answer);
          ws.current.send(
            JSON.stringify({
              type: "answer",
              answer,
              senderId: clientId.current,
            })
          );
          console.log("answer sent", answer);

          break;
        case "answer":
          await pc.current.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          );
          console.log("got answer and set", data);

          break;
        case "candidate":
          if (data.candidate) {
            const candidate = new RTCIceCandidate({
              candidate: data.candidate.candidate,
              sdpMid: data.candidate.sdpMid,
              sdpMLineIndex: data.candidate.sdpMLineIndex,
            });
            await pc.current.addIceCandidate(candidate);
          }
          console.log("got candidate and set", data);
          break;
        default:
          break;
      }
    };

    pc.current.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        ws.current.send(
          JSON.stringify({
            type: "candidate",
            candidate: event.candidate,
            senderId: clientId.current,
          })
        );
        console.log("candiate sent", event.candidate);
      }
    };

    pc.current.ontrack = (event: RTCTrackEvent) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        console.log("remote ref set", remoteVideoRef);
      }
    };

    // if (localStream) {
    // localStream.getTracks().forEach((track) => {
    //   if (pc.current.signalingState !== "closed") {
    //     pc.current.addTrack(track, localStream);
    //   }
    // });
    // }

    return () => {
      localStream?.getTracks().forEach((track) => track.stop());
      pc.current.close();
      ws.current.close();
    };
  }, [localStream]);

  const callUser = async () => {
    await callToPatient({
      doctor_id: callDetails.doctor,
      patient_id: callDetails.patient,
      type: "patient",
    });
  };
  console.log(pc.current);

  return (
    <div>
      <div>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          style={{ width: "100%", height: "40vh" }}
        />
      </div>
      <div>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{ width: "100%", height: "40vh" }}
        />
      </div>
      <div>
        {callDetails.type !== "patient" ? (
          <button onClick={callUser}>Call</button>
        ) : (
          <button>Answer</button>
        )}
      </div>
    </div>
  );
};

export default VideoCallPage;
