import React from 'react'
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Register';
import ProtectedRoute from './Pages/Services/ProtectedRoute';
import DashboardAdmin from './Pages/Admin/DashboardAdmin';
import DashboardSociety from './Pages/Society/DashboardSociety';
import NotFound from './Pages/error/NotFound';
import Vaccines from './Pages/Admin/Vaccines';
import Regionals from './Pages/Admin/Regionals';
import Report from './Pages/Admin/Report';
import Spots from './Pages/Admin/Spots';
import Medicals from './Pages/Admin/Medicals';
import SpotVaccination from './Pages/Society/SpotVaccination';
import Vaccination from './Pages/Society/Vaccination';
import Consultation from './Pages/Society/Consultation';
import DashboardOfficer from './Pages/Officer/DashboardOfficer';
import ManageVaccination from './Pages/Officer/ManageVaccination';
import DashboardDoctor from './Pages/Doctor/DashboardDoctor';
import VaccinationHistory from './Pages/Doctor/VaccinationHistory';
import Konsultation from './Pages/Doctor/Konsultation';
export default function App() {
  return (
    <Router>
      <Routes>
         <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<DashboardAdmin />} />
          <Route path="/admin/vaccines" element={<Vaccines />} />
          <Route path="/admin/regionals" element={<Regionals />} />
          <Route path="/admin/report" element={<Report />} />
          <Route path="/admin/spots" element={<Spots />} />
          <Route path="/admin/medicals" element={<Medicals />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["medical", "doctor"]} />}>
          <Route path="/doctor/dashboard" element={<DashboardDoctor />} />
          <Route path="/doctor/vaccination-history" element={<VaccinationHistory />} />
          <Route path="/doctor/consultation" element={<Konsultation />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["medical", "officer"]} />}>
          <Route path="/officer/dashboard" element={<DashboardOfficer />} />
          <Route path="/officer/manage-vaccination" element={<ManageVaccination />} />
        </Route>


        <Route element={<ProtectedRoute allowedRoles={["society"]} />}>
          <Route path="/dashboard" element={<DashboardSociety />} />
          <Route path="/spot-vaccination" element={<SpotVaccination />} />
          <Route path="/vaccination" element={<Vaccination />} />
          <Route path="/Consultations" element={<Consultation />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}
