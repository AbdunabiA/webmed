import React from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Rating,
  Typography,
  colors,
} from "@mui/material";
import { IDoctor } from "./types";
import { tgSecondaryBgColor } from "../../utils/colors";
import { BACKEND_URL } from "../../utils/api";
import { Star } from "@mui/icons-material";

interface DoctorCardProps {
  card: IDoctor;
  onSelect: (card: IDoctor) => void;
  isSelected: boolean;
}

const DoctorCard: React.FC<DoctorCardProps> = ({
  card,
  onSelect,
  isSelected,
}) => {
  // console.log(card);

  return (
    <Box
      sx={{
        marginTop: "15px",
        cursor: "pointer",
      }}
      onClick={() => onSelect(card)}
    >
      <Card
        sx={{
          display: "flex",
          background: isSelected ? colors.blue[500] : tgSecondaryBgColor,
          borderRadius: "15px",
        }}
      >
        <CardMedia
          component="img"
          sx={{
            width: "40%",
            height: "100%",
            objectFit: "contain",
            border: "1px solid black",
            borderRadius: "15px",
          }}
          image={"https://telecure.ru" + card.avatar}
          alt={`${card.avatar} album cover`}
        />
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <CardContent sx={{ flex: "1 0 auto" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  component="div"
                  variant="subtitle1"
                  fontWeight="bold"
                >
                  {card.full_name}
                </Typography>
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  component="div"
                >
                  {card.direction}
                </Typography>
                <Box display="flex">
                  {/* <Star
                    sx={{
                      fontSize: "14px",
                      color: colors.grey[500],
                    }}
                  /> */}
                  <Typography variant="caption">
                    <Rating
                      name="half-rating"
                      value={card.rating}
                      // onChange={handleValue}
                      precision={0.5}
                      style={{ fontSize: "16px" }}
                    />
                    ({card.voted_patients} reviews)
                  </Typography>
                </Box>
                <Typography variant="caption">
                  Цена консультации: {card.price} RUB
                </Typography>
              </Box>
              <Typography
                color={card.busy ? "red" : colors.green[500]}
                variant="h5"
              >
                •
              </Typography>
            </Box>
          </CardContent>
        </Box>
      </Card>
    </Box>
  );
};

export default DoctorCard;
