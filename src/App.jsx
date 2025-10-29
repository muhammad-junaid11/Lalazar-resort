import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, CssBaseline, useTheme } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import theme from "./Theme/theme";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Dashboard from "./Dashboard/Dashboard";
import Bookings from "./Dashboard/DashboardPages/Bookings";
import DashboardLayoutpage from "./Dashboard/Dashboadlayout/DashboardLayoutpage";
import GuestDetails from "./Dashboard/DashboardPages/Guestdetails";
import Rooms from "./Dashboard/DashboardPages/Rooms";
import AddRoom from "./Dashboard/DashboardPages/Addroom";

function AppContent() {
  const theme = useTheme();

  console.log("AppContent rendering"); // Debug

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar
        theme="colored"
        toastStyle={{
          backgroundColor: theme.palette.primary.main,
          color: "#fff",
        }}
      />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard routes with layout */}
        <Route path="/" element={<DashboardLayoutpage />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="bookings/:id" element={<GuestDetails />} />
          <Route path="rooms" element={<Rooms />} />
           <Route path="rooms/add" element={<AddRoom />} />
           <Route path="rooms/:roomId" element={<AddRoom />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;