import {
  Avatar,
  Button,
  Container,
  Grid,
  IconButton,
  Input,
  Paper,
  Typography,
} from "@mui/material";
import React, { ChangeEvent, useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import AttachFileIcon from "@mui/icons-material/AttachFile";

interface Message {
  text: string;
  imageUrl?: string;
  sender: string;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const userSenderId = "USER_ID_1"; // Replace with the actual user ID of the sender
  const userReceiver: User = {
    userId: "USER_ID_2", // Replace with the actual user ID of the receiver
    userName: "Receiver User", // Replace with the actual user name of the receiver
    avatarUrl: "URL_TO_RECEIVER_AVATAR", // Replace with the actual URL of the receiver's avatar
  };

  useEffect(() => {
    // Connect to the WebSocket server
    const socket = new WebSocket(`wss://telecure.ru/chat/${userSenderId}`);

    // Listen for incoming messages from the server
    socket.addEventListener("message", (event) => {
      const message: Message = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Save the WebSocket instance for later use
    setWs(socket);

    // Clean up the WebSocket connection on component unmount
    return () => {
      socket.close();
    };
  }, [userSenderId]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSendMessage = () => {
    // Send the message and image to the server
    if (ws) {
      const message: Message = {
        text: newMessage,
        sender: userSenderId,
      };
      ws.send(JSON.stringify(message));

      setMessages((prevMessages) => [...prevMessages, message]); // Display the sent message immediately

      setNewMessage("");
      setImage(null);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} style={{ padding: "20px", margin: "20px 0" }}>
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Avatar
            alt={userReceiver.userName}
            src={userReceiver.avatarUrl}
            style={{ marginRight: "10px" }}
          />
          <Typography variant="h6">{userReceiver.userName}</Typography>
        </div>

        <div>
          {messages.map((message, index) => (
            <div key={index}>
              {`${message.sender}: ${message.text}`}
              {message.imageUrl && (
                <img
                  src={message.imageUrl}
                  alt="Uploaded"
                  style={{ maxWidth: "100%", marginTop: "5px" }}
                />
              )}
            </div>
          ))}
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
            <Button
              type="button"
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleSendMessage}
            >
              Send
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Chat;
