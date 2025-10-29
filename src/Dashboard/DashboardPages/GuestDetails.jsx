import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Stack,
  useTheme,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { bookings } from "./Bookings";

const GuestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const booking = bookings.find((b) => b.id === id);

  const getChipColor = (status, isPayment = false) => {
    const bookingColors = {
      New: theme.palette.primary.main,
      Pending: theme.palette.warning.main,
      Confirmed: theme.palette.success.main,
      "Checked Out": theme.palette.info.main,
      Cancelled: theme.palette.error.main,
      Failed: theme.palette.error.main,
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
        label={label}
        size="small"
        sx={{
          backgroundColor: color + "33", // light background
          color: color, // text color same as base color
          fontWeight: 600,
          ml: 1,
        }}
      />
    );
  };

  const KeyValueBlock = ({ label, value }) => (
    <Box sx={{ flex: 1, minWidth: "200px" }}>
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

  const Row = ({ children }) => (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 8,
      }}
    >
      {children}
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

  if (!booking) {
    return (
      <Box sx={{ textAlign: "center", mt: 10, p: 3 }}>
        <Typography variant="h6" color="text.secondary">
          Booking not found for ID: {id}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, sm: 4 }, py: { xs: 3, sm: 5 }, minHeight: "100vh" }}>
      <Card sx={{ borderRadius: 3, boxShadow: 4, mb: 4 }}>
        <CardContent sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
          {/* Header Section */}
          <Box
            sx={{
              mb: 3,
              display: "flex",
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: theme.palette.primary.main,
              }}
            >
              Booking Details: #{booking.id}
            </Typography>

            {/* Status + Buttons */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={1.5}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              {/* Status Chips */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                alignItems={{ xs: "flex-start", sm: "center" }}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, mr: 1, display: "inline" }}
                  >
                    Booking Status:
                  </Typography>
                  <StatusChip label={booking.status} />
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, mr: 1, display: "inline" }}
                  >
                    Payment Status:
                  </Typography>
                  <StatusChip label={booking.paymentStatus} isPayment />
                </Box>
              </Stack>

              {/* Accept / Reject Buttons */}
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  mt: { xs: 1.5, sm: 0 },
                  width: { xs: "100%", sm: "auto" },
                  justifyContent: { xs: "flex-start", sm: "flex-start" },
                }}
              >
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={() => alert("Booking Accepted")}
                >
                  Accept
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => alert("Booking Rejected")}
                >
                  Reject
                </Button>
              </Stack>
            </Stack>
          </Box>


          {/* Guest Info Section */}
          <SectionHeader title="Guest Information" />
          <Stack spacing={5}>
            <Row>
              <KeyValueBlock label="Guest Name" value={booking.guest} />
              <KeyValueBlock label="Gender" value={booking.gender} />
              <KeyValueBlock label="Date of Birth" value={booking.dob} />
              <KeyValueBlock label="Phone No" value={booking.contact} />
            </Row>
            <Row>
              <KeyValueBlock label="Guest ID" value={booking.guestId} />
              <KeyValueBlock label="ID Proof No." value={booking.idProof} />
              <KeyValueBlock label="Email" value={booking.email || "N/A"} />
              <KeyValueBlock label="Address" value={booking.address} />
            </Row>
          </Stack>


          {/* Reservation Section */}
          <SectionHeader title="Reservation & Payment Details" />
          <Stack spacing={5}>
            <Row>
              <KeyValueBlock label="Transaction ID" value={booking.transactionId} />
              <KeyValueBlock label="Room Type" value={booking.type} />
              <KeyValueBlock
                label="Room Number"
                value={booking.roomNumber || "Unassigned"}
              />
              <KeyValueBlock
                label="Guests"
                value={`${booking.numGuests} person(s)`}
              />
            </Row>

            <Row>
              <KeyValueBlock label="Check-In" value={booking.checkIn} />
              <KeyValueBlock label="Check-Out" value={booking.checkOut} />
              <KeyValueBlock label="Amount Paid" value={booking.amountPaid} />
              <KeyValueBlock
                label="Payment Method"
                value={booking.paymentMethod}
              />
            </Row>

            <Row>
              <KeyValueBlock label="Booking Date" value={booking.dateOfBooking} />
              <KeyValueBlock label="Payment Date" value={booking.dateOfPayment} />
              <Box sx={{ flex: 1 }} />
              <Box sx={{ flex: 1 }} />
            </Row>

            {booking.receiptImage && (
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  onClick={() => window.open(booking.receiptImage, "_blank")}
                >
                  View Payment Receipt
                </Button>
              </Box>
            )}
          </Stack>


          {/* Administrative Section */}
          <SectionHeader title="Administrative Record" />
          <Row>
            <KeyValueBlock
              label="Processed By"
              value={booking.adminId || "N/A"}
            />
            <KeyValueBlock
              label="Date"
              value={booking.dateOfBooking}
            />
            <KeyValueBlock
              label="Email"
              value={booking.secondaryEmail || "N/A"}
            />
            <Box sx={{ flex: 1 }} />
          </Row>
        </CardContent>
      </Card>
    </Box>
  );
};

export default GuestDetails;
