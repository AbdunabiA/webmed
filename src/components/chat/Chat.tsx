import {
  Avatar,
  Button,
  Container,
  Grid,
  FormControl,
  Input,
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
}

interface Messag {
  message: string;
  image_bytes?: string | null;
  receiver: number | string;
  sender: string | number;
  type: string;
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

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    // {
    //   message:
    //     "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Id ab dolores excepturi temporibus beatae tempore molestias voluptates omnis similique tenetur. Sit a commodi error culpa. Nobis amet tempore ullam atque, nemo consequatur delectus corporis saepe dolorem consectetur, incidunt assumenda dolor!",
    //   image_bytes: null,
    //   receiver: {
    //     id: 2,
    //     full_name: "Abdunabi",
    //   },
    //   sender: {
    //     id: 2,
    //     full_name: "Bexruz",
    //   },
    //   type: "patient",
    // },
    // {
    //   message:
    //     "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Id ab dolores excepturi temporibus beatae tempore molestias voluptates omnis similique tenetur. Sit a commodi error culpa. Nobis amet tempore ullam atque, nemo consequatur delectus corporis saepe dolorem consectetur, incidunt assumenda dolor!",
    //   image_bytes: null,
    //   receiver: {
    //     id: 2,
    //     full_name: "Abdunabi",
    //   },
    //   sender: {
    //     id: 2,
    //     full_name: "Bexruz",
    //   },
    //   type: "doctor",
    // },
    // {
    //   message:
    //     "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Id ab dolores excepturi temporibus beatae tempore molestias voluptates omnis similique tenetur. Sit a commodi error culpa. Nobis amet tempore ullam atque, nemo consequatur delectus corporis saepe dolorem consectetur, incidunt assumenda dolor!",
    //   image_bytes: null,
    //   receiver: {
    //     id: 2,
    //     full_name: "Abdunabi",
    //   },
    //   sender: {
    //     id: 2,
    //     full_name: "Bexruz",
    //   },
    //   type: "patient",
    // },
    // {
    //   message:
    //     "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Id ab dolores excepturi temporibus beatae tempore molestias voluptates omnis similique tenetur. Sit a commodi error culpa. Nobis amet tempore ullam atque, nemo consequatur delectus corporis saepe dolorem consectetur, incidunt assumenda dolor!",
    //   image_bytes: null,
    //   receiver: {
    //     id: 2,
    //     full_name: "Abdunabi",
    //   },
    //   sender: {
    //     id: 2,
    //     full_name: "Bexruz",
    //   },
    //   type: "doctor",
    // },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
                      backgroundColor: "#2671bd",
                    }}
                  >{` ${message?.message}`}</p>
                ) : null}

                {message?.image_bytes && (
                  <img
                    src={"https://telecure.ru" + message.image_bytes}
                    alt="Uploaded"
                    style={{ maxWidth: "50%", marginTop: "5px" }}
                  />
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
              <FormControl onSubmit={handleSendMessage}>
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
        </Paper>
      </div>
    </Container>
  );
};

export default Chat;
