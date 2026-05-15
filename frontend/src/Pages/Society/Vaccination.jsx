// src/Pages/Society/Vaccination.jsx
import React, { useState, useEffect } from 'react';
import MainPublic from '../Layouts/MainPublic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSyringe,
    faCalendarAlt,
    faClock,
    faCheckCircle,
    faUserMd,
    faUserNurse,
    faMapMarkerAlt,
    faHospital,
    faExclamationTriangle,
    faPlus,
    faChevronDown,
    faChevronUp,
    faInfoCircle,
    faSpinner,
    faFileMedical,
    faXmark,
    faVial,
    faShieldAlt,
    faGlobeAsia,
    faHistory,
    faCalendarCheck,
    faUsers,
    faBuilding,
    faStopwatch,
    faForward,
} from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

export default function Vaccination() {
    const [vaccinations, setVaccinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    
    const [formData, setFormData] = useState({
        spot_id: '',
        vaccine_id: '',
        date: '',
        dose: '1'
    });

    const [spots, setSpots] = useState([]);
    const [vaccines, setVaccines] = useState([]);
    const [loadingFormData, setLoadingFormData] = useState(false);

    // Fetch vaccination history
    const fetchVaccinations = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = localStorage.getItem('token');
            const response = await api.get(`/vaccinations?token=${token}`);
            
            if (response.data && response.data.vaccinations) {
                setVaccinations(response.data.vaccinations);
            }
        } catch (err) {
            console.error('Error fetching vaccinations:', err);
            if (err.response?.status === 404) {
                setVaccinations([]);
            } else {
                setError('Gagal memuat data vaksinasi. Silakan coba lagi.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Fetch spots and vaccines for form
    const fetchFormData = async () => {
        try {
            setLoadingFormData(true);
            const token = localStorage.getItem('token');
            
            const spotsResponse = await api.get(`/auth/spots?token=${token}`);
            if (spotsResponse.data && spotsResponse.data.data) {
                setSpots(spotsResponse.data.data);
            }
            
            const vaccinesResponse = await api.get(`/auth/vaccine?token=${token}`);
            if (vaccinesResponse.data && vaccinesResponse.data.data) {
                setVaccines(vaccinesResponse.data.data);
            }
        } catch (err) {
            console.error('Error fetching form data:', err);
        } finally {
            setLoadingFormData(false);
        }
    };

    useEffect(() => {
        fetchVaccinations();
    }, []);

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

    const formatDateShort = (dateString) => {
        if (!dateString) return '-';
        const options = { 
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    const getDoseConfig = (dose) => {
        switch (dose) {
            case 1:
                return {
                    label: 'Dosis 1 (Primer)',
                    icon: faSyringe,
                    color: '#3b82f6',
                    bgColor: '#dbeafe',
                    borderColor: '#93c5fd',
                    description: 'Vaksinasi primer pertama'
                };
            case 2:
                return {
                    label: 'Dosis 2 (Primer Lengkap)',
                    icon: faSyringe,
                    color: '#10b981',
                    bgColor: '#d1fae5',
                    borderColor: '#6ee7b7',
                    description: 'Vaksinasi primer lengkap'
                };
            case 3:
                return {
                    label: 'Dosis 3 (Booster 1)',
                    icon: faForward,
                    color: '#f59e0b',
                    bgColor: '#fef3c7',
                    borderColor: '#fcd34d',
                    description: 'Booster pertama'
                };
            case 4:
                return {
                    label: 'Dosis 4 (Booster 2)',
                    icon: faForward,
                    color: '#ef4444',
                    bgColor: '#fee2e2',
                    borderColor: '#fca5a5',
                    description: 'Booster kedua'
                };
            case 5:
                return {
                    label: 'Dosis 5 (Tahunan)',
                    icon: faCalendarCheck,
                    color: '#8b5cf6',
                    bgColor: '#ede9fe',
                    borderColor: '#c4b5fd',
                    description: 'Vaksinasi tahunan'
                };
            default:
                return {
                    label: `Dosis ${dose}`,
                    icon: faSyringe,
                    color: '#6b7280',
                    bgColor: '#f3f4f6',
                    borderColor: '#d1d5db',
                    description: `Vaksinasi dosis ke-${dose}`
                };
        }
    };

    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleSpotChange = (spotId) => {
        setFormData({...formData, spot_id: spotId, vaccine_id: ''});
    };

    const getAvailableVaccines = () => {
        if (!formData.spot_id) return vaccines;
        
        const selectedSpot = spots.find(spot => spot.id === parseInt(formData.spot_id));
        if (!selectedSpot || !selectedSpot.spot_vaccines) return vaccines;
        
        const availableVaccineIds = selectedSpot.spot_vaccines.map(sv => sv.vaccine_id);
        return vaccines.filter(vaccine => availableVaccineIds.includes(vaccine.id));
    };

    const getSelectedSpot = () => {
        if (!formData.spot_id) return null;
        return spots.find(spot => spot.id === parseInt(formData.spot_id));
    };

    const getMinimumInterval = (dose) => {
        const intervals = { 2: 14, 3: 90, 4: 180, 5: 365 };
        return intervals[dose] || 30;
    };

    const getAvailableDoses = () => {
        if (vaccinations.length === 0) {
            return [{ value: 1, label: 'Dosis 1 (Vaksinasi Pertama)', disabled: false }];
        }
        
        const maxExistingDose = Math.max(...vaccinations.map(v => v.dose));
        const nextDose = maxExistingDose + 1;
        
        if (nextDose > 10) {
            return [{ value: '', label: 'Vaksinasi sudah maksimal (10 dosis)', disabled: true }];
        }
        
        const doseLabels = {
            2: ' (Primer Lengkap - 14 hari setelah dosis 1)',
            3: ' (Booster 1 - 90 hari setelah dosis 2)',
            4: ' (Booster 2 - 180 hari setelah dosis 3)',
            5: ' (Tahunan - 365 hari setelah dosis 4)',
        };
        
        const label = doseLabels[nextDose] || ` (${getMinimumInterval(nextDose)} hari setelah dosis ${nextDose-1})`;
        
        return [{ value: nextDose, label: `Dosis ${nextDose}${label}`, disabled: false }];
    };

    const getIntervalInfo = () => {
        const dose = parseInt(formData.dose);
        if (dose <= 1 || vaccinations.length === 0) return null;
        
        const lastDose = vaccinations.find(v => v.dose === dose - 1);
        if (!lastDose) return null;
        
        const minimumInterval = getMinimumInterval(dose);
        const lastDate = new Date(lastDose.date);
        const eligibleDate = new Date(lastDate);
        eligibleDate.setDate(eligibleDate.getDate() + minimumInterval);
        
        return {
            lastDate,
            eligibleDate,
            minimumInterval,
            isEligible: new Date() >= eligibleDate,
            lastVaccine: lastDose.vaccine?.name
        };
    };

    const getRecommendedVaccines = () => {
        const dose = parseInt(formData.dose);
        const availableVaccines = getAvailableVaccines();
        
        if (dose === 2) {
            const dose1 = vaccinations.find(v => v.dose === 1);
            if (dose1) {
                const filtered = availableVaccines.filter(v => v.id === dose1.vaccine?.id);
                return filtered.length > 0 ? filtered : availableVaccines;
            }
        }
        
        return availableVaccines;
    };

    const validateForm = () => {
        const errors = {};
        
        if (!formData.spot_id) {
            errors.spot_id = 'Lokasi vaksinasi harus dipilih';
        }
        
        if (!formData.vaccine_id) {
            errors.vaccine_id = 'Jenis vaksin harus dipilih';
        }
        
        if (!formData.date) {
            errors.date = 'Tanggal vaksinasi harus diisi';
        } else {
            const intervalInfo = getIntervalInfo();
            if (intervalInfo && !intervalInfo.isEligible) {
                const selectedDate = new Date(formData.date);
                if (selectedDate < intervalInfo.eligibleDate) {
                    errors.date = `Minimal ${intervalInfo.minimumInterval} hari setelah vaksinasi sebelumnya`;
                }
            }
        }
        
        if (!formData.dose) {
            errors.dose = 'Dosis harus dipilih';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        try {
            setSubmitting(true);
            
            const token = localStorage.getItem('token');
            const submitData = {
                spot_id: parseInt(formData.spot_id),
                vaccine_id: parseInt(formData.vaccine_id),
                date: formData.date,
                dose: parseInt(formData.dose)
            };
            
            await api.post(`/vaccinations?token=${token}`, submitData);
            
            setFormData({
                spot_id: '',
                vaccine_id: '',
                date: '',
                dose: '1'
            });
            setShowForm(false);
            setFormErrors({});
            
            setSuccessMessage('Pendaftaran vaksinasi berhasil! Silakan datang sesuai jadwal.');
            
            await fetchVaccinations();
            
            setTimeout(() => {
                setSuccessMessage('');
            }, 5000);
            
        } catch (err) {
            console.error('Error submitting vaccination:', err);
            if (err.response?.data?.message) {
                setFormErrors({ general: err.response.data.message });
            } else if (err.response?.data?.errors) {
                setFormErrors(err.response.data.errors);
            } else {
                setFormErrors({ general: 'Gagal mendaftar vaksinasi. Silakan coba lagi.' });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenForm = () => {
        setShowForm(!showForm);
        setFormErrors({});
        if (!showForm) {
            fetchFormData();
            if (vaccinations.length > 0) {
                const nextDose = Math.max(...vaccinations.map(v => v.dose)) + 1;
                if (nextDose <= 10) {
                    setFormData(prev => ({...prev, dose: nextDose.toString()}));
                }
            }
        }
    };

    const isMaxVaccination = vaccinations.length > 0 && 
        Math.max(...vaccinations.map(v => v.dose)) >= 10;

    if (loading) {
        return (
            <MainPublic>
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted">Memuat data vaksinasi...</p>
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
                            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
                            borderRadius: '16px',
                            color: 'white'
                        }}>
                            <div className="card-body p-4">
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                                    <div>
                                        <h4 className="mb-1 fw-bold">
                                            <FontAwesomeIcon icon={faSyringe} className="me-2" />
                                            Vaksinasi
                                        </h4>
                                        <p className="mb-0 opacity-75">
                                            Daftarkan diri Anda untuk mendapatkan vaksinasi di lokasi terdekat
                                        </p>
                                        {vaccinations.length > 0 && (
                                            <span className="badge bg-light text-primary mt-2 px-3 py-1" style={{ fontSize: '0.85rem' }}>
                                                Dosis terakhir: {Math.max(...vaccinations.map(v => v.dose))}
                                            </span>
                                        )}
                                    </div>
                                    <button 
                                        className="btn btn-light mt-3 mt-md-0"
                                        onClick={handleOpenForm}
                                        disabled={isMaxVaccination}
                                        style={{ 
                                            borderRadius: '10px',
                                            fontWeight: '500',
                                            opacity: isMaxVaccination ? 0.5 : 1
                                        }}
                                        title={isMaxVaccination ? 'Vaksinasi sudah mencapai maksimal 10 dosis' : ''}
                                    >
                                        <FontAwesomeIcon icon={showForm ? faXmark : faPlus} className="me-2" />
                                        {showForm ? 'Tutup Form' : isMaxVaccination ? 'Maksimal Tercapai' : 'Daftar Vaksinasi'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vaccination Progress Cards */}
                {vaccinations.length > 0 && (
                    <div className="row mb-4 g-3">
                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                                <div className="card-body p-4">
                                    <h6 className="fw-bold mb-3" style={{ color: '#1e293b' }}>
                                        <FontAwesomeIcon icon={faStopwatch} className="me-2" style={{ color: '#3b82f6' }} />
                                        Progress Vaksinasi
                                    </h6>
                                    <div className="progress mb-3" style={{ height: '12px', borderRadius: '6px' }}>
                                        <div 
                                            className="progress-bar bg-success" 
                                            style={{ 
                                                width: `${(Math.max(...vaccinations.map(v => v.dose)) / 10) * 100}%`,
                                                transition: 'width 0.5s ease'
                                            }}
                                        />
                                    </div>
                                    <small className="text-muted">
                                        {Math.max(...vaccinations.map(v => v.dose))} dari 10 dosis maksimal
                                    </small>
                                </div>
                            </div>
                        </div>

                        {!isMaxVaccination && (
                            <div className="col-md-6">
                                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                                    <div className="card-body p-4">
                                        <h6 className="fw-bold mb-3" style={{ color: '#1e293b' }}>
                                            <FontAwesomeIcon icon={faForward} className="me-2" style={{ color: '#10b981' }} />
                                            Dosis Berikutnya
                                        </h6>
                                        {(() => {
                                            const nextDose = Math.max(...vaccinations.map(v => v.dose)) + 1;
                                            const lastVaccination = vaccinations[vaccinations.length - 1];
                                            const interval = getMinimumInterval(nextDose);
                                            
                                            return (
                                                <div>
                                                    <span className="badge px-3 py-2 mb-2" style={{ 
                                                        backgroundColor: getDoseConfig(nextDose).bgColor,
                                                        color: getDoseConfig(nextDose).color,
                                                        borderRadius: '20px',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        {getDoseConfig(nextDose).label}
                                                    </span>
                                                    {lastVaccination && (
                                                        <div className="mt-2">
                                                            <small className="text-muted d-block">
                                                                <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                                                Vaksinasi terakhir: {formatDateShort(lastVaccination.date)}
                                                            </small>
                                                            <small className="text-muted d-block">
                                                                <FontAwesomeIcon icon={faClock} className="me-1" />
                                                                Bisa daftar {interval} hari setelahnya
                                                            </small>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Register Vaccination Form */}
                {showForm && (
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                                <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
                                    <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
                                        <FontAwesomeIcon icon={faFileMedical} className="me-2" style={{ color: '#3b82f6' }} />
                                        Form Pendaftaran Vaksinasi
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

                                    {loadingFormData ? (
                                        <div className="text-center py-4">
                                            <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: '24px', color: '#3b82f6' }} />
                                            <p className="text-muted mt-2">Memuat data lokasi dan vaksin...</p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit}>
                                            <div className="row g-3">
                                                {/* Spot Location */}
                                                <div className="col-md-6">
                                                    <label className="form-label fw-semibold" style={{ color: '#1e293b' }}>
                                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" style={{ color: '#ef4444' }} />
                                                        Lokasi Vaksinasi
                                                    </label>
                                                    <select
                                                        className={`form-select ${formErrors.spot_id ? 'is-invalid' : ''}`}
                                                        value={formData.spot_id}
                                                        onChange={(e) => handleSpotChange(e.target.value)}
                                                        style={{ 
                                                            borderRadius: '10px', 
                                                            padding: '10px 15px',
                                                            border: '1px solid #e2e8f0'
                                                        }}
                                                    >
                                                        <option value="">Pilih lokasi vaksinasi</option>
                                                        {spots.map((spot) => (
                                                            <option key={spot.id} value={spot.id}>
                                                                {spot.name} - {spot.address} ({spot.regional?.district || ''})
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {formErrors.spot_id && (
                                                        <div className="invalid-feedback">{formErrors.spot_id}</div>
                                                    )}
                                                </div>

                                                {/* Vaccine Type */}
                                                <div className="col-md-6">
                                                    <label className="form-label fw-semibold" style={{ color: '#1e293b' }}>
                                                        <FontAwesomeIcon icon={faVial} className="me-2" style={{ color: '#8b5cf6' }} />
                                                        Jenis Vaksin
                                                    </label>
                                                    <select
                                                        className={`form-select ${formErrors.vaccine_id ? 'is-invalid' : ''}`}
                                                        value={formData.vaccine_id}
                                                        onChange={(e) => setFormData({...formData, vaccine_id: e.target.value})}
                                                        disabled={!formData.spot_id}
                                                        style={{ 
                                                            borderRadius: '10px', 
                                                            padding: '10px 15px',
                                                            border: '1px solid #e2e8f0'
                                                        }}
                                                    >
                                                        <option value="">
                                                            {formData.spot_id 
                                                                ? (getRecommendedVaccines().length > 0 ? 'Pilih jenis vaksin' : 'Tidak ada vaksin tersedia')
                                                                : 'Pilih lokasi terlebih dahulu'
                                                            }
                                                        </option>
                                                        {getRecommendedVaccines().map((vaccine) => (
                                                            <option key={vaccine.id} value={vaccine.id}>
                                                                {vaccine.name}
                                                                {parseInt(formData.dose) === 2 && ' (Harus sama dengan Dosis 1)'}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {formErrors.vaccine_id && (
                                                        <div className="invalid-feedback">{formErrors.vaccine_id}</div>
                                                    )}
                                                </div>

                                                {/* Date */}
                                                <div className="col-md-6">
                                                    <label className="form-label fw-semibold" style={{ color: '#1e293b' }}>
                                                        <FontAwesomeIcon icon={faCalendarAlt} className="me-2" style={{ color: '#f59e0b' }} />
                                                        Tanggal Vaksinasi
                                                    </label>
                                                    <input
                                                        type="date"
                                                        className={`form-control ${formErrors.date ? 'is-invalid' : ''}`}
                                                        value={formData.date}
                                                        min={getTodayDate()}
                                                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                                                        style={{ 
                                                            borderRadius: '10px', 
                                                            padding: '10px 15px',
                                                            border: '1px solid #e2e8f0'
                                                        }}
                                                    />
                                                    {formErrors.date && (
                                                        <div className="invalid-feedback">{formErrors.date}</div>
                                                    )}
                                                    {getIntervalInfo() && (
                                                        <small className="text-muted mt-1 d-block">
                                                            <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                                                            Minimal {getIntervalInfo().minimumInterval} hari setelah{' '}
                                                            {formatDateShort(getIntervalInfo().lastDate)}
                                                        </small>
                                                    )}
                                                </div>

                                                {/* Dose */}
                                                <div className="col-md-6">
                                                    <label className="form-label fw-semibold" style={{ color: '#1e293b' }}>
                                                        <FontAwesomeIcon icon={faSyringe} className="me-2" style={{ color: '#3b82f6' }} />
                                                        Dosis
                                                    </label>
                                                    <select
                                                        className={`form-select ${formErrors.dose ? 'is-invalid' : ''}`}
                                                        value={formData.dose}
                                                        onChange={(e) => setFormData({...formData, dose: e.target.value})}
                                                        style={{ 
                                                            borderRadius: '10px', 
                                                            padding: '10px 15px',
                                                            border: '1px solid #e2e8f0'
                                                        }}
                                                    >
                                                        {getAvailableDoses().map((doseOption, index) => (
                                                            <option 
                                                                key={index} 
                                                                value={doseOption.value}
                                                                disabled={doseOption.disabled}
                                                            >
                                                                {doseOption.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {formErrors.dose && (
                                                        <div className="invalid-feedback">{formErrors.dose}</div>
                                                    )}
                                                </div>

                                                {/* Selected Spot Info */}
                                                {getSelectedSpot() && (
                                                    <div className="col-12">
                                                        <div className="p-3 rounded-3" style={{ 
                                                            backgroundColor: '#f0fdf4', 
                                                            border: '1px solid #6ee7b7' 
                                                        }}>
                                                            <div className="row g-2">
                                                                <div className="col-md-4">
                                                                    <small className="text-muted">
                                                                        <FontAwesomeIcon icon={faHospital} className="me-1" />
                                                                        Lokasi
                                                                    </small>
                                                                    <p className="mb-0 fw-semibold" style={{ color: '#047857', fontSize: '0.9rem' }}>
                                                                        {getSelectedSpot().name}
                                                                    </p>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <small className="text-muted">
                                                                        <FontAwesomeIcon icon={faUsers} className="me-1" />
                                                                        Kapasitas
                                                                    </small>
                                                                    <p className="mb-0 fw-semibold" style={{ color: '#047857', fontSize: '0.9rem' }}>
                                                                        {getSelectedSpot().capacity} orang/hari
                                                                    </p>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <small className="text-muted">
                                                                        <FontAwesomeIcon icon={faBuilding} className="me-1" />
                                                                        Melayani
                                                                    </small>
                                                                    <p className="mb-0 fw-semibold" style={{ color: '#047857', fontSize: '0.9rem' }}>
                                                                        {getSelectedSpot().serve}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Info Box */}
                                                <div className="col-12">
                                                    <div className="p-3 rounded-3" style={{ 
                                                        backgroundColor: '#eff6ff', 
                                                        border: '1px solid #93c5fd' 
                                                    }}>
                                                        <div className="d-flex align-items-start">
                                                            <FontAwesomeIcon 
                                                                icon={faInfoCircle} 
                                                                className="me-2 mt-1" 
                                                                style={{ color: '#3b82f6' }} 
                                                            />
                                                            <div>
                                                                <strong style={{ color: '#1e3a8a', fontSize: '0.9rem' }}>
                                                                    Informasi Penting:
                                                                </strong>
                                                                <ul className="mb-0 mt-2 ps-3" style={{ color: '#1e3a8a', fontSize: '0.85rem' }}>
                                                                    <li>Konsultasi Anda harus sudah diterima oleh dokter</li>
                                                                    <li>Dosis harus berurutan (tidak bisa loncat)</li>
                                                                    <li>Dosis 2: minimal 14 hari, vaksin harus sama</li>
                                                                    <li>Dosis 3+: bisa vaksin berbeda (heterologous booster)</li>
                                                                    <li>Maksimal 10 dosis per orang</li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Submit Button */}
                                            <div className="d-flex justify-content-end gap-2 mt-4">
                                                <button
                                                    type="button"
                                                    className="btn btn-light px-4"
                                                    onClick={() => {
                                                        setShowForm(false);
                                                        setFormData({ spot_id: '', vaccine_id: '', date: '', dose: '1' });
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
                                                        backgroundColor: '#3b82f6',
                                                        border: 'none'
                                                    }}
                                                >
                                                    {submitting ? (
                                                        <>
                                                            <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                                                            Mendaftarkan...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FontAwesomeIcon icon={faCalendarCheck} className="me-2" />
                                                            Daftar Vaksinasi
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    )}
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
                                <button className="btn btn-outline-danger ms-3" onClick={fetchVaccinations}>
                                    Coba Lagi
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Vaccination History */}
                <div className="row">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                            <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
                                        <FontAwesomeIcon icon={faHistory} className="me-2" style={{ color: '#3b82f6' }} />
                                        Riwayat Vaksinasi
                                    </h5>
                                    {vaccinations.length > 0 && (
                                        <span className="badge px-3 py-2" style={{ 
                                            backgroundColor: '#dbeafe',
                                            color: '#1e40af',
                                            borderRadius: '20px',
                                            fontWeight: '500'
                                        }}>
                                            {vaccinations.length} Vaksinasi
                                        </span>
                                    )}
                                </div>
                                <hr className="mt-3" />
                            </div>
                            <div className="card-body p-4">
                                {vaccinations.length === 0 ? (
                                    <div className="text-center py-5">
                                        <div className="mb-3">
                                            <div className="d-inline-flex align-items-center justify-content-center rounded-circle"
                                                 style={{
                                                     width: '80px',
                                                     height: '80px',
                                                     backgroundColor: '#eff6ff',
                                                     border: '2px dashed #93c5fd'
                                                 }}>
                                                <FontAwesomeIcon 
                                                    icon={faSyringe} 
                                                    style={{ fontSize: '32px', color: '#3b82f6' }} 
                                                />
                                            </div>
                                        </div>
                                        <h6 style={{ color: '#64748b' }}>Belum ada riwayat vaksinasi</h6>
                                        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                            Klik tombol "Daftar Vaksinasi" untuk mendaftarkan diri Anda
                                        </p>
                                    </div>
                                ) : (
                                    <div className="d-flex flex-column gap-3">
                                        {vaccinations.map((vaccination) => {
                                            const doseConfig = getDoseConfig(vaccination.dose);
                                            const isExpanded = expandedId === vaccination.id;
                                            
                                            return (
                                                <div 
                                                    key={vaccination.id}
                                                    className="rounded-3"
                                                    style={{
                                                        border: `1px solid ${doseConfig.borderColor}`,
                                                        backgroundColor: '#ffffff',
                                                        overflow: 'hidden',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                >
                                                    <div 
                                                        className="p-3 d-flex justify-content-between align-items-center"
                                                        onClick={() => toggleExpand(vaccination.id)}
                                                        style={{ cursor: 'pointer', userSelect: 'none' }}
                                                    >
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className="d-flex align-items-center justify-content-center rounded-circle"
                                                                 style={{
                                                                     width: '45px',
                                                                     height: '45px',
                                                                     backgroundColor: doseConfig.bgColor,
                                                                     flexShrink: 0
                                                                 }}>
                                                                <FontAwesomeIcon 
                                                                    icon={doseConfig.icon} 
                                                                    style={{ 
                                                                        fontSize: '18px', 
                                                                        color: doseConfig.color 
                                                                    }} 
                                                                />
                                                            </div>
                                                            
                                                            <div>
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <span className="badge px-2 py-1" style={{
                                                                        backgroundColor: doseConfig.bgColor,
                                                                        color: doseConfig.color,
                                                                        borderRadius: '6px',
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: '600'
                                                                    }}>
                                                                        {doseConfig.label}
                                                                    </span>
                                                                    <span className="badge px-2 py-1" style={{
                                                                        backgroundColor: '#f0fdf4',
                                                                        color: '#047857',
                                                                        borderRadius: '6px',
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: '600'
                                                                    }}>
                                                                        {vaccination.vaccine?.name || '-'}
                                                                    </span>
                                                                </div>
                                                                <div className="d-flex align-items-center gap-3 mt-1">
                                                                    <small className="text-muted">
                                                                        <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                                                        {formatDateShort(vaccination.date)}
                                                                    </small>
                                                                    <small className="text-muted">
                                                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                                                                        {vaccination.spot?.name || '-'}
                                                                    </small>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="d-flex align-items-center gap-2">
                                                            <small className="text-muted d-none d-md-block">
                                                                <FontAwesomeIcon icon={faClock} className="me-1" />
                                                                {formatDate(vaccination.created_at)}
                                                            </small>
                                                            
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

                                                    {isExpanded && (
                                                        <div style={{
                                                            backgroundColor: '#f8fafc',
                                                            borderTop: `1px solid ${doseConfig.borderColor}`,
                                                            padding: '20px',
                                                            animation: 'fadeIn 0.3s ease'
                                                        }}>
                                                            <div className="row g-3">
                                                                <div className="col-md-6">
                                                                    <div className="p-3 rounded-3 bg-white" style={{ border: '1px solid #e2e8f0' }}>
                                                                        <label className="fw-semibold mb-2" style={{ color: '#3b82f6', fontSize: '0.9rem' }}>
                                                                            <FontAwesomeIcon icon={faSyringe} className="me-2" />
                                                                            Informasi Vaksinasi
                                                                        </label>
                                                                        <div className="d-flex flex-column gap-2">
                                                                            <div>
                                                                                <small className="text-muted">Dosis</small>
                                                                                <p className="mb-0 fw-semibold" style={{ color: '#334155' }}>
                                                                                    {doseConfig.label}
                                                                                </p>
                                                                            </div>
                                                                            <div>
                                                                                <small className="text-muted">Vaksin</small>
                                                                                <p className="mb-0 fw-semibold" style={{ color: '#334155' }}>
                                                                                    <FontAwesomeIcon icon={faVial} className="me-1" style={{ color: '#8b5cf6' }} />
                                                                                    {vaccination.vaccine?.name || '-'}
                                                                                </p>
                                                                            </div>
                                                                            <div>
                                                                                <small className="text-muted">Tanggal</small>
                                                                                <p className="mb-0 fw-semibold" style={{ color: '#334155' }}>
                                                                                    <FontAwesomeIcon icon={faCalendarAlt} className="me-1" style={{ color: '#f59e0b' }} />
                                                                                    {formatDateShort(vaccination.date)}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-6">
                                                                    <div className="p-3 rounded-3 bg-white" style={{ border: '1px solid #e2e8f0' }}>
                                                                        <label className="fw-semibold mb-2" style={{ color: '#ef4444', fontSize: '0.9rem' }}>
                                                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                                                                            Lokasi Vaksinasi
                                                                        </label>
                                                                        <div className="d-flex flex-column gap-2">
                                                                            <div>
                                                                                <small className="text-muted">Nama Tempat</small>
                                                                                <p className="mb-0 fw-semibold" style={{ color: '#334155' }}>
                                                                                    <FontAwesomeIcon icon={faHospital} className="me-1" style={{ color: '#ef4444' }} />
                                                                                    {vaccination.spot?.name || '-'}
                                                                                </p>
                                                                            </div>
                                                                            <div>
                                                                                <small className="text-muted">Alamat</small>
                                                                                <p className="mb-0 fw-semibold" style={{ color: '#334155' }}>
                                                                                    {vaccination.spot?.address || '-'}
                                                                                </p>
                                                                            </div>
                                                                            <div>
                                                                                <small className="text-muted">Kapasitas</small>
                                                                                <p className="mb-0 fw-semibold" style={{ color: '#334155' }}>
                                                                                    <FontAwesomeIcon icon={faUsers} className="me-1" style={{ color: '#8b5cf6' }} />
                                                                                    {vaccination.spot?.capacity || '-'} orang/hari
                                                                                </p>
                                                                            </div>
                                                                            <div>
                                                                                <small className="text-muted">Regional</small>
                                                                                <p className="mb-0 fw-semibold" style={{ color: '#334155' }}>
                                                                                    <FontAwesomeIcon icon={faGlobeAsia} className="me-1" style={{ color: '#10b981' }} />
                                                                                    {vaccination.spot?.regional?.province || '-'} - {vaccination.spot?.regional?.district || '-'}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-6">
                                                                    <div className="p-3 rounded-3" style={{ 
                                                                        backgroundColor: '#f0fdf4', 
                                                                        border: '1px solid #6ee7b7' 
                                                                    }}>
                                                                        <label className="fw-semibold mb-2" style={{ color: '#047857', fontSize: '0.9rem' }}>
                                                                            <FontAwesomeIcon icon={faUserMd} className="me-2" />
                                                                            Dokter
                                                                        </label>
                                                                        <div className="d-flex align-items-center gap-2">
                                                                            <div className="d-flex align-items-center justify-content-center rounded-circle"
                                                                                 style={{
                                                                                     width: '35px',
                                                                                     height: '35px',
                                                                                     backgroundColor: '#d1fae5',
                                                                                     flexShrink: 0
                                                                                 }}>
                                                                                <FontAwesomeIcon 
                                                                                    icon={faUserMd} 
                                                                                    style={{ fontSize: '16px', color: '#047857' }} 
                                                                                />
                                                                            </div>
                                                                            <span style={{ color: '#047857', fontWeight: '500' }}>
                                                                                Dr. {vaccination.doctor?.name || '-'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-6">
                                                                    <div className="p-3 rounded-3" style={{ 
                                                                        backgroundColor: '#eff6ff', 
                                                                        border: '1px solid #93c5fd' 
                                                                    }}>
                                                                        <label className="fw-semibold mb-2" style={{ color: '#1e3a8a', fontSize: '0.9rem' }}>
                                                                            <FontAwesomeIcon icon={faUserNurse} className="me-2" />
                                                                            Petugas
                                                                        </label>
                                                                        <div className="d-flex align-items-center gap-2">
                                                                            <div className="d-flex align-items-center justify-content-center rounded-circle"
                                                                                 style={{
                                                                                     width: '35px',
                                                                                     height: '35px',
                                                                                     backgroundColor: '#dbeafe',
                                                                                     flexShrink: 0
                                                                                 }}>
                                                                                <FontAwesomeIcon 
                                                                                    icon={faUserNurse} 
                                                                                    style={{ fontSize: '16px', color: '#1e3a8a' }} 
                                                                                />
                                                                            </div>
                                                                            <span style={{ color: '#1e3a8a', fontWeight: '500' }}>
                                                                                {vaccination.officer?.name || '-'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="col-12">
                                                                    <div className="d-flex justify-content-between align-items-center mt-2 p-2 rounded-3" 
                                                                         style={{ backgroundColor: '#f1f5f9' }}>
                                                                        <small className="text-muted">
                                                                            <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                                                            Terdaftar: {formatDate(vaccination.created_at)}
                                                                        </small>
                                                                        <small className="text-muted">
                                                                            <FontAwesomeIcon icon={faShieldAlt} className="me-1" />
                                                                            ID: {vaccination.id}
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