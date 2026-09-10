import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    if (decoded.role !== "admin") {
      return <Navigate to="/student" replace />;
    }

    return children;
  } catch (error) {
    console.error("Invalid token");
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
};

export default AdminRoute;
