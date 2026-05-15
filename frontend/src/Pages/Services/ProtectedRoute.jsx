// src/Pages/Services/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles }) {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token) {
        return <Navigate to="/" replace />;
    }

    if (!user) {
        localStorage.removeItem("token");
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
            // Redirect ke dashboard sesuai role
            switch (user.role) {
                case "admin":
                    return <Navigate to="/admin/dashboard" replace />;
                case "doctor":
                    return <Navigate to="/doctor/dashboard" replace />;
                case "officer":
                    return <Navigate to="/officer/dashboard" replace />;
                case "society":
                    return <Navigate to="/dashboard" replace />;
                default:
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    return <Navigate to="/" replace />;
            }
        }
    }
    return <Outlet />;
}