import {
  Avatar,
  Button,
  Container,
  FormControl,
  Grid,
  Input,
  Modal,
  Paper,
  Typography,
} from "@mui/material";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { styled } from "@mui/material/styles";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { useParams } from "react-router-dom";
import {
  getPatientInfo,
  getSelectedDoctor,
  getUser,
} from "../../utils/storage";
import { decryptCallId } from "../../utils/decryption";
import { BACKEND_URL, WEBSOCKET_API, fetchChatHistory } from "../../utils/api";
import { position } from "html2canvas/dist/types/css/property-descriptors/position";

export interface Message {
  message: string;
  image_bytes?: string | null;
  receiver: {
    id: number;
    full_name: string;
  };
  sender: {
    id: number;
    full_name: string;
  };
  type: string;
  status?: string;
}

interface Messag {
  message: string;
  image_bytes?: string | null;
  receiver: number | string;
  sender: string | number;
  type: string;
  status?: string;
}

interface User {
  userId: string;
  userName: string;
  avatarUrl?: string;
}

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

interface Modal {
  isOpen: boolean;
  message: {
    status?: string;
    message: string | null;
    image_bytes?: string | null;
    receiver: {
      id: number;
      full_name: string;
    };
    sender: {
      id: number;
      full_name: string;
    };
    type: string;
  } | null;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [modal, setModal] = useState<Modal>({ isOpen: false, message: null });

