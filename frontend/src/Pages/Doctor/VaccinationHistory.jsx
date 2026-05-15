// src/Pages/Doctor/VaccinationHistory.jsx
import React, { useState, useEffect } from 'react';
import MainPublic from '../Layouts/MainPublic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSyringe,
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
    faHistory,
    faUserCheck,
    faCalendarCheck,
    faStethoscope,
    faBirthdayCake,
    faSearch,
    faUser,
    faVial,
    faCalendarAlt,
    faHospital,
    faUserMd,
    faNotesMedical,
    faPlusCircle,
    faUserPlus,
    faDisease,
    faHeartbeat,
    faCheck,
    faXmark,
} from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

export default function VaccinationHistory() {
    const [activeTab, setActiveTab] = useState('record');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    
    // Search patient
    const [searchNIK, setSearchNIK] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [patientData, setPatientData] = useState(null);
    const [setShowPatientHistory] = useState(false);
    
    // Patient history data
    const [consultations, setConsultations] = useState([]);
    const [vaccinations, setVaccinations] = useState([]);
    const [setHistoryLoading] = useState(false);
    
    // Expanded items
    const [expandedConsultationId, setExpandedConsultationId] = useState(null);
    const [expandedVaccinationId, setExpandedVaccinationId] = useState(null);
    
    // Record vaccination form
    const [showRecordForm, setShowRecordForm] = useState(false);
    const [recordLoading, setRecordLoading] = useState(false);
    const [recordForm, setRecordForm] = useState({
        society_id: '',
        vaccine_id: '',
        date: new Date().toISOString().split('T')[0],
        dose: '1',
        officer_id: ''
    });
    const [recordErrors, setRecordErrors] = useState({});
    
    // Mock data untuk dropdown (akan diganti dengan API)
    const [vaccines, setVaccines] = useState([]);
    const [officers, setOfficers] = useState([]);

    const getToken = () => {
        return localStorage.getItem('token');
    };

    // Search patient by NIK
    const handleSearchPatient = async (e) => {
        e.preventDefault();
        
        if (!searchNIK.trim()) {
            setError('Masukkan NIK pasien');
            return;
        }

        try {
            setSearchLoading(true);
            setError(null);
            setPatientData(null);
            setShowPatientHistory(false);
            
            const token = getToken();
            // Asumsi ada endpoint untuk search patient by NIK
            // Jika tidak ada, bisa gunakan endpoint getPatientHistory dengan societyId
            const response = await api.get(`/doctor/patients/search?token=${token}`, {
                params: { nik: searchNIK }
            });
            
            if (response.data && response.data.patient) {
                setPatientData(response.data.patient);
                // Otomatis fetch history
                await fetchPatientHistory(response.data.patient.id);
                setShowPatientHistory(true);
            } else {
                setError('Pasien tidak ditemukan');
            }
        } catch (err) {
            console.error('Error searching patient:', err);
            if (err.response?.status === 404) {
                setError('Pasien dengan NIK tersebut tidak ditemukan');
            } else {
                setError('Gagal mencari data pasien. Silakan coba lagi.');
            }
        } finally {
            setSearchLoading(false);
        }
    };

    // Fetch patient history
    const fetchPatientHistory = async (societyId) => {
        try {
            setHistoryLoading(true);
            setError(null);
            
            const token = getToken();
            const response = await api.get(`/doctor/patients/${societyId}/history?token=${token}`);
            
            if (response.data) {
                setPatientData(response.data.patient);
                setConsultations(response.data.consultations?.data || []);
                setVaccinations(response.data.vaccinations?.data || []);
            }
        } catch (err) {
            console.error('Error fetching patient history:', err);
            setError('Gagal memuat riwayat pasien. Silakan coba lagi.');
        } finally {
            setHistoryLoading(false);
        }
    };

    // Open record vaccination form
    const openRecordForm = () => {
        if (!patientData) {
            setError('Cari pasien terlebih dahulu');
            return;
        }
        
        setRecordForm({
            society_id: patientData.id,
            vaccine_id: '',
            date: new Date().toISOString().split('T')[0],
            dose: determineNextDose(),
            officer_id: ''
        });
        setRecordErrors({});
        setShowRecordForm(true);
    };

    // Determine next dose
    const determineNextDose = () => {
        if (!vaccinations || vaccinations.length === 0) return '1';
        
        const hasDose1 = vaccinations.some(v => v.dose === 1);
        const hasDose2 = vaccinations.some(v => v.dose === 2);
        
        if (!hasDose1) return '1';
        if (hasDose1 && !hasDose2) return '2';
        return '1'; // Default
    };

    // Submit record vaccination
    const submitRecordVaccination = async (e) => {
        e.preventDefault();
        
        // Validasi form
        const errors = {};
        if (!recordForm.vaccine_id) errors.vaccine_id = 'Pilih vaksin';
        if (!recordForm.date) errors.date = 'Pilih tanggal';
        if (!recordForm.dose) errors.dose = 'Pilih dosis';
        if (!recordForm.officer_id) errors.officer_id = 'Pilih officer';
        
        if (Object.keys(errors).length > 0) {
            setRecordErrors(errors);
            return;
        }

        try {
            setRecordLoading(true);
            setRecordErrors({});
            
            const token = getToken();
            await api.post(`/doctor/vaccinations/record?token=${token}`, recordForm);
            
            setSuccessMessage('Vaksinasi berhasil dicatat');
            setShowRecordForm(false);
            setRecordForm({
                society_id: '',
                vaccine_id: '',
                date: new Date().toISOString().split('T')[0],
                dose: '1',
                officer_id: ''
            });
            
            // Refresh patient history
            if (patientData) {
                await fetchPatientHistory(patientData.id);
            }
            
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err) {
            console.error('Error recording vaccination:', err);
            if (err.response?.data?.errors) {
                setRecordErrors(err.response.data.errors);
            } else if (err.response?.data?.message) {
                setRecordErrors({ general: err.response.data.message });
            } else {
                setRecordErrors({ general: 'Gagal mencatat vaksinasi' });
            }
        } finally {
            setRecordLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const options = { 
            day: 'numeric',
            month: 'long',
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

    // Mock fetch vaccines and officers (ganti dengan API sesungguhnya)
    useEffect(() => {
        // Ini hanya mock, ganti dengan fetch API yang sesuai
        setVaccines([
            { id: 1, name: 'Sinovac' },
            { id: 2, name: 'AstraZeneca' },
            { id: 3, name: 'Pfizer' },
            { id: 4, name: 'Moderna' }
        ]);
        
        setOfficers([
            { id: 1, name: 'Officer A' },
            { id: 2, name: 'Officer B' },
            { id: 3, name: 'Officer C' }
        ]);
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'accepted':
                return (
                    <span className="badge" style={{ backgroundColor: '#d1fae5', color: '#047857' }}>
                        <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                        Diterima
                    </span>
                );
            case 'declined':
                return (
                    <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                        <FontAwesomeIcon icon={faTimesCircle} className="me-1" />
                        Ditolak
                    </span>
                );
            case 'pending':
                return (
                    <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
                        <FontAwesomeIcon icon={faHourglassHalf} className="me-1" />
                        Menunggu
                    </span>
                );
            default:
                return (
                    <span className="badge bg-secondary">{status}</span>
                );
        }
    };

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
                                            Riwayat Vaksinasi
                                        </h4>
                                        <p className="mb-0 opacity-75">
                                            Catat dan lihat riwayat vaksinasi pasien
                                        </p>
                                    </div>
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
                                            className={`nav-link ${activeTab === 'record' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('record')}
                                            style={{
                                                borderRadius: '10px',
                                                backgroundColor: activeTab === 'record' ? '#10b981' : 'transparent',
                                                color: activeTab === 'record' ? 'white' : '#64748b',
                                                fontWeight: '500',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faPlusCircle} className="me-2" />
                                            Catat Vaksinasi
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
                                            Riwayat Pasien
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Record Vaccination Tab */}
                {activeTab === 'record' && (
                    <>
                        {/* Search Patient */}
                        <div className="row mb-4">
                            <div className="col-12">
                                <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                                    <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
                                        <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
                                            <FontAwesomeIcon icon={faSearch} className="me-2" style={{ color: '#10b981' }} />
                                            Cari Pasien
                                        </h5>
                                        <hr className="mt-3" />
                                    </div>
                                    <div className="card-body p-4">
                                        <form onSubmit={handleSearchPatient}>
                                            <div className="row g-3 align-items-end">
                                                <div className="col-md-8">
                                                    <label className="form-label fw-semibold">
                                                        <FontAwesomeIcon icon={faIdCard} className="me-2" style={{ color: '#8b5cf6' }} />
                                                        Nomor Induk Kependudukan (NIK)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-lg"
                                                        placeholder="Masukkan NIK pasien..."
                                                        value={searchNIK}
                                                        onChange={(e) => setSearchNIK(e.target.value)}
                                                        style={{ borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                                    />
                                                </div>
                                                <div className="col-md-4">
                                                    <button
                                                        type="submit"
                                                        className="btn btn-lg text-white w-100"
                                                        disabled={searchLoading}
                                                        style={{ 
                                                            backgroundColor: '#10b981', 
                                                            borderRadius: '10px',
                                                            border: 'none'
                                                        }}
                                                    >
                                                        {searchLoading ? (
                                                            <>
                                                                <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                                                                Mencari...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FontAwesomeIcon icon={faSearch} className="me-2" />
                                                                Cari Pasien
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Patient Found */}
                        {patientData && (
                            <>
                                {/* Patient Info Card */}
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                                            <div className="card-body p-4">
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
                                                        <FontAwesomeIcon icon={faUserCheck} className="me-2" style={{ color: '#10b981' }} />
                                                        Informasi Pasien
                                                    </h5>
                                                    <button
                                                        className="btn text-white"
                                                        onClick={openRecordForm}
                                                        style={{ 
                                                            backgroundColor: '#10b981', 
                                                            borderRadius: '10px'
                                                        }}
                                                    >
                                                        <FontAwesomeIcon icon={faPlusCircle} className="me-2" />
                                                        Catat Vaksinasi
                                                    </button>
                                                </div>

                                                <div className="row g-3">
                                                    <div className="col-md-8">
                                                        <div className="p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                                            <div className="d-flex align-items-center mb-3">
                                                                <div className="d-flex align-items-center justify-content-center rounded-circle me-3"
                                                                     style={{
                                                                         width: '60px',
                                                                         height: '60px',
                                                                         backgroundColor: '#f0fdf4',
                                                                         border: '2px solid #6ee7b7'
                                                                     }}>
                                                                    <FontAwesomeIcon icon={faUser} style={{ fontSize: '24px', color: '#10b981' }} />
                                                                </div>
                                                                <div>
                                                                    <h6 className="mb-1 fw-bold">{patientData.name}</h6>
                                                                    <span className="badge" style={{
                                                                        backgroundColor: patientData.gender === 'male' ? '#dbeafe' : '#fce7f3',
                                                                        color: patientData.gender === 'male' ? '#1e40af' : '#be185d'
                                                                    }}>
                                                                        <FontAwesomeIcon icon={faVenusMars} className="me-1" />
                                                                        {patientData.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="row">
                                                                <div className="col-md-6">
                                                                    <div className="mb-2">
                                                                        <small className="text-muted d-block">
                                                                            <FontAwesomeIcon icon={faIdCard} className="me-2" style={{ width: '16px' }} />
                                                                            NIK
                                                                        </small>
                                                                        <span className="fw-semibold">{patientData.id_card_number}</span>
                                                                    </div>
                                                                    <div className="mb-2">
                                                                        <small className="text-muted d-block">
                                                                            <FontAwesomeIcon icon={faBirthdayCake} className="me-2" style={{ width: '16px' }} />
                                                                            Tanggal Lahir / Usia
                                                                        </small>
                                                                        <span className="fw-semibold">
                                                                            {formatDate(patientData.born_date)} 
                                                                            <span className="text-muted ms-1">({calculateAge(patientData.born_date)} tahun)</span>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <div className="mb-2">
                                                                        <small className="text-muted d-block">
                                                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" style={{ width: '16px' }} />
                                                                            Alamat
                                                                        </small>
                                                                        <span className="fw-semibold">{patientData.address}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="col-md-4">
                                                        <div className="p-3 rounded-3 h-100" style={{ backgroundColor: '#f0fdf4', border: '1px solid #6ee7b7' }}>
                                                            <label className="fw-semibold mb-3" style={{ color: '#047857', fontSize: '0.9rem' }}>
                                                                <FontAwesomeIcon icon={faSyringe} className="me-2" />
                                                                Status Vaksinasi
                                                            </label>
                                                            
                                                            <div className="mb-2">
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <div className="d-flex align-items-center justify-content-center rounded-circle"
                                                                         style={{
                                                                             width: '35px',
                                                                             height: '35px',
                                                                             backgroundColor: vaccinations.some(v => v.dose === 1) ? '#d1fae5' : '#f1f5f9'
                                                                         }}>
                                                                        <FontAwesomeIcon 
                                                                            icon={vaccinations.some(v => v.dose === 1) ? faCheck : faXmark}
                                                                            style={{ 
                                                                                color: vaccinations.some(v => v.dose === 1) ? '#047857' : '#94a3b8',
                                                                                fontSize: '14px'
                                                                            }} 
                                                                        />
                                                                    </div>
                                                                    <span style={{ color: vaccinations.some(v => v.dose === 1) ? '#1e293b' : '#94a3b8' }}>
                                                                        Dosis 1
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            
                                                            <div>
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <div className="d-flex align-items-center justify-content-center rounded-circle"
                                                                         style={{
                                                                             width: '35px',
                                                                             height: '35px',
                                                                             backgroundColor: vaccinations.some(v => v.dose === 2) ? '#d1fae5' : '#f1f5f9'
                                                                         }}>
                                                                        <FontAwesomeIcon 
                                                                            icon={vaccinations.some(v => v.dose === 2) ? faCheck : faXmark}
                                                                            style={{ 
                                                                                color: vaccinations.some(v => v.dose === 2) ? '#047857' : '#94a3b8',
                                                                                fontSize: '14px'
                                                                            }} 
                                                                        />
                                                                    </div>
                                                                    <span style={{ color: vaccinations.some(v => v.dose === 2) ? '#1e293b' : '#94a3b8' }}>
                                                                        Dosis 2
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Summary */}
                                <div className="row mb-4">
                                    <div className="col-md-3 col-6 mb-3">
                                        <div className="p-3 rounded-3 text-center" style={{ backgroundColor: '#f0fdf4' }}>
                                            <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                                                 style={{ width: '45px', height: '45px', backgroundColor: '#d1fae5' }}>
                                                <FontAwesomeIcon icon={faSyringe} style={{ fontSize: '18px', color: '#047857' }} />
                                            </div>
                                            <h4 className="fw-bold mb-0" style={{ color: '#047857' }}>{vaccinations.length}</h4>
                                            <small className="text-muted">Total Vaksinasi</small>
                                        </div>
                                    </div>
                                    <div className="col-md-3 col-6 mb-3">
                                        <div className="p-3 rounded-3 text-center" style={{ backgroundColor: '#eff6ff' }}>
                                            <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                                                 style={{ width: '45px', height: '45px', backgroundColor: '#dbeafe' }}>
                                                <FontAwesomeIcon icon={faStethoscope} style={{ fontSize: '18px', color: '#1d4ed8' }} />
                                            </div>
                                            <h4 className="fw-bold mb-0" style={{ color: '#1d4ed8' }}>{consultations.length}</h4>
                                            <small className="text-muted">Total Konsultasi</small>
                                        </div>
                                    </div>
                                    <div className="col-md-3 col-6 mb-3">
                                        <div className="p-3 rounded-3 text-center" style={{ backgroundColor: '#fef3c7' }}>
                                            <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                                                 style={{ width: '45px', height: '45px', backgroundColor: '#fde68a' }}>
                                                <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: '18px', color: '#b45309' }} />
                                            </div>
                                            <h4 className="fw-bold mb-0" style={{ color: '#b45309' }}>
                                                {vaccinations.filter(v => v.dose === 1).length}
                                            </h4>
                                            <small className="text-muted">Dosis 1</small>
                                        </div>
                                    </div>
                                    <div className="col-md-3 col-6 mb-3">
                                        <div className="p-3 rounded-3 text-center" style={{ backgroundColor: '#fdf2f8' }}>
                                            <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                                                 style={{ width: '45px', height: '45px', backgroundColor: '#fce7f3' }}>
                                                <FontAwesomeIcon icon={faCalendarCheck} style={{ fontSize: '18px', color: '#be185d' }} />
                                            </div>
                                            <h4 className="fw-bold mb-0" style={{ color: '#be185d' }}>
                                                {vaccinations.filter(v => v.dose === 2).length}
                                            </h4>
                                            <small className="text-muted">Dosis 2</small>
                                        </div>
                                    </div>
                                </div>

                                {/* Vaccination History List */}
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                                            <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
                                                <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
                                                    <FontAwesomeIcon icon={faSyringe} className="me-2" style={{ color: '#10b981' }} />
                                                    Riwayat Vaksinasi
                                                </h5>
                                                <hr className="mt-3" />
                                            </div>
                                            <div className="card-body p-4">
                                                {vaccinations.length === 0 ? (
                                                    <div className="text-center py-4">
                                                        <div className="mb-3">
                                                            <div className="d-inline-flex align-items-center justify-content-center rounded-circle"
                                                                 style={{ width: '60px', height: '60px', backgroundColor: '#f0fdf4', border: '2px dashed #6ee7b7' }}>
                                                                <FontAwesomeIcon icon={faSyringe} style={{ fontSize: '24px', color: '#10b981' }} />
                                                            </div>
                                                        </div>
                                                        <p className="text-muted mb-0">Belum ada riwayat vaksinasi</p>
                                                    </div>
                                                ) : (
                                                    <div className="d-flex flex-column gap-3">
                                                        {vaccinations.map((vac) => {
                                                            const isExpanded = expandedVaccinationId === vac.id;
                                                            
                                                            return (
                                                                <div key={vac.id}
                                                                    className="rounded-3"
                                                                    style={{
                                                                        border: '1px solid #e2e8f0',
                                                                        backgroundColor: '#ffffff',
                                                                        overflow: 'hidden'
                                                                    }}
                                                                >
                                                                    <div 
                                                                        className="p-3 d-flex justify-content-between align-items-center"
                                                                        onClick={() => setExpandedVaccinationId(isExpanded ? null : vac.id)}
                                                                        style={{ cursor: 'pointer', userSelect: 'none' }}
                                                                    >
                                                                        <div className="d-flex align-items-center gap-3">
                                                                            <div className="d-flex align-items-center justify-content-center rounded-circle"
                                                                                 style={{
                                                                                     width: '45px',
                                                                                     height: '45px',
                                                                                     backgroundColor: vac.dose === 1 ? '#dbeafe' : '#d1fae5',
                                                                                     flexShrink: 0
                                                                                 }}>
                                                                                <strong style={{ 
                                                                                    color: vac.dose === 1 ? '#1e40af' : '#047857',
                                                                                    fontSize: '1rem'
                                                                                }}>
                                                                                    D{vac.dose}
                                                                                </strong>
                                                                            </div>
                                                                            
                                                                            <div>
                                                                                <strong style={{ color: '#1e293b' }}>{vac.vaccine?.name}</strong>
                                                                                <div className="d-flex align-items-center gap-2 mt-1">
                                                                                    <small className="text-muted">
                                                                                        <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                                                                        {formatDate(vac.date)}
                                                                                    </small>
                                                                                    <span className="badge" style={{ 
                                                                                        backgroundColor: vac.dose === 1 ? '#dbeafe' : '#d1fae5',
                                                                                        color: vac.dose === 1 ? '#1e40af' : '#047857'
                                                                                    }}>
                                                                                        Dosis {vac.dose}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <FontAwesomeIcon 
                                                                            icon={isExpanded ? faChevronUp : faChevronDown} 
                                                                            style={{ color: '#64748b' }} 
                                                                        />
                                                                    </div>

                                                                    {isExpanded && (
                                                                        <div style={{
                                                                            backgroundColor: '#f8fafc',
                                                                            borderTop: '1px solid #e2e8f0',
                                                                            padding: '20px'
                                                                        }}>
                                                                            <div className="row g-3">
                                                                                <div className="col-md-6">
                                                                                    <div className="p-3 rounded-3 bg-white" style={{ border: '1px solid #e2e8f0' }}>
                                                                                        <label className="fw-semibold mb-2" style={{ color: '#8b5cf6', fontSize: '0.9rem' }}>
                                                                                            <FontAwesomeIcon icon={faVial} className="me-2" />
                                                                                            Detail Vaksin
                                                                                        </label>
                                                                                        <p className="mb-1"><strong>Vaksin:</strong> {vac.vaccine?.name}</p>
                                                                                        <p className="mb-1"><strong>Dosis:</strong> {vac.dose}</p>
                                                                                        <p className="mb-0"><strong>Tanggal:</strong> {formatDate(vac.date)}</p>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="col-md-6">
                                                                                    <div className="p-3 rounded-3 bg-white" style={{ border: '1px solid #e2e8f0' }}>
                                                                                        <label className="fw-semibold mb-2" style={{ color: '#10b981', fontSize: '0.9rem' }}>
                                                                                            <FontAwesomeIcon icon={faHospital} className="me-2" />
                                                                                            Informasi Medis
                                                                                        </label>
                                                                                        <p className="mb-1"><strong>Spot:</strong> {vac.spot?.name}</p>
                                                                                        <p className="mb-1"><strong>Dokter:</strong> {vac.doctor?.name}</p>
                                                                                        <p className="mb-0"><strong>Officer:</strong> {vac.officer?.name}</p>
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

                                {/* Consultation History */}
                                <div className="row">
                                    <div className="col-12">
                                        <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                                            <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
                                                <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
                                                    <FontAwesomeIcon icon={faStethoscope} className="me-2" style={{ color: '#10b981' }} />
                                                    Riwayat Konsultasi
                                                </h5>
                                                <hr className="mt-3" />
                                            </div>
                                            <div className="card-body p-4">
                                                {consultations.length === 0 ? (
                                                    <div className="text-center py-4">
                                                        <div className="mb-3">
                                                            <div className="d-inline-flex align-items-center justify-content-center rounded-circle"
                                                                 style={{ width: '60px', height: '60px', backgroundColor: '#f0fdf4', border: '2px dashed #6ee7b7' }}>
                                                                <FontAwesomeIcon icon={faStethoscope} style={{ fontSize: '24px', color: '#10b981' }} />
                                                            </div>
                                                        </div>
                                                        <p className="text-muted mb-0">Belum ada riwayat konsultasi</p>
                                                    </div>
                                                ) : (
                                                    <div className="d-flex flex-column gap-3">
                                                        {consultations.map((consultation) => {
                                                            const isExpanded = expandedConsultationId === consultation.id;
                                                            
                                                            return (
                                                                <div key={consultation.id}
                                                                    className="rounded-3"
                                                                    style={{
                                                                        border: '1px solid #e2e8f0',
                                                                        backgroundColor: '#ffffff',
                                                                        overflow: 'hidden'
                                                                    }}
                                                                >
                                                                    <div 
                                                                        className="p-3 d-flex justify-content-between align-items-center"
                                                                        onClick={() => setExpandedConsultationId(isExpanded ? null : consultation.id)}
                                                                        style={{ cursor: 'pointer', userSelect: 'none' }}
                                                                    >
                                                                        <div className="d-flex align-items-center gap-3">
                                                                            <div className="d-flex align-items-center justify-content-center rounded-circle"
                                                                                 style={{
                                                                                     width: '45px',
                                                                                     height: '45px',
                                                                                     backgroundColor: '#f0fdf4',
                                                                                     flexShrink: 0
                                                                                 }}>
                                                                                <FontAwesomeIcon icon={faStethoscope} style={{ fontSize: '18px', color: '#10b981' }} />
                                                                            </div>
                                                                            
                                                                            <div>
                                                                                {getStatusBadge(consultation.status)}
                                                                                <div className="mt-1">
                                                                                    <small className="text-muted">
                                                                                        <FontAwesomeIcon icon={faClock} className="me-1" />
                                                                                        {formatDateTime(consultation.created_at)}
                                                                                    </small>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <FontAwesomeIcon 
                                                                            icon={isExpanded ? faChevronUp : faChevronDown} 
                                                                            style={{ color: '#64748b' }} 
                                                                        />
                                                                    </div>

                                                                    {isExpanded && (
                                                                        <div style={{
                                                                            backgroundColor: '#f8fafc',
                                                                            borderTop: '1px solid #e2e8f0',
                                                                            padding: '20px'
                                                                        }}>
                                                                            <div className="row g-3">
                                                                                <div className="col-md-6">
                                                                                    <div className="p-3 rounded-3 bg-white" style={{ border: '1px solid #e2e8f0' }}>
                                                                                        <label className="fw-semibold mb-2" style={{ color: '#ef4444', fontSize: '0.9rem' }}>
                                                                                            <FontAwesomeIcon icon={faDisease} className="me-2" />
                                                                                            Riwayat Penyakit
                                                                                        </label>
                                                                                        <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                                                                                            {consultation.disease_history || 'Tidak ada'}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="col-md-6">
                                                                                    <div className="p-3 rounded-3 bg-white" style={{ border: '1px solid #e2e8f0' }}>
                                                                                        <label className="fw-semibold mb-2" style={{ color: '#f59e0b', fontSize: '0.9rem' }}>
                                                                                            <FontAwesomeIcon icon={faHeartbeat} className="me-2" />
                                                                                            Gejala Saat Ini
                                                                                        </label>
                                                                                        <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                                                                                            {consultation.current_symptoms || 'Tidak ada'}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                                {consultation.doctor_notes && (
                                                                                    <div className="col-12">
                                                                                        <div className="p-3 rounded-3 bg-white" style={{ border: '1px solid #e2e8f0' }}>
                                                                                            <label className="fw-semibold mb-2" style={{ color: '#8b5cf6', fontSize: '0.9rem' }}>
                                                                                                <FontAwesomeIcon icon={faNotesMedical} className="me-2" />
                                                                                                Catatan Dokter
                                                                                            </label>
                                                                                            <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                                                                                                {consultation.doctor_notes}
                                                                                            </p>
                                                                                            {consultation.doctor && (
                                                                                                <small className="text-muted mt-2 d-block">
                                                                                                    <FontAwesomeIcon icon={faUserMd} className="me-1" />
                                                                                                    Oleh: {consultation.doctor.name}
                                                                                                </small>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                )}
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

                        {/* No Patient Found State */}
                        {!patientData && !searchLoading && (
                            <div className="row">
                                <div className="col-12">
                                    <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                                        <div className="card-body p-5 text-center">
                                            <div className="mb-3">
                                                <div className="d-inline-flex align-items-center justify-content-center rounded-circle"
                                                     style={{ width: '80px', height: '80px', backgroundColor: '#f0fdf4', border: '2px dashed #6ee7b7' }}>
                                                    <FontAwesomeIcon icon={faUserPlus} style={{ fontSize: '32px', color: '#10b981' }} />
                                                </div>
                                            </div>
                                            <h6 style={{ color: '#64748b' }}>Cari Pasien</h6>
                                            <p className="text-muted small">
                                                Masukkan NIK pasien untuk melihat riwayat dan mencatat vaksinasi
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
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
                                    <h6 style={{ color: '#64748b' }}>Riwayat Pasien</h6>
                                    <p className="text-muted small">
                                        Silakan gunakan tab "Catat Vaksinasi" untuk mencari dan melihat riwayat pasien
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Record Vaccination Modal */}
                {showRecordForm && patientData && (
                    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content" style={{ borderRadius: '16px', border: 'none' }}>
                                <div className="modal-header" style={{ 
                                    backgroundColor: '#f0fdf4', 
                                    borderRadius: '16px 16px 0 0' 
                                }}>
                                    <h5 className="modal-title fw-bold" style={{ color: '#047857' }}>
                                        <FontAwesomeIcon icon={faSyringe} className="me-2" />
                                        Catat Vaksinasi Baru
                                    </h5>
                                    <button 
                                        type="button" 
                                        className="btn-close"
                                        onClick={() => setShowRecordForm(false)}
                                    ></button>
                                </div>
                                <div className="modal-body p-4">
                                    {recordErrors.general && (
                                        <div className="alert alert-danger py-2 d-flex align-items-center">
                                            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                                            {recordErrors.general}
                                        </div>
                                    )}

                                    {/* Patient Summary */}
                                    <div className="mb-4 p-3 rounded-3" style={{ backgroundColor: '#f8fafc' }}>
                                        <div className="d-flex align-items-center">
                                            <div className="d-flex align-items-center justify-content-center rounded-circle me-3"
                                                 style={{
                                                     width: '50px',
                                                     height: '50px',
                                                     backgroundColor: '#f0fdf4'
                                                 }}>
                                                <FontAwesomeIcon icon={faUser} style={{ fontSize: '20px', color: '#10b981' }} />
                                            </div>
                                            <div>
                                                <strong>{patientData.name}</strong>
                                                <br />
                                                <small className="text-muted">{patientData.id_card_number}</small>
                                            </div>
                                        </div>
                                    </div>

                                    <form onSubmit={submitRecordVaccination}>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label fw-semibold">
                                                        <FontAwesomeIcon icon={faVial} className="me-2" style={{ color: '#8b5cf6' }} />
                                                        Vaksin <span className="text-danger">*</span>
                                                    </label>
                                                    <select
                                                        className={`form-select ${recordErrors.vaccine_id ? 'is-invalid' : ''}`}
                                                        value={recordForm.vaccine_id}
                                                        onChange={(e) => setRecordForm({...recordForm, vaccine_id: e.target.value})}
                                                        style={{ borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                                    >
                                                        <option value="">Pilih Vaksin</option>
                                                        {vaccines.map((vaccine) => (
                                                            <option key={vaccine.id} value={vaccine.id}>
                                                                {vaccine.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {recordErrors.vaccine_id && (
                                                        <div className="invalid-feedback d-block">{recordErrors.vaccine_id}</div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label fw-semibold">
                                                        <FontAwesomeIcon icon={faCalendarAlt} className="me-2" style={{ color: '#f59e0b' }} />
                                                        Tanggal Vaksinasi <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        className={`form-control ${recordErrors.date ? 'is-invalid' : ''}`}
                                                        value={recordForm.date}
                                                        onChange={(e) => setRecordForm({...recordForm, date: e.target.value})}
                                                        style={{ borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                                    />
                                                    {recordErrors.date && (
                                                        <div className="invalid-feedback d-block">{recordErrors.date}</div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label fw-semibold">
                                                        <FontAwesomeIcon icon={faSyringe} className="me-2" style={{ color: '#10b981' }} />
                                                        Dosis <span className="text-danger">*</span>
                                                    </label>
                                                    <select
                                                        className={`form-select ${recordErrors.dose ? 'is-invalid' : ''}`}
                                                        value={recordForm.dose}
                                                        onChange={(e) => setRecordForm({...recordForm, dose: e.target.value})}
                                                        style={{ borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                                    >
                                                        <option value="1">Dosis 1</option>
                                                        <option value="2">Dosis 2</option>
                                                    </select>
                                                    {recordErrors.dose && (
                                                        <div className="invalid-feedback d-block">{recordErrors.dose}</div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label fw-semibold">
                                                        <FontAwesomeIcon icon={faUserCheck} className="me-2" style={{ color: '#3b82f6' }} />
                                                        Officer <span className="text-danger">*</span>
                                                    </label>
                                                    <select
                                                        className={`form-select ${recordErrors.officer_id ? 'is-invalid' : ''}`}
                                                        value={recordForm.officer_id}
                                                        onChange={(e) => setRecordForm({...recordForm, officer_id: e.target.value})}
                                                        style={{ borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                                    >
                                                        <option value="">Pilih Officer</option>
                                                        {officers.map((officer) => (
                                                            <option key={officer.id} value={officer.id}>
                                                                {officer.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {recordErrors.officer_id && (
                                                        <div className="invalid-feedback d-block">{recordErrors.officer_id}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-end gap-2 mt-3">
                                            <button
                                                type="button"
                                                className="btn btn-light px-4"
                                                onClick={() => setShowRecordForm(false)}
                                                style={{ borderRadius: '10px' }}
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn px-4 text-white"
                                                disabled={recordLoading}
                                                style={{ 
                                                    borderRadius: '10px',
                                                    backgroundColor: '#10b981',
                                                    border: 'none',
                                                    minWidth: '120px'
                                                }}
                                            >
                                                {recordLoading ? (
                                                    <>
                                                        <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                                                        Menyimpan...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FontAwesomeIcon icon={faCheck} className="me-2" />
                                                        Simpan
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