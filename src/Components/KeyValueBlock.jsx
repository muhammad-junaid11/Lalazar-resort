import React from "react";
import { Box, Typography } from "@mui/material";

const KeyValueBlock = ({ label, value, children }) => {
  return (
    <Box sx={{ flexBasis: { xs: "100%", sm: "30%" } }}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>

      {children ? (
        children
      ) : (
        <Typography variant="body1" sx={{ mt: 0.5, fontWeight: "medium" }}>
          {value || "--"}
        </Typography>
      )}
    </Box>
  );
};

export default KeyValueBlock;
