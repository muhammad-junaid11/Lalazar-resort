import React, { useEffect } from "react";
import {
  Box,
  Typography,
  MenuItem,
  Button,
  Card,
  CardContent,
  Stack,
  useTheme,
  TextField,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const roomStatuses = ["Available", "Booked", "Maintenance", "Cleaning"];
const roomCategories = ["Deluxe Room", "Executive Room", "Family Room", "Luxury Room"];
const propertyTypes = ["Owned", "Partnered"];
const hotelNames = [
  "Lalazar Resort",
  "Pine View Hotel",
  "Snow Peak Retreat",
  "Mountain Bliss Inn",
  "Valley View Resort",
  "Serenity Lodge",
  "Maple Leaf Hotel",
  "Golden Sands Resort",
  "Evergreen Heights",
  "Crystal Lake Resort",
];

const Textfieldinput = ({ name, control, label, placeholder, type = "text", select, children, rules }) => (
  <Controller
    name={name}
    control={control}
    rules={rules}
    render={({ field }) => (
      <TextField
        {...field}
        type={type}
        label={label}
        placeholder={placeholder}
        select={select}
        size="small"
        fullWidth
        InputProps={{ sx: { py: 0.5 } }}
        InputLabelProps={{ sx: { mt: 0 } }}
      >
        {children}
      </TextField>
    )}
  />
);

const AddRoom = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const { handleSubmit, control, reset } = useForm({
    defaultValues: {
      hotelName: "",
      category: "",
      roomNumber: "",
      price: "",
      status: "",
      propertyType: "",
    },
  });

  useEffect(() => {
    if (isEditMode) {
      const existingRooms = JSON.parse(localStorage.getItem("roomsData")) || [];
      const roomToEdit = existingRooms.find((r) => r.id === parseInt(id));
      if (roomToEdit) reset(roomToEdit);
    }
  }, [id, isEditMode, reset]);

  const onSubmit = (data) => {
    const existingRooms = JSON.parse(localStorage.getItem("roomsData")) || [];

    if (isEditMode) {
      const updatedRooms = existingRooms.map((r) =>
        r.id === parseInt(id) ? { ...r, ...data, price: parseFloat(data.price) } : r
      );
      localStorage.setItem("roomsData", JSON.stringify(updatedRooms));
      toast.success("Room updated successfully!", { position: "top-right", autoClose: 2000 });
    } else {
      const newRoom = { ...data, id: existingRooms.length + 1, price: parseFloat(data.price) };
      localStorage.setItem("roomsData", JSON.stringify([...existingRooms, newRoom]));
      toast.success("Room added successfully!", { position: "top-right", autoClose: 2000 });
    }

    setTimeout(() => navigate("/rooms"), 2000);
    reset();
  };

  return (
    <Box sx={{ flexGrow: 1, mt: 0, mb: 0, py: 1 }}>
      <Card sx={{ borderRadius: 2, boxShadow: 2, width: "100%", backgroundColor: theme.palette.background.paper }}>
        <CardContent sx={{ p: 2 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h5" fontWeight="bold" color={theme.palette.primary.main}>
                {isEditMode ? "Edit Room" : "Add New Room"}
              </Typography>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ borderRadius: 2, py: 1, px: 2, fontWeight: 600, textTransform: "none" }}
              >
                Save
              </Button>
            </Box>

            <Stack spacing={1.5}>
              {/* Row 1: Hotel + Room No */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={0.5}>
                <Box sx={{ flex: 1 }}>
                  <Textfieldinput
                    name="hotelName"
                    control={control}
                    label="Hotel Name"
                    select
                    rules={{ required: true }}
                  >
                    {hotelNames.map((name) => (
                      <MenuItem key={name} value={name}>
                        {name}
                      </MenuItem>
                    ))}
                  </Textfieldinput>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Textfieldinput
                    name="roomNumber"
                    control={control}
                    label="Room No"
                    type="number"
                    placeholder="e.g., 205"
                    rules={{ required: true }}
                  />
                </Box>
              </Stack>

              {/* Row 2: Price + Category */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={0.5}>
                <Box sx={{ flex: 1 }}>
                  <Textfieldinput
                    name="price"
                    control={control}
                    label="Price (PKR)"
                    type="number"
                    rules={{ required: true, min: 1 }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Textfieldinput
                    name="category"
                    control={control}
                    label="Category"
                    select
                    rules={{ required: true }}
                  >
                    {roomCategories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Textfieldinput>
                </Box>
              </Stack>

              {/* Row 3: Status + Property Type */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={0.5}>
                <Box sx={{ flex: 1 }}>
                  <Textfieldinput
                    name="status"
                    control={control}
                    label="Status"
                    select
                    rules={{ required: true }}
                  >
                    {roomStatuses.map((st) => (
                      <MenuItem key={st} value={st}>
                        {st}
                      </MenuItem>
                    ))}
                  </Textfieldinput>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Textfieldinput
                    name="propertyType"
                    control={control}
                    label="Type"
                    select
                    rules={{ required: true }}
                  >
                    {propertyTypes.map((p) => (
                      <MenuItem key={p} value={p}>
                        {p}
                      </MenuItem>
                    ))}
                  </Textfieldinput>
                </Box>
              </Stack>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AddRoom;
