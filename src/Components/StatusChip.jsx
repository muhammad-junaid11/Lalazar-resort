// src/Components/StatusChip.jsx
import React from "react";
import { Chip, useTheme } from "@mui/material";

const statusColorMap = {
  // Room Status
  Available: "success",
  Booked: "error",
  Maintenance: "warning",
  Cleaning: "info",

  // Booking Status
  New: "primary",
  Pending: "warning",
  Confirmed: "success",
  "Checked Out": "info",
  Cancelled: "error",

  // Payment Status
  Paid: "success",
  Refunded: "info",
  Failed: "error",
};

const StatusChip = ({ label }) => {
  const theme = useTheme();
  const colorKey = statusColorMap[label] || "grey";
  const color =
    colorKey === "grey" ? theme.palette.grey[500] : theme.palette[colorKey].main;

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        backgroundColor: color + "33", // semi-transparent
        color,
        fontWeight: 600,
        ml: 1,
      }}
    />
  );
};

export default StatusChip;
