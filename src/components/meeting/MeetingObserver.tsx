import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  API_BASE_URL,
} from "../../utils/api";

const MeetingObserver = () => {
  const { callId } = useParams();

  const videoContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  const videoStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "600px",
    height: "auto",
    marginBottom: "20px",
  };

  return (
    <div style={videoContainerStyle}>
      <div style={videoStyle}>
        <video src={`${API_BASE_URL}/video_stream_doctor/${callId}`} autoPlay></video>
      </div>
      <div style={videoStyle}>
        <video src={`${API_BASE_URL}/video_stream_patient/${callId}`} autoPlay></video>
      </div>
    </div>
  );
};

export default MeetingObserver;
