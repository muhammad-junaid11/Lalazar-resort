import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
  CircularProgress,
  useTheme,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../FirebaseFireStore/Firebase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmDialog from "../../Components/ConfirmDialog";
import KeyValueBlock from "../../Components/KeyValueBlock";
import HeaderSection from "../../Components/HeaderSection";
import LoadingOverlay from "../../Components/LoadingOverlay";

const BookingDetails = () => {
  const { id } = useParams();
  const theme = useTheme();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // ConfirmDialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState(null);

  // Receipt Dialog state
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);

  const parseTimestamp = (value) => {
    if (!value) return null;
    if (value.seconds !== undefined && value.nanoseconds !== undefined) {
      return new Date(value.seconds * 1000);
    } else if (value instanceof Date) {
      return value;
    } else if (typeof value === "string") {
      return new Date(value);
    } else {
      return null;
    }
  };

  const formatDateTime = (value) => {
    const date = parseTimestamp(value);
    if (!date) return "--";
    return date.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatDateOnly = (value) => {
    const date = parseTimestamp(value);
    if (!date) return "--";
    return date.toISOString().split("T")[0];
  };

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const bookingRef = doc(db, "bookings", id);
      const bookingSnap = await getDoc(bookingRef);
      if (!bookingSnap.exists()) {
        setBooking(null);
        return;
      }
      const bookingData = bookingSnap.data();
      const bookingDocId = bookingSnap.id;

      // Fetch user info
      let userData = {};
      if (bookingData.userId) {
        const userSnap = await getDoc(doc(db, "users", bookingData.userId));
        if (userSnap.exists) userData = userSnap.data();
      }

      // 🚨 UPDATED PAYMENT INFO FETCHING 🚨
      const paymentRef = collection(db, "payment");
      const paymentQuery = query(
        paymentRef,
        where("bookingId", "==", bookingDocId)
      );
      const paymentSnap = await getDocs(paymentQuery);

      let totalAmount = 0;
      let paymentDate = "--";
      let paymentMethod = bookingData.paymentMethod || "--";
      let paymentStatus = "Pending";
      let paymentId = "--";
      let paymentReceiptUrl = ""; // Will capture the receiptPath if found

      if (!paymentSnap.empty) {
        let latestPaymentTimestamp = 0;
        let latestPaymentData = null;

        paymentSnap.docs.forEach((payDoc) => {
          const payData = payDoc.data();

          // 1. Calculate total amount
          totalAmount += Number(
            (payData.amount || "0").toString().replace(/[^0-9.]/g, "")
          );

          // 2. Capture the receipt path (prioritize existence over time)
          if (payData.receiptPath) {
            paymentReceiptUrl = payData.receiptPath;
          }

          // 3. Track the LATEST payment for status and date display
          const paymentTimestamp = payData.paymentDate?.seconds || 0;
          if (paymentTimestamp >= latestPaymentTimestamp) {
            latestPaymentTimestamp = paymentTimestamp;
            latestPaymentData = payData;
            paymentId = payDoc.id;
          }
        });

        // Use the data from the latest payment for status and date
        if (latestPaymentData) {
          paymentMethod = latestPaymentData.paymentType || paymentMethod;
          paymentStatus = latestPaymentData.status
            ? latestPaymentData.status.charAt(0).toUpperCase() +
              latestPaymentData.status.slice(1)
            : "Pending";
          paymentDate = latestPaymentData.paymentDate
            ? formatDateTime(latestPaymentData.paymentDate)
            : "--";
        }
      }
      // 🚨 END UPDATED PAYMENT INFO FETCHING 🚨

      // Rooms info
      let roomsDetails = [];
      if (Array.isArray(bookingData.roomId) && bookingData.roomId.length > 0) {
        const roomPromises = bookingData.roomId.map(async (roomId) => {
          const roomSnap = await getDoc(doc(db, "rooms", roomId));
          if (!roomSnap.exists()) return null;
          const roomData = roomSnap.data();

          let categoryName = "--";
          if (roomData.categoryId) {
            const categorySnap = await getDoc(
              doc(db, "roomCategory", roomData.categoryId)
            );
            if (categorySnap.exists)
              categoryName = categorySnap.data().categoryName;
          }

          let hotelName = "--";
          if (roomData.hotelId) {
            const hotelSnap = await getDoc(doc(db, "hotel", roomData.hotelId));
            if (hotelSnap.exists) hotelName = hotelSnap.data().hotelName;
          }

          return {
            roomNo: roomData.roomNo || "N/A",
            category: categoryName,
            hotel: hotelName,
          };
        });

        roomsDetails = (await Promise.all(roomPromises)).filter(Boolean);
      }

      setBooking({
        id: bookingDocId,
        bookingId: bookingDocId,
        bookingStatus:
          bookingData.status?.charAt(0).toUpperCase() +
            bookingData.status?.slice(1) || "New",
        userName: userData.userName || userData.fullName || "N/A",
        gender: userData.gender || "N/A",
        dob: formatDateOnly(userData.dob),
        number: userData.number || "--",
        email: userData.email || userData.userEmail || "--",
        address: userData.address || "--",
        idProof: userData.idProof || "--",
        userId: bookingData.userId || "--",
        roomsDetails,
        paymentId,
        totalAmount,
        paymentMethod,
        paymentStatus,
        paymentDate,
        paymentReceipt: paymentReceiptUrl,
        persons: bookingData.persons || "--",
        checkIn: formatDateTime(bookingData.checkInDate),
        checkOut: formatDateTime(bookingData.checkOutDate),
        adminId: bookingData.adminId || "--",
        secondaryEmail: bookingData.secondaryEmail || "--",
      });
    } catch (error) {
      console.error("Error fetching booking details:", error);
      toast.error("Failed to fetch booking details");
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      await updateDoc(doc(db, "bookings", id), { status: newStatus });

      if (newStatus === "Rejected") toast.error("Booking rejected!");
      else if (newStatus === "Confirmed") toast.success("Booking accepted!");

      setBooking((prev) =>
        prev ? { ...prev, bookingStatus: newStatus } : prev
      );
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getChipColor = (status, isPayment = false) => {
    const bookingColors = {
      New: theme.palette.primary.main,
      Pending: theme.palette.warning.main,
      Confirmed: theme.palette.success.main,
      "Checked Out": theme.palette.info.main,
      Cancelled: theme.palette.error.main,
      Rejected: theme.palette.error.main,
    };
    const paymentColors = {
      Paid: theme.palette.success.main,
      Pending: theme.palette.warning.main,
      Refunded: theme.palette.info.main,
      Failed: theme.palette.error.main,
      Waived: theme.palette.grey[600],
    };
    return isPayment
      ? paymentColors[status] || theme.palette.grey[500]
      : bookingColors[status] || theme.palette.grey[500];
  };

  const StatusChip = ({ label, isPayment = false }) => {
    const color = getChipColor(label, isPayment);
    return (
      <Chip
        label={label || "--"}
        size="small"
        sx={{ backgroundColor: color + "33", color, fontWeight: 600, ml: 1 }}
      />
    );
  };




  if (loading)
  return (
    <LoadingOverlay
      loading={loading}
      message="Loading booking details..."
      fullScreen
    />
  );

  if (!booking)
    return (
      <Typography
        variant="h6"
        sx={{ textAlign: "center", mt: 5, color: "text.secondary" }}
      >
        Booking not found
      </Typography>
    );

  return (
    <Box sx={{ flexGrow: 1, mt: 0, mb: 0, py: 1 }}>
      <ToastContainer position="top-right" autoClose={3000} />

      <Card sx={{ borderRadius: 3, boxShadow: 4, mb: 4 }}>
        <CardContent sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
          {/* Booking Status */}
          <Box
            sx={{
              mb: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
            >
              Booking Detail:
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={1.5}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
                  Booking Status:
                </Typography>
                <StatusChip label={booking.bookingStatus} />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
                  Payment Status:
                </Typography>
                <StatusChip label={booking.paymentStatus} isPayment />
              </Box>
            </Stack>
          </Box>

          {/* Accept / Reject Buttons */}
          <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              disabled={updatingStatus || booking.bookingStatus === "Confirmed"}
              onClick={() => {
                setDialogAction("Confirmed");
                setDialogOpen(true);
              }}
            >
              Accept
            </Button>
            <Button
              variant="contained"
              color="error"
              disabled={
                updatingStatus ||
                booking.bookingStatus === "Rejected" ||
                booking.bookingStatus === "Confirmed"
              }
              onClick={() => {
                setDialogAction("Rejected");
                setDialogOpen(true);
              }}
            >
              Reject
            </Button>
          </Box>

          <HeaderSection title="Guest Information" />
          <Grid container sx={{ px: 0.5 }} spacing={2}>
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <KeyValueBlock label="Guest Name" value={booking.userName} />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <KeyValueBlock label="Guest Name" value={booking.userName} />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <KeyValueBlock label="Gender" value={booking.gender} />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <KeyValueBlock label="Date of Birth" value={booking.dob} />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <KeyValueBlock label="Phone No" value={booking.number} />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <KeyValueBlock label="Email" value={booking.email} />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <KeyValueBlock label="Address" value={booking.address} />
            </Grid>
          </Grid>

          {/* Rooms Info */}
          <HeaderSection title="Rooms Information" />
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 3,
              justifyContent: "flex-start",
            }}
          >
            {booking.roomsDetails.map((room, idx) => (
              <Card
                key={idx}
                sx={{
                  width: 250,
                  height: 150,
                  p: 2,
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 1,
                  },
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", mb: 1 }}
                >
                  Room {idx + 1}
                </Typography>
                <Typography>Room Number: {room.roomNo}</Typography>
                <Typography>Category: {room.category}</Typography>
                <Typography>Hotel: {room.hotel}</Typography>
              </Card>
            ))}
          </Box>

          {/* Reservation & Payment Details */}
          <HeaderSection title="Reservation & Payment Details" />
          <Grid container sx={{ px: 0.5 }} spacing={2}>
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <KeyValueBlock label="Guests" value={booking.persons} />
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <KeyValueBlock label="Check-In" value={booking.checkIn} />
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <KeyValueBlock label="Check-Out" value={booking.checkOut} />
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <KeyValueBlock label="Total Amount" value={booking.totalAmount} />
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <KeyValueBlock
                label="Payment Method"
                value={booking.paymentMethod}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <KeyValueBlock label="Payment Date" value={booking.paymentDate} />
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <KeyValueBlock label="Payment Receipt">
                {booking.paymentReceipt && (
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{
                      mt: 1,
                      px: 2,
                      maxWidth: 180,
                      minWidth: 100,
                      textTransform: "none",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                    onClick={() => setReceiptDialogOpen(true)}
                  >
                    Show Receipt
                  </Button>
                )}
              </KeyValueBlock>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={
          dialogAction === "Confirmed" ? "Confirm Booking" : "Reject Booking"
        }
        description={
          dialogAction === "Confirmed"
            ? "Are you sure you want to accept this booking?"
            : "Are you sure you want to reject this booking?"
        }
        onConfirm={() => handleStatusUpdate(dialogAction)}
        confirmText={dialogAction === "Confirmed" ? "Accept" : "Reject"}
        cancelText="Cancel"
      />

      {/* Receipt Dialog */}
      <Dialog
        open={receiptDialogOpen}
        onClose={() => setReceiptDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Payment Receipt</DialogTitle>
        <DialogContent sx={{ display: "flex", justifyContent: "center" }}>
          <Box
            component="img"
            src={booking?.paymentReceipt} // Use optional chaining just in case
            alt="Payment Receipt"
            sx={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceiptDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingDetails;
