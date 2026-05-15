// src/Pages/Society/SpotVaccination.jsx
import React, { useState, useEffect } from 'react';
import MainPublic from '../Layouts/MainPublic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMapMarkerAlt,
    faHospital,
    faUsers,
    faBuilding,
    faVial,
    faCheckCircle,
    faTimesCircle,
    faCalendarAlt,
    faExclamationTriangle,
    faSearch,
    faChevronDown,
    faChevronUp,
    faInfoCircle,
    faSpinner,
    faLocationDot,
    faXmark,
    faCity,
    faEye
} from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

export default function SpotVaccination() {
    const [spots, setSpots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [selectedSpot, setSelectedSpot] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailDate, setDetailDate] = useState('');
    const [spotDetail, setSpotDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [vaccineFilter, setVaccineFilter] = useState('all');

    // Fetch spots
    const fetchSpots = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = localStorage.getItem('token');
            const response = await api.get(`/spots?token=${token}`);
            
            if (response.data && response.data.spots) {
                setSpots(response.data.spots);
            }
        } catch (err) {
            console.error('Error fetching spots:', err);
            if (err.response?.status === 404) {
                setSpots([]);
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Gagal memuat data lokasi vaksinasi. Silakan coba lagi.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Fetch spot detail
    const fetchSpotDetail = async (spotId, date = '') => {
        try {
            setLoadingDetail(true);
            
            const token = localStorage.getItem('token');
            const url = date 
                ? `/spots/${spotId}?token=${token}&date=${date}`
                : `/spots/${spotId}?token=${token}`;
            
            const response = await api.get(url);
            
            if (response.data) {
                setSpotDetail(response.data);
            }
        } catch (err) {
            console.error('Error fetching spot detail:', err);
        } finally {
            setLoadingDetail(false);
        }
    };

    useEffect(() => {
        fetchSpots();
    }, []);

    // Get today's date
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    // Toggle expand spot card
    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    // Open detail modal
    const handleOpenDetail = async (spot) => {
        setSelectedSpot(spot);
        setDetailDate(getTodayDate());
        setShowDetailModal(true);
        await fetchSpotDetail(spot.id, getTodayDate());
    };

    // Handle date change in detail modal
    const handleDateChange = async (date) => {
        setDetailDate(date);
        if (selectedSpot && date) {
            await fetchSpotDetail(selectedSpot.id, date);
        }
    };

    // Get all available vaccine types
    const getAllVaccines = () => {
        const vaccineSet = new Set();
        spots.forEach(spot => {
            if (spot.available_vaccines) {
                Object.keys(spot.available_vaccines).forEach(vaccine => {
                    if (spot.available_vaccines[vaccine]) {
                        vaccineSet.add(vaccine);
                    }
                });
            }
        });
        return Array.from(vaccineSet);
    };

    // Filter spots
    const filteredSpots = spots.filter(spot => {
        const matchesSearch = spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             spot.address.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesVaccine = vaccineFilter === 'all' || 
                              (spot.available_vaccines && spot.available_vaccines[vaccineFilter]);
        
        return matchesSearch && matchesVaccine;
    });

    // Get capacity status - dipindahkan ke dalam komponen render atau dibuat sebagai fungsi lokal
    const getCapacityStatus = (spot, currentSpotDetail) => {
        if (!currentSpotDetail || currentSpotDetail.spot?.id !== spot.id) return null;
        
        const percentage = (currentSpotDetail.vaccination_count / spot.capacity) * 100;
        let status = {
            color: '#10b981',
            bgColor: '#d1fae5',
            label: 'Tersedia',
            icon: faCheckCircle
        };
        
        if (percentage >= 100) {
            status = {
                color: '#ef4444',
                bgColor: '#fee2e2',
                label: 'Penuh',
                icon: faTimesCircle
            };
        } else if (percentage >= 75) {
            status = {
                color: '#f59e0b',
                bgColor: '#fef3c7',
                label: 'Hampir Penuh',
                icon: faExclamationTriangle
            };
        }
        
        return { ...status, percentage, count: currentSpotDetail.vaccination_count };
    };

    // Hitung capacity status untuk modal
    const modalCapacityStatus = selectedSpot && spotDetail 
        ? getCapacityStatus(selectedSpot, spotDetail) 
        : null;

    if (loading) {
        return (
            <MainPublic>
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted">Memuat data lokasi vaksinasi...</p>
                    </div>
                </div>
            </MainPublic>
        );
    }

    return (
        <MainPublic>
            <div className="mx-4 my-2 py-4 py-md-5">
                {/* Header Section */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm" style={{ 
                            background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 50%, #2dd4bf 100%)',
                            borderRadius: '16px',
                            color: 'white'
                        }}>
                            <div className="card-body p-4">
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                                    <div>
                                        <h4 className="mb-1 fw-bold">
                                            <FontAwesomeIcon icon={faLocationDot} className="me-2" />
                                            Lokasi Vaksinasi
                                        </h4>
                                        <p className="mb-0 opacity-75">
                                            Temukan lokasi vaksinasi terdekat di wilayah Anda
                                        </p>
                                    </div>
                                    {spots.length > 0 && (
                                        <span className="badge bg-light text-primary mt-3 mt-md-0 px-3 py-2" style={{ 
                                            borderRadius: '20px',
                                            fontSize: '0.9rem'
                                        }}>
                                            {spots.length} Lokasi Tersedia
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="alert alert-danger d-flex align-items-center" role="alert">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                                <div>{error}</div>
                                <button className="btn btn-outline-danger ms-3" onClick={fetchSpots}>
                                    Coba Lagi
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search and Filter */}
                {spots.length > 0 && !error && (
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                                <div className="card-body p-3">
                                    <div className="row g-3">
                                        {/* Search */}
                                        <div className="col-md-6">
                                            <div className="input-group">
                                                <span className="input-group-text bg-white" style={{ 
                                                    border: '1px solid #e2e8f0',
                                                    borderRight: 'none',
                                                    borderRadius: '10px 0 0 10px'
                                                }}>
                                                    <FontAwesomeIcon icon={faSearch} style={{ color: '#64748b' }} />
                                                </span>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Cari lokasi atau alamat..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    style={{ 
                                                        border: '1px solid #e2e8f0',
                                                        borderLeft: 'none',
                                                        borderRadius: '0 10px 10px 0',
                                                        padding: '10px 15px'
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Vaccine Filter */}
                                        <div className="col-md-6">
                                            <select
                                                className="form-select"
                                                value={vaccineFilter}
                                                onChange={(e) => setVaccineFilter(e.target.value)}
                                                style={{ 
                                                    borderRadius: '10px',
                                                    padding: '10px 15px',
                                                    border: '1px solid #e2e8f0'
                                                }}
                                            >
                                                <option value="all">Semua Jenis Vaksin</option>
                                                {getAllVaccines().map((vaccine, index) => (
                                                    <option key={index} value={vaccine}>
                                                        {vaccine}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Spots List */}
                {!error && (
                    <div className="row">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                                <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
                                            <FontAwesomeIcon icon={faHospital} className="me-2" style={{ color: '#14b8a6' }} />
                                            Daftar Lokasi Vaksinasi
                                        </h5>
                                        {filteredSpots.length !== spots.length && (
                                            <small className="text-muted">
                                                Menampilkan {filteredSpots.length} dari {spots.length} lokasi
                                            </small>
                                        )}
                                    </div>
                                    <hr className="mt-3" />
                                </div>
                                <div className="card-body p-4">
                                    {spots.length === 0 ? (
                                        <div className="text-center py-5">
                                            <div className="mb-3">
                                                <div className="d-inline-flex align-items-center justify-content-center rounded-circle"
                                                     style={{
                                                         width: '80px',
                                                         height: '80px',
                                                         backgroundColor: '#f0fdf4',
                                                         border: '2px dashed #5eead4'
                                                     }}>
                                                    <FontAwesomeIcon 
                                                        icon={faHospital} 
                                                        style={{ fontSize: '32px', color: '#14b8a6' }} 
                                                    />
                                                </div>
                                            </div>
                                            <h6 style={{ color: '#64748b' }}>Tidak ada lokasi vaksinasi tersedia</h6>
                                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                                Pastikan konsultasi Anda sudah diterima oleh dokter
                                            </p>
                                        </div>
                                    ) : filteredSpots.length === 0 ? (
                                        <div className="text-center py-5">
                                            <div className="mb-3">
                                                <div className="d-inline-flex align-items-center justify-content-center rounded-circle"
                                                     style={{
                                                         width: '80px',
                                                         height: '80px',
                                                         backgroundColor: '#fef3c7',
                                                         border: '2px dashed #fcd34d'
                                                     }}>
                                                    <FontAwesomeIcon 
                                                        icon={faSearch} 
                                                        style={{ fontSize: '32px', color: '#f59e0b' }} 
                                                    />
                                                </div>
                                            </div>
                                            <h6 style={{ color: '#64748b' }}>Tidak ada lokasi yang cocok</h6>
                                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                                Coba ubah kata kunci pencarian atau filter vaksin
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="d-flex flex-column gap-3">
                                            {filteredSpots.map((spot) => {
                                                const isExpanded = expandedId === spot.id;
                                                
                                                return (
                                                    <div 
                                                        key={spot.id}
                                                        className="rounded-3"
                                                        style={{
                                                            border: '1px solid #5eead4',
                                                            backgroundColor: '#ffffff',
                                                            overflow: 'hidden',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                    >
                                                        {/* Spot Header - Clickable */}
                                                        <div 
                                                            className="p-3 d-flex justify-content-between align-items-center"
                                                            onClick={() => toggleExpand(spot.id)}
                                                            style={{ cursor: 'pointer', userSelect: 'none' }}
                                                        >
                                                            <div className="d-flex align-items-center gap-3">
                                                                {/* Spot Icon */}
                                                                <div className="d-flex align-items-center justify-content-center rounded-circle"
                                                                     style={{
                                                                         width: '45px',
                                                                         height: '45px',
                                                                         backgroundColor: '#ccfbf1',
                                                                         flexShrink: 0
                                                                     }}>
                                                                    <FontAwesomeIcon 
                                                                        icon={faHospital} 
                                                                        style={{ 
                                                                            fontSize: '18px', 
                                                                            color: '#0f766e' 
                                                                        }} 
                                                                    />
                                                                </div>
                                                                
                                                                <div>
                                                                    <div className="d-flex align-items-center gap-2">
                                                                        <h6 className="mb-0 fw-bold" style={{ color: '#1e293b', fontSize: '0.95rem' }}>
                                                                            {spot.name}
                                                                        </h6>
                                                                        <span className="badge px-2 py-1" style={{
                                                                            backgroundColor: '#ccfbf1',
                                                                            color: '#0f766e',
                                                                            borderRadius: '6px',
                                                                            fontSize: '0.7rem',
                                                                            fontWeight: '600'
                                                                        }}>
                                                                            {spot.serve}
                                                                        </span>
                                                                    </div>
                                                                    <div className="d-flex align-items-center gap-3 mt-1">
                                                                        <small className="text-muted">
                                                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" style={{ color: '#ef4444' }} />
                                                                            {spot.address}
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="d-flex align-items-center gap-2">
                                                                <button
                                                                    className="btn btn-sm px-3 py-1"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleOpenDetail(spot);
                                                                    }}
                                                                    style={{ 
                                                                        borderRadius: '8px',
                                                                        fontWeight: '500',
                                                                        fontSize: '0.8rem',
                                                                        backgroundColor: '#14b8a6',
                                                                        color: 'white',
                                                                        border: 'none'
                                                                    }}
                                                                >
                                                                    <FontAwesomeIcon icon={faEye} className="me-1" />
                                                                    Detail
                                                                </button>
                                                                
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
                                                                borderTop: '1px solid #5eead4',
                                                                padding: '20px',
                                                                animation: 'fadeIn 0.3s ease'
                                                            }}>
                                                                <div className="row g-3">
                                                                    {/* Spot Info */}
                                                                    <div className="col-md-6">
                                                                        <div className="p-3 rounded-3 bg-white" style={{ border: '1px solid #e2e8f0' }}>
                                                                            <label className="fw-semibold mb-3" style={{ color: '#0f766e', fontSize: '0.9rem' }}>
                                                                                <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                                                                                Informasi Lokasi
                                                                            </label>
                                                                            <div className="d-flex flex-column gap-2">
                                                                                <div>
                                                                                    <small className="text-muted">
                                                                                        <FontAwesomeIcon icon={faBuilding} className="me-1" />
                                                                                        Nama
                                                                                    </small>
                                                                                    <p className="mb-0 fw-semibold" style={{ color: '#334155' }}>
                                                                                        {spot.name}
                                                                                    </p>
                                                                                </div>
                                                                                <div>
                                                                                    <small className="text-muted">
                                                                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                                                                                        Alamat
                                                                                    </small>
                                                                                    <p className="mb-0 fw-semibold" style={{ color: '#334155' }}>
                                                                                        {spot.address}
                                                                                    </p>
                                                                                </div>
                                                                                <div>
                                                                                    <small className="text-muted">
                                                                                        <FontAwesomeIcon icon={faCity} className="me-1" />
                                                                                        Melayani
                                                                                    </small>
                                                                                    <p className="mb-0 fw-semibold" style={{ color: '#334155' }}>
                                                                                        {spot.serve}
                                                                                    </p>
                                                                                </div>
                                                                                <div>
                                                                                    <small className="text-muted">
                                                                                        <FontAwesomeIcon icon={faUsers} className="me-1" />
                                                                                        Kapasitas
                                                                                    </small>
                                                                                    <p className="mb-0 fw-semibold" style={{ color: '#334155' }}>
                                                                                        {spot.capacity} orang/hari
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Available Vaccines */}
                                                                    <div className="col-md-6">
                                                                        <div className="p-3 rounded-3 bg-white" style={{ border: '1px solid #e2e8f0' }}>
                                                                            <label className="fw-semibold mb-3" style={{ color: '#8b5cf6', fontSize: '0.9rem' }}>
                                                                                <FontAwesomeIcon icon={faVial} className="me-2" />
                                                                                Vaksin Tersedia
                                                                            </label>
                                                                            <div className="d-flex flex-wrap gap-2">
                                                                                {spot.available_vaccines && Object.keys(spot.available_vaccines).map((vaccine, index) => (
                                                                                    <span 
                                                                                        key={index}
                                                                                        className="badge px-3 py-2"
                                                                                        style={{
                                                                                            backgroundColor: spot.available_vaccines[vaccine] ? '#d1fae5' : '#fee2e2',
                                                                                            color: spot.available_vaccines[vaccine] ? '#047857' : '#ef4444',
                                                                                            borderRadius: '20px',
                                                                                            fontSize: '0.8rem',
                                                                                            fontWeight: '500'
                                                                                        }}
                                                                                    >
                                                                                        <FontAwesomeIcon 
                                                                                            icon={spot.available_vaccines[vaccine] ? faCheckCircle : faTimesCircle} 
                                                                                            className="me-1" 
                                                                                        />
                                                                                        {vaccine}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
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
                )}

                {/* Detail Modal */}
                {showDetailModal && selectedSpot && (
                    <div 
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2000,
                            overflowY: 'auto'
                        }}
                        onClick={() => setShowDetailModal(false)}
                    >
                        <div 
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                width: '600px',
                                maxWidth: '95%',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                                margin: '20px'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-4 border-bottom d-flex justify-content-between align-items-center" 
                                 style={{ 
                                     backgroundColor: '#f0fdfa', 
                                     borderRadius: '16px 16px 0 0' 
                                 }}>
                                <h5 className="mb-0 fw-bold" style={{ color: '#1e293b' }}>
                                    <FontAwesomeIcon icon={faHospital} className="me-2" style={{ color: '#14b8a6' }} />
                                    Detail Lokasi
                                </h5>
                                <button 
                                    className="btn btn-light btn-sm rounded-circle"
                                    onClick={() => setShowDetailModal(false)}
                                    style={{ width: '32px', height: '32px', padding: 0 }}
                                >
                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-4">
                                {loadingDetail ? (
                                    <div className="text-center py-4">
                                        <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: '24px', color: '#14b8a6' }} />
                                        <p className="text-muted mt-2">Memuat detail...</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Spot Info */}
                                        <div className="mb-4">
                                            <h6 className="fw-bold mb-3" style={{ color: '#1e293b' }}>
                                                <FontAwesomeIcon icon={faInfoCircle} className="me-2" style={{ color: '#14b8a6' }} />
                                                Informasi Lokasi
                                            </h6>
                                            <div className="p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                                <div className="row g-2">
                                                    <div className="col-6">
                                                        <small className="text-muted">Nama</small>
                                                        <p className="mb-0 fw-semibold">{selectedSpot.name}</p>
                                                    </div>
                                                    <div className="col-6">
                                                        <small className="text-muted">Melayani</small>
                                                        <p className="mb-0 fw-semibold">{selectedSpot.serve}</p>
                                                    </div>
                                                    <div className="col-12">
                                                        <small className="text-muted">Alamat</small>
                                                        <p className="mb-0 fw-semibold">{selectedSpot.address}</p>
                                                    </div>
                                                    <div className="col-6">
                                                        <small className="text-muted">Kapasitas</small>
                                                        <p className="mb-0 fw-semibold">{selectedSpot.capacity} orang/hari</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Date Picker & Capacity */}
                                        <div className="mb-4">
                                            <label className="form-label fw-semibold" style={{ color: '#1e293b' }}>
                                                <FontAwesomeIcon icon={faCalendarAlt} className="me-2" style={{ color: '#f59e0b' }} />
                                                Cek Ketersediaan Tanggal
                                            </label>
                                            <input
                                                type="date"
                                                className="form-control mb-3"
                                                value={detailDate}
                                                min={getTodayDate()}
                                                onChange={(e) => handleDateChange(e.target.value)}
                                                style={{ 
                                                    borderRadius: '10px', 
                                                    padding: '10px 15px',
                                                    border: '1px solid #e2e8f0'
                                                }}
                                            />

                                            {spotDetail && modalCapacityStatus && (
                                                <div className="p-3 rounded-3" style={{ 
                                                    backgroundColor: modalCapacityStatus.bgColor,
                                                    border: `1px solid ${modalCapacityStatus.color}`
                                                }}>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <strong style={{ color: modalCapacityStatus.color }}>
                                                                <FontAwesomeIcon icon={modalCapacityStatus.icon} className="me-2" />
                                                                Status: {modalCapacityStatus.label}
                                                            </strong>
                                                            <p className="mb-0 mt-1" style={{ fontSize: '0.9rem' }}>
                                                                Terdaftar: {spotDetail.vaccination_count} / {selectedSpot.capacity} orang
                                                            </p>
                                                        </div>
                                                        <div className="text-end">
                                                            <h4 className="mb-0 fw-bold" style={{ color: modalCapacityStatus.color }}>
                                                                {spotDetail.vaccination_count}
                                                                <small className="text-muted" style={{ fontSize: '0.9rem' }}>/{selectedSpot.capacity}</small>
                                                            </h4>
                                                            <small className="text-muted">Kuota terpakai</small>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Progress Bar */}
                                                    <div className="progress mt-3" style={{ height: '10px', borderRadius: '5px' }}>
                                                        <div 
                                                            className="progress-bar"
                                                            style={{ 
                                                                width: `${Math.min((spotDetail.vaccination_count / selectedSpot.capacity) * 100, 100)}%`,
                                                                backgroundColor: modalCapacityStatus.color
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {spotDetail && !modalCapacityStatus && (
                                                <div className="p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                                    <p className="mb-0 text-muted">
                                                        <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                                                        Terdaftar: {spotDetail.vaccination_count} / {selectedSpot.capacity} orang
                                                    </p>
                                                    <div className="progress mt-3" style={{ height: '10px', borderRadius: '5px' }}>
                                                        <div 
                                                            className="progress-bar"
                                                            style={{ 
                                                                width: `${Math.min((spotDetail.vaccination_count / selectedSpot.capacity) * 100, 100)}%`,
                                                                backgroundColor: '#14b8a6'
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Available Vaccines */}
                                        <div className="mb-4">
                                            <h6 className="fw-bold mb-3" style={{ color: '#1e293b' }}>
                                                <FontAwesomeIcon icon={faVial} className="me-2" style={{ color: '#8b5cf6' }} />
                                                Vaksin Tersedia
                                            </h6>
                                            <div className="d-flex flex-wrap gap-2">
                                                {selectedSpot.available_vaccines && Object.keys(selectedSpot.available_vaccines).map((vaccine, index) => (
                                                    <span 
                                                        key={index}
                                                        className="badge px-3 py-2"
                                                        style={{
                                                            backgroundColor: selectedSpot.available_vaccines[vaccine] ? '#d1fae5' : '#fee2e2',
                                                            color: selectedSpot.available_vaccines[vaccine] ? '#047857' : '#ef4444',
                                                            borderRadius: '20px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: '500'
                                                        }}
                                                    >
                                                        <FontAwesomeIcon 
                                                            icon={selectedSpot.available_vaccines[vaccine] ? faCheckCircle : faTimesCircle} 
                                                            className="me-1" 
                                                        />
                                                        {vaccine}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 border-top d-flex justify-content-end">
                                <button
                                    className="btn px-4 text-white"
                                    onClick={() => setShowDetailModal(false)}
                                    style={{ 
                                        borderRadius: '10px', 
                                        fontWeight: '500',
                                        backgroundColor: '#14b8a6',
                                        border: 'none'
                                    }}
                                >
                                    <FontAwesomeIcon icon={faXmark} className="me-2" />
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}
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