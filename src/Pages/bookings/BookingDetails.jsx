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
  Modal,
  IconButton,
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

const BookingDetails = () => {
  const { id } = useParams();
  const theme = useTheme();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState("");

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
        if (userSnap.exists()) userData = userSnap.data();
      }

      // Fetch payment info
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

      if (!paymentSnap.empty) {
        paymentSnap.docs.forEach((payDoc) => {
          const payData = payDoc.data();
          totalAmount += Number(
            (payData.amount || "0").toString().replace(/[^0-9.]/g, "")
          );
        });

        const latestPaymentDoc = paymentSnap.docs[paymentSnap.docs.length - 1];
        const latestPaymentData = latestPaymentDoc.data();
        paymentId = latestPaymentDoc.id;
        paymentMethod = latestPaymentData.paymentType || paymentMethod;
        paymentStatus = latestPaymentData.status
          ? latestPaymentData.status.charAt(0).toUpperCase() +
            latestPaymentData.status.slice(1)
          : "Pending";
        paymentDate = latestPaymentData.paymentDate
          ? formatDateTime(latestPaymentData.paymentDate)
          : "--";
      }

      // Fetch rooms, categories, hotels
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
        paymentReceipt: bookingData.paymentReceipt || "",
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

  const KeyValueBlock = ({ label, value }) => (
    <Box sx={{ flexBasis: { xs: "100%", sm: "30%" } }}>
      <Typography
        variant="body2"
        sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}
      >
        {label}
      </Typography>
      <Typography variant="body1" sx={{ mt: 0.5, fontWeight: "bold" }}>
        {value || "--"}
      </Typography>
    </Box>
  );

  const SectionHeader = ({ title }) => (
    <Box
      sx={{
        backgroundColor: "#F0F9F8",
        px: 2,
        py: 1,
        borderRadius: 1,
        mb: 2,
        mt: 3,
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
      >
        {title}
      </Typography>
    </Box>
  );

  const handleImageClick = (src) => {
    setModalImage(src);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalImage("");
  };

  if (loading)
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress size={40} />
        <Typography sx={{ mt: 2 }}>Loading booking details...</Typography>
      </Box>
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

          {/* Accept/Reject Buttons */}
          <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="success"
              disabled={updatingStatus || booking.bookingStatus === "Confirmed"}
              onClick={() => handleStatusUpdate("Confirmed")}
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
              onClick={() => handleStatusUpdate("Rejected")}
            >
              Reject
            </Button>
          </Box>

          {/* Guest Info */}
          <SectionHeader title="Guest Information" />
          <Stack spacing={5}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              <KeyValueBlock label="Guest Name" value={booking.userName} />
              <KeyValueBlock label="Gender" value={booking.gender} />
              <KeyValueBlock label="Date of Birth" value={booking.dob} />
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              <KeyValueBlock label="Phone No" value={booking.number} />
              <KeyValueBlock label="Email" value={booking.email} />
              <KeyValueBlock label="Address" value={booking.address} />
            </Box>
          </Stack>

          {/* Rooms Info */}
          <SectionHeader title="Rooms Information" />
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
        width: 250,       // fixed width
        height: 150,      // fixed height
        p: 2,
        borderRadius: 2,
        boxShadow: 3,     // uses theme shadow
        backgroundColor: "transparent", // remove bg
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
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
          <SectionHeader title="Reservation & Payment Details" />
          <Stack spacing={3}>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 5,
                alignItems: "center",
              }}
            >
              <KeyValueBlock label="Guests" value={booking.persons} />
              <KeyValueBlock label="Check-In" value={booking.checkIn} />
              <KeyValueBlock label="Check-Out" value={booking.checkOut} />
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              <KeyValueBlock label="Total Amount" value={booking.totalAmount} />
              <KeyValueBlock
                label="Payment Method"
                value={booking.paymentMethod}
              />
              <KeyValueBlock label="Payment Date" value={booking.paymentDate} />
              {booking.paymentReceipt && (
                <Box sx={{ flexBasis: { xs: "100%", sm: "30%" } }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontWeight: 600,
                    }}
                  >
                    Receipt
                  </Typography>
                  <Box
                    component="img"
                    src={booking.paymentReceipt}
                    alt="Payment Receipt"
                    sx={{
                      width: 200,
                      height: 150,
                      objectFit: "contain",
                      border: "none",
                      cursor: "pointer",
                      mt: 0.5,
                    }}
                    onClick={() => handleImageClick(booking.paymentReceipt)}
                  />
                </Box>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Modal for Image */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            position: "relative",
            maxWidth: "90vw",
            maxHeight: "90vh",
            backgroundColor: "white",
            borderRadius: 2,
            p: 1,
            boxShadow: 24,
          }}
        >
          <IconButton
            onClick={handleCloseModal}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "grey.500",
            }}
          >
            <Close />
          </IconButton>
          <Box
            component="img"
            src={modalImage}
            alt="Payment Receipt"
            sx={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default BookingDetails;
