// Selectinput.jsx
import React from "react";
import { Controller } from "react-hook-form";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const Selectinput = ({ name, control, label, options = [], sx = {}, ...rest }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        // REMOVED: fullWidth from FormControl
        <FormControl size="small" sx={sx}> 
          <InputLabel>{label}</InputLabel>
          <Select {...field} label={label} {...rest}>
            {options.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    />
  );
};

export default Selectinput;