// src/Pages/Society/Consultation.jsx
import React, { useState, useEffect } from 'react';
import MainPublic from '../Layouts/MainPublic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faNotesMedical,
    faHistory,
    faPaperPlane,
    faClock,
    faCheckCircle,
    faHourglassHalf,
    faTimesCircle,
    faUserMd,
    faCalendarAlt,
    faStethoscope,
    faExclamationTriangle,
    faPlus,
    faChevronDown,
    faChevronUp,
    faInfoCircle,
    faSpinner,
    faClipboardList,
    faFileMedical,
    faXmark
} from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

export default function Consultation() {
    const [consultations, setConsultations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    
    // Form state
    const [formData, setFormData] = useState({
        disease_history: '',
        current_symptoms: ''
    });

    // Fetch consultations
    const fetchConsultations = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = localStorage.getItem('token');
            const response = await api.get(`/consultations?token=${token}`);
            
            if (response.data && response.data.consultations) {
                setConsultations(response.data.consultations);
            }
        } catch (err) {
            console.error('Error fetching consultations:', err);
            if (err.response?.status === 404) {
                setConsultations([]);
            } else {
                setError('Gagal memuat data konsultasi. Silakan coba lagi.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConsultations();
    }, []);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    // Format date for consultation list (shorter)
    const formatDateShort = (dateString) => {
        if (!dateString) return '-';
        const options = { 
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    // Get status display
    const getStatusConfig = (status) => {
        switch (status) {
            case 'pending':
                return {
                    label: 'Menunggu Dokter',
                    icon: faHourglassHalf,
                    color: '#f59e0b',
                    bgColor: '#fef3c7',
                    borderColor: '#fcd34d'
                };
            case 'accepted':
                return {
                    label: 'Diterima',
                    icon: faCheckCircle,
                    color: '#10b981',
                    bgColor: '#d1fae5',
                    borderColor: '#6ee7b7'
                };
            case 'rejected':
                return {
                    label: 'Ditolak',
                    icon: faTimesCircle,
                    color: '#ef4444',
                    bgColor: '#fee2e2',
                    borderColor: '#fca5a5'
                };
            case 'completed':
                return {
                    label: 'Selesai',
                    icon: faCheckCircle,
                    color: '#3b82f6',
                    bgColor: '#dbeafe',
                    borderColor: '#93c5fd'
                };
            default:
                return {
                    label: status,
                    icon: faInfoCircle,
                    color: '#6b7280',
                    bgColor: '#f3f4f6',
                    borderColor: '#d1d5db'
                };
        }
    };

    // Toggle expand consultation detail
    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    // Validate form
    const validateForm = () => {
        const errors = {};
        
        if (!formData.disease_history.trim()) {
            errors.disease_history = 'Riwayat penyakit harus diisi';
        }
        
        if (!formData.current_symptoms.trim()) {
            errors.current_symptoms = 'Gejala saat ini harus diisi';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        try {
            setSubmitting(true);
            
            const token = localStorage.getItem('token');
            await api.post(`/consultations?token=${token}`, formData);
            
            // Reset form
            setFormData({
                disease_history: '',
                current_symptoms: ''
            });
            setShowForm(false);
            setFormErrors({});
            
            // Show success message
            setSuccessMessage('Konsultasi berhasil dikirim! Dokter akan segera menangani.');
            
            // Refresh consultations
            await fetchConsultations();
            
            // Clear success message after 5 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 5000);
            
        } catch (err) {
            console.error('Error submitting consultation:', err);
            if (err.response?.data?.errors) {
                setFormErrors(err.response.data.errors);
            } else {
                setFormErrors({ general: 'Gagal mengirim konsultasi. Silakan coba lagi.' });
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <MainPublic>
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
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
                        <button 
                            type="button" 
                            className="btn-close" 
                            onClick={() => setSuccessMessage('')}
                        ></button>
                    </div>
                )}

                {/* Header Section */}
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
                                            Konsultasi Kesehatan
                                        </h4>
                                        <p className="mb-0 opacity-75">
                                            Konsultasikan keluhan kesehatan Anda dengan dokter kami
                                        </p>
                                    </div>
                                    <button 
                                        className="btn btn-light mt-3 mt-md-0"
                                        onClick={() => {
                                            setShowForm(!showForm);
                                            setFormErrors({});
                                        }}
                                        style={{ 
                                            borderRadius: '10px',
                                            fontWeight: '500'
                                        }}
                                    >
                                        <FontAwesomeIcon icon={showForm ? faXmark : faPlus} className="me-2" />
                                        {showForm ? 'Tutup Form' : 'Buat Konsultasi'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Create Consultation Form */}
                {showForm && (
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                                <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
                                    <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
                                        <FontAwesomeIcon icon={faFileMedical} className="me-2" style={{ color: '#10b981' }} />
                                        Form Konsultasi Baru
                                    </h5>
                                    <hr className="mt-3" />
                                </div>
                                <div className="card-body p-4">
                                    {formErrors.general && (
                                        <div className="alert alert-danger py-2 mb-3 d-flex align-items-center">
                                            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                                            {formErrors.general}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit}>
                                        {/* Disease History */}
                                        <div className="mb-4">
                                            <label className="form-label fw-semibold" style={{ color: '#1e293b' }}>
                                                <FontAwesomeIcon icon={faHistory} className="me-2" style={{ color: '#8b5cf6' }} />
                                                Riwayat Penyakit
                                            </label>
                                            <textarea
                                                className={`form-control ${formErrors.disease_history ? 'is-invalid' : ''}`}
                                                placeholder="Ceritakan riwayat penyakit yang pernah Anda alami..."
                                                rows="4"
                                                value={formData.disease_history}
                                                onChange={(e) => setFormData({...formData, disease_history: e.target.value})}
                                                style={{ 
                                                    borderRadius: '10px', 
                                                    padding: '15px',
                                                    border: '1px solid #e2e8f0',
                                                    resize: 'vertical'
                                                }}
                                            />
                                            {formErrors.disease_history && (
                                                <div className="invalid-feedback">{formErrors.disease_history}</div>
                                            )}
                                            <small className="text-muted mt-1 d-block">
                                                <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                                                Contoh: diabetes, hipertensi, asma, alergi, dll.
                                            </small>
                                        </div>

                                        {/* Current Symptoms */}
                                        <div className="mb-4">
                                            <label className="form-label fw-semibold" style={{ color: '#1e293b' }}>
                                                <FontAwesomeIcon icon={faNotesMedical} className="me-2" style={{ color: '#ef4444' }} />
                                                Gejala Saat Ini
                                            </label>
                                            <textarea
                                                className={`form-control ${formErrors.current_symptoms ? 'is-invalid' : ''}`}
                                                placeholder="Jelaskan gejala yang sedang Anda alami saat ini..."
                                                rows="4"
                                                value={formData.current_symptoms}
                                                onChange={(e) => setFormData({...formData, current_symptoms: e.target.value})}
                                                style={{ 
                                                    borderRadius: '10px', 
                                                    padding: '15px',
                                                    border: '1px solid #e2e8f0',
                                                    resize: 'vertical'
                                                }}
                                            />
                                            {formErrors.current_symptoms && (
                                                <div className="invalid-feedback">{formErrors.current_symptoms}</div>
                                            )}
                                            <small className="text-muted mt-1 d-block">
                                                <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                                                Contoh: demam, pusing, batuk, nyeri sendi, dll.
                                            </small>
                                        </div>

                                        {/* Submit Button */}
                                        <div className="d-flex justify-content-end gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-light px-4"
                                                onClick={() => {
                                                    setShowForm(false);
                                                    setFormData({ disease_history: '', current_symptoms: '' });
                                                    setFormErrors({});
                                                }}
                                                style={{ borderRadius: '10px', fontWeight: '500' }}
                                            >
                                                <FontAwesomeIcon icon={faXmark} className="me-2" />
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn px-4 text-white"
                                                disabled={submitting}
                                                style={{ 
                                                    borderRadius: '10px', 
                                                    fontWeight: '500',
                                                    backgroundColor: '#10b981',
                                                    border: 'none'
                                                }}
                                            >
                                                {submitting ? (
                                                    <>
                                                        <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                                                        Mengirim...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                                                        Kirim Konsultasi
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

                {/* Error Message */}
                {error && (
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="alert alert-danger d-flex align-items-center" role="alert">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                                <div>{error}</div>
                                <button className="btn btn-outline-danger ms-3" onClick={fetchConsultations}>
                                    Coba Lagi
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Consultation History */}
                <div className="row">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                            <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
                                        <FontAwesomeIcon icon={faClipboardList} className="me-2" style={{ color: '#10b981' }} />
                                        Riwayat Konsultasi
                                    </h5>
                                    {consultations.length > 0 && (
                                        <span className="badge px-3 py-2" style={{ 
                                            backgroundColor: '#d1fae5',
                                            color: '#047857',
                                            borderRadius: '20px',
                                            fontWeight: '500'
                                        }}>
                                            {consultations.length} Konsultasi
                                        </span>
                                    )}
                                </div>
                                <hr className="mt-3" />
                            </div>
                            <div className="card-body p-4">
                                {consultations.length === 0 ? (
                                    <div className="text-center py-5">
                                        <div className="mb-3">
                                            <div className="d-inline-flex align-items-center justify-content-center rounded-circle"
                                                 style={{
                                                     width: '80px',
                                                     height: '80px',
                                                     backgroundColor: '#f0fdf4',
                                                     border: '2px dashed #6ee7b7'
                                                 }}>
                                                <FontAwesomeIcon 
                                                    icon={faClipboardList} 
                                                    style={{ fontSize: '32px', color: '#10b981' }} 
                                                />
                                            </div>
                                        </div>
                                        <h6 style={{ color: '#64748b' }}>Belum ada riwayat konsultasi</h6>
                                        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                            Klik tombol "Buat Konsultasi" untuk memulai konsultasi dengan dokter
                                        </p>
                                    </div>
                                ) : (
                                    <div className="d-flex flex-column gap-3">
                                        {consultations.map((consultation) => {
                                            const statusConfig = getStatusConfig(consultation.status);
                                            const isExpanded = expandedId === consultation.id;
                                            
                                            return (
                                                <div 
                                                    key={consultation.id}
                                                    className="rounded-3"
                                                    style={{
                                                        border: `1px solid ${statusConfig.borderColor}`,
                                                        backgroundColor: '#ffffff',
                                                        overflow: 'hidden',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                >
                                                    {/* Consultation Header - Clickable */}
                                                    <div 
                                                        className="p-3 d-flex justify-content-between align-items-center"
                                                        onClick={() => toggleExpand(consultation.id)}
                                                        style={{ cursor: 'pointer', userSelect: 'none' }}
                                                    >
                                                        <div className="d-flex align-items-center gap-3">
                                                            {/* Status Icon */}
                                                            <div className="d-flex align-items-center justify-content-center rounded-circle"
                                                                 style={{
                                                                     width: '45px',
                                                                     height: '45px',
                                                                     backgroundColor: statusConfig.bgColor,
                                                                     flexShrink: 0
                                                                 }}>
                                                                <FontAwesomeIcon 
                                                                    icon={statusConfig.icon} 
                                                                    style={{ 
                                                                        fontSize: '18px', 
                                                                        color: statusConfig.color 
                                                                    }} 
                                                                />
                                                            </div>
                                                            
                                                            <div>
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <span className="badge px-2 py-1" style={{
                                                                        backgroundColor: statusConfig.bgColor,
                                                                        color: statusConfig.color,
                                                                        borderRadius: '6px',
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: '600'
                                                                    }}>
                                                                        {statusConfig.label}
                                                                    </span>
                                                                </div>
                                                                <div className="d-flex align-items-center gap-3 mt-1">
                                                                    <small className="text-muted">
                                                                        <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                                                        {formatDateShort(consultation.created_at)}
                                                                    </small>
                                                                    {consultation.doctor && (
                                                                        <small className="text-muted">
                                                                            <FontAwesomeIcon icon={faUserMd} className="me-1" />
                                                                            Dr. {consultation.doctor.name}
                                                                        </small>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="d-flex align-items-center gap-2">
                                                            {/* Timestamp */}
                                                            <small className="text-muted d-none d-md-block">
                                                                <FontAwesomeIcon icon={faClock} className="me-1" />
                                                                {formatDate(consultation.created_at)}
                                                            </small>
                                                            
                                                            {/* Expand Icon */}
                                                            <div className="d-flex align-items-center justify-content-center rounded-circle"
                                                                 style={{
                                                                     width: '30px',
                                                                     height: '30px',
                                                                     backgroundColor: '#f1f5f9',
                                                                     flexShrink: 0
                                                                 }}>
                                                                <FontAwesomeIcon 
                                                                    icon={isExpanded ? faChevronUp : faChevronDown} 
                                                                    style={{ 
                                                                        fontSize: '12px', 
                                                                        color: '#64748b' 
                                                                    }} 
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Expanded Content */}
                                                    {isExpanded && (
                                                        <div style={{
                                                            backgroundColor: '#f8fafc',
                                                            borderTop: `1px solid ${statusConfig.borderColor}`,
                                                            padding: '20px',
                                                            animation: 'fadeIn 0.3s ease'
                                                        }}>
                                                            <div className="row g-3">
                                                                {/* Disease History */}
                                                                <div className="col-md-6">
                                                                    <div className="p-3 rounded-3 bg-white" style={{ border: '1px solid #e2e8f0' }}>
                                                                        <label className="fw-semibold mb-2" style={{ color: '#8b5cf6', fontSize: '0.9rem' }}>
                                                                            <FontAwesomeIcon icon={faHistory} className="me-2" />
                                                                            Riwayat Penyakit
                                                                        </label>
                                                                        <p className="mb-0" style={{ color: '#334155', lineHeight: '1.6' }}>
                                                                            {consultation.disease_history || '-'}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Current Symptoms */}
                                                                <div className="col-md-6">
                                                                    <div className="p-3 rounded-3 bg-white" style={{ border: '1px solid #e2e8f0' }}>
                                                                        <label className="fw-semibold mb-2" style={{ color: '#ef4444', fontSize: '0.9rem' }}>
                                                                            <FontAwesomeIcon icon={faNotesMedical} className="me-2" />
                                                                            Gejala Saat Ini
                                                                        </label>
                                                                        <p className="mb-0" style={{ color: '#334155', lineHeight: '1.6' }}>
                                                                            {consultation.current_symptoms || '-'}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Doctor Notes (if any) */}
                                                                {consultation.doctor_notes && (
                                                                    <div className="col-12">
                                                                        <div className="p-3 rounded-3" style={{ 
                                                                            backgroundColor: '#eff6ff', 
                                                                            border: '1px solid #93c5fd' 
                                                                        }}>
                                                                            <label className="fw-semibold mb-2" style={{ color: '#3b82f6', fontSize: '0.9rem' }}>
                                                                                <FontAwesomeIcon icon={faUserMd} className="me-2" />
                                                                                Catatan Dokter
                                                                            </label>
                                                                            <p className="mb-0" style={{ color: '#1e3a8a', lineHeight: '1.6' }}>
                                                                                {consultation.doctor_notes}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Doctor Info (if assigned) */}
                                                                {consultation.doctor && (
                                                                    <div className="col-12">
                                                                        <div className="p-3 rounded-3" style={{ 
                                                                            backgroundColor: '#f0fdf4', 
                                                                            border: '1px solid #6ee7b7' 
                                                                        }}>
                                                                            <div className="d-flex align-items-center gap-3">
                                                                                <div className="d-flex align-items-center justify-content-center rounded-circle"
                                                                                     style={{
                                                                                         width: '40px',
                                                                                         height: '40px',
                                                                                         backgroundColor: '#d1fae5',
                                                                                         flexShrink: 0
                                                                                     }}>
                                                                                    <FontAwesomeIcon 
                                                                                        icon={faUserMd} 
                                                                                        style={{ fontSize: '18px', color: '#047857' }} 
                                                                                    />
                                                                                </div>
                                                                                <div>
                                                                                    <strong style={{ color: '#047857', fontSize: '0.95rem' }}>
                                                                                        Dr. {consultation.doctor.name}
                                                                                    </strong>
                                                                                    <br />
                                                                                    <small style={{ color: '#047857', opacity: 0.7 }}>
                                                                                        {consultation.doctor.role || 'Dokter'}
                                                                                    </small>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Footer Info */}
                                                                <div className="col-12">
                                                                    <div className="d-flex justify-content-between align-items-center mt-2 p-2 rounded-3" 
                                                                         style={{ backgroundColor: '#f1f5f9' }}>
                                                                        <small className="text-muted">
                                                                            <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                                                            Dibuat: {formatDate(consultation.created_at)}
                                                                        </small>
                                                                        <small className="text-muted">
                                                                            <FontAwesomeIcon icon={faClock} className="me-1" />
                                                                            Diperbarui: {formatDate(consultation.updated_at)}
                                                                        </small>
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
            </div>

            {/* Add fadeIn animation */}
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