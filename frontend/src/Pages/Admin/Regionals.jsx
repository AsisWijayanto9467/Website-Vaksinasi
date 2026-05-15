// src/Pages/Admin/Regionals.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus,
    faEdit,
    faTrash,
    faSearch,
    faLocationDot,
    faSpinner,
    faExclamationTriangle,
    faCheckCircle,
    faChevronLeft,
    faChevronRight,
    faSave,
    faTimes,
    faMapMarkerAlt,
    faBuilding
} from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';
import Main from '../Layouts/Main';

export default function Regionals() {
    // State Management
    const [regionals, setRegionals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    
    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedRegional, setSelectedRegional] = useState(null);
    
    // Delete Confirmation State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [regionalToDelete, setRegionalToDelete] = useState(null);
    
    // Form State
    const [formData, setFormData] = useState({
        province: '',
        district: ''
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

    // Fetch Regionals dengan token di URL
    const fetchRegionals = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = getToken();
            const response = await api.get(`/admin/regionals?token=${token}`);
            setRegionals(response.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch regionals');
            console.error('Error fetching regionals:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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

    // Handle Search - search by province or district
    const filteredRegionals = regionals.filter(regional =>
        regional.province.toLowerCase().includes(searchTerm.toLowerCase()) ||
        regional.district.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const totalPages = Math.ceil(filteredRegionals.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRegionals = filteredRegionals.slice(startIndex, endIndex);

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
        if (!formData.province.trim()) {
            errors.province = 'Province is required';
        } else if (formData.province.trim().length < 2) {
            errors.province = 'Province must be at least 2 characters';
        }
        
        if (!formData.district.trim()) {
            errors.district = 'District is required';
        } else if (formData.district.trim().length < 2) {
            errors.district = 'District must be at least 2 characters';
        }
        
        return errors;
    };

    // Open Modal for Create
    const handleCreate = () => {
        setModalMode('create');
        setSelectedRegional(null);
        setFormData({ province: '', district: '' });
        setFormErrors({});
        setShowModal(true);
    };

    // Open Modal for Edit
    const handleEdit = (regional) => {
        setModalMode('edit');
        setSelectedRegional(regional);
        setFormData({
            province: regional.province,
            district: regional.district
        });
        setFormErrors({});
        setShowModal(true);
    };

    // Close Modal
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedRegional(null);
        setFormData({ province: '', district: '' });
        setFormErrors({});
    };

    // Submit Form (Create or Update) dengan token di URL
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
                await api.post(`/admin/regionals?token=${token}`, formData);
                setSuccessMessage('Regional created successfully!');
            } else {
                await api.put(`/admin/regionals/${selectedRegional.id}?token=${token}`, formData);
                setSuccessMessage('Regional updated successfully!');
            }
            
            handleCloseModal();
            fetchRegionals();
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
    const handleDeleteClick = (regional) => {
        setRegionalToDelete(regional);
        setShowDeleteConfirm(true);
    };

    // Delete dengan token di URL
    const handleDeleteConfirm = async () => {
        try {
            const token = getToken();
            await api.delete(`/admin/regionals/${regionalToDelete.id}?token=${token}`);
            setSuccessMessage('Regional deleted successfully!');
            setShowDeleteConfirm(false);
            setRegionalToDelete(null);
            fetchRegionals();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete regional');
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

    return (
        <Main>
            <div className="regionals-page">
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
                                    <div className="bg-info rounded p-3 d-flex align-items-center justify-content-center" 
                                         style={{ width: '50px', height: '50px' }}>
                                        <FontAwesomeIcon icon={faLocationDot} className="text-white fs-5" />
                                    </div>
                                    <div>
                                        <h4 className="mb-1 fw-bold">Regional Management</h4>
                                        <p className="text-muted mb-0">Manage provinces, districts, and their vaccination spots</p>
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
                                            placeholder="Search by province or district..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            style={{ borderRadius: '8px' }}
                                        />
                                    </div>
                                    <button
                                        className="btn btn-info text-white d-flex align-items-center gap-2"
                                        onClick={handleCreate}
                                        style={{ borderRadius: '8px', whiteSpace: 'nowrap' }}
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                        <span className="d-none d-sm-inline">Add Regional</span>
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
                                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-info mb-3" />
                                <p className="text-muted">Loading regionals...</p>
                            </div>
                        ) : filteredRegionals.length === 0 ? (
                            <div className="text-center py-5">
                                <FontAwesomeIcon icon={faMapMarkerAlt} size="3x" className="text-muted mb-3" />
                                <h5 className="text-muted">No regionals found</h5>
                                <p className="text-muted">
                                    {searchTerm ? 'No regionals match your search criteria' : 'Start by adding a new regional'}
                                </p>
                                {!searchTerm && (
                                    <button
                                        className="btn btn-info text-white"
                                        onClick={handleCreate}
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                                        Add First Regional
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th style={{ width: '80px' }} className="text-center">#</th>
                                                <th style={{ width: '35%' }}>Province</th>
                                                <th style={{ width: '35%' }}>District</th>
                                                <th style={{ width: '100px' }} className="text-center">Spots</th>
                                                <th style={{ width: '150px' }} className="text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentRegionals.map((regional, index) => (
                                                <tr key={regional.id}>
                                                    <td className="text-center align-middle">
                                                        <span className="badge bg-secondary rounded-pill">
                                                            {startIndex + index + 1}
                                                        </span>
                                                    </td>
                                                    <td className="align-middle">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <FontAwesomeIcon 
                                                                icon={faBuilding} 
                                                                className="text-info" 
                                                            />
                                                            <span className="fw-medium">{regional.province}</span>
                                                        </div>
                                                    </td>
                                                    <td className="align-middle">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <FontAwesomeIcon 
                                                                icon={faMapMarkerAlt} 
                                                                className="text-secondary" 
                                                            />
                                                            <span>{regional.district}</span>
                                                        </div>
                                                    </td>
                                                    <td className="text-center align-middle">
                                                        <span className="badge bg-info rounded-pill">
                                                            {regional.spots_count || 0}
                                                        </span>
                                                    </td>
                                                    <td className="text-center align-middle">
                                                        <div className="d-flex gap-2 justify-content-center">
                                                            <button
                                                                className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                                                                onClick={() => handleEdit(regional)}
                                                                title="Edit regional"
                                                            >
                                                                <FontAwesomeIcon icon={faEdit} />
                                                                <span className="d-none d-md-inline">Edit</span>
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                                                                onClick={() => handleDeleteClick(regional)}
                                                                title="Delete regional"
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} />
                                                                <span className="d-none d-md-inline">Delete</span>
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
                                            Showing {startIndex + 1} to {Math.min(endIndex, filteredRegionals.length)} of {filteredRegionals.length} regionals
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
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content shadow">
                                <div className="modal-header bg-info text-white">
                                    <h5 className="modal-title d-flex align-items-center gap-2">
                                        <FontAwesomeIcon icon={modalMode === 'create' ? faPlus : faEdit} />
                                        {modalMode === 'create' ? 'Add New Regional' : 'Edit Regional'}
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
                                        {/* General Error */}
                                        {formErrors.general && (
                                            <div className="alert alert-danger py-2">
                                                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                                                {formErrors.general}
                                            </div>
                                        )}

                                        <div className="mb-3">
                                            <label htmlFor="province" className="form-label fw-semibold">
                                                Province <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control ${formErrors.province ? 'is-invalid' : ''}`}
                                                id="province"
                                                name="province"
                                                value={formData.province}
                                                onChange={handleInputChange}
                                                placeholder="Enter province name"
                                                disabled={submitting}
                                                autoFocus
                                            />
                                            {formErrors.province && (
                                                <div className="invalid-feedback">
                                                    {formErrors.province}
                                                </div>
                                            )}
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="district" className="form-label fw-semibold">
                                                District <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control ${formErrors.district ? 'is-invalid' : ''}`}
                                                id="district"
                                                name="district"
                                                value={formData.district}
                                                onChange={handleInputChange}
                                                placeholder="Enter district name"
                                                disabled={submitting}
                                            />
                                            {formErrors.district && (
                                                <div className="invalid-feedback">
                                                    {formErrors.district}
                                                </div>
                                            )}
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
                                            className="btn btn-info text-white d-flex align-items-center gap-2"
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
                                                    {modalMode === 'create' ? 'Save Regional' : 'Update Regional'}
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
                                        You are about to delete regional
                                    </p>
                                    <p className="mb-2">
                                        <strong className="text-dark">
                                            {regionalToDelete?.province}, {regionalToDelete?.district}
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
                                        Delete Regional
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