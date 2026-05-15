// src/Pages/Admin/Spots.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus,
    faEdit,
    faTrash,
    faSearch,
    faMapPin,
    faSpinner,
    faExclamationTriangle,
    faCheckCircle,
    faChevronLeft,
    faChevronRight,
    faSave,
    faTimes,
    faHospital,
    faMapMarkerAlt,
    faUserDoctor,
    faSyringe,
    faLocationDot,
} from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';
import Main from '../Layouts/Main';

export default function Spots() {
    // State Management
    const [spots, setSpots] = useState([]);
    const [regionals, setRegionals] = useState([]);
    const [vaccines, setVaccines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    
    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedSpot, setSelectedSpot] = useState(null);
    
    // Delete Confirmation State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [spotToDelete, setSpotToDelete] = useState(null);
    
    // Manage Vaccines Modal State
    const [showVaccineModal, setShowVaccineModal] = useState(false);
    const [selectedSpotForVaccine, setSelectedSpotForVaccine] = useState(null);
    const [selectedVaccineIds, setSelectedVaccineIds] = useState([]);
    const [ setCurrentSpotVaccines] = useState([]);
    
    // Form State
    const [formData, setFormData] = useState({
        regional_id: '',
        name: '',
        address: '',
        serve: 1,
        capacity: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    
    // Search & Pagination State
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Helper function to get token
    const getToken = () => {
        return localStorage.getItem('token');
    };

    // Fetch Spots
    const fetchSpots = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = getToken();
            const response = await api.get(`/admin/spots?token=${token}`);
            setSpots(response.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch spots');
            console.error('Error fetching spots:', err);
        } finally {
            setLoading(false);
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

    // Fetch Vaccines for manage vaccines
    const fetchVaccines = async () => {
        try {
            const token = getToken();
            const response = await api.get(`/admin/vaccines?token=${token}`);
            setVaccines(response.data.data || []);
        } catch (err) {
            console.error('Error fetching vaccines:', err);
        }
    };

    useEffect(() => {
        fetchSpots();
        fetchRegionals();
        fetchVaccines();
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

    // Handle Search
    const filteredSpots = spots.filter(spot =>
        spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spot.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spot.regional?.province?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spot.regional?.district?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const totalPages = Math.ceil(filteredSpots.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentSpots = filteredSpots.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

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
        if (!formData.regional_id) {
            errors.regional_id = 'Regional is required';
        }
        if (!formData.name.trim()) {
            errors.name = 'Spot name is required';
        } else if (formData.name.trim().length < 2) {
            errors.name = 'Spot name must be at least 2 characters';
        }
        if (!formData.address.trim()) {
            errors.address = 'Address is required';
        }
        if (!formData.serve) {
            errors.serve = 'Serve type is required';
        }
        if (!formData.capacity || formData.capacity < 1) {
            errors.capacity = 'Capacity must be at least 1';
        }
        return errors;
    };

    // Get serve type label
    const getServeLabel = (serve) => {
        const serveMap = {
            1: 'Individual',
            2: 'Group',
            3: 'Both'
        };
        return serveMap[serve] || 'Unknown';
    };

    // Get serve badge color
    const getServeBadgeColor = (serve) => {
        const colorMap = {
            1: 'primary',
            2: 'warning',
            3: 'success'
        };
        return colorMap[serve] || 'secondary';
    };

    // Open Modal for Create
    const handleCreate = () => {
        setModalMode('create');
        setSelectedSpot(null);
        setFormData({
            regional_id: '',
            name: '',
            address: '',
            serve: 1,
            capacity: ''
        });
        setFormErrors({});
        setShowModal(true);
    };

    // Open Modal for Edit
    const handleEdit = (spot) => {
        setModalMode('edit');
        setSelectedSpot(spot);
        setFormData({
            regional_id: spot.regional_id,
            name: spot.name,
            address: spot.address,
            serve: spot.serve,
            capacity: spot.capacity
        });
        setFormErrors({});
        setShowModal(true);
    };

    // Close Modal
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedSpot(null);
        setFormData({
            regional_id: '',
            name: '',
            address: '',
            serve: 1,
            capacity: ''
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
            if (modalMode === 'create') {
                await api.post(`/admin/spots?token=${token}`, formData);
                setSuccessMessage('Spot created successfully!');
            } else {
                await api.put(`/admin/spots/${selectedSpot.id}?token=${token}`, formData);
                setSuccessMessage('Spot updated successfully!');
            }
            
            handleCloseModal();
            fetchSpots();
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Operation failed';
            setFormErrors({ 
                general: err.response?.data?.errors || errorMessage 
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Delete Confirmation
    const handleDeleteClick = (spot) => {
        setSpotToDelete(spot);
        setShowDeleteConfirm(true);
    };

    // Delete
    const handleDeleteConfirm = async () => {
        try {
            const token = getToken();
            await api.delete(`/admin/spots/${spotToDelete.id}?token=${token}`);
            setSuccessMessage('Spot deleted successfully!');
            setShowDeleteConfirm(false);
            setSpotToDelete(null);
            fetchSpots();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete spot');
            setShowDeleteConfirm(false);
        }
    };

    // Open Manage Vaccines Modal
    const handleManageVaccines = (spot) => {
        setSelectedSpotForVaccine(spot);
        // Get current vaccine IDs for this spot
        const currentVaccineIds = spot.spot_vaccines?.map(sv => sv.vaccine_id) || [];
        setSelectedVaccineIds(currentVaccineIds);
        setCurrentSpotVaccines(spot.spot_vaccines || []);
        setShowVaccineModal(true);
    };

    // Toggle vaccine selection
    const handleVaccineToggle = (vaccineId) => {
        setSelectedVaccineIds(prev => {
            if (prev.includes(vaccineId)) {
                return prev.filter(id => id !== vaccineId);
            } else {
                return [...prev, vaccineId];
            }
        });
    };

    // Save vaccine management
    const handleSaveVaccines = async () => {
        try {
            const token = getToken();
            await api.post(`/admin/spots/manage-vaccines?token=${token}`, {
                spot_id: selectedSpotForVaccine.id,
                vaccine_ids: selectedVaccineIds
            });
            setSuccessMessage('Spot vaccines updated successfully!');
            setShowVaccineModal(false);
            setSelectedSpotForVaccine(null);
            fetchSpots();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update vaccines');
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

    return (
        <Main>
            <div className="spots-page">
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
                                    <div className="bg-success rounded p-3 d-flex align-items-center justify-content-center" 
                                         style={{ width: '50px', height: '50px' }}>
                                        <FontAwesomeIcon icon={faHospital} className="text-white fs-5" />
                                    </div>
                                    <div>
                                        <h4 className="mb-1 fw-bold">Spots Management</h4>
                                        <p className="text-muted mb-0">Manage vaccination spots and their capacities</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="d-flex justify-content-md-end gap-2 mt-3 mt-md-0">
                                    <div className="position-relative" style={{ minWidth: '250px' }}>
                                        <FontAwesomeIcon 
                                            icon={faSearch} 
                                            className="position-absolute text-muted"
                                            style={{ 
                                                left: '15px', 
                                                top: '50%', 
                                                transform: 'translateY(-50%)',
                                                zIndex: 10
                                            }} 
                                        />
                                        <input
                                            type="text"
                                            className="form-control ps-5"
                                            placeholder="Search by name, address, or regional..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            style={{ borderRadius: '8px' }}
                                        />
                                    </div>
                                    <button
                                        className="btn btn-success d-flex align-items-center gap-2"
                                        onClick={handleCreate}
                                        style={{ borderRadius: '8px', whiteSpace: 'nowrap' }}
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                        <span className="d-none d-sm-inline">Add Spot</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="card shadow-sm">
                    <div className="card-body p-0">
                        {loading ? (
                            <div className="text-center py-5">
                                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-success mb-3" />
                                <p className="text-muted">Loading spots...</p>
                            </div>
                        ) : filteredSpots.length === 0 ? (
                            <div className="text-center py-5">
                                <FontAwesomeIcon icon={faMapPin} size="3x" className="text-muted mb-3" />
                                <h5 className="text-muted">No spots found</h5>
                                <p className="text-muted">
                                    {searchTerm ? 'No spots match your search criteria' : 'Start by adding a new vaccination spot'}
                                </p>
                                {!searchTerm && (
                                    <button
                                        className="btn btn-success"
                                        onClick={handleCreate}
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                                        Add First Spot
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
                                                <th style={{ width: '20%' }}>Spot Name</th>
                                                <th style={{ width: '25%' }}>Address</th>
                                                <th style={{ width: '15%' }}>Regional</th>
                                                <th style={{ width: '10%' }} className="text-center">Serve</th>
                                                <th style={{ width: '8%' }} className="text-center">Capacity</th>
                                                <th style={{ width: '8%' }} className="text-center">Staff</th>
                                                <th style={{ width: '14%' }} className="text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentSpots.map((spot, index) => (
                                                <tr key={spot.id}>
                                                    <td className="text-center align-middle">
                                                        <span className="badge bg-secondary rounded-pill">
                                                            {startIndex + index + 1}
                                                        </span>
                                                    </td>
                                                    <td className="align-middle">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <FontAwesomeIcon 
                                                                icon={faHospital} 
                                                                className="text-success" 
                                                            />
                                                            <span className="fw-medium">{spot.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="align-middle">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <FontAwesomeIcon 
                                                                icon={faMapMarkerAlt} 
                                                                className="text-secondary" 
                                                            />
                                                            <small>{spot.address}</small>
                                                        </div>
                                                    </td>
                                                    <td className="align-middle">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <FontAwesomeIcon 
                                                                icon={faLocationDot} 
                                                                className="text-info" 
                                                            />
                                                            <div>
                                                                <small className="d-block fw-medium">{spot.regional?.province}</small>
                                                                <small className="text-muted">{spot.regional?.district}</small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="text-center align-middle">
                                                        <span className={`badge bg-${getServeBadgeColor(spot.serve)}`}>
                                                            {getServeLabel(spot.serve)}
                                                        </span>
                                                    </td>
                                                    <td className="text-center align-middle">
                                                        <span className="fw-bold">{spot.capacity}</span>
                                                    </td>
                                                    <td className="text-center align-middle">
                                                        <span className="badge bg-info rounded-pill">
                                                            <FontAwesomeIcon icon={faUserDoctor} className="me-1" />
                                                            {spot.medicals_count || 0}
                                                        </span>
                                                    </td>
                                                    <td className="text-center align-middle">
                                                        <div className="d-flex gap-1 justify-content-center flex-wrap">
                                                            <button
                                                                className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                                                                onClick={() => handleEdit(spot)}
                                                                title="Edit spot"
                                                            >
                                                                <FontAwesomeIcon icon={faEdit} />
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                                                                onClick={() => handleManageVaccines(spot)}
                                                                title="Manage vaccines"
                                                            >
                                                                <FontAwesomeIcon icon={faSyringe} />
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                                                                onClick={() => handleDeleteClick(spot)}
                                                                title="Delete spot"
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
                                            Showing {startIndex + 1} to {Math.min(endIndex, filteredSpots.length)} of {filteredSpots.length} spots
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
                                <div className="modal-header bg-success text-white">
                                    <h5 className="modal-title d-flex align-items-center gap-2">
                                        <FontAwesomeIcon icon={modalMode === 'create' ? faPlus : faEdit} />
                                        {modalMode === 'create' ? 'Add New Spot' : 'Edit Spot'}
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
                                                <label htmlFor="regional_id" className="form-label fw-semibold">
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
                                                    <div className="invalid-feedback">
                                                        {formErrors.regional_id}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="name" className="form-label fw-semibold">
                                                    Spot Name <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter spot name"
                                                    disabled={submitting}
                                                />
                                                {formErrors.name && (
                                                    <div className="invalid-feedback">
                                                        {formErrors.name}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="col-12 mb-3">
                                                <label htmlFor="address" className="form-label fw-semibold">
                                                    Address <span className="text-danger">*</span>
                                                </label>
                                                <textarea
                                                    className={`form-control ${formErrors.address ? 'is-invalid' : ''}`}
                                                    id="address"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter complete address"
                                                    rows="3"
                                                    disabled={submitting}
                                                ></textarea>
                                                {formErrors.address && (
                                                    <div className="invalid-feedback">
                                                        {formErrors.address}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="serve" className="form-label fw-semibold">
                                                    Serve Type <span className="text-danger">*</span>
                                                </label>
                                                <select
                                                    className={`form-select ${formErrors.serve ? 'is-invalid' : ''}`}
                                                    id="serve"
                                                    name="serve"
                                                    value={formData.serve}
                                                    onChange={handleInputChange}
                                                    disabled={submitting}
                                                >
                                                    <option value={1}>Individual</option>
                                                    <option value={2}>Group</option>
                                                    <option value={3}>Both</option>
                                                </select>
                                                {formErrors.serve && (
                                                    <div className="invalid-feedback">
                                                        {formErrors.serve}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="capacity" className="form-label fw-semibold">
                                                    Capacity <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    className={`form-control ${formErrors.capacity ? 'is-invalid' : ''}`}
                                                    id="capacity"
                                                    name="capacity"
                                                    value={formData.capacity}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter capacity"
                                                    min="1"
                                                    disabled={submitting}
                                                />
                                                {formErrors.capacity && (
                                                    <div className="invalid-feedback">
                                                        {formErrors.capacity}
                                                    </div>
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
                                            className="btn btn-success d-flex align-items-center gap-2"
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
                                                    {modalMode === 'create' ? 'Save Spot' : 'Update Spot'}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Manage Vaccines Modal */}
                {showVaccineModal && (
                    <div 
                        className="modal d-block" 
                        tabIndex="-1"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    >
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content shadow">
                                <div className="modal-header bg-info text-white">
                                    <h5 className="modal-title d-flex align-items-center gap-2">
                                        <FontAwesomeIcon icon={faSyringe} />
                                        Manage Vaccines for {selectedSpotForVaccine?.name}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white"
                                        onClick={() => setShowVaccineModal(false)}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <p className="text-muted mb-3">
                                        Select vaccines available at this spot:
                                    </p>
                                    {vaccines.length === 0 ? (
                                        <div className="text-center py-3">
                                            <p className="text-muted">No vaccines available</p>
                                        </div>
                                    ) : (
                                        <div className="list-group">
                                            {vaccines.map(vaccine => (
                                                <label 
                                                    key={vaccine.id} 
                                                    className="list-group-item d-flex align-items-center gap-3"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        checked={selectedVaccineIds.includes(vaccine.id)}
                                                        onChange={() => handleVaccineToggle(vaccine.id)}
                                                    />
                                                    <FontAwesomeIcon icon={faSyringe} className="text-info" />
                                                    <span>{vaccine.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer bg-light">
                                    <button
                                        type="button"
                                        className="btn btn-secondary d-flex align-items-center gap-2"
                                        onClick={() => setShowVaccineModal(false)}
                                    >
                                        <FontAwesomeIcon icon={faTimes} />
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-info text-white d-flex align-items-center gap-2"
                                        onClick={handleSaveVaccines}
                                    >
                                        <FontAwesomeIcon icon={faSave} />
                                        Save Vaccines
                                    </button>
                                </div>
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
                                        You are about to delete spot
                                    </p>
                                    <p className="mb-2">
                                        <strong className="text-dark">
                                            {spotToDelete?.name}
                                        </strong>
                                    </p>
                                    <p className="text-muted">This action cannot be undone.</p>
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
                                        Delete Spot
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