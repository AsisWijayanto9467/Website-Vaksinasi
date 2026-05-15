// src/Pages/Officer/DashboardOfficer.jsx
import React, { useState, useEffect } from 'react';
import MainPublic from '../Layouts/MainPublic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUserNurse,
    faHospital,
    faUsers,
    faSyringe,
    faCalendarAlt,
    faClock,
    faMapMarkerAlt,
    faExclamationTriangle,
    faChevronDown,
    faChevronUp,
    faVial,
    faGlobeAsia,
    faBuilding,
    faChartPie,
    faListCheck,
    faBoxes,
    faShieldVirus,
    faFlask,
    faCircleCheck
} from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

export default function DashboardOfficer() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedPatientId, setExpandedPatientId] = useState(null);

    const getToken = () => {
        return localStorage.getItem('token');
    };

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

    useEffect(() => {
        fetchDashboard();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    const getGenderDisplay = (gender) => {
        switch (gender) {
            case 'male': return 'Laki-laki';
            case 'female': return 'Perempuan';
            default: return gender || '-';
        }
    };

    const togglePatientExpand = (id) => {
        setExpandedPatientId(expandedPatientId === id ? null : id);
    };

    const getUtilizationColor = (percentage) => {
        if (percentage >= 90) return '#ef4444';
        if (percentage >= 70) return '#f59e0b';
        return '#10b981';
    };

    // Get vaccine color based on name
    const getVaccineColor = (vaccineName) => {
        const name = vaccineName?.toLowerCase() || '';
        if (name.includes('sinovac')) return { bg: '#fef3c7', text: '#92400e', icon: faShieldVirus };
        if (name.includes('astrazeneca')) return { bg: '#dbeafe', text: '#1e40af', icon: faShieldVirus };
        if (name.includes('pfizer')) return { bg: '#d1fae5', text: '#047857', icon: faShieldVirus };
        if (name.includes('moderna')) return { bg: '#fee2e2', text: '#991b1b', icon: faShieldVirus };
        if (name.includes('sinopharm')) return { bg: '#ede9fe', text: '#5b21b6', icon: faShieldVirus };
        return { bg: '#f0fdf4', text: '#047857', icon: faFlask };
    };

    if (loading) {
        return (
            <MainPublic>
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted">Memuat dashboard officer...</p>
                    </div>
                </div>
            </MainPublic>
        );
    }

    if (error) {
        return (
            <MainPublic>
                <div className="container py-5">
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                        <div>{error}</div>
                        <button className="btn btn-outline-danger ms-3" onClick={fetchDashboard}>
                            Coba Lagi
                        </button>
                    </div>
                </div>
            </MainPublic>
        );
    }

    const { officer, spot, today_summary, available_vaccines, my_patients_today } = dashboardData || {};
    const utilizationPercentage = today_summary?.utilization_percentage || 0;
    const utilizationColor = getUtilizationColor(utilizationPercentage);

    return (
        <MainPublic>
            <div className="mx-4 my-2 py-4 py-md-5">
                {/* Welcome Section */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm" style={{ 
                            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
                            borderRadius: '16px',
                            color: 'white'
                        }}>
                            <div className="card-body p-4">
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                                    <div>
                                        <h4 className="mb-1 fw-bold">
                                            <FontAwesomeIcon icon={faUserNurse} className="me-2" />
                                            Dashboard Officer
                                        </h4>
                                        <p className="mb-0 opacity-75">
                                            Selamat datang, {officer?.name || 'Officer'}!
                                        </p>
                                        <div className="d-flex align-items-center gap-2 mt-2">
                                            <span className="badge bg-light text-primary px-3 py-1" style={{ fontSize: '0.85rem' }}>
                                                <FontAwesomeIcon icon={faHospital} className="me-1" />
                                                {spot?.name || '-'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-end mt-3 mt-md-0">
                                        <small className="opacity-75 d-block">
                                            <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                            {formatDate(today_summary?.date)}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="row mb-4 g-3">
                    <div className="col-md-3 col-6">
                        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                            <div className="card-body p-3">
                                <div className="d-flex align-items-center">
                                    <div className="d-flex align-items-center justify-content-center rounded-circle me-3"
                                         style={{ width: '50px', height: '50px', backgroundColor: '#dbeafe', flexShrink: 0 }}>
                                        <FontAwesomeIcon icon={faSyringe} style={{ fontSize: '20px', color: '#3b82f6' }} />
                                    </div>
                                    <div>
                                        <small className="text-muted">Total Vaksinasi</small>
                                        <h4 className="mb-0 fw-bold" style={{ color: '#3b82f6' }}>
                                            {today_summary?.total_vaccinations || 0}
                                        </h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3 col-6">
                        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                            <div className="card-body p-3">
                                <div className="d-flex align-items-center">
                                    <div className="d-flex align-items-center justify-content-center rounded-circle me-3"
                                         style={{ width: '50px', height: '50px', backgroundColor: '#d1fae5', flexShrink: 0 }}>
                                        <FontAwesomeIcon icon={faUserNurse} style={{ fontSize: '20px', color: '#10b981' }} />
                                    </div>
                                    <div>
                                        <small className="text-muted">Saya Tangani</small>
                                        <h4 className="mb-0 fw-bold" style={{ color: '#10b981' }}>
                                            {today_summary?.my_vaccinations || 0}
                                        </h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3 col-6">
                        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                            <div className="card-body p-3">
                                <div className="d-flex align-items-center">
                                    <div className="d-flex align-items-center justify-content-center rounded-circle me-3"
                                         style={{ width: '50px', height: '50px', backgroundColor: '#fef3c7', flexShrink: 0 }}>
                                        <FontAwesomeIcon icon={faUsers} style={{ fontSize: '20px', color: '#f59e0b' }} />
                                    </div>
                                    <div>
                                        <small className="text-muted">Sisa Kapasitas</small>
                                        <h4 className="mb-0 fw-bold" style={{ color: '#f59e0b' }}>
                                            {today_summary?.remaining_capacity || 0}
                                        </h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3 col-6">
                        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                            <div className="card-body p-3">
                                <div className="d-flex align-items-center">
                                    <div className="d-flex align-items-center justify-content-center rounded-circle me-3"
                                         style={{ width: '50px', height: '50px', backgroundColor: '#fee2e2', flexShrink: 0 }}>
                                        <FontAwesomeIcon icon={faChartPie} style={{ fontSize: '20px', color: '#ef4444' }} />
                                    </div>
                                    <div>
                                        <small className="text-muted">Utilisasi</small>
                                        <h4 className="mb-0 fw-bold" style={{ color: utilizationColor }}>
                                            {utilizationPercentage}%
                                        </h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Spot Info & Capacity Bar */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                            <div className="card-body p-4">
                                <h6 className="fw-bold mb-3" style={{ color: '#1e293b' }}>
                                    <FontAwesomeIcon icon={faBuilding} className="me-2" style={{ color: '#3b82f6' }} />
                                    Informasi Spot & Kapasitas
                                </h6>
                                
                                <div className="row g-3 mb-3">
                                    <div className="col-md-4">
                                        <div className="p-2 rounded-3" style={{ backgroundColor: '#f8fafc' }}>
                                            <small className="text-muted">
                                                <FontAwesomeIcon icon={faHospital} className="me-1" />
                                                Nama Spot
                                            </small>
                                            <p className="mb-0 fw-semibold" style={{ color: '#334155' }}>{spot?.name || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="p-2 rounded-3" style={{ backgroundColor: '#f8fafc' }}>
                                            <small className="text-muted">
                                                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                                                Alamat
                                            </small>
                                            <p className="mb-0 fw-semibold" style={{ color: '#334155' }}>{spot?.address || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="p-2 rounded-3" style={{ backgroundColor: '#f8fafc' }}>
                                            <small className="text-muted">
                                                <FontAwesomeIcon icon={faGlobeAsia} className="me-1" />
                                                Regional
                                            </small>
                                            <p className="mb-0 fw-semibold" style={{ color: '#334155' }}>
                                                {spot?.regional?.province || '-'} - {spot?.regional?.district || '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <small className="text-muted">Kapasitas Terpakai</small>
                                        <small className="fw-semibold" style={{ color: utilizationColor }}>
                                            {today_summary?.total_vaccinations || 0} / {spot?.capacity || 0}
                                        </small>
                                    </div>
                                    <div className="progress" style={{ height: '12px', borderRadius: '6px' }}>
                                        <div 
                                            className="progress-bar"
                                            style={{ 
                                                width: `${Math.min(utilizationPercentage, 100)}%`,
                                                backgroundColor: utilizationColor,
                                                transition: 'width 0.5s ease'
                                            }}
                                        />
                                    </div>
                                    <small className="text-muted mt-1 d-block">
                                        Sisa {today_summary?.remaining_capacity || 0} slot dari {spot?.capacity || 0} kapasitas
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Available Vaccines & My Patients */}
                <div className="row">
                    {/* Available Vaccines - DIPERBAIKI */}
                    <div className="col-lg-5 mb-4">
                        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                            <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h6 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
                                        <FontAwesomeIcon icon={faBoxes} className="me-2" style={{ color: '#8b5cf6' }} />
                                        Vaksin Tersedia
                                    </h6>
                                    {available_vaccines && available_vaccines.length > 0 && (
                                        <span className="badge px-3 py-2" style={{ 
                                            backgroundColor: '#ede9fe',
                                            color: '#5b21b6',
                                            borderRadius: '20px',
                                            fontWeight: '500'
                                        }}>
                                            {available_vaccines.length} Jenis
                                        </span>
                                    )}
                                </div>
                                <hr className="mt-3" />
                            </div>
                            <div className="card-body p-4">
                                {available_vaccines && available_vaccines.length > 0 ? (
                                    <div className="d-flex flex-column gap-3">
                                        {available_vaccines.map((vaccine, index) => {
                                            const vaccineStyle = getVaccineColor(vaccine.name);
                                            return (
                                                <div 
                                                    key={index}
                                                    className="p-3 rounded-3 d-flex align-items-center gap-3"
                                                    style={{
                                                        backgroundColor: vaccineStyle.bg,
                                                        border: `1px solid ${vaccineStyle.text}20`,
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'translateX(5px)';
                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'translateX(0)';
                                                        e.currentTarget.style.boxShadow = 'none';
                                                    }}
                                                >
                                                    <div className="d-flex align-items-center justify-content-center rounded-circle"
                                                         style={{
                                                             width: '45px',
                                                             height: '45px',
                                                             backgroundColor: '#ffffff',
                                                             flexShrink: 0,
                                                             boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
                                                         }}>
                                                        <FontAwesomeIcon 
                                                            icon={vaccineStyle.icon} 
                                                            style={{ fontSize: '20px', color: vaccineStyle.text }} 
                                                        />
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <div className="fw-semibold" style={{ color: vaccineStyle.text, fontSize: '0.95rem' }}>
                                                            {vaccine.name}
                                                        </div>
                                                        <small style={{ color: vaccineStyle.text, opacity: 0.7 }}>
                                                            Tersedia untuk vaksinasi
                                                        </small>
                                                    </div>
                                                    <div className="d-flex align-items-center justify-content-center rounded-circle"
                                                         style={{
                                                             width: '28px',
                                                             height: '28px',
                                                             backgroundColor: '#ffffff',
                                                             flexShrink: 0
                                                         }}>
                                                        <FontAwesomeIcon 
                                                            icon={faCircleCheck} 
                                                            style={{ fontSize: '14px', color: '#10b981' }} 
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-5">
                                        <div className="mb-3">
                                            <div className="d-inline-flex align-items-center justify-content-center rounded-circle"
                                                 style={{
                                                     width: '80px',
                                                     height: '80px',
                                                     backgroundColor: '#f5f3ff',
                                                     border: '2px dashed #c4b5fd'
                                                 }}>
                                                <FontAwesomeIcon 
                                                    icon={faBoxes} 
                                                    style={{ fontSize: '32px', color: '#8b5cf6' }} 
                                                />
                                            </div>
                                        </div>
                                        <h6 style={{ color: '#64748b' }}>Tidak ada vaksin tersedia</h6>
                                        <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                                            Belum ada vaksin yang terdaftar di spot ini
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* My Patients Today */}
                    <div className="col-lg-7">
                        <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                            <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h6 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
                                        <FontAwesomeIcon icon={faListCheck} className="me-2" style={{ color: '#3b82f6' }} />
                                        Pasien Saya Hari Ini
                                    </h6>
                                    {my_patients_today && my_patients_today.length > 0 && (
                                        <span className="badge px-3 py-2" style={{ 
                                            backgroundColor: '#dbeafe',
                                            color: '#1e40af',
                                            borderRadius: '20px',
                                            fontWeight: '500'
                                        }}>
                                            {my_patients_today.length} Pasien
                                        </span>
                                    )}
                                </div>
                                <hr className="mt-3" />
                            </div>
                            <div className="card-body p-4">
                                {my_patients_today && my_patients_today.length > 0 ? (
                                    <div className="d-flex flex-column gap-2">
                                        {my_patients_today.map((patient) => {
                                            const isExpanded = expandedPatientId === patient.id;
                                            
                                            return (
                                                <div 
                                                    key={patient.id}
                                                    className="rounded-3"
                                                    style={{
                                                        border: '1px solid #93c5fd',
                                                        backgroundColor: '#ffffff',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    <div 
                                                        className="p-3 d-flex justify-content-between align-items-center"
                                                        onClick={() => togglePatientExpand(patient.id)}
                                                        style={{ cursor: 'pointer', userSelect: 'none' }}
                                                    >
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className="d-flex align-items-center justify-content-center rounded-circle"
                                                                 style={{
                                                                     width: '40px',
                                                                     height: '40px',
                                                                     backgroundColor: '#dbeafe',
                                                                     flexShrink: 0
                                                                 }}>
                                                                <span className="fw-bold" style={{ color: '#3b82f6', fontSize: '1rem' }}>
                                                                    {patient.queue_number}
                                                                </span>
                                                            </div>
                                                            
                                                            <div>
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <span className="fw-semibold" style={{ color: '#1e293b', fontSize: '0.9rem' }}>
                                                                        {patient.society?.name || '-'}
                                                                    </span>
                                                                    <span className="badge px-2 py-1" style={{
                                                                        backgroundColor: patient.dose === 1 ? '#dbeafe' : '#d1fae5',
                                                                        color: patient.dose === 1 ? '#3b82f6' : '#047857',
                                                                        borderRadius: '6px',
                                                                        fontSize: '0.7rem'
                                                                    }}>
                                                                        Dosis {patient.dose}
                                                                    </span>
                                                                </div>
                                                                <div className="d-flex align-items-center gap-2 mt-1">
                                                                    <small className="text-muted">
                                                                        <FontAwesomeIcon icon={faClock} className="me-1" />
                                                                        {patient.registration_time}
                                                                    </small>
                                                                    <small className="text-muted">
                                                                        <FontAwesomeIcon icon={faVial} className="me-1" />
                                                                        {patient.vaccine?.name || '-'}
                                                                    </small>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <FontAwesomeIcon 
                                                            icon={isExpanded ? faChevronUp : faChevronDown} 
                                                            style={{ color: '#64748b', fontSize: '12px' }} 
                                                        />
                                                    </div>

                                                    {isExpanded && (
                                                        <div style={{
                                                            backgroundColor: '#f8fafc',
                                                            borderTop: '1px solid #93c5fd',
                                                            padding: '15px 20px',
                                                            animation: 'fadeIn 0.3s ease'
                                                        }}>
                                                            <div className="row g-2">
                                                                <div className="col-6">
                                                                    <small className="text-muted">NIK</small>
                                                                    <p className="mb-0 fw-semibold small">{patient.society?.id_card_number || '-'}</p>
                                                                </div>
                                                                <div className="col-6">
                                                                    <small className="text-muted">Gender</small>
                                                                    <p className="mb-0 fw-semibold small">
                                                                        {getGenderDisplay(patient.society?.gender)}
                                                                    </p>
                                                                </div>
                                                                <div className="col-6">
                                                                    <small className="text-muted">Vaksin</small>
                                                                    <p className="mb-0 fw-semibold small">{patient.vaccine?.name || '-'}</p>
                                                                </div>
                                                                <div className="col-6">
                                                                    <small className="text-muted">Dosis</small>
                                                                    <p className="mb-0 fw-semibold small">Dosis {patient.dose}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-5">
                                        <div className="mb-3">
                                            <div className="d-inline-flex align-items-center justify-content-center rounded-circle"
                                                 style={{
                                                     width: '70px',
                                                     height: '70px',
                                                     backgroundColor: '#eff6ff',
                                                     border: '2px dashed #93c5fd'
                                                 }}>
                                                <FontAwesomeIcon 
                                                    icon={faUserNurse} 
                                                    style={{ fontSize: '28px', color: '#3b82f6' }} 
                                                />
                                            </div>
                                        </div>
                                        <h6 style={{ color: '#64748b' }}>Belum ada pasien</h6>
                                        <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                                            Anda belum memiliki pasien yang ditugaskan hari ini
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </MainPublic>
    );
}