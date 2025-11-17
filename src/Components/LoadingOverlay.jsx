import React from "react";
import { Box, CircularProgress, Typography, useTheme } from "@mui/material";

const LoadingOverlay = ({ loading, message = "Loading...", fullScreen = false }) => {
  const theme = useTheme();

  if (!loading) return null;

  return (
    <Box
      sx={{
        position: fullScreen ? "fixed" : "absolute",
        inset: 0,
        backgroundColor: fullScreen
          ? theme.palette.background.default + "CC"
          : theme.palette.background.paper + "CC",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: fullScreen ? 1300 : 1,
      }}
    >
      <CircularProgress sx={{ color: theme.palette.primary.main }} />
      {message && (
        <Typography sx={{ mt: 2, color: theme.palette.text.primary }}>{message}</Typography>
      )}
    </Box>
  );
};

export default LoadingOverlay;
