import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  Button,
} from "@mui/material";
import { Link } from "react-router-dom";
import { auth, db } from "../../FirebaseFireStore/Firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import Customdatagriddesktop from "../../Components/Customdatagriddesktop";
import VisibilityIcon from "@mui/icons-material/Visibility";
import HotelIcon from "@mui/icons-material/Hotel";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import StatusChip from "../../Components/StatusChip";

import { useForm } from "react-hook-form";
import Textfieldinput from "../../Components/Forms/Textfieldinput";
import Selectinput from "../../Components/Forms/Selectinput";

const statuses = ["New", "Pending", "Confirmed", "Checked Out", "Cancelled"];

const stats = [
  { label: "Active Bookings", value: "85%", change: "+5%", icon: <HotelIcon sx={{ fontSize: 32, color: "#fff" }} /> },
  { label: "Room Occupancy", value: "65%", change: "-10%", icon: <MeetingRoomIcon sx={{ fontSize: 32, color: "#fff" }} /> },
  { label: "Guest Satisfaction", value: "6.0/10", change: "-4%", icon: <EmojiEmotionsIcon sx={{ fontSize: 32, color: "#fff" }} /> },
  { label: "Revenue Growth", value: "12%", change: "+8%", icon: <TrendingUpIcon sx={{ fontSize: 32, color: "#fff" }} /> },
];

const formatDate = (val) => {
  if (!val) return "N/A";
  try {
    const date = val.toDate ? val.toDate() : new Date(val);
    return isNaN(date.getTime()) ? "N/A" : date.toISOString().split("T")[0];
  } catch {
    return "N/A";
  }
};