  const { chatId, chatInfo: hash } = useParams();
  const chatInfo = decryptCallId(hash as string);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView();
    // { behavior: "smooth" }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const getChatHistory = async () => {
      try {
        const chatHistory = await fetchChatHistory(chatId as string);
        // console.log("History", chatHistory);

        if (chatHistory) setMessages(chatHistory);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
        // Handle error appropriately, maybe set an error state
      }
    };

    getChatHistory();
  }, []);

  const sendFile = (file: File) => {
    const reader = new FileReader();

    reader.onload = function (event) {
      if (event.target?.result && ws) {
        const base64String = event.target.result as string;
        console.log("Image", event.target.result);

        const data: Messag = {
          message: newMessage,
          sender:
            chatInfo.type === "patient"
              ? chatInfo.patient.id
              : chatInfo.doctor.id,
          receiver:
            chatInfo.type === "patient"
              ? chatInfo.doctor.id
              : chatInfo.patient.id,
          type: chatInfo.type,
          image_bytes: base64String,
        };

        // Now send this data object over the WebSocket
        ws.send(JSON.stringify(data));
      }
    };

    reader.readAsDataURL(file);
  };
  // console.log("messages", messages);

  const userReceiver: User = {
    userId: "USER_ID_2", // Replace with the actual user ID of the receiver
    userName: "Receiver User", // Replace with the actual user name of the receiver
    avatarUrl: "URL_TO_RECEIVER_AVATAR", // Replace with the actual URL of the receiver's avatar
  };

  useEffect(() => {
    // Connect to the WebSocket server
    const socket = new WebSocket(`${WEBSOCKET_API}chat/${chatId}/`);

    // Listen for incoming messages from the server
    socket.addEventListener("message", (event) => {
      const message: Message = JSON.parse(event.data);
      // console.log('OnMessage', message);

      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Save the WebSocket instance for later use
    setWs(socket);

    // Clean up the WebSocket connection on component unmount
    return () => {
      socket.close();
    };
  }, []);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      sendFile(e.target.files[0]);
      setImage(null);
    }
  };

  const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Send the message and image to the server
    if (ws && newMessage.trim()) {
      const message: Messag = {
        message: newMessage,
        sender:
          chatInfo.type === "patient"
            ? chatInfo.patient.id
            : chatInfo.doctor.id,
        receiver:
          chatInfo.type === "patient"
            ? chatInfo.doctor.id
            : chatInfo.patient.id,
        type: chatInfo.type,
      };
      ws.send(JSON.stringify(message));

      // setMessages((prevMessages) => [...prevMessages, message]); // Display the sent message immediately

      setNewMessage("");
      setImage(null);
    }
  };
  console.log("MESSAGES", messages);

  return (
    <Container component="main" maxWidth="sm">
      <div style={{ height: "95vh" }}>
        <Paper elevation={3} style={{ padding: "20px", margin: "20px 0" }}>
          <div
            style={{
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Avatar
              alt={
                chatInfo.type === "patient"
                  ? chatInfo.doctor.name
                  : chatInfo.patient.name
              }
              src={userReceiver.avatarUrl}
              style={{ marginRight: "10px" }}
            />
            <Typography variant="h6">
              {chatInfo.type === "patient"
                ? chatInfo.doctor.name
                : chatInfo.patient.name}
            </Typography>
          </div>
          <Modal
            style={{
              width: "100vw",
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            open={modal.isOpen}
            onClose={() => setModal({ isOpen: false, message: null })}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "end" }}>
                <h1
                  onClick={() => setModal({ isOpen: false, message: null })}
                  style={{
                    color: "white",
                    fontSize: "30px",
                    backgroundColor: "black",
                    borderRadius: "10px",
                    padding: "5px",
                  }}
                >
                  X
                </h1>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%",
                }}
              >
                <img
                  style={{
                    width: "90%",
                    maxHeight: "90%",
                    filter:
                      modal?.message?.status === "close"
                        ? "blur(15px)"
                        : "none",
                  }}
                  src={"https://telecure.ru" + modal?.message?.image_bytes}
                  alt=""
                />
              </div>
            </div>
          </Modal>
          <div style={{ overflowY: "auto", height: "100%", maxHeight: "66vh" }}>
            {messages?.map((message, index) => (
              <div
                key={index}
                style={
                  chatInfo.type === message.type
                    ? {
                        display: "flex",
                        alignItems: "end",
                        justifyContent: "end",
                      }
                    : {
                        display: "flex",
                        alignItems: "end",
                        justifyContent: "start",
                      }
                }
              >
                {chatInfo.type !== message.type ? (
                  <Avatar style={{ marginRight: "5px" }}>
                    {message?.sender?.full_name[0].toUpperCase()}
                  </Avatar>
                ) : null}
                {message?.message ? (
                  <p
                    style={{
                      maxWidth: "70%",
                      padding: "5px 10px",
                      borderRadius: "15px",
                      backgroundColor:
                        chatInfo.type === message.type ? "#2671bd" : "#210a6d",
                    }}
                  >{` ${message?.message}`}</p>
                ) : null}

                {message?.image_bytes && (
                  <>
                    <img
                      onClick={() => setModal({ isOpen: true, message })}
                      src={"https://telecure.ru" + message.image_bytes}
                      alt="Uploaded"
                      style={{
                        maxWidth: "50%",
                        marginTop: "5px",
                        filter:
                          message.status === "close" ? "blur(15px)" : "none",
                      }}
                    />
                  </>
                )}
                {chatInfo.type === message.type ? (
                  <Avatar style={{ marginLeft: "5px" }}>
                    {message?.sender?.full_name[0].toUpperCase()}
                  </Avatar>
                ) : null}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {
            messages[0].status !== "close" ? (
              <form onSubmit={handleSendMessage}>
            <Grid container spacing={2} style={{ marginTop: "20px" }}>
              <Grid item xs={12} sx={{ display: "flex" }}>
                <Button
                  component="label"
                  color="inherit"
                  variant="text"
                  sx={{ padding: 0, margin: 0 }}
                  startIcon={<AttachFileIcon />}
                >
                  <VisuallyHiddenInput
                    type="file"
                    id="imageInput"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>

                <Input
                  fullWidth
                  placeholder="Type message..."
                  id="message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
               
                    <FormControl fullWidth>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                  >
                    Send
                  </Button>
                </FormControl>
              </Grid>
            </Grid>
          </form>
            ) : null
          }

        </Paper>
      </div>
    </Container>
  );
};

export default Chat;
