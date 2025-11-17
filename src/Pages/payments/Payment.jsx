import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../FirebaseFireStore/Firebase";
import Customdatagriddesktop from "../../Components/Customdatagriddesktop";
import ConfirmDialog from "../../Components/ConfirmDialog";
import StatusChip from "../../Components/StatusChip";

// Formats check-in → check-out string
const formatDateRange = (checkIn, checkOut) => {
  const start = checkIn?.toDate
    ? checkIn.toDate().toISOString().split("T")[0]
    : checkIn;
  const end = checkOut?.toDate
    ? checkOut.toDate().toISOString().split("T")[0]
    : checkOut;
  return `${start || "N/A"} → ${end || "N/A"}`;
};

const Payment = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [receiptDialog, setReceiptDialog] = useState({ open: false, url: "" });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    id: null,
    action: null,
  });
  const theme = useTheme();

  useEffect(() => {
    const fetchAdvancePayments = async () => {
      setLoading(true);
      try {
        const [roomsSnap, usersSnap, categoriesSnap, bookingSnap, paymentSnap] =
          await Promise.all([
            getDocs(collection(db, "rooms")),
            getDocs(collection(db, "users")),
            getDocs(collection(db, "roomCategory")),
            getDocs(collection(db, "bookings")),
            getDocs(collection(db, "payment")),
          ]);

        const categoryMap = {};
        categoriesSnap.docs.forEach((doc) => {
          categoryMap[doc.id] = doc.data().categoryName || "Unknown";
        });

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

        const bookingsMap = {};
        bookingSnap.docs.forEach((docSnap) => {
          const data = docSnap.data();
          let roomNumbers = [];
          const roomIds = Array.isArray(data.roomId)
            ? data.roomId
            : data.roomId
            ? [data.roomId]
            : [];
          roomIds.forEach((rid) => {
            if (roomMap[rid]) roomNumbers.push(roomMap[rid].roomNo);
          });
          bookingsMap[docSnap.id] = {
            guestName: userMap[data.userId]?.userName || "Unknown",
            checkIn: data.checkInDate || data.checkIn,
            checkOut: data.checkOutDate || data.checkOut,
            roomNumbers: roomNumbers.join(", ") || "N/A",
          };
        });

        const advancePayments = paymentSnap.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
          .filter((p) => p.advance && p.advance !== "0");

        const mergedData = advancePayments.map((p) => {
          const booking = bookingsMap[p.bookingId] || {};
          return {
            id: p.id,
            guestName: booking.guestName,
            roomNo: booking.roomNumbers,
            dates: formatDateRange(booking.checkIn, booking.checkOut),
            advance: p.advance || "N/A",
            receipt: p.receiptPath || "",
            status:
              p.status?.charAt(0).toUpperCase() + p.status?.slice(1) ||
              "Pending",
          };
        });

        setPayments(mergedData);
      } catch (err) {
        console.error("Failed to fetch advance payments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvancePayments();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "payment", id), { status: newStatus });
      setPayments((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1),
              }
            : p
        )
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const columns = [
    { field: "guestName", headerName: "Guest Name", flex: 1 },
    { field: "roomNo", headerName: "Room No", flex: 1 },
    { field: "advance", headerName: "Advance", flex: 1 },
    { field: "dates", headerName: "Check-in → Check-out", flex: 1.5 },
    {
      field: "receipt",
      headerName: "Receipt",
      flex: 0.8,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => setReceiptDialog({ open: true, url: params.value })}
          disabled={!params.value}
        >
          View
        </Button>
      ),
    },
   {
  field: "status",
  headerName: "Status",
  flex: 1,
  renderCell: (params) => <StatusChip label={params.value} />,
},

    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const status = params.row.status;

        // Determine the disabled state for each button
        const isVerified = status === "Verified";
        const isRejected = status === "Rejected";

        // Verify button remains enabled only if status is Pending or Rejected
        const isVerifyDisabled = isVerified;

        // Reject button is disabled if status is Verified OR Rejected
        const isRejectDisabled = isVerified || isRejected;

        return (
          <Box
            sx={{
              display: "flex",
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Stack direction="row" spacing={1}>
              {/* VERIFY Button */}
              <Button
                size="small"
                variant="contained"
                color="success"
                // Use the calculated disabled state
                disabled={isVerifyDisabled}
                onClick={() =>
                  setConfirmDialog({
                    open: true,
                    id: params.row.id,
                    action: "verified",
                  })
                }
              >
                Verify
              </Button>

              {/* REJECT Button */}
              <Button
                size="small"
                variant="contained"
                color="error"
                // Use the calculated disabled state
                disabled={isRejectDisabled}
                onClick={() =>
                  setConfirmDialog({
                    open: true,
                    id: params.row.id,
                    action: "rejected",
                  })
                }
              >
                Reject
              </Button>
            </Stack>
          </Box>
        );
      },
    },
  ];

  return (
    <Box>
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ width: "100%", minWidth: 600, position: "relative" }}>
            <Customdatagriddesktop
              rows={payments}
              columns={columns}
              pageSizeOptions={[5, 10, 20]}
              defaultPageSize={10}
              getRowId={(row) => row.id}
              loading={loading} 
            />
          </Box>
        </CardContent>
      </Card>

      {/* Receipt Dialog (like BookingDetails) */}
      <Dialog
        open={receiptDialog.open}
        onClose={() => setReceiptDialog({ open: false, url: "" })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Payment Receipt</DialogTitle>
        <DialogContent sx={{ display: "flex", justifyContent: "center" }}>
          {receiptDialog.url ? (
            <Box
              component="img"
              src={receiptDialog.url}
              alt="Payment Receipt"
              sx={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }}
            />
          ) : (
            <Typography>No receipt available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setReceiptDialog({ open: false, url: "" })}
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() =>
          setConfirmDialog({ open: false, id: null, action: null })
        }
        title={
          confirmDialog.action === "verified"
            ? "Confirm Payment"
            : "Reject Payment"
        }
        description={
          confirmDialog.action === "verified"
            ? "Are you sure you want to verify this payment?"
            : "Are you sure you want to reject this payment?"
        }
        confirmText={confirmDialog.action === "verified" ? "Verify" : "Reject"}
        color={confirmDialog.action === "verified" ? "success" : "error"}
        onConfirm={() => {
          handleStatusUpdate(confirmDialog.id, confirmDialog.action);
        }}
      />
    </Box>
  );
};

export default Payment;
