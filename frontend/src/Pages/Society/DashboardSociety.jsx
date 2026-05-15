// src/Pages/Society/DashboardSociety.jsx
import React, { useState, useEffect } from 'react';
import MainPublic from '../Layouts/MainPublic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser,
    faIdCard,
    faCakeCandles,
    faVenusMars,
    faBuilding,
    faPenToSquare,
    faXmark,
    faCheck,
    faUserCircle,
    faCalendarAlt,
    faMapMarkerAlt,
    faShieldAlt,
    faClock,
    faEdit,
    faSave,
    faGlobeAsia
} from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

export default function DashboardSociety() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        born_date: '',
        gender: '',
        address: '',
        regional_id: '',
        password: ''
    });
    const [updating, setUpdating] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [regionals, setRegionals] = useState([]);

    // Format date untuk tampilan
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    // Format date untuk input form
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
    };

    // Hitung umur
    const calculateAge = (bornDate) => {
        if (!bornDate) return '-';
        const today = new Date();
        const birthDate = new Date(bornDate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // Fetch profile data
    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = localStorage.getItem('token');
            const response = await api.get(`/profile?token=${token}`);
            
            setProfile(response.data.data);
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Gagal memuat data profil. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch regionals untuk dropdown edit
    const fetchRegionals = async () => {
        try {
            const response = await api.get('/regionals');
            setRegionals(response.data.data || []);
        } catch (err) {
            console.error('Error fetching regionals:', err);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    // Buka modal edit
    const handleOpenEdit = async () => {
        setEditForm({
            name: profile.name || '',
            born_date: formatDateForInput(profile.born_date),
            gender: profile.gender || '',
            address: profile.address || '',
            regional_id: profile.regional?.id || '',
            password: ''
        });
        setFormErrors({});
        setSuccessMessage('');
        await fetchRegionals();
        setShowEditModal(true);
    };

    // Validasi form edit
    const validateEditForm = () => {
        const errors = {};
        
        if (editForm.name && editForm.name.length > 255) {
            errors.name = 'Nama maksimal 255 karakter';
        }
        
        if (editForm.gender && !['male', 'female'].includes(editForm.gender)) {
            errors.gender = 'Gender tidak valid';
        }
        
        if (editForm.password && editForm.password.length < 6) {
            errors.password = 'Password minimal 6 karakter';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle update profile
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        
        if (!validateEditForm()) {
            return;
        }
        
        try {
            setUpdating(true);
            
            const token = localStorage.getItem('token');
            
            // Hanya kirim field yang diisi
            const updateData = {};
            Object.keys(editForm).forEach(key => {
                if (editForm[key] !== '' && editForm[key] !== null) {
                    updateData[key] = editForm[key];
                }
            });
            
            const response = await api.put(`/profile?token=${token}`, updateData);
            
            setShowEditModal(false);
            setSuccessMessage('Profil berhasil diperbarui!');
            
            // Refresh profile
            await fetchProfile();
            
            // Update user di localStorage
            const userData = JSON.parse(localStorage.getItem('user'));
            if (userData && response.data.data) {
                userData.name = response.data.data.name;
                localStorage.setItem('user', JSON.stringify(userData));
            }
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
            
        } catch (err) {
            console.error('Error updating profile:', err);
            if (err.response?.data?.errors) {
                setFormErrors(err.response.data.errors);
            } else {
                setFormErrors({ general: 'Gagal memperbarui profil. Silakan coba lagi.' });
            }
        } finally {
            setUpdating(false);
        }
    };

    // Get gender display
    const getGenderDisplay = (gender) => {
        switch (gender) {
            case 'male': return 'Laki-laki';
            case 'female': return 'Perempuan';
            default: return gender || '-';
        }
    };

    // Get gender color
    const getGenderColor = (gender) => {
        switch (gender) {
            case 'male': return '#3b82f6';
            case 'female': return '#ec4899';
            default: return '#6b7280';
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
                        <p className="text-muted">Memuat data profil...</p>
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
                        <FontAwesomeIcon icon={faXmark} className="me-2" />
                        <div>{error}</div>
                        <button className="btn btn-outline-danger ms-3" onClick={fetchProfile}>
                            Coba Lagi
                        </button>
                    </div>
                </div>
            </MainPublic>
        );
    }

    return (
        <MainPublic>
            <div className="mx-4 py-4 py-md-5">
                {/* Success Message */}
                {successMessage && (
                    <div className="alert alert-success alert-dismissible fade show" role="alert">
                        <FontAwesomeIcon icon={faCheck} className="me-2" />
                        {successMessage}
                        <button 
                            type="button" 
                            className="btn-close" 
                            onClick={() => setSuccessMessage('')}
                        ></button>
                    </div>
                )}

                {/* Welcome Section */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm" style={{ 
                            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)',
                            borderRadius: '16px',
                            color: 'white'
                        }}>
                            <div className="card-body p-4">
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                                    <div>
                                        <h4 className="mb-1 fw-bold">
                                            Selamat Datang, {profile?.name || 'User'}!
                                        </h4>
                                        <p className="mb-0 opacity-75">
                                            Kelola informasi profil dan data pribadi Anda
                                        </p>
                                    </div>
                                    <button 
                                        className="btn btn-light mt-3 mt-md-0"
                                        onClick={handleOpenEdit}
                                        style={{ 
                                            borderRadius: '10px',
                                            fontWeight: '500'
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faPenToSquare} className="me-2" />
                                        Edit Profil
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Information */}
                <div className="row">
                    {/* Left Column - Avatar & Basic Info */}
                    <div className="col-lg-4 mb-4">
                        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                            <div className="card-body text-center p-4">
                                {/* Avatar */}
                                <div className="mb-4">
                                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle"
                                         style={{
                                             width: '120px',
                                             height: '120px',
                                             background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                                             position: 'relative'
                                         }}>
                                        <FontAwesomeIcon 
                                            icon={faUserCircle} 
                                            style={{ fontSize: '64px', color: '#4f46e5' }} 
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '5px',
                                            right: '5px',
                                            width: '20px',
                                            height: '20px',
                                            backgroundColor: getGenderColor(profile?.gender),
                                            borderRadius: '50%',
                                            border: '3px solid white'
                                        }}></div>
                                    </div>
                                </div>

                                <h5 className="fw-bold mb-1" style={{ color: '#1e293b' }}>
                                    {profile?.name || '-'}
                                </h5>
                                <span className="badge px-3 py-2" style={{ 
                                    backgroundColor: getGenderColor(profile?.gender),
                                    fontSize: '0.85rem',
                                    borderRadius: '20px'
                                }}>
                                    <FontAwesomeIcon icon={faVenusMars} className="me-1" />
                                    {getGenderDisplay(profile?.gender)}
                                </span>
                                <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.9rem' }}>
                                    {calculateAge(profile?.born_date)} tahun
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Detail Info */}
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                            <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
                                <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
                                    <FontAwesomeIcon icon={faUser} className="me-2" style={{ color: '#3b82f6' }} />
                                    Informasi Pribadi
                                </h5>
                                <hr className="mt-3" />
                            </div>
                            <div className="card-body p-4">
                                <div className="row g-4">
                                    {/* ID Card Number */}
                                    <div className="col-md-6">
                                        <div className="p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                            <div className="d-flex align-items-center mb-2">
                                                <FontAwesomeIcon icon={faIdCard} style={{ color: '#3b82f6', width: '20px' }} />
                                                <span className="ms-2 text-muted" style={{ fontSize: '0.85rem' }}>NIK</span>
                                            </div>
                                            <p className="mb-0 fw-semibold" style={{ color: '#1e293b', fontSize: '1rem' }}>
                                                {profile?.id_card_number || '-'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Born Date */}
                                    <div className="col-md-6">
                                        <div className="p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                            <div className="d-flex align-items-center mb-2">
                                                <FontAwesomeIcon icon={faCakeCandles} style={{ color: '#f59e0b', width: '20px' }} />
                                                <span className="ms-2 text-muted" style={{ fontSize: '0.85rem' }}>Tanggal Lahir</span>
                                            </div>
                                            <p className="mb-0 fw-semibold" style={{ color: '#1e293b', fontSize: '1rem' }}>
                                                {formatDate(profile?.born_date)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Gender */}
                                    <div className="col-md-6">
                                        <div className="p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                            <div className="d-flex align-items-center mb-2">
                                                <FontAwesomeIcon icon={faVenusMars} style={{ color: getGenderColor(profile?.gender), width: '20px' }} />
                                                <span className="ms-2 text-muted" style={{ fontSize: '0.85rem' }}>Jenis Kelamin</span>
                                            </div>
                                            <p className="mb-0 fw-semibold" style={{ color: '#1e293b', fontSize: '1rem' }}>
                                                {getGenderDisplay(profile?.gender)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="col-md-6">
                                        <div className="p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                            <div className="d-flex align-items-center mb-2">
                                                <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: '#ef4444', width: '20px' }} />
                                                <span className="ms-2 text-muted" style={{ fontSize: '0.85rem' }}>Alamat</span>
                                            </div>
                                            <p className="mb-0 fw-semibold" style={{ color: '#1e293b', fontSize: '1rem' }}>
                                                {profile?.address || '-'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Regional - Province */}
                                    <div className="col-md-6">
                                        <div className="p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                            <div className="d-flex align-items-center mb-2">
                                                <FontAwesomeIcon icon={faGlobeAsia} style={{ color: '#10b981', width: '20px' }} />
                                                <span className="ms-2 text-muted" style={{ fontSize: '0.85rem' }}>Provinsi</span>
                                            </div>
                                            <p className="mb-0 fw-semibold" style={{ color: '#1e293b', fontSize: '1rem' }}>
                                                {profile?.regional?.province || '-'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Regional - District */}
                                    <div className="col-md-6">
                                        <div className="p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                            <div className="d-flex align-items-center mb-2">
                                                <FontAwesomeIcon icon={faBuilding} style={{ color: '#8b5cf6', width: '20px' }} />
                                                <span className="ms-2 text-muted" style={{ fontSize: '0.85rem' }}>Kabupaten/Kota</span>
                                            </div>
                                            <p className="mb-0 fw-semibold" style={{ color: '#1e293b', fontSize: '1rem' }}>
                                                {profile?.regional?.district || '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Meta Info */}
                                <div className="mt-4 p-3 rounded-3" style={{ backgroundColor: '#f1f5f9' }}>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <small className="text-muted">
                                                <FontAwesomeIcon icon={faClock} className="me-1" />
                                                Bergabung sejak: {formatDate(profile?.created_at)}
                                            </small>
                                        </div>
                                        <div className="col-md-6 text-md-end mt-2 mt-md-0">
                                            <small className="text-muted">
                                                <FontAwesomeIcon icon={faEdit} className="me-1" />
                                                Terakhir diperbarui: {formatDate(profile?.updated_at)}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Profile Modal */}
                {showEditModal && (
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
                        onClick={() => setShowEditModal(false)}
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
                                 style={{ backgroundColor: '#f8fafc', borderRadius: '16px 16px 0 0' }}>
                                <h5 className="mb-0 fw-bold" style={{ color: '#1e293b' }}>
                                    <FontAwesomeIcon icon={faPenToSquare} className="me-2" style={{ color: '#3b82f6' }} />
                                    Edit Profil
                                </h5>
                                <button 
                                    className="btn btn-light btn-sm rounded-circle"
                                    onClick={() => setShowEditModal(false)}
                                    style={{ width: '32px', height: '32px', padding: 0 }}
                                >
                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleUpdateProfile}>
                                <div className="p-4">
                                    {formErrors.general && (
                                        <div className="alert alert-danger py-2 mb-3">
                                            {formErrors.general}
                                        </div>
                                    )}

                                    <div className="row g-3">
                                        {/* Name */}
                                        <div className="col-12">
                                            <label className="form-label fw-semibold small text-muted">
                                                <FontAwesomeIcon icon={faUser} className="me-1" />
                                                Nama Lengkap
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                                                placeholder="Masukkan nama lengkap"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                                style={{ borderRadius: '10px', padding: '10px 15px' }}
                                            />
                                            {formErrors.name && (
                                                <div className="invalid-feedback">{formErrors.name}</div>
                                            )}
                                        </div>

                                        {/* Born Date */}
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold small text-muted">
                                                <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                                Tanggal Lahir
                                            </label>
                                            <input
                                                type="date"
                                                className={`form-control ${formErrors.born_date ? 'is-invalid' : ''}`}
                                                value={editForm.born_date}
                                                onChange={(e) => setEditForm({...editForm, born_date: e.target.value})}
                                                style={{ borderRadius: '10px', padding: '10px 15px' }}
                                            />
                                            {formErrors.born_date && (
                                                <div className="invalid-feedback">{formErrors.born_date}</div>
                                            )}
                                        </div>

                                        {/* Gender */}
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold small text-muted">
                                                <FontAwesomeIcon icon={faVenusMars} className="me-1" />
                                                Jenis Kelamin
                                            </label>
                                            <select
                                                className={`form-select ${formErrors.gender ? 'is-invalid' : ''}`}
                                                value={editForm.gender}
                                                onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                                                style={{ borderRadius: '10px', padding: '10px 15px' }}
                                            >
                                                <option value="">Pilih jenis kelamin</option>
                                                <option value="male">Laki-laki</option>
                                                <option value="female">Perempuan</option>
                                            </select>
                                            {formErrors.gender && (
                                                <div className="invalid-feedback">{formErrors.gender}</div>
                                            )}
                                        </div>

                                        {/* Address */}
                                        <div className="col-12">
                                            <label className="form-label fw-semibold small text-muted">
                                                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                                                Alamat
                                            </label>
                                            <textarea
                                                className={`form-control ${formErrors.address ? 'is-invalid' : ''}`}
                                                placeholder="Masukkan alamat lengkap"
                                                value={editForm.address}
                                                onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                                                rows="2"
                                                style={{ borderRadius: '10px', padding: '10px 15px', resize: 'vertical' }}
                                            />
                                            {formErrors.address && (
                                                <div className="invalid-feedback">{formErrors.address}</div>
                                            )}
                                        </div>

                                        {/* Regional */}
                                        <div className="col-12">
                                            <label className="form-label fw-semibold small text-muted">
                                                <FontAwesomeIcon icon={faGlobeAsia} className="me-1" />
                                                Regional
                                            </label>
                                            <select
                                                className={`form-select ${formErrors.regional_id ? 'is-invalid' : ''}`}
                                                value={editForm.regional_id}
                                                onChange={(e) => setEditForm({...editForm, regional_id: e.target.value})}
                                                style={{ borderRadius: '10px', padding: '10px 15px' }}
                                            >
                                                <option value="">Pilih regional</option>
                                                {regionals.map((regional) => (
                                                    <option key={regional.id} value={regional.id}>
                                                        {regional.province} - {regional.district}
                                                    </option>
                                                ))}
                                            </select>
                                            {formErrors.regional_id && (
                                                <div className="invalid-feedback">{formErrors.regional_id}</div>
                                            )}
                                        </div>

                                        {/* Password */}
                                        <div className="col-12">
                                            <div className="p-3 rounded-3" style={{ backgroundColor: '#fffbeb', border: '1px solid #fcd34d' }}>
                                                <label className="form-label fw-semibold small text-muted">
                                                    <FontAwesomeIcon icon={faShieldAlt} className="me-1" style={{ color: '#f59e0b' }} />
                                                    Password Baru
                                                    <span className="text-muted fw-normal ms-1">(opsional)</span>
                                                </label>
                                                <input
                                                    type="password"
                                                    className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                                                    placeholder="Kosongkan jika tidak ingin mengubah"
                                                    value={editForm.password}
                                                    onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                                                    style={{ borderRadius: '10px', padding: '10px 15px' }}
                                                />
                                                {formErrors.password && (
                                                    <div className="invalid-feedback">{formErrors.password}</div>
                                                )}
                                                <small className="text-muted mt-1 d-block">
                                                    Minimal 6 karakter
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="p-4 border-top d-flex justify-content-end gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-light px-4"
                                        onClick={() => setShowEditModal(false)}
                                        style={{ borderRadius: '10px', fontWeight: '500' }}
                                    >
                                        <FontAwesomeIcon icon={faXmark} className="me-2" />
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary px-4"
                                        disabled={updating}
                                        style={{ borderRadius: '10px', fontWeight: '500' }}
                                    >
                                        {updating ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <FontAwesomeIcon icon={faSave} className="me-2" />
                                                Simpan Perubahan
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </MainPublic>
    );
}