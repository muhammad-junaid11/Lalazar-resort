import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../FirebaseFireStore/Firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Customdatagriddesktop from "../../Components/Customdatagriddesktop";

import HotelIcon from "@mui/icons-material/Hotel";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const statuses = ["New", "Pending", "Confirmed", "Checked Out", "Cancelled"];
const paymentStatuses = ["Paid", "Pending", "Refunded", "Failed", "Waived"];
const categories = ["Deluxe Room", "Executive Room", "Family Room", "Luxury Room"];

// ✅ Sample booking data
export const bookings = Array.from({ length: 24 }).map((_, i) => {
  const status = statuses[i % statuses.length];
  const category = categories[i % categories.length];
  const paymentStatus = paymentStatuses[i % paymentStatuses.length];
  const bookingId = `12${20 + i}`;
  return {
    id: bookingId,
    guestId: `GUEST${1000 + i}`,
    guest: `Guest ${i + 1}`,
    email: `guest${i + 1}@gmail.com`,
    secondaryEmail: `admin.alt${i + 1}@gmail.com`, // 🆕 Secondary Email
    contact: `+92300${100000 + i}`,
    gender: i % 2 === 0 ? "Male" : "Female",
    dob: `199${i % 10}-0${(i % 9) + 1}-15`,
    address: `House No. ${i + 10}, Street ${i + 3}, Gulberg III, Lahore`,
    idProof: `IDP${i + 5000}`,
    type: category, // 🆕 using category
    checkIn: "Jan 21, 2025",
    checkOut: "Jan 28, 2025",
    status,
    roomNumber: `R${100 + (i % 8)}`,
    dateOfBooking: `Dec 0${(i % 5) + 1}, 2024`,
    numGuests: (i % 3) + 1,
    paymentStatus,
    amountPaid: `$${(i + 1) * 100}`,
    paymentMethod: i % 2 === 0 ? "Credit Card" : "Cash",
    transactionId: `TXN${90000 + i}`,
    dateOfPayment: `Dec 2${(i % 5)}, 2024`,
    receiptImage: "",
    adminId: `ADM${10 + (i % 3)}`,
  };
});


const stats = [
  {
    label: "Active Bookings",
    value: "85%",
    change: "+5%",
    icon: <HotelIcon sx={{ fontSize: 32, color: "#fff" }} />,
  },
  {
    label: "Room Occupancy",
    value: "65%",
    change: "-10%",
    icon: <MeetingRoomIcon sx={{ fontSize: 32, color: "#fff" }} />,
  },
  {
    label: "Guest Satisfaction",
    value: "6.0/10",
    change: "-4%",
    icon: <EmojiEmotionsIcon sx={{ fontSize: 32, color: "#fff" }} />,
  },
  {
    label: "Revenue Growth",
    value: "12%",
    change: "+8%",
    icon: <TrendingUpIcon sx={{ fontSize: 32, color: "#fff" }} />,
  },
];

const Bookings = () => {
  const [adminName, setAdminName] = useState("Admin");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [page, setPage] = useState(1);
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          setAdminName(
            docSnap.exists() ? docSnap.data().fullName || "Admin" : "Admin"
          );
        } catch {
          setAdminName("Admin");
        }
      } else setAdminName("Admin");
    });
    return () => unsubscribe();
  }, []);

  const handleRowClick = (row) => navigate(`/bookings/${row.id}`);

  const getChipStyle = (color) => ({
    backgroundColor: color + "33",
    color: color,
    fontWeight: 600,
  });

  const columns = [
    { field: "id", headerName: "Booking ID", flex: 0.8 },
    { field: "guest", headerName: "Guest Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    // { field: "contact", headerName: "Contact", flex: 1 },
    { field: "type", headerName: "Room Category", flex: 0.8 },
    { field: "checkIn", headerName: "Check In", flex: 0.8 },
    { field: "checkOut", headerName: "Check Out", flex: 0.8 },
    {
      field: "status",
      headerName: "Booking Status",
      flex: 1,
      renderCell: (params) => {
        const value = params.value;
        const colors = {
          New: theme.palette.primary.main,
          Pending: theme.palette.warning.main,
          Confirmed: theme.palette.success.main,
          "Checked Out": theme.palette.info.main,
          Cancelled: theme.palette.error.main,
        };
        return (
          <Chip
            label={value}
            size="small"
            sx={getChipStyle(colors[value] || theme.palette.grey[500])}
          />
        );
      },
    },
    {
      field: "paymentStatus",
      headerName: "Payment Status",
      flex: 1,
      renderCell: (params) => {
        const value = params.value;
        const colors = {
          Paid: theme.palette.success.main,
          Pending: theme.palette.warning.main,
          Refunded: theme.palette.info.main,
          Failed: theme.palette.error.main,
          Waived: theme.palette.grey[600],
        };
        return (
          <Chip
            label={value}
            size="small"
            sx={getChipStyle(colors[value] || theme.palette.grey[500])}
          />
        );
      },
    },
  ];

  const filteredRows = useMemo(() => {
    return bookings.filter((row) => {
      const matchesSearch =
        row.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.guest.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.contact.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus ? row.status === filterStatus : true;
      const matchesCategory = filterCategory ? row.type === filterCategory : true;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [searchQuery, filterStatus, filterCategory]);

  return (
    <Box sx={{ px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 3 }, flexGrow: 1 }}>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((s) => (
          <Grid item xs={12} sm={6} md={3} key={s.label}>
            <Card
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                borderRadius: 3,
                boxShadow: 3,
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 3,
                }}
              >
                <Box
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    borderRadius: "50%",
                    width: 64,
                    height: 64,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {s.icon}
                </Box>

                <Box sx={{ textAlign: "right", flex: 1, ml: 2 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {s.label}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: "bold", lineHeight: 1.2 }}
                  >
                    {s.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: s.change.startsWith("+")
                        ? theme.palette.success.light
                        : theme.palette.error.light,
                      fontWeight: 500,
                    }}
                  >
                    {s.change}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ borderRadius: 3, boxShadow: 3, p: { xs: 1, sm: 2, md: 3 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "flex-end",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
            mb: 3,
            flexWrap: "wrap",
          }}
        >
          <TextField
            size="small"
            label="Search"
            placeholder="Search by ID, Name, Email or Contact"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            sx={{ minWidth: { xs: "100%", sm: 220 } }}
          />

          <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 180 } }}>
            <InputLabel>Booking Status</InputLabel>
            <Select
              value={filterStatus}
              label="Booking Status"
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="">All</MenuItem>
              {statuses.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 180 } }}>
            <InputLabel>Room Category</InputLabel>
            <Select
              value={filterCategory}
              label="Room Category"
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="">All</MenuItem>
              {categories.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Customdatagriddesktop
          rows={filteredRows}
          columns={columns}
          onRowClick={handleRowClick}
          pageSizeOptions={[5, 10, 20]}
          defaultPageSize={10}
        />
      </Box>
    </Box>
  );
};

export default Bookings;
