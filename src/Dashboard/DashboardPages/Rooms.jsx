// src/Dashboard/DashboardPages/Rooms.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  useTheme,
  MenuItem,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Customdatagriddesktop from "../../Components/Customdatagriddesktop";
import ConfirmDialog from "../../Components/ConfirmDialog";
import { Link, useNavigate } from "react-router-dom";

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

export const roomsData = Array.from({ length: 25 }).map((_, i) => ({
  id: i + 1,
  room_id: `RM${1000 + i}`,
  hotelName: hotelNames[i % hotelNames.length],
  category: roomCategories[i % roomCategories.length],
  roomNumber: 200 + i,
  price: 100 + i * 20,
  status: roomStatuses[i % roomStatuses.length],
  propertyType: propertyTypes[i % propertyTypes.length],
}));

const Rooms = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterProperty, setFilterProperty] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Confirmation dialog states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmDescription, setConfirmDescription] = useState("");
  const [confirmAction, setConfirmAction] = useState(() => () => {});

  useEffect(() => {
    localStorage.setItem("roomsData", JSON.stringify(roomsData));
    setRows(roomsData);
  }, []);

  const getChipStyle = (color) => ({
    backgroundColor: color + "33",
    color,
    fontWeight: 600,
  });

  const commonCellStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  };

  const handleDeleteClick = (room) => {
    setConfirmDescription(`Are you sure you want to remove room number ${room.roomNumber}?`);
    setConfirmAction(() => () => {
      const updatedRows = rows.filter((r) => r.id !== room.id);
      setRows(updatedRows);
      localStorage.setItem("roomsData", JSON.stringify(updatedRows));
    });
    setConfirmOpen(true);
  };

  const columns = [
    {
      field: "roomNumber",
      headerName: "Room No",
      flex: 0.8,
      renderCell: (params) => (
        <Box sx={commonCellStyle}>
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "hotelName",
      headerName: "Hotel Name",
      flex: 1.2,
      renderCell: (params) => (
        <Box sx={commonCellStyle}>
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "category",
      headerName: "Category",
      flex: 1,
      renderCell: (params) => (
        <Box sx={commonCellStyle}>
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "propertyType",
      headerName: "Type",
      flex: 1,
      renderCell: (params) => (
        <Box sx={commonCellStyle}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "price",
      headerName: "Price",
      flex: 0.8,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Box sx={commonCellStyle}>
          <Typography variant="body2">PKR {params.row?.price ?? 0}</Typography>
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        const value = params.value;
        const colors = {
          Available: theme.palette.success.main,
          Booked: theme.palette.error.main,
          Maintenance: theme.palette.warning.main,
          Cleaning: theme.palette.info.main,
        };
        return (
          <Box sx={commonCellStyle}>
            <Chip
              label={value}
              size="small"
              sx={getChipStyle(colors[value] || theme.palette.grey[500])}
            />
          </Box>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const row = params.row;

        return (
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <Button
              component={Link}
              to={`/rooms/${row.room_id}`} // friendly URL
              size="small"
              color="primary"
              variant="outlined"
              sx={{ minWidth: "auto", p: 0.5 }}
            >
              <EditIcon fontSize="small" />
            </Button>
            <Button
              size="small"
              color="error"
              variant="outlined"
              onClick={() => handleDeleteClick(row)}
              sx={{ minWidth: "auto", p: 0.5 }}
            >
              <DeleteIcon fontSize="small" />
            </Button>
          </Box>
        );
      },
    },
  ];

  const handleAddRoom = () => navigate("/rooms/add");
  const handleRowClick = (row) => console.log("Navigate to Room Details:", row.room_id);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch =
        row.roomNumber.toString().includes(searchQuery) ||
        row.hotelName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory ? row.category === filterCategory : true;
      const matchesProperty = filterProperty ? row.propertyType === filterProperty : true;
      const matchesStatus = filterStatus ? row.status === filterStatus : true;
      return matchesSearch && matchesCategory && matchesProperty && matchesStatus;
    });
  }, [rows, searchQuery, filterCategory, filterProperty, filterStatus]);

  return (
    <Box sx={{ flexGrow: 1, mb: 2 }}>
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          {/* Toolbar */}
          <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
            <Grid item>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                color="primary"
                onClick={handleAddRoom}
                sx={{ fontWeight: "bold", borderRadius: 2, textTransform: "none", boxShadow: 2, minHeight: 36 }}
              >
                Add Room
              </Button>
            </Grid>

            {/* Filters */}
            <Grid item>
              <Grid container spacing={1} alignItems="center">
                <Grid item>
                  <TextField
                    size="small"
                    placeholder="Search by Room No or Hotel Name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ minWidth: 220, "& .MuiInputBase-input": { padding: "6px 10px", textAlign: "center" } }}
                  />
                </Grid>

                <Grid item>
                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel sx={{ color: filterCategory ? "inherit" : theme.palette.text.disabled }}>Category</InputLabel>
                    <Select
                      value={filterCategory}
                      label="Category"
                      onChange={(e) => setFilterCategory(e.target.value)}
                      sx={{ "& .MuiSelect-select": { color: filterCategory ? "inherit" : theme.palette.text.disabled, textAlign: "center" } }}
                    >
                      <MenuItem value="">All</MenuItem>
                      {roomCategories.map((c) => (
                        <MenuItem key={c} value={c}>
                          {c}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item>
                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel sx={{ color: filterProperty ? "inherit" : theme.palette.text.disabled }}>Type</InputLabel>
                    <Select
                      value={filterProperty}
                      label="Property Type"
                      onChange={(e) => setFilterProperty(e.target.value)}
                      sx={{ "& .MuiSelect-select": { color: filterProperty ? "inherit" : theme.palette.text.disabled, textAlign: "center" } }}
                    >
                      <MenuItem value="">All</MenuItem>
                      {propertyTypes.map((p) => (
                        <MenuItem key={p} value={p}>
                          {p}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item>
                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel sx={{ color: filterStatus ? "inherit" : theme.palette.text.disabled }}>Status</InputLabel>
                    <Select
                      value={filterStatus}
                      label="Status"
                      onChange={(e) => setFilterStatus(e.target.value)}
                      sx={{ "& .MuiSelect-select": { color: filterStatus ? "inherit" : theme.palette.text.disabled, textAlign: "center" } }}
                    >
                      <MenuItem value="">All</MenuItem>
                      {roomStatuses.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* Data Table */}
          <Customdatagriddesktop
            rows={filteredRows}
            columns={columns}
            onRowClick={handleRowClick}
            pageSizeOptions={[5, 10, 20]}
            defaultPageSize={10}
          />
        </CardContent>
      </Card>

      {/* Generic Confirmation Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={setConfirmOpen}
        title="Confirm Action"
        description={confirmDescription}
        onConfirm={confirmAction}
        confirmText="Yes"
        cancelText="No"
      />
    </Box>
  );
};

export default Rooms;
