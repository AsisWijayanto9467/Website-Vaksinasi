// src/Pages/Admin/Report.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFileAlt,
    faSpinner,
    faExclamationTriangle,
    faCheckCircle,
    faSearch,
    faChartBar,
    faSyringe,
    faComments,
    faHospital,
    faUserDoctor,
    faFilter,
    faFilePdf,
    faEye,
    faClock,
} from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';
import Main from '../Layouts/Main';

export default function Report() {
    // State Management
    const [activeTab, setActiveTab] = useState('vaccination'); // vaccination, consultation, capacity
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    
    // Report Data State
    const [vaccinationData, setVaccinationData] = useState(null);
    const [consultationData, setConsultationData] = useState(null);
    const [capacityData, setCapacityData] = useState(null);
    
    // Filter State
    const [showFilters, setShowFilters] = useState(true);
    const [filters, setFilters] = useState({
        start_date: '',
        end_date: '',
        regional_id: '',
        spot_id: '',
        vaccine_id: '',
        doctor_id: '',
        status: ''
    });
    
    // Reference Data for Filters
    const [regionals, setRegionals] = useState([]);
    const [spots, setSpots] = useState([]);
    const [vaccines, setVaccines] = useState([]);
    
    // Detail Modal State
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailData, setDetailData] = useState(null);
    const [setDetailType] = useState('');

    // Helper function to get token
    const getToken = () => {
        return localStorage.getItem('token');
    };

    // Fetch Reference Data
    const fetchReferenceData = async () => {
        try {
            const token = getToken();
            const [regionalsRes, spotsRes, vaccinesRes] = await Promise.all([
                api.get(`/admin/regionals?token=${token}`),
                api.get(`/admin/spots?token=${token}`),
                api.get(`/admin/vaccines?token=${token}`)
            ]);
            setRegionals(regionalsRes.data.data || []);
            setSpots(spotsRes.data.data || []);
            setVaccines(vaccinesRes.data.data || []);
        } catch (err) {
            console.error('Error fetching reference data:', err);
        }
    };

    useEffect(() => {
        fetchReferenceData();
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

    // Handle Filter Change
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({
            ...filters,
            [name]: value
        });
    };

    // Reset Filters
    const resetFilters = () => {
        setFilters({
            start_date: '',
            end_date: '',
            regional_id: '',
            spot_id: '',
            vaccine_id: '',
            doctor_id: '',
            status: ''
        });
    };

    // Build query params from filters
    const buildQueryParams = () => {
        const params = new URLSearchParams();
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);
        if (filters.regional_id) params.append('regional_id', filters.regional_id);
        if (filters.spot_id) params.append('spot_id', filters.spot_id);
        if (filters.vaccine_id) params.append('vaccine_id', filters.vaccine_id);
        if (filters.doctor_id) params.append('doctor_id', filters.doctor_id);
        if (filters.status) params.append('status', filters.status);
        return params.toString();
    };

    // Fetch Vaccination Report
    const fetchVaccinationReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = getToken();
            const queryParams = buildQueryParams();
            const response = await api.get(`/admin/reports/vaccinations?token=${token}&${queryParams}`);
            setVaccinationData(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch vaccination report');
        } finally {
            setLoading(false);
        }
    };

    // Fetch Consultation Report
    const fetchConsultationReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = getToken();
            const queryParams = buildQueryParams();
            const response = await api.get(`/admin/reports/consultations?token=${token}&${queryParams}`);
            setConsultationData(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch consultation report');
        } finally {
            setLoading(false);
        }
    };

    // Fetch Capacity Report
    const fetchCapacityReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = getToken();
            const queryParams = buildQueryParams();
            const response = await api.get(`/admin/reports/capacity?token=${token}&${queryParams}`);
            setCapacityData(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch capacity report');
        } finally {
            setLoading(false);
        }
    };

    // Generate Report based on active tab
    const generateReport = () => {
        switch(activeTab) {
            case 'vaccination':
                fetchVaccinationReport();
                break;
            case 'consultation':
                fetchConsultationReport();
                break;
            case 'capacity':
                fetchCapacityReport();
                break;
            default:
                break;
        }
    };

    // Handle Tab Change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setVaccinationData(null);
        setConsultationData(null);
        setCapacityData(null);
    };

    // Show Detail Modal
    const handleShowDetail = (data, type) => {
        setDetailData(data);
        setDetailType(type);
        setShowDetailModal(true);
    };

    // Download PDF function
    const downloadPDF = () => {
        const printWindow = window.open('', '_blank');
        const currentData = activeTab === 'vaccination' ? vaccinationData : 
                           activeTab === 'consultation' ? consultationData : 
                           capacityData;
        
        if (!currentData) return;

        let htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>HealthCare Report - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .header h1 { color: #333; margin-bottom: 5px; }
                    .header p { color: #666; margin: 0; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #4CAF50; color: white; }
                    .summary { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
                    .summary h3 { margin-top: 0; }
                    .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
        `;

        if (activeTab === 'vaccination') {
            htmlContent += `
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Vaccination Report</h1>
                    <p>Generated on: ${new Date().toLocaleDateString()}</p>
                </div>
                <div class="summary">
                    <h3>Summary</h3>
                    <p><strong>Total Vaccinations:</strong> ${currentData.total_vaccinations}</p>
                </div>
                <h3>Vaccinations by Spot</h3>
                <table>
                    <tr><th>Spot Name</th><th>Total</th><th>Dose 1</th><th>Dose 2</th></tr>
                    ${currentData.by_spot.map(item => `
                        <tr>
                            <td>${item.spot_name}</td>
                            <td>${item.total}</td>
                            <td>${item.dose_1}</td>
                            <td>${item.dose_2}</td>
                        </tr>
                    `).join('')}
                </table>
                <h3>Vaccinations by Vaccine</h3>
                <table>
                    <tr><th>Vaccine Name</th><th>Total</th></tr>
                    ${currentData.by_vaccine.map(item => `
                        <tr><td>${item.vaccine_name}</td><td>${item.total}</td></tr>
                    `).join('')}
                </table>
                <div class="footer">
                    <p>&copy; 2026 HealthCare System. All rights reserved.</p>
                </div>
            </body>
            </html>`;
        } else if (activeTab === 'consultation') {
            htmlContent += `
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Consultation Report</h1>
                    <p>Generated on: ${new Date().toLocaleDateString()}</p>
                </div>
                <div class="summary">
                    <h3>Summary</h3>
                    <p><strong>Total Consultations:</strong> ${currentData.total_consultations}</p>
                    <p><strong>Accepted:</strong> ${currentData.accepted_count} | 
                       <strong>Declined:</strong> ${currentData.declined_count} | 
                       <strong>Pending:</strong> ${currentData.pending_count}</p>
                    <p><strong>Acceptance Rate:</strong> ${currentData.acceptance_rate}%</p>
                </div>
                <h3>Consultations by Doctor</h3>
                <table>
                    <tr><th>Doctor Name</th><th>Total</th><th>Accepted</th><th>Declined</th><th>Pending</th></tr>
                    ${currentData.by_doctor.map(item => `
                        <tr>
                            <td>${item.doctor_name}</td>
                            <td>${item.total}</td>
                            <td>${item.accepted}</td>
                            <td>${item.declined}</td>
                            <td>${item.pending}</td>
                        </tr>
                    `).join('')}
                </table>
                <div class="footer">
                    <p>&copy; 2026 HealthCare System. All rights reserved.</p>
                </div>
            </body>
            </html>`;
        } else if (activeTab === 'capacity') {
            htmlContent += `
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Capacity Report</h1>
                    <p>Generated on: ${new Date().toLocaleDateString()}</p>
                </div>
                <div class="summary">
                    <h3>Summary</h3>
                    <p><strong>Total Spots:</strong> ${currentData.summary.total_spots}</p>
                    <p><strong>Total Capacity:</strong> ${currentData.summary.total_capacity}</p>
                    <p><strong>Average Utilization:</strong> ${currentData.summary.average_utilization}%</p>
                    <p><strong>Total Pending Queue:</strong> ${currentData.summary.total_pending_queue}</p>
                </div>
                <h3>Spot Details</h3>
                <table>
                    <tr><th>Spot Name</th><th>Regional</th><th>Capacity</th><th>Recent Vaccinations</th><th>Utilization</th><th>Queue</th></tr>
                    ${currentData.spots.map(item => `
                        <tr>
                            <td>${item.spot_name}</td>
                            <td>${item.regional}</td>
                            <td>${item.capacity}</td>
                            <td>${item.recent_vaccinations_30days}</td>
                            <td>${item.utilization_rate}%</td>
                            <td>${item.pending_queue}</td>
                        </tr>
                    `).join('')}
                </table>
                <div class="footer">
                    <p>&copy; 2026 HealthCare System. All rights reserved.</p>
                </div>
            </body>
            </html>`;
        }

        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <Main>
            <div className="report-page">
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
                                    <div className="bg-warning rounded p-3 d-flex align-items-center justify-content-center" 
                                         style={{ width: '50px', height: '50px' }}>
                                        <FontAwesomeIcon icon={faFileAlt} className="text-white fs-5" />
                                    </div>
                                    <div>
                                        <h4 className="mb-1 fw-bold">Reports & Statistics</h4>
                                        <p className="text-muted mb-0">View and download system reports</p>
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
                                    </button>
                                    <button
                                        className="btn btn-warning d-flex align-items-center gap-2"
                                        onClick={generateReport}
                                        disabled={loading}
                                    >
                                        <FontAwesomeIcon icon={faSearch} />
                                        Generate Report
                                    </button>
                                    {(vaccinationData || consultationData || capacityData) && (
                                        <button
                                            className="btn btn-danger d-flex align-items-center gap-2"
                                            onClick={downloadPDF}
                                        >
                                            <FontAwesomeIcon icon={faFilePdf} />
                                            Download PDF
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-white p-0">
                        <ul className="nav nav-tabs">
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === 'vaccination' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('vaccination')}
                                >
                                    <FontAwesomeIcon icon={faSyringe} className="me-2" />
                                    Vaccination Report
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === 'consultation' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('consultation')}
                                >
                                    <FontAwesomeIcon icon={faComments} className="me-2" />
                                    Consultation Report
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === 'capacity' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('capacity')}
                                >
                                    <FontAwesomeIcon icon={faHospital} className="me-2" />
                                    Capacity Report
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Filters Section */}
                    {showFilters && (
                        <div className="card-body border-bottom bg-light">
                            <h6 className="fw-bold mb-3">
                                <FontAwesomeIcon icon={faFilter} className="me-2" />
                                Filters
                            </h6>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="form-label small fw-semibold">Start Date</label>
                                    <input
                                        type="date"
                                        className="form-control form-control-sm"
                                        name="start_date"
                                        value={filters.start_date}
                                        onChange={handleFilterChange}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small fw-semibold">End Date</label>
                                    <input
                                        type="date"
                                        className="form-control form-control-sm"
                                        name="end_date"
                                        value={filters.end_date}
                                        onChange={handleFilterChange}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small fw-semibold">Regional</label>
                                    <select
                                        className="form-select form-select-sm"
                                        name="regional_id"
                                        value={filters.regional_id}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">All Regionals</option>
                                        {regionals.map(regional => (
                                            <option key={regional.id} value={regional.id}>
                                                {regional.province} - {regional.district}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                {activeTab !== 'consultation' && (
                                    <div className="col-md-4">
                                        <label className="form-label small fw-semibold">Spot</label>
                                        <select
                                            className="form-select form-select-sm"
                                            name="spot_id"
                                            value={filters.spot_id}
                                            onChange={handleFilterChange}
                                        >
                                            <option value="">All Spots</option>
                                            {spots.map(spot => (
                                                <option key={spot.id} value={spot.id}>{spot.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                
                                {activeTab === 'vaccination' && (
                                    <div className="col-md-4">
                                        <label className="form-label small fw-semibold">Vaccine</label>
                                        <select
                                            className="form-select form-select-sm"
                                            name="vaccine_id"
                                            value={filters.vaccine_id}
                                            onChange={handleFilterChange}
                                        >
                                            <option value="">All Vaccines</option>
                                            {vaccines.map(vaccine => (
                                                <option key={vaccine.id} value={vaccine.id}>{vaccine.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                
                                {activeTab === 'consultation' && (
                                    <div className="col-md-4">
                                        <label className="form-label small fw-semibold">Status</label>
                                        <select
                                            className="form-select form-select-sm"
                                            name="status"
                                            value={filters.status}
                                            onChange={handleFilterChange}
                                        >
                                            <option value="">All Status</option>
                                            <option value="pending">Pending</option>
                                            <option value="accepted">Accepted</option>
                                            <option value="declined">Declined</option>
                                        </select>
                                    </div>
                                )}
                                
                                <div className="col-md-4 d-flex align-items-end">
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={resetFilters}
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Report Content */}
                <div className="card shadow-sm">
                    <div className="card-body">
                        {loading ? (
                            <div className="text-center py-5">
                                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-warning mb-3" />
                                <p className="text-muted">Generating report...</p>
                            </div>
                        ) : (
                            <>
                                {/* Vaccination Report */}
                                {activeTab === 'vaccination' && vaccinationData && (
                                    <div>
                                        <h5 className="mb-4">
                                            <FontAwesomeIcon icon={faChartBar} className="me-2 text-warning" />
                                            Vaccination Report Summary
                                        </h5>
                                        
                                        {/* Summary Cards */}
                                        <div className="row mb-4">
                                            <div className="col-md-3">
                                                <div className="card bg-primary text-white">
                                                    <div className="card-body text-center">
                                                        <h3 className="mb-0">{vaccinationData.total_vaccinations}</h3>
                                                        <small>Total Vaccinations</small>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="card bg-success text-white">
                                                    <div className="card-body text-center">
                                                        <h3 className="mb-0">{vaccinationData.by_spot.length}</h3>
                                                        <small>Active Spots</small>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="card bg-info text-white">
                                                    <div className="card-body text-center">
                                                        <h3 className="mb-0">{vaccinationData.by_vaccine.length}</h3>
                                                        <small>Vaccine Types</small>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="card bg-warning text-white">
                                                    <div className="card-body text-center">
                                                        <h3 className="mb-0">{vaccinationData.by_date.length}</h3>
                                                        <small>Active Days</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* By Spot Table */}
                                        <h6 className="fw-bold mt-4 mb-3">
                                            <FontAwesomeIcon icon={faHospital} className="me-2" />
                                            Vaccinations by Spot
                                        </h6>
                                        <div className="table-responsive mb-4">
                                            <table className="table table-hover">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Spot Name</th>
                                                        <th className="text-center">Total</th>
                                                        <th className="text-center">Dose 1</th>
                                                        <th className="text-center">Dose 2</th>
                                                        <th className="text-center">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {vaccinationData.by_spot.map((item, index) => (
                                                        <tr key={index}>
                                                            <td>{item.spot_name}</td>
                                                            <td className="text-center">
                                                                <span className="badge bg-primary">{item.total}</span>
                                                            </td>
                                                            <td className="text-center">{item.dose_1}</td>
                                                            <td className="text-center">{item.dose_2}</td>
                                                            <td className="text-center">
                                                                <button
                                                                    className="btn btn-sm btn-outline-info"
                                                                    onClick={() => handleShowDetail(item, 'spot')}
                                                                >
                                                                    <FontAwesomeIcon icon={faEye} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* By Vaccine Table */}
                                        <h6 className="fw-bold mt-4 mb-3">
                                            <FontAwesomeIcon icon={faSyringe} className="me-2" />
                                            Vaccinations by Vaccine Type
                                        </h6>
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Vaccine Name</th>
                                                        <th className="text-center">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {vaccinationData.by_vaccine.map((item, index) => (
                                                        <tr key={index}>
                                                            <td>{item.vaccine_name}</td>
                                                            <td className="text-center">
                                                                <span className="badge bg-success">{item.total}</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Consultation Report */}
                                {activeTab === 'consultation' && consultationData && (
                                    <div>
                                        <h5 className="mb-4">
                                            <FontAwesomeIcon icon={faChartBar} className="me-2 text-warning" />
                                            Consultation Report Summary
                                        </h5>
                                        
                                        {/* Summary Cards */}
                                        <div className="row mb-4">
                                            <div className="col-md-3">
                                                <div className="card bg-primary text-white">
                                                    <div className="card-body text-center">
                                                        <h3 className="mb-0">{consultationData.total_consultations}</h3>
                                                        <small>Total Consultations</small>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="card bg-success text-white">
                                                    <div className="card-body text-center">
                                                        <h3 className="mb-0">{consultationData.accepted_count}</h3>
                                                        <small>Accepted</small>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="card bg-danger text-white">
                                                    <div className="card-body text-center">
                                                        <h3 className="mb-0">{consultationData.declined_count}</h3>
                                                        <small>Declined</small>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="card bg-info text-white">
                                                    <div className="card-body text-center">
                                                        <h3 className="mb-0">{consultationData.acceptance_rate}%</h3>
                                                        <small>Acceptance Rate</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pending Count */}
                                        <div className="alert alert-warning d-flex align-items-center mb-4">
                                            <FontAwesomeIcon icon={faClock} className="me-2" />
                                            <strong>{consultationData.pending_count} consultations pending</strong>
                                        </div>

                                        {/* By Doctor Table */}
                                        <h6 className="fw-bold mt-4 mb-3">
                                            <FontAwesomeIcon icon={faUserDoctor} className="me-2" />
                                            Consultations by Doctor
                                        </h6>
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Doctor Name</th>
                                                        <th className="text-center">Total</th>
                                                        <th className="text-center">Accepted</th>
                                                        <th className="text-center">Declined</th>
                                                        <th className="text-center">Pending</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {consultationData.by_doctor.map((item, index) => (
                                                        <tr key={index}>
                                                            <td>{item.doctor_name}</td>
                                                            <td className="text-center">
                                                                <span className="badge bg-primary">{item.total}</span>
                                                            </td>
                                                            <td className="text-center">
                                                                <span className="text-success">{item.accepted}</span>
                                                            </td>
                                                            <td className="text-center">
                                                                <span className="text-danger">{item.declined}</span>
                                                            </td>
                                                            <td className="text-center">
                                                                <span className="text-warning">{item.pending}</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Capacity Report */}
                                {activeTab === 'capacity' && capacityData && (
                                    <div>
                                        <h5 className="mb-4">
                                            <FontAwesomeIcon icon={faChartBar} className="me-2 text-warning" />
                                            Capacity Report Summary
                                        </h5>
                                        
                                        {/* Summary Cards */}
                                        <div className="row mb-4">
                                            <div className="col-md-3">
                                                <div className="card bg-primary text-white">
                                                    <div className="card-body text-center">
                                                        <h3 className="mb-0">{capacityData.summary.total_spots}</h3>
                                                        <small>Total Spots</small>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="card bg-success text-white">
                                                    <div className="card-body text-center">
                                                        <h3 className="mb-0">{capacityData.summary.total_capacity}</h3>
                                                        <small>Total Capacity</small>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="card bg-info text-white">
                                                    <div className="card-body text-center">
                                                        <h3 className="mb-0">{capacityData.summary.average_utilization}%</h3>
                                                        <small>Avg Utilization</small>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="card bg-warning text-white">
                                                    <div className="card-body text-center">
                                                        <h3 className="mb-0">{capacityData.summary.total_pending_queue}</h3>
                                                        <small>Pending Queue</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Spots Table */}
                                        <h6 className="fw-bold mt-4 mb-3">
                                            <FontAwesomeIcon icon={faHospital} className="me-2" />
                                            Spot Capacity Details
                                        </h6>
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Spot Name</th>
                                                        <th>Regional</th>
                                                        <th className="text-center">Capacity</th>
                                                        <th className="text-center">Recent Vaccinations</th>
                                                        <th className="text-center">Utilization</th>
                                                        <th className="text-center">Queue</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {capacityData.spots.map((item, index) => (
                                                        <tr key={index}>
                                                            <td>{item.spot_name}</td>
                                                            <td>
                                                                <small>{item.regional}</small>
                                                            </td>
                                                            <td className="text-center">{item.capacity}</td>
                                                            <td className="text-center">{item.recent_vaccinations_30days}</td>
                                                            <td className="text-center">
                                                                <div className="progress" style={{ height: '20px' }}>
                                                                    <div
                                                                        className={`progress-bar ${
                                                                            item.utilization_rate > 80 ? 'bg-danger' :
                                                                            item.utilization_rate > 50 ? 'bg-warning' : 'bg-success'
                                                                        }`}
                                                                        style={{ width: `${item.utilization_rate}%` }}
                                                                    >
                                                                        {item.utilization_rate}%
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="text-center">
                                                                <span className={`badge ${
                                                                    item.pending_queue > 10 ? 'bg-danger' :
                                                                    item.pending_queue > 5 ? 'bg-warning' : 'bg-success'
                                                                }`}>
                                                                    {item.pending_queue}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Empty State */}
                                {!vaccinationData && !consultationData && !capacityData && (
                                    <div className="text-center py-5">
                                        <FontAwesomeIcon icon={faFileAlt} size="3x" className="text-muted mb-3" />
                                        <h5 className="text-muted">No Report Generated</h5>
                                        <p className="text-muted">
                                            Select a report type and click "Generate Report" to view data
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Detail Modal */}
                {showDetailModal && (
                    <div 
                        className="modal d-block" 
                        tabIndex="-1"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    >
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content shadow">
                                <div className="modal-header bg-info text-white">
                                    <h5 className="modal-title">
                                        <FontAwesomeIcon icon={faEye} className="me-2" />
                                        Detail Information
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white"
                                        onClick={() => setShowDetailModal(false)}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <pre className="bg-light p-3 rounded" style={{ maxHeight: '400px', overflow: 'auto' }}>
                                        {JSON.stringify(detailData, null, 2)}
                                    </pre>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowDetailModal(false)}
                                    >
                                        Close
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