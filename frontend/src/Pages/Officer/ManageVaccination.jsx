// src/Pages/Officer/ManageVaccination.jsx
import React, { useState, useEffect } from 'react';
import MainPublic from '../Layouts/MainPublic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSyringe,
    faClipboardCheck,
    faUsers,
    faChartBar,
    faCalendarAlt,
    faClock,
    faCheckCircle,
    faTimesCircle,
    faHourglassHalf,
    faUserCheck,
    faHospital,
    faExclamationTriangle,
    faChevronDown,
    faChevronUp,
    faSpinner,
    faClipboardList,
    faIdCard,
    faVenusMars,
    faMapMarkerAlt,
    faCheck,
    faXmark,
    faNotesMedical,
    faSync
} from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

export default function ManageVaccination() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    
    // Dashboard data
    const [dashboardData, setDashboardData] = useState(null);
    
    // Capacity data
    const [capacityData, setCapacityData] = useState(null);
    const [capacityDate, setCapacityDate] = useState(new Date().toISOString().split('T')[0]);
    const [capacityLoading, setCapacityLoading] = useState(false);
    
    // Queue data
    const [queueData, setQueueData] = useState(null);
    const [queueDate, setQueueDate] = useState(new Date().toISOString().split('T')[0]);
    const [queueLoading, setQueueLoading] = useState(false);
    const [expandedQueueId, setExpandedQueueId] = useState(null);
    
    // Verification form
    const [showVerificationForm, setShowVerificationForm] = useState(false);
    const [verificationLoading, setVerificationLoading] = useState(false);
    const [selectedVaccination, setSelectedVaccination] = useState(null);
    const [verificationForm, setVerificationForm] = useState({
        vaccination_id: '',
        status: 'verified',
        notes: ''
    });
    const [verificationErrors, setVerificationErrors] = useState({});

    const getToken = () => {
        return localStorage.getItem('token');
    };

    // Fetch dashboard data
    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError(null);
             const token = getToken();
            const response = await api.get(`/officer/dashboard?token=${token}`);
            if (response.data) {
                setDashboardData(response.data);
            }
        } catch (err) {
            console.error('Error fetching dashboard:', err);
            setError('Gagal memuat data dashboard. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch capacity data
    const fetchCapacity = async () => {
        try {
            setCapacityLoading(true);
            const spotId = dashboardData?.spot?.id;
            if (!spotId) return;
            
            const token = getToken();
            const response = await api.get(`/officer/spots/${spotId}/capacity?token=${token}`, {
                params: { date: capacityDate }
            });
            if (response.data) {
                setCapacityData(response.data);
            }
        } catch (err) {
            console.error('Error fetching capacity:', err);
            if (err.response?.status === 403) {
                setError('Anda hanya dapat melihat kapasitas spot Anda sendiri');
            }
        } finally {
            setCapacityLoading(false);
        }
    };

    // Fetch queue data
    const fetchQueue = async () => {
        try {
            setQueueLoading(true);
            const token = getToken();
            const response = await api.get(`/officer/queue/today?token=${token}`, {
                params: { date: queueDate }
            });
            if (response.data) {
                setQueueData(response.data);
            }
        } catch (err) {
            console.error('Error fetching queue:', err);
        } finally {
            setQueueLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    useEffect(() => {
        if (activeTab === 'capacity' && dashboardData?.spot?.id) {
            fetchCapacity();
        }
    }, [activeTab, capacityDate, dashboardData]);

    useEffect(() => {
        if (activeTab === 'queue') {
            fetchQueue();
        }
    }, [activeTab, queueDate]);

    // Handle verification
    const handleVerify = async (vaccination, status) => {
        setSelectedVaccination(vaccination);
        setVerificationForm({
            vaccination_id: vaccination.id,
            status: status,
            notes: ''
        });
        setShowVerificationForm(true);
        setVerificationErrors({});
    };

    const submitVerification = async (e) => {
        e.preventDefault();
        
        if (!verificationForm.vaccination_id || !verificationForm.status) {
            setVerificationErrors({ general: 'Data tidak lengkap' });
            return;
        }

        try {
            const token = getToken();
            setVerificationLoading(true);
            await api.post(`/officer/vaccinations/verify?token=${token}`, verificationForm);
            
            setSuccessMessage(`Vaksinasi berhasil ${verificationForm.status === 'verified' ? 'diverifikasi' : 'ditolak'}`);
            setShowVerificationForm(false);
            setVerificationForm({ vaccination_id: '', status: 'verified', notes: '' });
            
            // Refresh data
            await fetchDashboard();
            if (activeTab === 'queue') await fetchQueue();
            
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err) {
            console.error('Error verifying vaccination:', err);
            if (err.response?.data?.errors) {
                setVerificationErrors(err.response.data.errors);
            } else {
                setVerificationErrors({ 
                    general: err.response?.data?.message || 'Gagal memverifikasi vaksinasi' 
                });
            }
        } finally {
            setVerificationLoading(false);
        }
    };

    const formatDateShort = (dateString) => {
        if (!dateString) return '-';
        const options = { 
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    // Loading state
    if (loading) {
        return (
            <MainPublic>
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                    <div className="text-center">
                        <div className="spinner-border text-success mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted">Memuat dashboard officer...</p>
                    </div>
                </div>
            </MainPublic>
        );
    }

    return (
        <MainPublic>
            <div className="mx-4 my-2 py-4 py-md-5">
                {/* Success Message */}
                {successMessage && (
                    <div className="alert alert-success alert-dismissible fade show d-flex align-items-center" role="alert">
                        <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                        <div>{successMessage}</div>
                        <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                        <div>{error}</div>
                        <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                    </div>
                )}

                {/* Header */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm" style={{ 
                            background: 'linear-gradient(135deg, #047857 0%, #10b981 50%, #34d399 100%)',
                            borderRadius: '16px',
                            color: 'white'
                        }}>
                            <div className="card-body p-4">
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                                    <div>
                                        <h4 className="mb-1 fw-bold">
                                            <FontAwesomeIcon icon={faSyringe} className="me-2" />
                                            Dashboard Officer Vaksinasi
                                        </h4>
                                        <p className="mb-0 opacity-75">
                                            {dashboardData?.officer?.name ? `Selamat datang, ${dashboardData.officer.name}` : 'Kelola vaksinasi di spot Anda'}
                                        </p>
                                        {dashboardData?.spot && (
                                            <small className="opacity-75">
                                                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                                                {dashboardData.spot.name} - {dashboardData.spot.address}
                                            </small>
                                        )}
                                    </div>
                                    <button 
                                        className="btn btn-light mt-3 mt-md-0"
                                        onClick={fetchDashboard}
                                        style={{ borderRadius: '10px', fontWeight: '500' }}
                                    >
                                        <FontAwesomeIcon icon={faSync} className="me-2" />
                                        Refresh Data
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                            <div className="card-body p-2">
                                <ul className="nav nav-pills nav-fill gap-2 p-1">
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('dashboard')}
                                            style={{
                                                borderRadius: '10px',
                                                backgroundColor: activeTab === 'dashboard' ? '#10b981' : 'transparent',
                                                color: activeTab === 'dashboard' ? 'white' : '#64748b',
                                                fontWeight: '500',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faChartBar} className="me-2" />
                                            Dashboard
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link ${activeTab === 'capacity' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('capacity')}
                                            style={{
                                                borderRadius: '10px',
                                                backgroundColor: activeTab === 'capacity' ? '#10b981' : 'transparent',
                                                color: activeTab === 'capacity' ? 'white' : '#64748b',
                                                fontWeight: '500',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faHospital} className="me-2" />
                                            Kapasitas
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link ${activeTab === 'queue' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('queue')}
                                            style={{
                                                borderRadius: '10px',
                                                backgroundColor: activeTab === 'queue' ? '#10b981' : 'transparent',
                                                color: activeTab === 'queue' ? 'white' : '#64748b',
                                                fontWeight: '500',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faUsers} className="me-2" />
                                            Antrian Hari Ini
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Tab Content */}
                {activeTab === 'dashboard' && dashboardData && (
                    <>
                        {/* Statistics Cards */}
                        <div className="row mb-4">
                            <div className="col-md-3 col-6 mb-3">
                                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px', backgroundColor: '#f0fdf4' }}>
                                    <div className="card-body text-center p-3">
                                        <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                                             style={{ width: '50px', height: '50px', backgroundColor: '#d1fae5' }}>
                                            <FontAwesomeIcon icon={faUsers} style={{ fontSize: '20px', color: '#047857' }} />
                                        </div>
                                        <h3 className="fw-bold mb-0" style={{ color: '#047857' }}>
                                            {dashboardData.statistics?.total_today || 0}
                                        </h3>
                                        <small className="text-muted">Total Hari Ini</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3 col-6 mb-3">
                                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px', backgroundColor: '#eff6ff' }}>
                                    <div className="card-body text-center p-3">
                                        <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                                             style={{ width: '50px', height: '50px', backgroundColor: '#dbeafe' }}>
                                            <FontAwesomeIcon icon={faSyringe} style={{ fontSize: '20px', color: '#1d4ed8' }} />
                                        </div>
                                        <h3 className="fw-bold mb-0" style={{ color: '#1d4ed8' }}>
                                            {dashboardData.statistics?.total_vaccinations || 0}
                                        </h3>
                                        <small className="text-muted">Total Vaksinasi</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3 col-6 mb-3">
                                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px', backgroundColor: '#fef3c7' }}>
                                    <div className="card-body text-center p-3">
                                        <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                                             style={{ width: '50px', height: '50px', backgroundColor: '#fde68a' }}>
                                            <FontAwesomeIcon icon={faClipboardCheck} style={{ fontSize: '20px', color: '#b45309' }} />
                                        </div>
                                        <h3 className="fw-bold mb-0" style={{ color: '#b45309' }}>
                                            {dashboardData.statistics?.verified_today || 0}
                                        </h3>
                                        <small className="text-muted">Terverifikasi</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3 col-6 mb-3">
                                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px', backgroundColor: '#fee2e2' }}>
                                    <div className="card-body text-center p-3">
                                        <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                                             style={{ width: '50px', height: '50px', backgroundColor: '#fecaca' }}>
                                            <FontAwesomeIcon icon={faHourglassHalf} style={{ fontSize: '20px', color: '#dc2626' }} />
                                        </div>
                                        <h3 className="fw-bold mb-0" style={{ color: '#dc2626' }}>
                                            {dashboardData.statistics?.pending || 0}
                                        </h3>
                                        <small className="text-muted">Menunggu</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Vaccinations */}
                        <div className="row">
                            <div className="col-12">
                                <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                                    <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
                                        <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
                                            <FontAwesomeIcon icon={faClipboardList} className="me-2" style={{ color: '#10b981' }} />
                                            Vaksinasi Terbaru
                                        </h5>
                                        <hr className="mt-3" />
                                    </div>
                                    <div className="card-body p-4">
                                        {dashboardData.recent_vaccinations?.length === 0 ? (
                                            <div className="text-center py-5">
                                                <div className="mb-3">
                                                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle"
                                                         style={{ width: '80px', height: '80px', backgroundColor: '#f0fdf4', border: '2px dashed #6ee7b7' }}>
                                                        <FontAwesomeIcon icon={faSyringe} style={{ fontSize: '32px', color: '#10b981' }} />
                                                    </div>
                                                </div>
                                                <h6 style={{ color: '#64748b' }}>Belum ada data vaksinasi</h6>
                                            </div>
                                        ) : (
                                            <div className="table-responsive">
                                                <table className="table table-hover align-middle">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th style={{ borderRadius: '8px 0 0 0' }}>No</th>
                                                            <th>Masyarakat</th>
                                                            <th>Vaksin</th>
                                                            <th>Dosis</th>
                                                            <th>Tanggal</th>
                                                            <th>Status</th>
                                                            <th style={{ borderRadius: '0 8px 0 0' }}>Aksi</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {dashboardData.recent_vaccinations?.map((vac, index) => (
                                                            <tr key={vac.id}>
                                                                <td>{index + 1}</td>
                                                                <td>
                                                                    <div>
                                                                        <strong style={{ color: '#1e293b' }}>{vac.society?.name}</strong>
                                                                        <br />
                                                                        <small className="text-muted">
                                                                            <FontAwesomeIcon icon={faIdCard} className="me-1" />
                                                                            {vac.society?.id_card_number}
                                                                        </small>
                                                                    </div>
                                                                </td>
                                                                <td>{vac.vaccine?.name || '-'}</td>
                                                                <td>
                                                                    <span className="badge" style={{ backgroundColor: '#d1fae5', color: '#047857' }}>
                                                                        Dosis {vac.dose}
                                                                    </span>
                                                                </td>
                                                                <td>{formatDateShort(vac.date)}</td>
                                                                <td>
                                                                    {vac.verification_status === 'verified' ? (
                                                                        <span className="badge" style={{ backgroundColor: '#d1fae5', color: '#047857' }}>
                                                                            <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                                                                            Terverifikasi
                                                                        </span>
                                                                    ) : vac.verification_status === 'rejected' ? (
                                                                        <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                                                                            <FontAwesomeIcon icon={faTimesCircle} className="me-1" />
                                                                            Ditolak
                                                                        </span>
                                                                    ) : (
                                                                        <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
                                                                            <FontAwesomeIcon icon={faHourglassHalf} className="me-1" />
                                                                            Menunggu
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {!vac.verified_by_officer && (
                                                                        <div className="d-flex gap-2">
                                                                            <button
                                                                                className="btn btn-sm text-white"
                                                                                onClick={() => handleVerify(vac, 'verified')}
                                                                                style={{ backgroundColor: '#10b981', borderRadius: '8px' }}
                                                                            >
                                                                                <FontAwesomeIcon icon={faCheck} className="me-1" />
                                                                                Verifikasi
                                                                            </button>
                                                                            <button
                                                                                className="btn btn-sm text-white"
                                                                                onClick={() => handleVerify(vac, 'rejected')}
                                                                                style={{ backgroundColor: '#ef4444', borderRadius: '8px' }}
                                                                            >
                                                                                <FontAwesomeIcon icon={faXmark} className="me-1" />
                                                                                Tolak
                                                                            </button>
                                                                        </div>
                                                                    )}
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
                    </>
                )}

                {/* Capacity Tab Content */}
                {activeTab === 'capacity' && (
                    <div className="row">
                        <div className="col-12 mb-4">
                            <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                                <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
                                            <FontAwesomeIcon icon={faHospital} className="me-2" style={{ color: '#10b981' }} />
                                            Kapasitas Spot Vaksinasi
                                        </h5>
                                        <div className="d-flex align-items-center gap-2">
                                            <FontAwesomeIcon icon={faCalendarAlt} style={{ color: '#64748b' }} />
                                            <input
                                                type="date"
                                                className="form-control form-control-sm"
                                                value={capacityDate}
                                                onChange={(e) => setCapacityDate(e.target.value)}
                                                style={{ borderRadius: '8px', width: 'auto' }}
                                            />
                                        </div>
                                    </div>
                                    <hr className="mt-3" />
                                </div>
                                <div className="card-body p-4">
                                    {capacityLoading ? (
                                        <div className="text-center py-5">
                                            <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: '32px', color: '#10b981' }} />
                                            <p className="mt-2 text-muted">Memuat data kapasitas...</p>
                                        </div>
                                    ) : capacityData ? (
                                        <>
                                            {/* Spot Info */}
                                            <div className="row mb-4">
                                                <div className="col-md-6">
                                                    <div className="p-3 rounded-3" style={{ backgroundColor: '#f0fdf4', border: '1px solid #6ee7b7' }}>
                                                        <strong style={{ color: '#047857' }}>
                                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                                                            {capacityData.spot?.name}
                                                        </strong>
                                                        <p className="mb-0 mt-1 text-muted">{capacityData.spot?.address}</p>
                                                        <small className="text-muted">
                                                            {capacityData.spot?.regional?.district}, {capacityData.spot?.regional?.province}
                                                        </small>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="p-3 rounded-3" style={{ backgroundColor: '#eff6ff', border: '1px solid #93c5fd' }}>
                                                        <strong style={{ color: '#1d4ed8' }}>
                                                            <FontAwesomeIcon icon={faSyringe} className="me-2" />
                                                            Vaksin Tersedia
                                                        </strong>
                                                        <div className="mt-2">
                                                            {capacityData.available_vaccines?.map((vaccine) => (
                                                                <span key={vaccine.id} className="badge me-1 mb-1" 
                                                                      style={{ backgroundColor: '#dbeafe', color: '#1e40af', fontSize: '0.85rem' }}>
                                                                    {vaccine.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Capacity Status */}
                                            <div className="row mb-4">
                                                <div className="col-12">
                                                    <div className="card" style={{ backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                                                        <div className="card-body">
                                                            <h6 className="fw-bold mb-3" style={{ color: '#1e293b' }}>
                                                                <FontAwesomeIcon icon={faChartBar} className="me-2" style={{ color: '#8b5cf6' }} />
                                                                Status Kapasitas - {capacityData.date}
                                                            </h6>
                                                            
                                                            {/* Progress Bar */}
                                                            <div className="mb-3">
                                                                <div className="d-flex justify-content-between mb-1">
                                                                    <small className="fw-semibold">Utilisasi</small>
                                                                    <small className="fw-semibold">{capacityData.capacity_status?.utilization_percentage}%</small>
                                                                </div>
                                                                <div className="progress" style={{ height: '25px', borderRadius: '12px' }}>
                                                                    <div
                                                                        className="progress-bar progress-bar-striped progress-bar-animated"
                                                                        role="progressbar"
                                                                        style={{ 
                                                                            width: `${capacityData.capacity_status?.utilization_percentage}%`,
                                                                            backgroundColor: capacityData.capacity_status?.is_full ? '#ef4444' : '#10b981',
                                                                            borderRadius: '12px'
                                                                        }}
                                                                    >
                                                                        {capacityData.capacity_status?.utilization_percentage > 10 && 
                                                                            `${capacityData.capacity_status?.utilization_percentage}%`}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="row g-3">
                                                                <div className="col-md-3 col-6">
                                                                    <div className="p-2 rounded-3 text-center" style={{ backgroundColor: '#d1fae5' }}>
                                                                        <small className="text-muted d-block">Total Kapasitas</small>
                                                                        <strong style={{ color: '#047857', fontSize: '1.2rem' }}>
                                                                            {capacityData.capacity_status?.total_capacity}
                                                                        </strong>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-3 col-6">
                                                                    <div className="p-2 rounded-3 text-center" style={{ backgroundColor: '#fef3c7' }}>
                                                                        <small className="text-muted d-block">Terpakai</small>
                                                                        <strong style={{ color: '#b45309', fontSize: '1.2rem' }}>
                                                                            {capacityData.capacity_status?.used_capacity}
                                                                        </strong>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-3 col-6">
                                                                    <div className="p-2 rounded-3 text-center" style={{ backgroundColor: '#eff6ff' }}>
                                                                        <small className="text-muted d-block">Dosis 1</small>
                                                                        <strong style={{ color: '#1d4ed8', fontSize: '1.2rem' }}>
                                                                            {capacityData.capacity_status?.breakdown?.dose_1}
                                                                        </strong>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-3 col-6">
                                                                    <div className="p-2 rounded-3 text-center" style={{ backgroundColor: '#f0fdf4' }}>
                                                                        <small className="text-muted d-block">Dosis 2</small>
                                                                        <strong style={{ color: '#047857', fontSize: '1.2rem' }}>
                                                                            {capacityData.capacity_status?.breakdown?.dose_2}
                                                                        </strong>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {capacityData.capacity_status?.is_full && (
                                                                <div className="alert alert-warning mt-3 mb-0 d-flex align-items-center">
                                                                    <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                                                                    Kapasitas spot sudah penuh untuk tanggal ini!
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Hourly Data */}
                                            {capacityData.hourly_data?.length > 0 && (
                                                <div className="row">
                                                    <div className="col-12">
                                                        <h6 className="fw-bold mb-3" style={{ color: '#1e293b' }}>
                                                            <FontAwesomeIcon icon={faClock} className="me-2" style={{ color: '#f59e0b' }} />
                                                            Data Per Jam
                                                        </h6>
                                                        <div className="table-responsive">
                                                            <table className="table table-sm table-bordered">
                                                                <thead className="table-light">
                                                                    <tr>
                                                                        <th>Jam</th>
                                                                        <th>Jumlah Vaksinasi</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {capacityData.hourly_data.map((data, index) => (
                                                                        <tr key={index}>
                                                                            <td>{data.hour}</td>
                                                                            <td>
                                                                                <span className="badge" style={{ backgroundColor: '#d1fae5', color: '#047857' }}>
                                                                                    {data.count}
                                                                                </span>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-5">
                                            <p className="text-muted">Pilih tanggal untuk melihat kapasitas</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Queue Tab Content */}
                {activeTab === 'queue' && (
                    <div className="row">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                                <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
                                            <FontAwesomeIcon icon={faUsers} className="me-2" style={{ color: '#10b981' }} />
                                            Antrian Vaksinasi Hari Ini
                                        </h5>
                                        <div className="d-flex align-items-center gap-2">
                                            <FontAwesomeIcon icon={faCalendarAlt} style={{ color: '#64748b' }} />
                                            <input
                                                type="date"
                                                className="form-control form-control-sm"
                                                value={queueDate}
                                                onChange={(e) => setQueueDate(e.target.value)}
                                                style={{ borderRadius: '8px', width: 'auto' }}
                                            />
                                        </div>
                                    </div>
                                    <hr className="mt-3" />
                                </div>
                                <div className="card-body p-4">
                                    {queueLoading ? (
                                        <div className="text-center py-5">
                                            <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: '32px', color: '#10b981' }} />
                                            <p className="mt-2 text-muted">Memuat data antrian...</p>
                                        </div>
                                    ) : queueData ? (
                                        <>
                                            {/* Queue Statistics */}
                                            <div className="row mb-4">
                                                <div className="col-md-3 col-6 mb-2">
                                                    <div className="p-2 rounded-3 text-center" style={{ backgroundColor: '#d1fae5' }}>
                                                        <small className="text-muted d-block">Total Antrian</small>
                                                        <strong style={{ color: '#047857', fontSize: '1.2rem' }}>
                                                            {queueData.statistics?.total_queue}
                                                        </strong>
                                                    </div>
                                                </div>
                                                <div className="col-md-3 col-6 mb-2">
                                                    <div className="p-2 rounded-3 text-center" style={{ backgroundColor: '#eff6ff' }}>
                                                        <small className="text-muted d-block">Dosis 1</small>
                                                        <strong style={{ color: '#1d4ed8', fontSize: '1.2rem' }}>
                                                            {queueData.statistics?.dose_1_queue}
                                                        </strong>
                                                    </div>
                                                </div>
                                                <div className="col-md-3 col-6 mb-2">
                                                    <div className="p-2 rounded-3 text-center" style={{ backgroundColor: '#f0fdf4' }}>
                                                        <small className="text-muted d-block">Dosis 2</small>
                                                        <strong style={{ color: '#047857', fontSize: '1.2rem' }}>
                                                            {queueData.statistics?.dose_2_queue}
                                                        </strong>
                                                    </div>
                                                </div>
                                                <div className="col-md-3 col-6 mb-2">
                                                    <div className="p-2 rounded-3 text-center" style={{ backgroundColor: '#fef3c7' }}>
                                                        <small className="text-muted d-block">Tugas Saya</small>
                                                        <strong style={{ color: '#b45309', fontSize: '1.2rem' }}>
                                                            {queueData.statistics?.my_queue}
                                                        </strong>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Queue List */}
                                            {queueData.queue?.length === 0 ? (
                                                <div className="text-center py-5">
                                                    <div className="mb-3">
                                                        <div className="d-inline-flex align-items-center justify-content-center rounded-circle"
                                                             style={{ width: '80px', height: '80px', backgroundColor: '#f0fdf4', border: '2px dashed #6ee7b7' }}>
                                                            <FontAwesomeIcon icon={faUsers} style={{ fontSize: '32px', color: '#10b981' }} />
                                                        </div>
                                                    </div>
                                                    <h6 style={{ color: '#64748b' }}>Tidak ada antrian untuk tanggal ini</h6>
                                                </div>
                                            ) : (
                                                <div className="d-flex flex-column gap-3">
                                                    {queueData.queue.map((item) => {
                                                        const isExpanded = expandedQueueId === item.id;
                                                        const isAssignedToMe = item.status === 'assigned_to_me';
                                                        
                                                        return (
                                                            <div key={item.id}
                                                                className="rounded-3"
                                                                style={{
                                                                    border: `1px solid ${isAssignedToMe ? '#6ee7b7' : '#e2e8f0'}`,
                                                                    backgroundColor: '#ffffff',
                                                                    overflow: 'hidden'
                                                                }}
                                                            >
                                                                {/* Queue Header */}
                                                                <div 
                                                                    className="p-3 d-flex justify-content-between align-items-center"
                                                                    onClick={() => setExpandedQueueId(isExpanded ? null : item.id)}
                                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                                >
                                                                    <div className="d-flex align-items-center gap-3">
                                                                        {/* Queue Number */}
                                                                        <div className="d-flex align-items-center justify-content-center rounded-circle"
                                                                             style={{
                                                                                 width: '50px',
                                                                                 height: '50px',
                                                                                 backgroundColor: isAssignedToMe ? '#d1fae5' : '#f1f5f9',
                                                                                 flexShrink: 0
                                                                             }}>
                                                                            <strong style={{ 
                                                                                color: isAssignedToMe ? '#047857' : '#64748b',
                                                                                fontSize: '1.1rem'
                                                                            }}>
                                                                                {item.queue_number}
                                                                            </strong>
                                                                        </div>
                                                                        
                                                                        <div>
                                                                            <strong style={{ color: '#1e293b' }}>{item.society?.name}</strong>
                                                                            <div className="d-flex align-items-center gap-2 mt-1">
                                                                                <span className="badge" style={{ 
                                                                                    backgroundColor: item.dose === 1 ? '#dbeafe' : '#d1fae5',
                                                                                    color: item.dose === 1 ? '#1e40af' : '#047857'
                                                                                }}>
                                                                                    Dosis {item.dose}
                                                                                </span>
                                                                                <small className="text-muted">
                                                                                    <FontAwesomeIcon icon={faClock} className="me-1" />
                                                                                    {item.registration_time}
                                                                                </small>
                                                                                {isAssignedToMe && (
                                                                                    <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
                                                                                        <FontAwesomeIcon icon={faUserCheck} className="me-1" />
                                                                                        Tugas Saya
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="d-flex align-items-center gap-2">
                                                                        {isAssignedToMe && (
                                                                            <button
                                                                                className="btn btn-sm text-white"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleVerify(item, 'verified');
                                                                                }}
                                                                                style={{ backgroundColor: '#10b981', borderRadius: '8px' }}
                                                                            >
                                                                                <FontAwesomeIcon icon={faCheck} />
                                                                            </button>
                                                                        )}
                                                                        <FontAwesomeIcon 
                                                                            icon={isExpanded ? faChevronUp : faChevronDown} 
                                                                            style={{ color: '#64748b' }} 
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Expanded Content */}
                                                                {isExpanded && (
                                                                    <div style={{
                                                                        backgroundColor: '#f8fafc',
                                                                        borderTop: `1px solid ${isAssignedToMe ? '#6ee7b7' : '#e2e8f0'}`,
                                                                        padding: '20px'
                                                                    }}>
                                                                        <div className="row g-3">
                                                                            <div className="col-md-6">
                                                                                <div className="p-3 rounded-3 bg-white" style={{ border: '1px solid #e2e8f0' }}>
                                                                                    <label className="fw-semibold mb-2" style={{ color: '#8b5cf6', fontSize: '0.9rem' }}>
                                                                                        <FontAwesomeIcon icon={faIdCard} className="me-2" />
                                                                                        Informasi Masyarakat
                                                                                    </label>
                                                                                    <p className="mb-1"><strong>Nama:</strong> {item.society?.name}</p>
                                                                                    <p className="mb-1"><strong>NIK:</strong> {item.society?.id_card_number}</p>
                                                                                    <p className="mb-1">
                                                                                        <strong>Jenis Kelamin:</strong>{' '}
                                                                                        <FontAwesomeIcon icon={faVenusMars} className="me-1" />
                                                                                        {item.society?.gender}
                                                                                    </p>
                                                                                    <p className="mb-1"><strong>Tanggal Lahir:</strong> {item.society?.born_date}</p>
                                                                                    <p className="mb-0"><strong>Alamat:</strong> {item.society?.address}</p>
                                                                                </div>
                                                                            </div>

                                                                            <div className="col-md-6">
                                                                                <div className="p-3 rounded-3 bg-white" style={{ border: '1px solid #e2e8f0' }}>
                                                                                    <label className="fw-semibold mb-2" style={{ color: '#10b981', fontSize: '0.9rem' }}>
                                                                                        <FontAwesomeIcon icon={faSyringe} className="me-2" />
                                                                                        Detail Vaksinasi
                                                                                    </label>
                                                                                    <p className="mb-1"><strong>Vaksin:</strong> {item.vaccine?.name}</p>
                                                                                    <p className="mb-1"><strong>Dosis:</strong> {item.dose}</p>
                                                                                    <p className="mb-1"><strong>Tanggal:</strong> {item.date}</p>
                                                                                    <p className="mb-1"><strong>Dokter:</strong> {item.doctor?.name}</p>
                                                                                    <p className="mb-0"><strong>Officer:</strong> {item.officer?.name}</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-5">
                                            <p className="text-muted">Pilih tanggal untuk melihat antrian</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Verification Modal */}
                {showVerificationForm && selectedVaccination && (
                    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content" style={{ borderRadius: '16px', border: 'none' }}>
                                <div className="modal-header" style={{ backgroundColor: '#f0fdf4', borderRadius: '16px 16px 0 0' }}>
                                    <h5 className="modal-title fw-bold" style={{ color: '#047857' }}>
                                        <FontAwesomeIcon icon={faClipboardCheck} className="me-2" />
                                        {verificationForm.status === 'verified' ? 'Verifikasi Vaksinasi' : 'Tolak Vaksinasi'}
                                    </h5>
                                    <button 
                                        type="button" 
                                        className="btn-close"
                                        onClick={() => setShowVerificationForm(false)}
                                    ></button>
                                </div>
                                <div className="modal-body p-4">
                                    {verificationErrors.general && (
                                        <div className="alert alert-danger py-2 d-flex align-items-center">
                                            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                                            {verificationErrors.general}
                                        </div>
                                    )}

                                    <div className="mb-3 p-3 rounded-3" style={{ backgroundColor: '#f8fafc' }}>
                                        <p className="mb-1"><strong>Nama:</strong> {selectedVaccination.society?.name}</p>
                                        <p className="mb-1"><strong>Vaksin:</strong> {selectedVaccination.vaccine?.name}</p>
                                        <p className="mb-0"><strong>Dosis:</strong> {selectedVaccination.dose}</p>
                                    </div>

                                    <form onSubmit={submitVerification}>
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                <FontAwesomeIcon icon={faNotesMedical} className="me-2" style={{ color: '#8b5cf6' }} />
                                                Catatan (Opsional)
                                            </label>
                                            <textarea
                                                className="form-control"
                                                rows="3"
                                                placeholder="Tambahkan catatan verifikasi..."
                                                value={verificationForm.notes}
                                                onChange={(e) => setVerificationForm({...verificationForm, notes: e.target.value})}
                                                style={{ borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                            />
                                        </div>

                                        <div className="d-flex justify-content-end gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-light px-4"
                                                onClick={() => setShowVerificationForm(false)}
                                                style={{ borderRadius: '10px' }}
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn px-4 text-white"
                                                disabled={verificationLoading}
                                                style={{ 
                                                    borderRadius: '10px',
                                                    backgroundColor: verificationForm.status === 'verified' ? '#10b981' : '#ef4444',
                                                    border: 'none'
                                                }}
                                            >
                                                {verificationLoading ? (
                                                    <>
                                                        <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                                                        Memproses...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FontAwesomeIcon 
                                                            icon={verificationForm.status === 'verified' ? faCheck : faXmark} 
                                                            className="me-2" 
                                                        />
                                                        {verificationForm.status === 'verified' ? 'Verifikasi' : 'Tolak'}
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainPublic>
    );
}