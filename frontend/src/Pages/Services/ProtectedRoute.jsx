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
            switch (user.role) {
                case "admin":
                    return <Navigate to="/admin/dashboard" replace />;
                case "doctor":
                case "officer":
                case "medical":
                    return <Navigate to="/medical/dashboard" replace />;
                case "society":
                    return <Navigate to="/dashboard" replace />;
                default:
                    return <Navigate to="/" replace />;
            }
        }
    }

    return <Outlet />;
}