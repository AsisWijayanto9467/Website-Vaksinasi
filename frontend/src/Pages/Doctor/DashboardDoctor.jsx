// src/Pages/Doctor/DashboardDoctor.jsx
import React, { useState, useEffect } from 'react';
import MainPublic from '../Layouts/MainPublic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSyringe,
    faClipboardCheck,
    faUsers,
    faCalendarAlt,
    faClock,
    faCheckCircle,
    faTimesCircle,
    faHourglassHalf,
    faHospital,
    faExclamationTriangle,
    faSpinner,
    faClipboardList,
    faIdCard,
    faVenusMars,
    faMapMarkerAlt,
    faUserMd,
    faSync,
    faUserCheck,
} from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

export default function DashboardDoctor() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    
    // Dashboard data
    const [dashboardData, setDashboardData] = useState(null);
    
    // Today vaccinations data
    const [todayVaccinations, setTodayVaccinations] = useState(null);
    const [vaccinationDate, setVaccinationDate] = useState(new Date().toISOString().split('T')[0]);
    const [vaccinationLoading, setVaccinationLoading] = useState(false);

    const getToken = () => {
        return localStorage.getItem('token');
    };

    // Fetch dashboard data
    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = getToken();
            const response = await api.get(`/doctor/dashboard?token=${token}`);
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

    // Fetch today vaccinations
    const fetchTodayVaccinations = async () => {
        try {
            setVaccinationLoading(true);
            const token = getToken();
            const response = await api.get(`/doctor/vaccinations/today?token=${token}`, {
                params: { date: vaccinationDate }
            });
            if (response.data) {
                setTodayVaccinations(response.data);
            }
        } catch (err) {
            console.error('Error fetching vaccinations:', err);
        } finally {
            setVaccinationLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    useEffect(() => {
        fetchTodayVaccinations();
    }, [vaccinationDate]);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const options = { 
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        const options = { 
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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
                        <p className="text-muted">Memuat dashboard doctor...</p>
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
                                            <FontAwesomeIcon icon={faUserMd} className="me-2" />
                                            Dashboard Doctor
                                        </h4>
                                        <p className="mb-0 opacity-75">
                                            {dashboardData?.doctor?.name ? `Selamat datang, Dr. ${dashboardData.doctor.name}` : 'Kelola konsultasi & vaksinasi'}
                                        </p>
                                        {dashboardData?.doctor?.spot && (
                                            <small className="opacity-75">
                                                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                                                {dashboardData.doctor.spot.name} - {dashboardData.doctor.spot.address}
                                            </small>
                                        )}
                                    </div>
                                    <button 
                                        className="btn btn-light mt-3 mt-md-0"
                                        onClick={() => {
                                            fetchDashboard();
                                            fetchTodayVaccinations();
                                        }}
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

                {/* Statistics Cards */}
                <div className="row mb-4">
                    <div className="col-md-4 col-6 mb-3">
                        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px', backgroundColor: '#fef3c7' }}>
                            <div className="card-body text-center p-3">
                                <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                                     style={{ width: '50px', height: '50px', backgroundColor: '#fde68a' }}>
                                    <FontAwesomeIcon icon={faHourglassHalf} style={{ fontSize: '20px', color: '#b45309' }} />
                                </div>
                                <h3 className="fw-bold mb-0" style={{ color: '#b45309' }}>
                                    {dashboardData?.statistics?.pending_consultations || 0}
                                </h3>
                                <small className="text-muted">Konsultasi Pending</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 col-6 mb-3">
                        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px', backgroundColor: '#eff6ff' }}>
                            <div className="card-body text-center p-3">
                                <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                                     style={{ width: '50px', height: '50px', backgroundColor: '#dbeafe' }}>
                                    <FontAwesomeIcon icon={faSyringe} style={{ fontSize: '20px', color: '#1d4ed8' }} />
                                </div>
                                <h3 className="fw-bold mb-0" style={{ color: '#1d4ed8' }}>
                                    {dashboardData?.statistics?.today_vaccinations || 0}
                                </h3>
                                <small className="text-muted">Vaksinasi Hari Ini</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 col-6 mb-3">
                        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px', backgroundColor: '#f0fdf4' }}>
                            <div className="card-body text-center p-3">
                                <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                                     style={{ width: '50px', height: '50px', backgroundColor: '#d1fae5' }}>
                                    <FontAwesomeIcon icon={faClipboardCheck} style={{ fontSize: '20px', color: '#047857' }} />
                                </div>
                                <h3 className="fw-bold mb-0" style={{ color: '#047857' }}>
                                    {dashboardData?.statistics?.total_handled_consultations || 0}
                                </h3>
                                <small className="text-muted">Total Ditangani</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Second Row Statistics */}
                <div className="row mb-4">
                    <div className="col-md-3 col-6 mb-3">
                        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px', backgroundColor: '#f0fdf4' }}>
                            <div className="card-body text-center p-3">
                                <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                                     style={{ width: '50px', height: '50px', backgroundColor: '#d1fae5' }}>
                                    <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: '20px', color: '#047857' }} />
                                </div>
                                <h3 className="fw-bold mb-0" style={{ color: '#047857' }}>
                                    {dashboardData?.statistics?.accepted_consultations || 0}
                                </h3>
                                <small className="text-muted">Diterima</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 col-6 mb-3">
                        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px', backgroundColor: '#fee2e2' }}>
                            <div className="card-body text-center p-3">
                                <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                                     style={{ width: '50px', height: '50px', backgroundColor: '#fecaca' }}>
                                    <FontAwesomeIcon icon={faTimesCircle} style={{ fontSize: '20px', color: '#dc2626' }} />
                                </div>
                                <h3 className="fw-bold mb-0" style={{ color: '#dc2626' }}>
                                    {dashboardData?.statistics?.declined_consultations || 0}
                                </h3>
                                <small className="text-muted">Ditolak</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 col-6 mb-3">
                        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px', backgroundColor: '#fef3c7' }}>
                            <div className="card-body text-center p-3">
                                <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                                     style={{ width: '50px', height: '50px', backgroundColor: '#fde68a' }}>
                                    <FontAwesomeIcon icon={faHospital} style={{ fontSize: '20px', color: '#b45309' }} />
                                </div>
                                <h3 className="fw-bold mb-0" style={{ color: '#b45309' }}>
                                    {dashboardData?.statistics?.spot_pending_consultations || 0}
                                </h3>
                                <small className="text-muted">Pending di Spot</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 col-6 mb-3">
                        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px', backgroundColor: '#eff6ff' }}>
                            <div className="card-body text-center p-3">
                                <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                                     style={{ width: '50px', height: '50px', backgroundColor: '#dbeafe' }}>
                                    <FontAwesomeIcon icon={faUsers} style={{ fontSize: '20px', color: '#1d4ed8' }} />
                                </div>
                                <h3 className="fw-bold mb-0" style={{ color: '#1d4ed8' }}>
                                    {dashboardData?.doctor?.spot?.capacity || 0}
                                </h3>
                                <small className="text-muted">Kapasitas Spot</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Today Vaccinations Section */}
                <div className="row">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                            <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
                                        <FontAwesomeIcon icon={faClipboardList} className="me-2" style={{ color: '#10b981' }} />
                                        Vaksinasi Hari Ini
                                    </h5>
                                    <div className="d-flex align-items-center gap-2">
                                        <FontAwesomeIcon icon={faCalendarAlt} style={{ color: '#64748b' }} />
                                        <input
                                            type="date"
                                            className="form-control form-control-sm"
                                            value={vaccinationDate}
                                            onChange={(e) => setVaccinationDate(e.target.value)}
                                            style={{ borderRadius: '8px', width: 'auto' }}
                                        />
                                    </div>
                                </div>
                                <hr className="mt-3" />
                            </div>
                            <div className="card-body p-4">
                                {vaccinationLoading ? (
                                    <div className="text-center py-5">
                                        <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: '32px', color: '#10b981' }} />
                                        <p className="mt-2 text-muted">Memuat data vaksinasi...</p>
                                    </div>
                                ) : todayVaccinations ? (
                                    <>
                                        {/* Total */}
                                        <div className="d-flex align-items-center gap-3 mb-4">
                                            <div className="p-3 rounded-3" style={{ backgroundColor: '#d1fae5' }}>
                                                <strong style={{ color: '#047857', fontSize: '1.2rem' }}>
                                                    Total: {todayVaccinations.total || 0}
                                                </strong>
                                            </div>
                                            <small className="text-muted">
                                                <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                                {formatDate(todayVaccinations.date)}
                                            </small>
                                        </div>

                                        {todayVaccinations.vaccinations?.length === 0 ? (
                                            <div className="text-center py-5">
                                                <div className="mb-3">
                                                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle"
                                                         style={{ width: '80px', height: '80px', backgroundColor: '#f0fdf4', border: '2px dashed #6ee7b7' }}>
                                                        <FontAwesomeIcon icon={faSyringe} style={{ fontSize: '32px', color: '#10b981' }} />
                                                    </div>
                                                </div>
                                                <h6 style={{ color: '#64748b' }}>Belum ada data vaksinasi untuk tanggal ini</h6>
                                            </div>
                                        ) : (
                                            <div className="table-responsive">
                                                <table className="table table-hover align-middle">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th style={{ borderRadius: '8px 0 0 0' }}>No</th>
                                                            <th>Pasien</th>
                                                            <th>Vaksin</th>
                                                            <th>Dosis</th>
                                                            <th>Petugas</th>
                                                            <th style={{ borderRadius: '0 8px 0 0' }}>Waktu</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {todayVaccinations.vaccinations?.map((vac, index) => (
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
                                                                        <br />
                                                                        <small className="text-muted">
                                                                            <FontAwesomeIcon icon={faVenusMars} className="me-1" />
                                                                            {vac.society?.gender}
                                                                        </small>
                                                                    </div>
                                                                </td>
                                                                <td>{vac.vaccine?.name || '-'}</td>
                                                                <td>
                                                                    <span className="badge" style={{ 
                                                                        backgroundColor: vac.dose === 1 ? '#dbeafe' : '#d1fae5',
                                                                        color: vac.dose === 1 ? '#1e40af' : '#047857'
                                                                    }}>
                                                                        Dosis {vac.dose}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <div>
                                                                        <FontAwesomeIcon icon={faUserCheck} className="me-1" style={{ color: '#10b981', fontSize: '12px' }} />
                                                                        {vac.officer?.name || '-'}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <small className="text-muted">
                                                                        <FontAwesomeIcon icon={faClock} className="me-1" />
                                                                        {formatDateTime(vac.created_at)}
                                                                    </small>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-5">
                                        <p className="text-muted">Pilih tanggal untuk melihat vaksinasi</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainPublic>
    );
}