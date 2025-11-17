import React from "react";
import { Box, Typography, useTheme } from "@mui/material";

const SectionHeader = ({ title, sx = {} }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.mode === "light" ? "#F0F9F8" : theme.palette.background.paper,
        px: 0.5,
        py: 1,
        borderRadius: 1,
        mb: 2,
        mt: 3,
        ...sx,
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: "bold",
          color: theme.palette.primary.main,
        }}
      >
        {title}
      </Typography>
    </Box>
  );
};

export default SectionHeader;
