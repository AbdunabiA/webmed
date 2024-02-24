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
  const [clientId, setClientId] = useState(callDetails.type === "patient"
          ? callDetails.patient
          : callDetails.doctor);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
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

  useEffect(() => {
    if (!localStream) return;

    localStream.getTracks().forEach((track) => {
      console.log('adding local stream', track);
      
      pc.current.addTrack(track, localStream);
    });

    ws.current.onmessage = async (message: MessageEvent) => {
      const data = JSON.parse(message.data);
      console.log("websocket data", data);

      // const client: number =
        
      // setClientId(client); // This should be dynamically set based on your app's logic

      // Ignore messages sent by the current client
      if (data.senderId === clientId) {
        console.log('ignored');
        return;
      }
      switch (data.type) {
        case "offer":
          await pc.current.setRemoteDescription(
            new RTCSessionDescription(data.offer)
          );
          console.log('got offer and set', data);
          
          const answer = await pc.current.createAnswer();
          await pc.current.setLocalDescription(answer);
          ws.current.send(
            JSON.stringify({ type: "answer", answer, senderId: clientId })
          );
          console.log('answer sent', answer);
          
          break;
        case "answer":
          await pc.current.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          );
          console.log('got answer and set', data);
          
          break;
        case "candidate":
          if (data.candidate) {
            await pc.current.addIceCandidate(
              new RTCIceCandidate(data.candidate)
            );
          }
          console.log('got candidate and set', data);
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
            senderId: clientId,
          })
        );
        console.log("candiate sent", event.candidate);
        
      }
    };

    pc.current.ontrack = (event: RTCTrackEvent) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
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
    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);
    ws.current.send(
      JSON.stringify({ type: "offer", offer, senderId: clientId })
    );
    console.log("offer sent", offer);
    
  };

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
        {callDetails.type === "patient" ? <button onClick={callUser}>Call</button> : <button>Answer</button>}
      </div>
    </div>
  );
};

export default VideoCallPage;
