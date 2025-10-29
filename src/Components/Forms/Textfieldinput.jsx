import React, { useState } from "react";
import { Controller } from "react-hook-form";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const Textfieldinput = ({
  name,
  control,
  label,
  type = "text",
  rules = {},
  defaultValue = "",
  onChange,
  value = "",
  placeholder,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  const displayPlaceholder = value ? "" : placeholder;

  if (!control) {
    return (
      <TextField
        name={name}
        label={label}
        type={isPassword && !showPassword ? "password" : "text"}
        fullWidth
        margin="normal"
        value={value}
        onChange={onChange}
        placeholder={displayPlaceholder}
        InputProps={{
          endAdornment: isPassword && (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                tabIndex={-1}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        {...rest}
      />
    );
  }

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      rules={rules}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          type={isPassword && !showPassword ? "password" : "text"}
          label={label}
          fullWidth
          margin="normal"
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          placeholder={field.value ? "" : placeholder}
          InputProps={{
            endAdornment: isPassword && (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  tabIndex={-1}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          {...rest}
        />
      )}
    />
  );
};

export default Textfieldinput;
