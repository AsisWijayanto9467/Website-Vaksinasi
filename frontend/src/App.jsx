import React from 'react'
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Register';
import ProtectedRoute from './Pages/Services/ProtectedRoute';
import DashboardAdmin from './Pages/Admin/DashboardAdmin';
import DashboardMedical from './Pages/Medical/DashboardMedical';
import DashboardSociety from './Pages/Society/DashboardSociety';
import NotFound from './Pages/error/NotFound';

export default function App() {
  return (
    <Router>
      <Routes>
         <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<DashboardAdmin />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["medical", "doctor", "officer"]} />}>
          <Route path="/medical/dashboard" element={<DashboardMedical />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["society"]} />}>
          <Route path="/dashboard" element={<DashboardSociety />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}
