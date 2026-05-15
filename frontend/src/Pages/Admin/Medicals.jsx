// src/Pages/Admin/Medicals.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus,
    faEdit,
    faTrash,
    faSearch,
    faSpinner,
    faExclamationTriangle,
    faCheckCircle,
    faChevronLeft,
    faChevronRight,
    faSave,
    faTimes,
    faHospital,
    faUserDoctor,
    faLocationDot,
    faUser,
    faIdCard,
    faVenusMars,
    faMapMarkerAlt,
    faCalendarAlt,
    faLock,
    faStethoscope,
    faUserNurse,
    faFilter,
    faUsers
} from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';
import Main from '../Layouts/Main';

export default function Medicals() {
    // State Management
    const [medicals, setMedicals] = useState([]);
    const [spots, setSpots] = useState([]);
    const [regionals, setRegionals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    
    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedMedical, setSelectedMedical] = useState(null);
    
    // Delete Confirmation State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [medicalToDelete, setMedicalToDelete] = useState(null);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        id_card_number: '',
        password: '',
        gender: 'male',
        address: '',
        born_date: '',
        regional_id: '',
        role: 'doctor',
        spot_id: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    
    // Search, Filter & Pagination State
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'doctor', 'officer'
    const [spotFilter, setSpotFilter] = useState('all');
    const [regionalFilter, setRegionalFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const itemsPerPage = 5;

    // Helper function to get token
    const getToken = () => {
        return localStorage.getItem('token');
    };

    // Fetch Medicals
    const fetchMedicals = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = getToken();
            const response = await api.get(`/admin/medicals?token=${token}`);
            setMedicals(response.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch medical staff');
            console.error('Error fetching medicals:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Spots for dropdown
    const fetchSpots = async () => {
        try {
            const token = getToken();
            const response = await api.get(`/admin/spots?token=${token}`);
            setSpots(response.data.data || []);
        } catch (err) {
            console.error('Error fetching spots:', err);
        }
    };

    // Fetch Regionals for dropdown
    const fetchRegionals = async () => {
        try {
            const token = getToken();
            const response = await api.get(`/admin/regionals?token=${token}`);
            setRegionals(response.data.data || []);
        } catch (err) {
            console.error('Error fetching regionals:', err);
        }
    };

    useEffect(() => {
        fetchMedicals();
        fetchSpots();
        fetchRegionals();
    }, []);

    // Auto-dismiss success message
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Apply filters and search
    const applyFilters = (medicals) => {
        return medicals.filter(medical => {
            // Search filter
            const searchMatch = !searchTerm || 
                medical.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                medical.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                medical.spot?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                medical.user?.regional?.province?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                medical.user?.id_card_number?.toString().includes(searchTerm);

            // Role filter
            const roleMatch = roleFilter === 'all' || medical.role === roleFilter;

            // Spot filter
            const spotMatch = spotFilter === 'all' || medical.spot_id?.toString() === spotFilter;

            // Regional filter
            const regionalMatch = regionalFilter === 'all' || medical.user?.regional_id?.toString() === regionalFilter;

            return searchMatch && roleMatch && spotMatch && regionalMatch;
        });
    };

    const filteredMedicals = applyFilters(medicals);

    // Pagination Logic
    const totalPages = Math.ceil(filteredMedicals.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentMedicals = filteredMedicals.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Reset page when filters/search change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, roleFilter, spotFilter, regionalFilter]);

    // Count statistics
    const totalStaff = medicals.length;
    const totalDoctors = medicals.filter(m => m.role === 'doctor').length;
    const totalOfficers = medicals.filter(m => m.role === 'officer').length;
    const filteredCount = filteredMedicals.length;

    // Reset all filters
    const resetFilters = () => {
        setSearchTerm('');
        setRoleFilter('all');
        setSpotFilter('all');
        setRegionalFilter('all');
    };

    // Form Handling
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: ''
            });
        }
    };

    const validateForm = () => {
        const errors = {};
        
        if (modalMode === 'create') {
            if (!formData.name.trim()) {
                errors.name = 'Name is required';
            }
            if (!formData.id_card_number) {
                errors.id_card_number = 'ID Card Number is required';
            }
            if (!formData.password || formData.password.length < 6) {
                errors.password = 'Password must be at least 6 characters';
            }
            if (!formData.gender) {
                errors.gender = 'Gender is required';
            }
            if (!formData.address.trim()) {
                errors.address = 'Address is required';
            }
            if (!formData.born_date) {
                errors.born_date = 'Birth date is required';
            }
            if (!formData.regional_id) {
                errors.regional_id = 'Regional is required';
            }
            if (!formData.role) {
                errors.role = 'Role is required';
            }
            if (!formData.spot_id) {
                errors.spot_id = 'Spot is required';
            }
        } else {
            // For edit, only validate if fields are filled
            if (formData.name && formData.name.trim().length < 2) {
                errors.name = 'Name must be at least 2 characters';
            }
            if (formData.password && formData.password.length < 6) {
                errors.password = 'Password must be at least 6 characters';
            }
            if (formData.id_card_number && formData.id_card_number.toString().length < 5) {
                errors.id_card_number = 'Invalid ID Card Number';
            }
        }
        
        return errors;
    };

    // Get role badge
    const getRoleBadge = (role) => {
        return role === 'doctor' ? 'success' : 'info';
    };

    // Get role icon
    const getRoleIcon = (role) => {
        return role === 'doctor' ? faStethoscope : faUserNurse;
    };

    // Get role label
    const getRoleLabel = (role) => {
        return role === 'doctor' ? 'Doctor' : 'Officer';
    };

    // Open Modal for Create
    const handleCreate = () => {
        setModalMode('create');
        setSelectedMedical(null);
        setFormData({
            name: '',
            id_card_number: '',
            password: '',
            gender: 'male',
            address: '',
            born_date: '',
            regional_id: '',
            role: 'doctor',
            spot_id: ''
        });
        setFormErrors({});
        setShowModal(true);
    };

    // Open Modal for Edit
    const handleEdit = (medical) => {
        setModalMode('edit');
        setSelectedMedical(medical);
        setFormData({
            name: medical.name || '',
            id_card_number: medical.user?.id_card_number || '',
            password: '',
            gender: medical.user?.gender || 'male',
            address: medical.user?.address || '',
            born_date: medical.user?.born_date || '',
            regional_id: medical.user?.regional_id || '',
            role: medical.role || 'doctor',
            spot_id: medical.spot_id || ''
        });
        setFormErrors({});
        setShowModal(true);
    };

    // Close Modal
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedMedical(null);
        setFormData({
            name: '',
            id_card_number: '',
            password: '',
            gender: 'male',
            address: '',
            born_date: '',
            regional_id: '',
            role: 'doctor',
            spot_id: ''
        });
        setFormErrors({});
    };

    // Submit Form (Create or Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setSubmitting(true);
        try {
            const token = getToken();
            
            // Prepare data - remove empty fields for edit
            const submitData = { ...formData };
            if (modalMode === 'edit') {
                Object.keys(submitData).forEach(key => {
                    if (submitData[key] === '' || submitData[key] === null) {
                        delete submitData[key];
                    }
                });
            }
            
            if (modalMode === 'create') {
                await api.post(`/admin/medicals?token=${token}`, submitData);
                setSuccessMessage('Medical staff created successfully!');
            } else {
                await api.put(`/admin/medicals/${selectedMedical.id}?token=${token}`, submitData);
                setSuccessMessage('Medical staff updated successfully!');
            }
            
            handleCloseModal();
            fetchMedicals();
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Operation failed';
            const errors = err.response?.data?.errors;
            setFormErrors({ 
                general: typeof errors === 'string' ? errors : errorMessage
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Delete Confirmation
    const handleDeleteClick = (medical) => {
        setMedicalToDelete(medical);
        setShowDeleteConfirm(true);
    };

    // Delete
    const handleDeleteConfirm = async () => {
        try {
            const token = getToken();
            await api.delete(`/admin/medicals/${medicalToDelete.id}?token=${token}`);
            setSuccessMessage('Medical staff deleted successfully!');
            setShowDeleteConfirm(false);
            setMedicalToDelete(null);
            fetchMedicals();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete medical staff');
            setShowDeleteConfirm(false);
        }
    };

    // Generate Pagination Numbers
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 5; i++) {
                    pages.push(i);
                }
            } else if (currentPage >= totalPages - 2) {
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                    pages.push(i);
                }
            }
        }
        return pages;
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Main>
            <div className="medicals-page">
                {/* Success Message */}
                {successMessage && (
                    <div className="alert alert-success alert-dismissible fade show d-flex align-items-center shadow-sm" role="alert">
                        <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                        <span>{successMessage}</span>
                        <button 
                            type="button" 
                            className="btn-close" 
                            onClick={() => setSuccessMessage('')}
                        ></button>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center shadow-sm" role="alert">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                        <span>{error}</span>
                        <button 
                            type="button" 
                            className="btn-close" 
                            onClick={() => setError(null)}
                        ></button>
                    </div>
                )}

                {/* Header Section */}
                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <div className="row align-items-center">
                            <div className="col-md-6">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="rounded p-3 d-flex align-items-center justify-content-center" 
                                         style={{ width: '50px', height: '50px', backgroundColor: '#6f42c1' }}>
                                        <FontAwesomeIcon icon={faUserDoctor} className="text-white fs-5" />
                                    </div>
                                    <div>
                                        <h4 className="mb-1 fw-bold">Medical Staff Management</h4>
                                        <p className="text-muted mb-0">Manage doctors and officers in vaccination spots</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="d-flex justify-content-md-end gap-2 mt-3 mt-md-0">
                                    <button
                                        className="btn btn-outline-secondary d-flex align-items-center gap-2"
                                        onClick={() => setShowFilters(!showFilters)}
                                    >
                                        <FontAwesomeIcon icon={faFilter} />
                                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                                        {roleFilter !== 'all' || spotFilter !== 'all' || regionalFilter !== 'all' ? (
                                            <span className="badge bg-danger ms-1">
                                                {[
                                                    roleFilter !== 'all' ? 1 : 0,
                                                    spotFilter !== 'all' ? 1 : 0,
                                                    regionalFilter !== 'all' ? 1 : 0
                                                ].reduce((a, b) => a + b, 0)}
                                            </span>
                                        ) : null}
                                    </button>
                                    <button
                                        className="btn d-flex align-items-center gap-2 text-white"
                                        onClick={handleCreate}
                                        style={{ 
                                            borderRadius: '8px', 
                                            whiteSpace: 'nowrap',
                                            backgroundColor: '#6f42c1',
                                            borderColor: '#6f42c1'
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                        <span className="d-none d-sm-inline">Add Medical Staff</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Statistics Cards */}
                        <div className="row mt-3">
                            <div className="col-md-3">
                                <div className="card bg-light border-0">
                                    <div className="card-body text-center py-2">
                                        <FontAwesomeIcon icon={faUsers} className="text-secondary mb-1" />
                                        <h6 className="mb-0">{totalStaff}</h6>
                                        <small className="text-muted">Total Staff</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card bg-light border-0">
                                    <div className="card-body text-center py-2">
                                        <FontAwesomeIcon icon={faStethoscope} className="text-success mb-1" />
                                        <h6 className="mb-0">{totalDoctors}</h6>
                                        <small className="text-muted">Doctors</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card bg-light border-0">
                                    <div className="card-body text-center py-2">
                                        <FontAwesomeIcon icon={faUserNurse} className="text-info mb-1" />
                                        <h6 className="mb-0">{totalOfficers}</h6>
                                        <small className="text-muted">Officers</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card bg-light border-0">
                                    <div className="card-body text-center py-2">
                                        <FontAwesomeIcon icon={faSearch} className="text-primary mb-1" />
                                        <h6 className="mb-0">{filteredCount}</h6>
                                        <small className="text-muted">Filtered</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filters Section */}
                        {showFilters && (
                            <div className="row mt-3 pt-3 border-top">
                                <div className="col-md-4 mb-2">
                                    <label className="form-label small fw-semibold">
                                        <FontAwesomeIcon icon={faSearch} className="me-1" />
                                        Search
                                    </label>
                                    <div className="position-relative">
                                        <FontAwesomeIcon 
                                            icon={faSearch} 
                                            className="position-absolute text-muted"
                                            style={{ 
                                                left: '12px', 
                                                top: '50%', 
                                                transform: 'translateY(-50%)',
                                                zIndex: 10,
                                                fontSize: '0.85rem'
                                            }} 
                                        />
                                        <input
                                            type="text"
                                            className="form-control form-control-sm ps-5"
                                            placeholder="Search by name, ID, spot..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-3 mb-2">
                                    <label className="form-label small fw-semibold">
                                        <FontAwesomeIcon icon={faStethoscope} className="me-1" />
                                        Role
                                    </label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                    >
                                        <option value="all">All Roles</option>
                                        <option value="doctor">Doctor Only</option>
                                        <option value="officer">Officer Only</option>
                                    </select>
                                </div>
                                <div className="col-md-3 mb-2">
                                    <label className="form-label small fw-semibold">
                                        <FontAwesomeIcon icon={faHospital} className="me-1" />
                                        Spot
                                    </label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={spotFilter}
                                        onChange={(e) => setSpotFilter(e.target.value)}
                                    >
                                        <option value="all">All Spots</option>
                                        {spots.map(spot => (
                                            <option key={spot.id} value={spot.id}>{spot.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-2 mb-2 d-flex align-items-end">
                                    <button
                                        className="btn btn-secondary btn-sm w-100"
                                        onClick={resetFilters}
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Active Filters Indicator */}
                {(roleFilter !== 'all' || spotFilter !== 'all' || regionalFilter !== 'all' || searchTerm) && (
                    <div className="alert alert-info alert-dismissible fade show d-flex align-items-center py-2 mb-3" role="alert">
                        <FontAwesomeIcon icon={faFilter} className="me-2" />
                        <span>
                            Showing {filteredCount} of {totalStaff} staff
                            {roleFilter !== 'all' && (
                                <span className="badge bg-success ms-2">
                                    {getRoleLabel(roleFilter)}s
                                </span>
                            )}
                            {spotFilter !== 'all' && (
                                <span className="badge bg-primary ms-1">
                                    {spots.find(s => s.id.toString() === spotFilter)?.name || 'Spot'}
                                </span>
                            )}
                            {searchTerm && (
                                <span className="badge bg-secondary ms-1">
                                    Search: "{searchTerm}"
                                </span>
                            )}
                        </span>
                        <button 
                            type="button" 
                            className="btn-close btn-sm" 
                            onClick={resetFilters}
                        ></button>
                    </div>
                )}

                {/* Table Section */}
                <div className="card shadow-sm">
                    <div className="card-body p-0">
                        {loading ? (
                            <div className="text-center py-5">
                                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="mb-3" style={{ color: '#6f42c1' }} />
                                <p className="text-muted">Loading medical staff...</p>
                            </div>
                        ) : filteredMedicals.length === 0 ? (
                            <div className="text-center py-5">
                                <FontAwesomeIcon icon={faUserDoctor} size="3x" className="text-muted mb-3" />
                                <h5 className="text-muted">No medical staff found</h5>
                                <p className="text-muted">
                                    {searchTerm || roleFilter !== 'all' || spotFilter !== 'all' ? 
                                        'No staff match your search/filter criteria' : 
                                        'Start by adding a new medical staff'}
                                </p>
                                {!searchTerm && roleFilter === 'all' && spotFilter === 'all' && (
                                    <button
                                        className="btn text-white"
                                        style={{ backgroundColor: '#6f42c1' }}
                                        onClick={handleCreate}
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                                        Add First Medical Staff
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th style={{ width: '60px' }} className="text-center">#</th>
                                                <th style={{ width: '18%' }}>Name</th>
                                                <th style={{ width: '10%' }} className="text-center">Role</th>
                                                <th style={{ width: '15%' }}>Spot</th>
                                                <th style={{ width: '15%' }}>Regional</th>
                                                <th style={{ width: '10%' }} className="text-center">Gender</th>
                                                <th style={{ width: '12%' }}>Born Date</th>
                                                <th style={{ width: '120px' }} className="text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentMedicals.map((medical, index) => (
                                                <tr key={medical.id}>
                                                    <td className="text-center align-middle">
                                                        <span className="badge bg-secondary rounded-pill">
                                                            {startIndex + index + 1}
                                                        </span>
                                                    </td>
                                                    <td className="align-middle">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <FontAwesomeIcon 
                                                                icon={getRoleIcon(medical.role)}
                                                                className={medical.role === 'doctor' ? 'text-success' : 'text-info'}
                                                            />
                                                            <div>
                                                                <span className="fw-medium d-block">{medical.name}</span>
                                                                <small className="text-muted">
                                                                    <FontAwesomeIcon icon={faIdCard} className="me-1" />
                                                                    {medical.user?.id_card_number || '-'}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="text-center align-middle">
                                                        <span className={`badge bg-${getRoleBadge(medical.role)}`}>
                                                            <FontAwesomeIcon icon={getRoleIcon(medical.role)} className="me-1" />
                                                            {getRoleLabel(medical.role)}
                                                        </span>
                                                    </td>
                                                    <td className="align-middle">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <FontAwesomeIcon icon={faHospital} className="text-secondary" />
                                                            <small>{medical.spot?.name || '-'}</small>
                                                        </div>
                                                    </td>
                                                    <td className="align-middle">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <FontAwesomeIcon icon={faLocationDot} className="text-info" />
                                                            <small>
                                                                {medical.user?.regional?.province || '-'}, {medical.user?.regional?.district || ''}
                                                            </small>
                                                        </div>
                                                    </td>
                                                    <td className="text-center align-middle">
                                                        <span className={`badge ${medical.user?.gender === 'male' ? 'bg-primary' : 'bg-danger'}`}>
                                                            <FontAwesomeIcon icon={faVenusMars} className="me-1" />
                                                            {medical.user?.gender || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="align-middle">
                                                        <small>{formatDate(medical.user?.born_date)}</small>
                                                    </td>
                                                    <td className="text-center align-middle">
                                                        <div className="d-flex gap-1 justify-content-center">
                                                            <button
                                                                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                                                                onClick={() => handleEdit(medical)}
                                                                title="Edit staff"
                                                                style={{ borderColor: '#6f42c1', color: '#6f42c1' }}
                                                            >
                                                                <FontAwesomeIcon icon={faEdit} />
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                                                                onClick={() => handleDeleteClick(medical)}
                                                                title="Delete staff"
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="d-flex justify-content-between align-items-center p-3 border-top">
                                        <div className="text-muted small">
                                            Showing {startIndex + 1} to {Math.min(endIndex, filteredMedicals.length)} of {filteredMedicals.length} staff
                                        </div>
                                        <nav>
                                            <ul className="pagination pagination-sm mb-0">
                                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => handlePageChange(currentPage - 1)}
                                                        disabled={currentPage === 1}
                                                    >
                                                        <FontAwesomeIcon icon={faChevronLeft} />
                                                    </button>
                                                </li>
                                                {getPageNumbers().map((page) => (
                                                    <li
                                                        key={page}
                                                        className={`page-item ${currentPage === page ? 'active' : ''}`}
                                                    >
                                                        <button
                                                            className="page-link"
                                                            onClick={() => handlePageChange(page)}
                                                            style={currentPage === page ? { backgroundColor: '#6f42c1', borderColor: '#6f42c1', color: 'white' } : {}}
                                                        >
                                                            {page}
                                                        </button>
                                                    </li>
                                                ))}
                                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => handlePageChange(currentPage + 1)}
                                                        disabled={currentPage === totalPages}
                                                    >
                                                        <FontAwesomeIcon icon={faChevronRight} />
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Create/Edit Modal */}
                {showModal && (
                    <div 
                        className="modal d-block" 
                        tabIndex="-1"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    >
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content shadow">
                                <div className="modal-header text-white" style={{ backgroundColor: '#6f42c1' }}>
                                    <h5 className="modal-title d-flex align-items-center gap-2">
                                        <FontAwesomeIcon icon={modalMode === 'create' ? faPlus : faEdit} />
                                        {modalMode === 'create' ? 'Add New Medical Staff' : 'Edit Medical Staff'}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white"
                                        onClick={handleCloseModal}
                                        disabled={submitting}
                                    ></button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body">
                                        {formErrors.general && (
                                            <div className="alert alert-danger py-2">
                                                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                                                {formErrors.general}
                                            </div>
                                        )}

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="name" className="form-label fw-semibold">
                                                    <FontAwesomeIcon icon={faUser} className="me-1" />
                                                    Full Name <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter full name"
                                                    disabled={submitting}
                                                />
                                                {formErrors.name && (
                                                    <div className="invalid-feedback">{formErrors.name}</div>
                                                )}
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="id_card_number" className="form-label fw-semibold">
                                                    <FontAwesomeIcon icon={faIdCard} className="me-1" />
                                                    ID Card Number {modalMode === 'create' && <span className="text-danger">*</span>}
                                                </label>
                                                <input
                                                    type="number"
                                                    className={`form-control ${formErrors.id_card_number ? 'is-invalid' : ''}`}
                                                    id="id_card_number"
                                                    name="id_card_number"
                                                    value={formData.id_card_number}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter ID card number"
                                                    disabled={submitting}
                                                />
                                                {formErrors.id_card_number && (
                                                    <div className="invalid-feedback">{formErrors.id_card_number}</div>
                                                )}
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="password" className="form-label fw-semibold">
                                                    <FontAwesomeIcon icon={faLock} className="me-1" />
                                                    Password {modalMode === 'create' ? <span className="text-danger">*</span> : <small className="text-muted">(leave empty to keep current)</small>}
                                                </label>
                                                <input
                                                    type="password"
                                                    className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                                                    id="password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    placeholder={modalMode === 'create' ? 'Enter password (min 6 characters)' : 'Enter new password'}
                                                    disabled={submitting}
                                                />
                                                {formErrors.password && (
                                                    <div className="invalid-feedback">{formErrors.password}</div>
                                                )}
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="gender" className="form-label fw-semibold">
                                                    <FontAwesomeIcon icon={faVenusMars} className="me-1" />
                                                    Gender <span className="text-danger">*</span>
                                                </label>
                                                <select
                                                    className={`form-select ${formErrors.gender ? 'is-invalid' : ''}`}
                                                    id="gender"
                                                    name="gender"
                                                    value={formData.gender}
                                                    onChange={handleInputChange}
                                                    disabled={submitting}
                                                >
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                </select>
                                                {formErrors.gender && (
                                                    <div className="invalid-feedback">{formErrors.gender}</div>
                                                )}
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="born_date" className="form-label fw-semibold">
                                                    <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                                    Birth Date <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    className={`form-control ${formErrors.born_date ? 'is-invalid' : ''}`}
                                                    id="born_date"
                                                    name="born_date"
                                                    value={formData.born_date}
                                                    onChange={handleInputChange}
                                                    disabled={submitting}
                                                />
                                                {formErrors.born_date && (
                                                    <div className="invalid-feedback">{formErrors.born_date}</div>
                                                )}
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="role" className="form-label fw-semibold">
                                                    <FontAwesomeIcon icon={faStethoscope} className="me-1" />
                                                    Role <span className="text-danger">*</span>
                                                </label>
                                                <select
                                                    className={`form-select ${formErrors.role ? 'is-invalid' : ''}`}
                                                    id="role"
                                                    name="role"
                                                    value={formData.role}
                                                    onChange={handleInputChange}
                                                    disabled={submitting}
                                                >
                                                    <option value="doctor">Doctor</option>
                                                    <option value="officer">Officer</option>
                                                </select>
                                                {formErrors.role && (
                                                    <div className="invalid-feedback">{formErrors.role}</div>
                                                )}
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="regional_id" className="form-label fw-semibold">
                                                    <FontAwesomeIcon icon={faLocationDot} className="me-1" />
                                                    Regional <span className="text-danger">*</span>
                                                </label>
                                                <select
                                                    className={`form-select ${formErrors.regional_id ? 'is-invalid' : ''}`}
                                                    id="regional_id"
                                                    name="regional_id"
                                                    value={formData.regional_id}
                                                    onChange={handleInputChange}
                                                    disabled={submitting}
                                                >
                                                    <option value="">Select Regional</option>
                                                    {regionals.map(regional => (
                                                        <option key={regional.id} value={regional.id}>
                                                            {regional.province} - {regional.district}
                                                        </option>
                                                    ))}
                                                </select>
                                                {formErrors.regional_id && (
                                                    <div className="invalid-feedback">{formErrors.regional_id}</div>
                                                )}
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="spot_id" className="form-label fw-semibold">
                                                    <FontAwesomeIcon icon={faHospital} className="me-1" />
                                                    Assigned Spot <span className="text-danger">*</span>
                                                </label>
                                                <select
                                                    className={`form-select ${formErrors.spot_id ? 'is-invalid' : ''}`}
                                                    id="spot_id"
                                                    name="spot_id"
                                                    value={formData.spot_id}
                                                    onChange={handleInputChange}
                                                    disabled={submitting}
                                                >
                                                    <option value="">Select Spot</option>
                                                    {spots.map(spot => (
                                                        <option key={spot.id} value={spot.id}>
                                                            {spot.name} - {spot.regional?.province}
                                                        </option>
                                                    ))}
                                                </select>
                                                {formErrors.spot_id && (
                                                    <div className="invalid-feedback">{formErrors.spot_id}</div>
                                                )}
                                            </div>

                                            <div className="col-12 mb-3">
                                                <label htmlFor="address" className="form-label fw-semibold">
                                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                                                    Address <span className="text-danger">*</span>
                                                </label>
                                                <textarea
                                                    className={`form-control ${formErrors.address ? 'is-invalid' : ''}`}
                                                    id="address"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter complete address"
                                                    rows="2"
                                                    disabled={submitting}
                                                ></textarea>
                                                {formErrors.address && (
                                                    <div className="invalid-feedback">{formErrors.address}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer bg-light">
                                        <button
                                            type="button"
                                            className="btn btn-secondary d-flex align-items-center gap-2"
                                            onClick={handleCloseModal}
                                            disabled={submitting}
                                        >
                                            <FontAwesomeIcon icon={faTimes} />
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn text-white d-flex align-items-center gap-2"
                                            style={{ backgroundColor: '#6f42c1' }}
                                            disabled={submitting}
                                        >
                                            {submitting ? (
                                                <>
                                                    <FontAwesomeIcon icon={faSpinner} spin />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <FontAwesomeIcon icon={faSave} />
                                                    {modalMode === 'create' ? 'Save Staff' : 'Update Staff'}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div 
                        className="modal d-block" 
                        tabIndex="-1"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    >
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content shadow">
                                <div className="modal-header bg-danger text-white">
                                    <h5 className="modal-title d-flex align-items-center gap-2">
                                        <FontAwesomeIcon icon={faExclamationTriangle} />
                                        Delete Confirmation
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white"
                                        onClick={() => setShowDeleteConfirm(false)}
                                    ></button>
                                </div>
                                <div className="modal-body text-center py-4">
                                    <FontAwesomeIcon 
                                        icon={faTrash} 
                                        size="3x" 
                                        className="text-danger mb-3" 
                                    />
                                    <h5>Are you sure?</h5>
                                    <p className="text-muted mb-0">
                                        You are about to delete medical staff
                                    </p>
                                    <p className="mb-2">
                                        <strong className="text-dark">
                                            {medicalToDelete?.name}
                                        </strong>
                                        <br />
                                        <small className="text-muted">
                                            {getRoleLabel(medicalToDelete?.role)} at {medicalToDelete?.spot?.name}
                                        </small>
                                    </p>
                                    <p className="text-danger">This will also delete the associated user account!</p>
                                </div>
                                <div className="modal-footer bg-light justify-content-center">
                                    <button
                                        type="button"
                                        className="btn btn-secondary d-flex align-items-center gap-2"
                                        onClick={() => setShowDeleteConfirm(false)}
                                    >
                                        <FontAwesomeIcon icon={faTimes} />
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger d-flex align-items-center gap-2"
                                        onClick={handleDeleteConfirm}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                        Delete Staff
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Main>
    );
}