const Bookings = () => {
  const [adminName, setAdminName] = useState("Admin");
  const [bookings, setBookings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  // ===========================================
  // React Hook Form Setup
  // ===========================================
  const { control, watch } = useForm({
    defaultValues: {
      search: "",
      status: "",
      category: "",
    },
  });

  const searchQuery = watch("search");
  const filterStatus = watch("status");
  const filterCategory = watch("category");

  // Fetch Admin Name
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          setAdminName(docSnap.exists() ? docSnap.data().userName || docSnap.data().fullName || "Admin" : "Admin");
        } catch {
          setAdminName("Admin");
        }
      } else setAdminName("Admin");
    });
    return () => unsubscribe();
  }, []);

  // Fetch all booking-related data
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const [roomsSnap, usersSnap, categoriesSnap, bookingSnap, paymentSnap] = await Promise.all([
          getDocs(collection(db, "rooms")),
          getDocs(collection(db, "users")),
          getDocs(collection(db, "roomCategory")),
          getDocs(collection(db, "bookings")),
          getDocs(collection(db, "payment")),
        ]);

        const categoryMap = {};
        categoriesSnap.docs.forEach(doc => {
          categoryMap[doc.id] = doc.data().categoryName || "Unknown";
        });
        setCategories(Object.values(categoryMap));

        const roomMap = {};
        roomsSnap.docs.forEach((doc) => {
          const data = doc.data();
          roomMap[doc.id] = {
            roomNo: data.roomNo || "N/A",
            categoryName: categoryMap[data.categoryId] || "Unknown Category",
          };
        });

        const userMap = {};
        usersSnap.docs.forEach((doc) => {
          const data = doc.data();
          userMap[doc.id] = {
            userName: data.userName || data.fullName || "Unknown User",
            userEmail: data.userEmail || data.email || "N/A",
          };
        });

        const paymentMap = {};
        paymentSnap.docs.forEach((doc) => {
          const data = doc.data();
          if (data.bookingId)
            paymentMap[data.bookingId] = {
              status: data.status?.charAt(0).toUpperCase() + data.status?.slice(1).toLowerCase() || "Pending",
            };
        });

        const mergedBookings = bookingSnap.docs.map((docSnap) => {
          const data = docSnap.data();
          const userData = userMap[data.userId] || {};
          const paymentData = paymentMap[docSnap.id] || paymentMap[data.bookingId] || {};

          let roomNumbers = [];
          let categoriesList = [];

          if (Array.isArray(data.roomId)) {
            data.roomId.forEach((rid) => {
              if (roomMap[rid]) {
                roomNumbers.push(roomMap[rid].roomNo);
                categoriesList.push(roomMap[rid].categoryName);
              }
            });
          } else if (data.roomId && roomMap[data.roomId]) {
            roomNumbers.push(roomMap[data.roomId].roomNo);
            categoriesList.push(roomMap[data.roomId].categoryName);
          }

          return {
            id: docSnap.id,
            bookingId: data.bookingId || docSnap.id.substring(0, 8),
            userName: userData.userName,
            email: userData.userEmail,
            category: categoriesList.join(", ") || "Unknown Category",
            roomNumber: roomNumbers.join(", ") || "N/A",
            roomCount: Array.isArray(data.roomId) ? data.roomId.length : data.roomId ? 1 : 0,
            checkIn: formatDate(data.checkInDate || data.checkIn),
            checkOut: formatDate(data.checkOutDate || data.checkOut),
            bookingStatus: data.status?.charAt(0).toUpperCase() + data.status?.slice(1) || "New",
            paymentStatus: paymentData.status || "Pending",
          };
        });

        setBookings(mergedBookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Table Columns
  const columns = [
    { field: "userName", headerName: "Guest Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    {
      field: "roomCount",
      headerName: "No. of Rooms",
      flex: 0.7,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }}>
          <Typography>{params.value}</Typography>
        </Box>
      ),
    },
    { field: "checkIn", headerName: "Check In", flex: 0.8 },
    { field: "checkOut", headerName: "Check Out", flex: 0.8 },
    {
      field: "bookingStatus",
      headerName: "Booking Status",
      flex: 1,
      renderCell: (params) => <StatusChip label={params.value} />,
    },
    {
      field: "paymentStatus",
      headerName: "Payment Status",
      flex: 1,
      renderCell: (params) => <StatusChip label={params.value} />,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.6,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
          <Button
            component={Link}
            to={`/bookings/${params.row.id}`}
            size="small"
            color="info"
            variant="outlined"
            sx={{ minWidth: "auto", p: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            <VisibilityIcon fontSize="small" />
          </Button>
        </Box>
      ),
    },
  ];

  // Apply Filters
  const filteredRows = useMemo(() => {
    return bookings.filter((row) => {
      const matchesSearch =
        row.bookingId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.roomNumber?.toString().includes(searchQuery.toLowerCase());

      const matchesStatus = filterStatus ? row.bookingStatus === filterStatus : true;
      const matchesCategory = filterCategory ? row.category === filterCategory : true;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [bookings, searchQuery, filterStatus, filterCategory]);

  return (
    <Box sx={{ px: 2, py: 3, flexGrow: 1 }}>
      {/* Stats Cards */}
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
                sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 3 }}
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
                  <Typography variant="h5" sx={{ fontWeight: "bold", lineHeight: 1.2 }}>
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

      {/* Filters + Table */}
      <Box sx={{ boxShadow: 3, borderRadius: 3, p: 3 }}>
        {/* FILTERS */}
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
          {/* Search Input */}
          <Textfieldinput
            name="search"
            control={control}
            label="Search"
            placeholder="Search by Name, Room No or Email"
            fullWidth={false}
            sx={{ minWidth: { xs: "100%", sm: 220 } }}
          />

          {/* Status Filter */}
          <Selectinput
            name="status"
            control={control}
            label="Status"
            options={[
              { label: "All", value: "" },
              ...statuses.map((s) => ({ label: s, value: s })),
            ]}
            sx={{ minWidth: { xs: "100%", sm: 180 } }}
          />

          {/* Category Filter */}
          <Selectinput
            name="category"
            control={control}
            label="Category"
            options={[
              { label: "All", value: "" },
              ...categories.map((c) => ({ label: c, value: c })),
            ]}
            sx={{ minWidth: { xs: "100%", sm: 180 } }}
          />
        </Box>

        {/* TABLE */}
        <Box sx={{ position: "relative" }}>
          <Customdatagriddesktop
            rows={filteredRows}
            columns={columns}
            pageSizeOptions={[5, 10, 20]}
            defaultPageSize={10}
            getRowId={(row) => row.id}
            loading={loading}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Bookings;
