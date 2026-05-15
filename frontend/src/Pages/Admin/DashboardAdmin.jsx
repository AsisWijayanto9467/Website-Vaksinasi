// src/Pages/Admin/DashboardAdmin.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faGauge,
    faSpinner,
    faExclamationTriangle,
    faSyringe,
    faComments,
    faHospital,
    faUserDoctor,
    faUsers,
    faLocationDot,
    faMapPin,
    faClock,
    faCheckCircle,
    faArrowRight,
    faStethoscope,
    faUserNurse,
    faVial
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Main from '../Layouts/Main';

export default function DashboardAdmin() {
    const navigate = useNavigate();
    
    // State Management
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Dashboard Data
    const [dashboardData, setDashboardData] = useState({
        total_vaccines: 0,
        total_regionals: 0,
        total_spots: 0,
        total_medicals: 0,
        total_doctors: 0,
        total_officers: 0,
        total_vaccinations: 0,
        total_consultations: 0,
        pending_consultations: 0,
        recent_vaccinations: [],
        recent_consultations: [],
        spot_utilization: []
    });

    // Helper function to get token
    const getToken = () => {
        return localStorage.getItem('token');
    };

    // Fetch all dashboard data
    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = getToken();
            
            // Fetch all data in parallel
            const [
                vaccinesRes,
                regionalsRes,
                spotsRes,
                medicalsRes,
                vaccinationReportRes,
                consultationReportRes,
                capacityReportRes
            ] = await Promise.all([
                api.get(`/admin/vaccines?token=${token}`),
                api.get(`/admin/regionals?token=${token}`),
                api.get(`/admin/spots?token=${token}`),
                api.get(`/admin/medicals?token=${token}`),
                api.get(`/admin/reports/vaccinations?token=${token}`),
                api.get(`/admin/reports/consultations?token=${token}`),
                api.get(`/admin/reports/capacity?token=${token}`)
            ]);

            const vaccines = vaccinesRes.data.data || [];
            const regionals = regionalsRes.data.data || [];
            const spots = spotsRes.data.data || [];
            const medicals = medicalsRes.data.data || [];
            const vaccinationData = vaccinationReportRes.data.data || {};
            const consultationData = consultationReportRes.data.data || {};
            const capacityData = capacityReportRes.data.data || {};

            // Get recent vaccinations (last 5)
            const recentVaccinations = (vaccinationData.detailed_data || [])
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5);

            // Get recent consultations (last 5)
            const recentConsultations = (consultationData.detailed_data || [])
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 5);

            // Get spot utilization data (top 5 by queue)
            const spotUtilization = (capacityData.spots || [])
                .sort((a, b) => b.pending_queue - a.pending_queue)
                .slice(0, 5);

            setDashboardData({
                total_vaccines: vaccines.length,
                total_regionals: regionals.length,
                total_spots: spots.length,
                total_medicals: medicals.length,
                total_doctors: medicals.filter(m => m.role === 'doctor').length,
                total_officers: medicals.filter(m => m.role === 'officer').length,
                total_vaccinations: vaccinationData.total_vaccinations || 0,
                total_consultations: consultationData.total_consultations || 0,
                pending_consultations: consultationData.pending_count || 0,
                acceptance_rate: consultationData.acceptance_rate || 0,
                recent_vaccinations: recentVaccinations,
                recent_consultations: recentConsultations,
                spot_utilization: spotUtilization,
                capacity_summary: capacityData.summary || {}
            });
        } catch (err) {
            setError('Failed to fetch dashboard data');
            console.error('Error fetching dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get status badge
    const getStatusBadge = (status) => {
        const statusMap = {
            'pending': 'warning',
            'accepted': 'success',
            'declined': 'danger'
        };
        return statusMap[status] || 'secondary';
    };

    // Quick navigation items
    const quickLinks = [
        { path: '/admin/vaccines', icon: faSyringe, label: 'Manage Vaccines', color: 'primary' },
        { path: '/admin/regionals', icon: faLocationDot, label: 'Manage Regionals', color: 'info' },
        { path: '/admin/spots', icon: faHospital, label: 'Manage Spots', color: 'success' },
        { path: '/admin/medicals', icon: faUserDoctor, label: 'Manage Staff', color: 'purple' },
        { path: '/admin/report', icon: faVial, label: 'View Reports', color: 'warning' }
    ];

    if (loading) {
        return (
            <Main>
                <div className="text-center py-5">
                    <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary mb-3" />
                    <p className="text-muted">Loading dashboard...</p>
                </div>
            </Main>
        );
    }

    if (error) {
        return (
            <Main>
                <div className="alert alert-danger d-flex align-items-center shadow-sm" role="alert">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                    <span>{error}</span>
                </div>
            </Main>
        );
    }

    return (
        <Main>
            <div className="dashboard-admin-page">
                {/* Welcome Section */}
                <div className="card shadow-sm mb-4 border-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <div className="card-body text-white p-4">
                        <div className="row align-items-center">
                            <div className="col-md-8">
                                <h3 className="fw-bold mb-2">
                                    <FontAwesomeIcon icon={faGauge} className="me-2" />
                                    Admin Dashboard
                                </h3>
                                <p className="mb-0 opacity-75">
                                    Welcome to HealthCare System Administration. Monitor and manage your vaccination system here.
                                </p>
                            </div>
                            <div className="col-md-4 text-md-end mt-3 mt-md-0">
                                <button 
                                    className="btn btn-light"
                                    onClick={() => fetchDashboardData()}
                                >
                                    <FontAwesomeIcon icon={faSpinner} spin={loading} className="me-2" />
                                    Refresh Data
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="row mb-4">
                    <div className="col-xl-3 col-md-6 mb-3">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <p className="text-muted mb-1 small">Total Vaccines</p>
                                        <h3 className="fw-bold mb-0">{dashboardData.total_vaccines}</h3>
                                    </div>
                                    <div className="bg-primary rounded p-3">
                                        <FontAwesomeIcon icon={faSyringe} className="text-white fs-4" />
                                    </div>
                                </div>
                                <small className="text-success">
                                    <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                                    Active vaccine types
                                </small>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-3 col-md-6 mb-3">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <p className="text-muted mb-1 small">Total Spots</p>
                                        <h3 className="fw-bold mb-0">{dashboardData.total_spots}</h3>
                                    </div>
                                    <div className="bg-success rounded p-3">
                                        <FontAwesomeIcon icon={faHospital} className="text-white fs-4" />
                                    </div>
                                </div>
                                <small className="text-muted">
                                    <FontAwesomeIcon icon={faLocationDot} className="me-1" />
                                    Across {dashboardData.total_regionals} regionals
                                </small>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-3 col-md-6 mb-3">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <p className="text-muted mb-1 small">Medical Staff</p>
                                        <h3 className="fw-bold mb-0">{dashboardData.total_medicals}</h3>
                                    </div>
                                    <div className="bg-info rounded p-3">
                                        <FontAwesomeIcon icon={faUserDoctor} className="text-white fs-4" />
                                    </div>
                                </div>
                                <small className="text-muted">
                                    <FontAwesomeIcon icon={faStethoscope} className="me-1" />
                                    {dashboardData.total_doctors} Doctors
                                    <FontAwesomeIcon icon={faUserNurse} className="ms-2 me-1" />
                                    {dashboardData.total_officers} Officers
                                </small>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-3 col-md-6 mb-3">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <p className="text-muted mb-1 small">Total Vaccinations</p>
                                        <h3 className="fw-bold mb-0">{dashboardData.total_vaccinations}</h3>
                                    </div>
                                    <div className="bg-warning rounded p-3">
                                        <FontAwesomeIcon icon={faVial} className="text-white fs-4" />
                                    </div>
                                </div>
                                <small className="text-muted">
                                    <FontAwesomeIcon icon={faUsers} className="me-1" />
                                    Total administered doses
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secondary Stats Row */}
                <div className="row mb-4">
                    <div className="col-md-6 mb-3">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-body text-center">
                                <h5 className="text-muted mb-2">Consultations</h5>
                                <h2 className="fw-bold text-primary">{dashboardData.total_consultations}</h2>
                                <div className="mt-2">
                                    {dashboardData.pending_consultations > 0 && (
                                        <span className="badge bg-warning me-2">
                                            <FontAwesomeIcon icon={faClock} className="me-1" />
                                            {dashboardData.pending_consultations} Pending
                                        </span>
                                    )}
                                    <span className="badge bg-info">
                                        <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                                        {dashboardData.acceptance_rate}% Accepted
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6 mb-3">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-body text-center">
                                <h5 className="text-muted mb-2">Capacity Overview</h5>
                                <h2 className="fw-bold text-success">
                                    {dashboardData.capacity_summary?.average_utilization || 0}%
                                </h2>
                                <small className="text-muted">
                                    Average Utilization Rate
                                    <br />
                                    Total Capacity: {dashboardData.capacity_summary?.total_capacity || 0} | 
                                    Pending Queue: {dashboardData.capacity_summary?.total_pending_queue || 0}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-white fw-bold">
                        <FontAwesomeIcon icon={faArrowRight} className="me-2 text-primary" />
                        Quick Access
                    </div>
                    <div className="card-body">
                        <div className="row">
                            {quickLinks.map((link, index) => (
                                <div key={index} className="col-md-4 col-lg-2 mb-3">
                                    <button
                                        className="btn btn-outline-secondary w-100 h-100 d-flex flex-column align-items-center gap-2 py-3"
                                        onClick={() => navigate(link.path)}
                                        style={{ borderColor: link.color === 'purple' ? '#6f42c1' : undefined }}
                                    >
                                        <FontAwesomeIcon 
                                            icon={link.icon} 
                                            size="2x" 
                                            className={`text-${link.color}`}
                                            style={link.color === 'purple' ? { color: '#6f42c1' } : {}}
                                        />
                                        <span className="small">{link.label}</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Activities Row */}
                <div className="row">
                    {/* Recent Vaccinations */}
                    <div className="col-lg-6 mb-4">
                        <div className="card shadow-sm h-100">
                            <div className="card-header bg-white d-flex justify-content-between align-items-center">
                                <h6 className="fw-bold mb-0">
                                    <FontAwesomeIcon icon={faSyringe} className="me-2 text-primary" />
                                    Recent Vaccinations
                                </h6>
                                <button 
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => navigate('/admin/report')}
                                >
                                    View All
                                </button>
                            </div>
                            <div className="card-body p-0">
                                {dashboardData.recent_vaccinations.length === 0 ? (
                                    <div className="text-center py-4 text-muted">
                                        <FontAwesomeIcon icon={faSyringe} size="2x" className="mb-2" />
                                        <p>No recent vaccinations</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Society</th>
                                                    <th>Vaccine</th>
                                                    <th>Dose</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dashboardData.recent_vaccinations.map((vax, index) => (
                                                    <tr key={index}>
                                                        <td><small>{formatDate(vax.date)}</small></td>
                                                        <td><small>{vax.society?.name || '-'}</small></td>
                                                        <td><small>{vax.vaccine?.name || '-'}</small></td>
                                                        <td>
                                                            <span className="badge bg-info">Dose {vax.dose}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Consultations */}
                    <div className="col-lg-6 mb-4">
                        <div className="card shadow-sm h-100">
                            <div className="card-header bg-white d-flex justify-content-between align-items-center">
                                <h6 className="fw-bold mb-0">
                                    <FontAwesomeIcon icon={faComments} className="me-2 text-success" />
                                    Recent Consultations
                                </h6>
                                <button 
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() => navigate('/admin/report')}
                                >
                                    View All
                                </button>
                            </div>
                            <div className="card-body p-0">
                                {dashboardData.recent_consultations.length === 0 ? (
                                    <div className="text-center py-4 text-muted">
                                        <FontAwesomeIcon icon={faComments} size="2x" className="mb-2" />
                                        <p>No recent consultations</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Society</th>
                                                    <th>Doctor</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dashboardData.recent_consultations.map((consult, index) => (
                                                    <tr key={index}>
                                                        <td><small>{formatDate(consult.created_at)}</small></td>
                                                        <td><small>{consult.society?.name || '-'}</small></td>
                                                        <td><small>{consult.doctor?.name || '-'}</small></td>
                                                        <td>
                                                            <span className={`badge bg-${getStatusBadge(consult.status)}`}>
                                                                {consult.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Spot Utilization */}
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-white d-flex justify-content-between align-items-center">
                        <h6 className="fw-bold mb-0">
                            <FontAwesomeIcon icon={faHospital} className="me-2 text-warning" />
                            Top 5 Spots by Pending Queue
                        </h6>
                        <button 
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => navigate('/admin/report')}
                        >
                            Capacity Report
                        </button>
                    </div>
                    <div className="card-body p-0">
                        {dashboardData.spot_utilization.length === 0 ? (
                            <div className="text-center py-4 text-muted">
                                <p>No data available</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Spot Name</th>
                                            <th>Regional</th>
                                            <th className="text-center">Capacity</th>
                                            <th className="text-center">Utilization</th>
                                            <th className="text-center">Queue</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dashboardData.spot_utilization.map((spot, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <FontAwesomeIcon icon={faMapPin} className="me-2 text-secondary" />
                                                    {spot.spot_name}
                                                </td>
                                                <td><small>{spot.regional}</small></td>
                                                <td className="text-center">{spot.capacity}</td>
                                                <td className="text-center">
                                                    <div className="progress" style={{ height: '18px' }}>
                                                        <div
                                                            className={`progress-bar ${
                                                                spot.utilization_rate > 80 ? 'bg-danger' :
                                                                spot.utilization_rate > 50 ? 'bg-warning' : 'bg-success'
                                                            }`}
                                                            style={{ width: `${spot.utilization_rate}%` }}
                                                        >
                                                            {spot.utilization_rate}%
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <span className={`badge ${
                                                        spot.pending_queue > 10 ? 'bg-danger' :
                                                        spot.pending_queue > 5 ? 'bg-warning' : 'bg-success'
                                                    }`}>
                                                        {spot.pending_queue}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Main>
    );
}