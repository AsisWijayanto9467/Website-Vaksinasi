// src/Pages/Konsultation.jsx
import React, { useState, useEffect } from 'react';
import MainPublic from '../Layouts/MainPublic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUserMd,
    faClipboardList,
    faClock,
    faCheckCircle,
    faTimesCircle,
    faHourglassHalf,
    faExclamationTriangle,
    faChevronDown,
    faChevronUp,
    faSpinner,
    faIdCard,
    faVenusMars,
    faMapMarkerAlt,
    faCheck,
    faXmark,
    faNotesMedical,
    faSync,
    faHistory,
    faDisease,
    faHeartbeat,
    faUserCheck,
    faCalendarCheck,
    faStethoscope,
    faBirthdayCake
} from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

export default function Konsultation() {
    const [activeTab, setActiveTab] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    
    // Consultations data
    const [consultations, setConsultations] = useState([]);
    const [totalConsultations, setTotalConsultations] = useState(0);
    
    // Expanded consultation
    const [expandedId, setExpandedId] = useState(null);
    
    // Handle consultation form
    const [showHandleForm, setShowHandleForm] = useState(false);
    const [handleLoading, setHandleLoading] = useState(false);
    const [selectedConsultation, setSelectedConsultation] = useState(null);
    const [handleForm, setHandleForm] = useState({
        status: 'accepted',
        doctor_notes: ''
    });
    const [handleErrors, setHandleErrors] = useState({});

    const getToken = () => {
        return localStorage.getItem('token');
    };

    const fetchConsultations = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = getToken();
            const response = await api.get(`/doctor/consultations/pending?token=${token}`);
            
            if (response.data && response.data.consultations) {
                setConsultations(response.data.consultations);
                setTotalConsultations(response.data.total);
            }
        } catch (err) {
            console.error('Error fetching consultations:', err);
            if (err.response?.status === 404) {
                setConsultations([]);
                setTotalConsultations(0);
                setError('Tidak ada konsultasi yang menunggu');
            } else {
                setError('Gagal memuat data konsultasi. Silakan coba lagi.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'pending') {
            fetchConsultations();
        }
    }, [activeTab]);

    // Handle consultation submit
    const handleConsultationAction = (consultation, status) => {
        setSelectedConsultation(consultation);
        setHandleForm({
            status: status,
            doctor_notes: ''
        });
        setShowHandleForm(true);
        setHandleErrors({});
    };

    const submitHandleConsultation = async (e) => {
        e.preventDefault();
        
        if (!handleForm.doctor_notes.trim()) {
            setHandleErrors({ doctor_notes: 'Catatan dokter harus diisi' });
            return;
        }

        try {
            setHandleLoading(true);
            setHandleErrors({});
            
            const token = getToken();
            await api.put(`/doctor/consultations/${selectedConsultation.id}?token=${token}`, handleForm);
            
            setSuccessMessage(`Konsultasi berhasil ${handleForm.status === 'accepted' ? 'diterima' : 'ditolak'}`);
            setShowHandleForm(false);
            setHandleForm({ status: 'accepted', doctor_notes: '' });
            setSelectedConsultation(null);
            
            // Refresh data
            await fetchConsultations();
            
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err) {
            console.error('Error handling consultation:', err);
            if (err.response?.data?.errors) {
                setHandleErrors(err.response.data.errors);
            } else if (err.response?.data?.message) {
                setHandleErrors({ general: err.response.data.message });
            } else {
                setHandleErrors({ general: 'Gagal memproses konsultasi' });
            }
        } finally {
            setHandleLoading(false);
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

    const calculateAge = (bornDate) => {
        if (!bornDate) return '-';
        const birth = new Date(bornDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
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
                        <p className="text-muted">Memuat data konsultasi...</p>
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
                {error && consultations.length === 0 && (
                    <div className="alert alert-info alert-dismissible fade show d-flex align-items-center" role="alert">
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
                                            <FontAwesomeIcon icon={faStethoscope} className="me-2" />
                                            Manajemen Konsultasi
                                        </h4>
                                        <p className="mb-0 opacity-75">
                                            Kelola konsultasi pasien yang masuk
                                        </p>
                                    </div>
                                    <button 
                                        className="btn btn-light mt-3 mt-md-0"
                                        onClick={fetchConsultations}
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
                                            className={`nav-link ${activeTab === 'pending' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('pending')}
                                            style={{
                                                borderRadius: '10px',
                                                backgroundColor: activeTab === 'pending' ? '#10b981' : 'transparent',
                                                color: activeTab === 'pending' ? 'white' : '#64748b',
                                                fontWeight: '500',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faHourglassHalf} className="me-2" />
                                            Menunggu
                                            {totalConsultations > 0 && (
                                                <span className="badge ms-2" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
                                                    {totalConsultations}
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('history')}
                                            style={{
                                                borderRadius: '10px',
                                                backgroundColor: activeTab === 'history' ? '#10b981' : 'transparent',
                                                color: activeTab === 'history' ? 'white' : '#64748b',
                                                fontWeight: '500',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faHistory} className="me-2" />
                                            Riwayat Konsultasi
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending Tab Content */}
                {activeTab === 'pending' && (
                    <>
                        {/* Statistics Card */}
                        {consultations.length > 0 && (
                            <div className="row mb-4">
                                <div className="col-12">
                                    <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                                        <div className="card-body p-4">
                                            <div className="row g-3">
                                                <div className="col-md-3 col-6">
                                                    <div className="p-3 rounded-3 text-center" style={{ backgroundColor: '#fef3c7' }}>
                                                        <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                                                             style={{ width: '45px', height: '45px', backgroundColor: '#fde68a' }}>
                                                            <FontAwesomeIcon icon={faHourglassHalf} style={{ fontSize: '18px', color: '#b45309' }} />
                                                        </div>
                                                        <h4 className="fw-bold mb-0" style={{ color: '#b45309' }}>{totalConsultations}</h4>
                                                        <small className="text-muted">Total Menunggu</small>
                                                    </div>
                                                </div>
                                                <div className="col-md-3 col-6">
                                                    <div className="p-3 rounded-3 text-center" style={{ backgroundColor: '#f0fdf4' }}>
                                                        <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                                                             style={{ width: '45px', height: '45px', backgroundColor: '#d1fae5' }}>
                                                            <FontAwesomeIcon icon={faCalendarCheck} style={{ fontSize: '18px', color: '#047857' }} />
                                                        </div>
                                                        <h4 className="fw-bold mb-0" style={{ color: '#047857' }}>
                                                            {consultations.filter(c => new Date(c.created_at).toDateString() === new Date().toDateString()).length}
                                                        </h4>
                                                        <small className="text-muted">Hari Ini</small>
                                                    </div>
                                                </div>
                                                <div className="col-md-3 col-6">
                                                    <div className="p-3 rounded-3 text-center" style={{ backgroundColor: '#eff6ff' }}>
                                                        <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                                                             style={{ width: '45px', height: '45px', backgroundColor: '#dbeafe' }}>
                                                            <FontAwesomeIcon icon={faVenusMars} style={{ fontSize: '18px', color: '#1d4ed8' }} />
                                                        </div>
                                                        <h4 className="fw-bold mb-0" style={{ color: '#1d4ed8' }}>
                                                            {consultations.filter(c => c.society?.gender === 'male').length}
                                                        </h4>
                                                        <small className="text-muted">Laki-laki</small>
                                                    </div>
                                                </div>
                                                <div className="col-md-3 col-6">
                                                    <div className="p-3 rounded-3 text-center" style={{ backgroundColor: '#fdf2f8' }}>
                                                        <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                                                             style={{ width: '45px', height: '45px', backgroundColor: '#fce7f3' }}>
                                                            <FontAwesomeIcon icon={faVenusMars} style={{ fontSize: '18px', color: '#be185d' }} />
                                                        </div>
                                                        <h4 className="fw-bold mb-0" style={{ color: '#be185d' }}>
                                                            {consultations.filter(c => c.society?.gender === 'female').length}
                                                        </h4>
                                                        <small className="text-muted">Perempuan</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Consultation List */}
                        <div className="row">
                            <div className="col-12">
                                <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                                    <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
                                                <FontAwesomeIcon icon={faClipboardList} className="me-2" style={{ color: '#10b981' }} />
                                                Daftar Konsultasi Masuk
                                            </h5>
                                            {consultations.length > 0 && (
                                                <small className="text-muted">
                                                    <FontAwesomeIcon icon={faClock} className="me-1" />
                                                    Terakhir diperbarui: {new Date().toLocaleTimeString('id-ID')}
                                                </small>
                                            )}
                                        </div>
                                        <hr className="mt-3" />
                                    </div>
                                    <div className="card-body p-4">
                                        {consultations.length === 0 ? (
                                            <div className="text-center py-5">
                                                <div className="mb-3">
                                                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle"
                                                         style={{ width: '80px', height: '80px', backgroundColor: '#f0fdf4', border: '2px dashed #6ee7b7' }}>
                                                        <FontAwesomeIcon icon={faClipboardList} style={{ fontSize: '32px', color: '#10b981' }} />
                                                    </div>
                                                </div>
                                                <h6 style={{ color: '#64748b' }}>Tidak ada konsultasi yang menunggu</h6>
                                                <p className="text-muted small">Semua konsultasi telah ditangani</p>
                                            </div>
                                        ) : (
                                            <div className="d-flex flex-column gap-3">
                                                {consultations.map((consultation, index) => {
                                                    const isExpanded = expandedId === consultation.id;
                                                    
                                                    return (
                                                        <div key={consultation.id}
                                                            className="rounded-3"
                                                            style={{
                                                                border: '1px solid #e2e8f0',
                                                                backgroundColor: '#ffffff',
                                                                overflow: 'hidden',
                                                                transition: 'all 0.3s ease'
                                                            }}
                                                        >
                                                            {/* Consultation Header */}
                                                            <div 
                                                                className="p-3 d-flex justify-content-between align-items-center"
                                                                onClick={() => setExpandedId(isExpanded ? null : consultation.id)}
                                                                style={{ cursor: 'pointer', userSelect: 'none' }}
                                                            >
                                                                <div className="d-flex align-items-center gap-3">
                                                                    {/* Queue Number */}
                                                                    <div className="d-flex align-items-center justify-content-center rounded-circle"
                                                                         style={{
                                                                             width: '50px',
                                                                             height: '50px',
                                                                             backgroundColor: '#fef3c7',
                                                                             flexShrink: 0
                                                                         }}>
                                                                        <strong style={{ 
                                                                            color: '#b45309',
                                                                            fontSize: '1.1rem'
                                                                        }}>
                                                                            {index + 1}
                                                                        </strong>
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <strong style={{ color: '#1e293b' }}>{consultation.society?.name}</strong>
                                                                        <div className="d-flex align-items-center gap-2 mt-1">
                                                                            <small className="text-muted">
                                                                                <FontAwesomeIcon icon={faIdCard} className="me-1" />
                                                                                {consultation.society?.id_card_number}
                                                                            </small>
                                                                            <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
                                                                                <FontAwesomeIcon icon={faHourglassHalf} className="me-1" />
                                                                                Menunggu
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="d-flex align-items-center gap-2">
                                                                    <small className="text-muted d-none d-md-block">
                                                                        <FontAwesomeIcon icon={faClock} className="me-1" />
                                                                        {formatDateShort(consultation.created_at)}
                                                                    </small>
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
                                                                    borderTop: '1px solid #e2e8f0',
                                                                    padding: '20px'
                                                                }}>
                                                                    <div className="row g-3">
                                                                        {/* Patient Information */}
                                                                        <div className="col-md-6">
                                                                            <div className="p-3 rounded-3 bg-white" style={{ border: '1px solid #e2e8f0' }}>
                                                                                <label className="fw-semibold mb-3" style={{ color: '#8b5cf6', fontSize: '0.9rem' }}>
                                                                                    <FontAwesomeIcon icon={faUserCheck} className="me-2" />
                                                                                    Informasi Pasien
                                                                                </label>
                                                                                
                                                                                <div className="d-flex align-items-center mb-3">
                                                                                    <div className="d-flex align-items-center justify-content-center rounded-circle me-3"
                                                                                         style={{
                                                                                             width: '60px',
                                                                                             height: '60px',
                                                                                             backgroundColor: '#f0fdf4',
                                                                                             border: '2px solid #6ee7b7'
                                                                                         }}>
                                                                                        <FontAwesomeIcon icon={faUserMd} style={{ fontSize: '24px', color: '#10b981' }} />
                                                                                    </div>
                                                                                    <div>
                                                                                        <h6 className="mb-1 fw-bold">{consultation.society?.name}</h6>
                                                                                        <span className="badge" style={{
                                                                                            backgroundColor: consultation.society?.gender === 'male' ? '#dbeafe' : '#fce7f3',
                                                                                            color: consultation.society?.gender === 'male' ? '#1e40af' : '#be185d'
                                                                                        }}>
                                                                                            <FontAwesomeIcon icon={faVenusMars} className="me-1" />
                                                                                            {consultation.society?.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="mb-2">
                                                                                    <small className="text-muted d-block">
                                                                                        <FontAwesomeIcon icon={faIdCard} className="me-2" style={{ width: '16px' }} />
                                                                                        NIK
                                                                                    </small>
                                                                                    <span className="fw-semibold">{consultation.society?.id_card_number}</span>
                                                                                </div>

                                                                                <div className="mb-2">
                                                                                    <small className="text-muted d-block">
                                                                                        <FontAwesomeIcon icon={faBirthdayCake} className="me-2" style={{ width: '16px' }} />
                                                                                        Tanggal Lahir / Usia
                                                                                    </small>
                                                                                    <span className="fw-semibold">
                                                                                        {formatDateShort(consultation.society?.born_date)} 
                                                                                        <span className="text-muted ms-1">({calculateAge(consultation.society?.born_date)} tahun)</span>
                                                                                    </span>
                                                                                </div>

                                                                                <div className="mb-0">
                                                                                    <small className="text-muted d-block">
                                                                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" style={{ width: '16px' }} />
                                                                                        Alamat
                                                                                    </small>
                                                                                    <span className="fw-semibold">{consultation.society?.address}</span>
                                                                                    {consultation.society?.regional && (
                                                                                        <div className="mt-1">
                                                                                            <span className="badge" style={{ backgroundColor: '#f0fdf4', color: '#047857' }}>
                                                                                                {consultation.society.regional.district}, {consultation.society.regional.province}
                                                                                            </span>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Medical Information */}
                                                                        <div className="col-md-6">
                                                                            <div className="p-3 rounded-3 bg-white mb-3" style={{ border: '1px solid #e2e8f0' }}>
                                                                                <label className="fw-semibold mb-3" style={{ color: '#ef4444', fontSize: '0.9rem' }}>
                                                                                    <FontAwesomeIcon icon={faDisease} className="me-2" />
                                                                                    Riwayat Penyakit
                                                                                </label>
                                                                                <div className="p-3 rounded-3" style={{ backgroundColor: '#fef2f2' }}>
                                                                                    <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                                                                                        {consultation.disease_history || 'Tidak ada riwayat penyakit'}
                                                                                    </p>
                                                                                </div>
                                                                            </div>

                                                                            <div className="p-3 rounded-3 bg-white" style={{ border: '1px solid #e2e8f0' }}>
                                                                                <label className="fw-semibold mb-3" style={{ color: '#f59e0b', fontSize: '0.9rem' }}>
                                                                                    <FontAwesomeIcon icon={faHeartbeat} className="me-2" />
                                                                                    Gejala Saat Ini
                                                                                </label>
                                                                                <div className="p-3 rounded-3" style={{ backgroundColor: '#fffbeb' }}>
                                                                                    <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                                                                                        {consultation.current_symptoms || 'Tidak ada gejala'}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Action Buttons */}
                                                                    <div className="row mt-3">
                                                                        <div className="col-12">
                                                                            <div className="d-flex justify-content-end gap-2">
                                                                                <button
                                                                                    className="btn btn-lg text-white"
                                                                                    onClick={() => handleConsultationAction(consultation, 'declined')}
                                                                                    style={{ 
                                                                                        backgroundColor: '#ef4444', 
                                                                                        borderRadius: '10px',
                                                                                        minWidth: '140px'
                                                                                    }}
                                                                                >
                                                                                    <FontAwesomeIcon icon={faXmark} className="me-2" />
                                                                                    Tolak
                                                                                </button>
                                                                                <button
                                                                                    className="btn btn-lg text-white"
                                                                                    onClick={() => handleConsultationAction(consultation, 'accepted')}
                                                                                    style={{ 
                                                                                        backgroundColor: '#10b981', 
                                                                                        borderRadius: '10px',
                                                                                        minWidth: '140px'
                                                                                    }}
                                                                                >
                                                                                    <FontAwesomeIcon icon={faCheck} className="me-2" />
                                                                                    Terima
                                                                                </button>
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
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* History Tab Content */}
                {activeTab === 'history' && (
                    <div className="row">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                                <div className="card-body p-5 text-center">
                                    <div className="mb-3">
                                        <div className="d-inline-flex align-items-center justify-content-center rounded-circle"
                                             style={{ width: '80px', height: '80px', backgroundColor: '#f0fdf4', border: '2px dashed #6ee7b7' }}>
                                            <FontAwesomeIcon icon={faHistory} style={{ fontSize: '32px', color: '#10b981' }} />
                                        </div>
                                    </div>
                                    <h6 style={{ color: '#64748b' }}>Riwayat Konsultasi</h6>
                                    <p className="text-muted small">Fitur ini akan segera tersedia</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Handle Consultation Modal */}
                {showHandleForm && selectedConsultation && (
                    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content" style={{ borderRadius: '16px', border: 'none' }}>
                                <div className="modal-header" style={{ 
                                    backgroundColor: handleForm.status === 'accepted' ? '#f0fdf4' : '#fef2f2', 
                                    borderRadius: '16px 16px 0 0' 
                                }}>
                                    <h5 className="modal-title fw-bold" style={{ color: handleForm.status === 'accepted' ? '#047857' : '#dc2626' }}>
                                        <FontAwesomeIcon 
                                            icon={handleForm.status === 'accepted' ? faCheckCircle : faTimesCircle} 
                                            className="me-2" 
                                        />
                                        {handleForm.status === 'accepted' ? 'Terima Konsultasi' : 'Tolak Konsultasi'}
                                    </h5>
                                    <button 
                                        type="button" 
                                        className="btn-close"
                                        onClick={() => setShowHandleForm(false)}
                                    ></button>
                                </div>
                                <div className="modal-body p-4">
                                    {handleErrors.general && (
                                        <div className="alert alert-danger py-2 d-flex align-items-center">
                                            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                                            {handleErrors.general}
                                        </div>
                                    )}

                                    {/* Patient Summary */}
                                    <div className="mb-4 p-3 rounded-3" style={{ backgroundColor: '#f8fafc' }}>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <p className="mb-1"><strong>Pasien:</strong> {selectedConsultation.society?.name}</p>
                                                <p className="mb-1">
                                                    <strong>NIK:</strong> {selectedConsultation.society?.id_card_number}
                                                </p>
                                                <p className="mb-0">
                                                    <strong>Gender:</strong>{' '}
                                                    <FontAwesomeIcon icon={faVenusMars} className="me-1" />
                                                    {selectedConsultation.society?.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                                                </p>
                                            </div>
                                            <div className="col-md-6">
                                                <p className="mb-1">
                                                    <strong>Usia:</strong> {calculateAge(selectedConsultation.society?.born_date)} tahun
                                                </p>
                                                <p className="mb-0">
                                                    <strong>Tanggal Konsultasi:</strong> {formatDateShort(selectedConsultation.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <form onSubmit={submitHandleConsultation}>
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                <FontAwesomeIcon icon={faNotesMedical} className="me-2" style={{ color: '#8b5cf6' }} />
                                                Catatan Dokter <span className="text-danger">*</span>
                                            </label>
                                            <textarea
                                                className={`form-control ${handleErrors.doctor_notes ? 'is-invalid' : ''}`}
                                                rows="5"
                                                placeholder="Tulis catatan dokter, diagnosis, atau rekomendasi..."
                                                value={handleForm.doctor_notes}
                                                onChange={(e) => setHandleForm({...handleForm, doctor_notes: e.target.value})}
                                                style={{ borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                            />
                                            {handleErrors.doctor_notes && (
                                                <div className="invalid-feedback d-block">
                                                    {handleErrors.doctor_notes}
                                                </div>
                                            )}
                                            <small className="text-muted mt-1">
                                                Catatan akan dikirimkan ke pasien
                                            </small>
                                        </div>

                                        <div className="d-flex justify-content-end gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-light px-4"
                                                onClick={() => setShowHandleForm(false)}
                                                style={{ borderRadius: '10px' }}
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn px-4 text-white"
                                                disabled={handleLoading}
                                                style={{ 
                                                    borderRadius: '10px',
                                                    backgroundColor: handleForm.status === 'accepted' ? '#10b981' : '#ef4444',
                                                    border: 'none',
                                                    minWidth: '120px'
                                                }}
                                            >
                                                {handleLoading ? (
                                                    <>
                                                        <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                                                        Memproses...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FontAwesomeIcon 
                                                            icon={handleForm.status === 'accepted' ? faCheck : faXmark} 
                                                            className="me-2" 
                                                        />
                                                        {handleForm.status === 'accepted' ? 'Terima' : 'Tolak'}
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