// Textfieldinput.jsx - Best Practice
import React from "react";
import { Controller } from "react-hook-form";
import { TextField } from "@mui/material";

const Textfieldinput = ({ 
    name, 
    control, 
    label, 
    placeholder, 
    sx = {}, 
    // New prop with default value
    fullWidth = true, 
    ...rest 
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          size="small"
          label={label}
          placeholder={placeholder}
          fullWidth={fullWidth} // Use the prop value
          sx={sx} 
          {...rest}
        />
      )}
    />
  );
};

export default Textfieldinput;