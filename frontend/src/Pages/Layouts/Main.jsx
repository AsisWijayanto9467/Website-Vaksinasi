// src/Layouts/Main.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faHeartPulse,
    faGauge,
    faUsers,
    faLocationDot,
    faHospital,
    faFileAlt,
    faGear,
    faClipboard,
    faComments,
    faCapsules,
    faCalendarAlt,
    faCalendarCheck,
    faFileMedical,
    faUser,
    faBell,
    faChevronRight,
    faRightFromBracket,
    faTriangleExclamation,
    faCircleXmark,
    faCircleCheck,
    faShieldHalved
} from '@fortawesome/free-solid-svg-icons';




export default function Main({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);

    const handleLogout = async () => {
        const isConfirmed = window.confirm('Apakah Anda yakin ingin keluar?\nAnda akan diarahkan ke halaman login');
        
        if (isConfirmed) {
            try {
                const token = localStorage.getItem("token");
                
                await api.post('/auth/logout', {
                    token: token
                });
            } catch (err) {
                console.log('Logout API error:', err);
            } finally {
                localStorage.clear();
                navigate('/', { replace: true });
            }
        }
    };

        const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const userData = JSON.parse(localStorage.getItem('user'));
    const userRole = userData?.role;
    const userName = userData?.name;

    // Sidebar Menu Items berdasarkan Role dengan FontAwesome icons
    const getSidebarMenu = () => {
        if (userRole === 'admin') {
            return [
                { path: '/admin/dashboard', icon: faGauge, label: 'Dashboard' },
                { path: '/admin/users', icon: faUsers, label: 'Users' },
                { path: '/admin/regionals', icon: faLocationDot, label: 'Regionals' },
                { path: '/admin/hospitals', icon: faHospital, label: 'Hospitals' },
                { path: '/admin/reports', icon: faFileAlt, label: 'Reports' },
                { path: '/admin/settings', icon: faGear, label: 'Settings' },
            ];
        } else if (['medical', 'doctor', 'officer'].includes(userRole)) {
            return [
                { path: '/medical/dashboard', icon: faGauge, label: 'Dashboard' },
                { path: '/medical/patients', icon: faUsers, label: 'Patients' },
                { path: '/medical/consultations', icon: faComments, label: 'Consultations' },
                { path: '/medical/vaccinations', icon: faCapsules, label: 'Vaccinations' },
                { path: '/medical/schedule', icon: faCalendarAlt, label: 'Schedule' },
                { path: '/medical/reports', icon: faFileAlt, label: 'Reports' },
            ];
        } else {
            return [
                { path: '/dashboard', icon: faGauge, label: 'Dashboard' },
                { path: '/consultations', icon: faComments, label: 'Consultations' },
                { path: '/vaccinations', icon: faCapsules, label: 'Vaccinations' },
                { path: '/appointments', icon: faCalendarCheck, label: 'Appointments' },
                { path: '/medical-records', icon: faFileMedical, label: 'Medical Records' },
                { path: '/profile', icon: faUser, label: 'Profile' },
            ];
        }
    };

    const sidebarMenu = getSidebarMenu();
    const getRoleBadge = () => {
        if (userRole === 'admin') {
            return { label: 'Administrator', color: 'danger' };
        } else if (['medical', 'doctor', 'officer'].includes(userRole)) {
            return { label: 'Medical Staff', color: 'success' };
        } else {
            return { label: 'Society Member', color: 'primary' };
        }
    };

    const roleBadge = getRoleBadge();

    return (
        <div className="d-flex" style={{ minHeight: '100vh' }}>
            {/* Sidebar */}
            <div 
                className="bg-dark text-white d-flex flex-column flex-shrink-0"
                style={{ 
                    width: '260px',
                    minHeight: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    zIndex: 1000,
                    boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
                }}
            >
                {/* Sidebar Header */}
                <div className="p-3 border-bottom border-secondary">
                    <div className="d-flex align-items-center gap-2">
                        <div className="bg-primary rounded p-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                            <FontAwesomeIcon icon={faHeartPulse} className="text-white" />
                        </div>
                        <div>
                            <h5 className="mb-0 fw-bold text-white" style={{ fontSize: '1.1rem' }}>HealthCare</h5>
                            <span className={`badge bg-${roleBadge.color} mt-1`} style={{ fontSize: '0.65rem' }}>
                                {roleBadge.label}
                            </span>
                        </div>
                    </div>
                </div>

                {/* User Profile Section */}
                <div className="p-3 border-bottom border-secondary">
                    <div className="d-flex align-items-center gap-2">
                        <div 
                            className="rounded-circle bg-light text-dark d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: '45px', height: '45px' }}
                        >
                            <span className="fw-bold fs-5">
                                {userName?.charAt(0).toUpperCase() || 'U'}
                            </span>
                        </div>
                        <div className="flex-grow-1 min-width-0">
                            <p className="mb-0 fw-semibold text-truncate" style={{ fontSize: '0.9rem' }}>{userName || 'User'}</p>
                            <small className="text-white" style={{ fontSize: '0.75rem' }}>{userRole || 'society'}</small>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-grow-1 p-2 overflow-auto">
                    <ul className="nav flex-column gap-1">
                        {sidebarMenu.map((menu, index) => (
                            <li className="nav-item" key={index}>
                                <button
                                    className={`nav-link text-white d-flex align-items-center gap-3 px-3 py-2 rounded border-0 w-100 text-start ${
                                        isActive(menu.path) ? 'bg-primary' : ''
                                    }`}
                                    onClick={() => navigate(menu.path)}
                                    style={{ 
                                        transition: 'all 0.2s ease',
                                        backgroundColor: isActive(menu.path) ? undefined : 'transparent'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive(menu.path)) {
                                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive(menu.path)) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    <FontAwesomeIcon icon={menu.icon} style={{ width: '20px' }} />
                                    <span>{menu.label}</span>
                                    {isActive(menu.path) && (
                                        <FontAwesomeIcon icon={faChevronRight} className="ms-auto" />
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Sidebar Footer with Logout */}
                <div className="p-3 border-top border-secondary">
                    <button
                        className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center gap-2"
                        onClick={handleLogout}
                        style={{ transition: 'all 0.2s' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.2)';
                            e.currentTarget.style.borderColor = '#dc3545';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.borderColor = '#f8f9fa';
                        }}
                    >
                        <FontAwesomeIcon icon={faRightFromBracket} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow-1 d-flex flex-column" style={{ marginLeft: '260px' }}>
                {/* Top Header */}
                <header className="bg-white border-bottom shadow-sm sticky-top" style={{ zIndex: 999 }}>
                    <div className="container-fluid px-4 py-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="mb-0 text-dark fw-bold">
                                    {isActive('/admin/dashboard') && 'Admin Dashboard'}
                                    {isActive('/medical/dashboard') && 'Medical Dashboard'}
                                    {isActive('/dashboard') && 'Society Dashboard'}
                                    {isActive('/profile') && 'Profile'}
                                    {isActive('/admin/users') && 'User Management'}
                                    {isActive('/admin/regionals') && 'Regional Management'}
                                    {isActive('/admin/reports') && 'Reports'}
                                    {isActive('/medical/patients') && 'Patients'}
                                    {isActive('/medical/consultations') && 'Consultations'}
                                    {isActive('/medical/vaccinations') && 'Vaccinations'}
                                    {isActive('/consultations') && 'My Consultations'}
                                    {isActive('/vaccinations') && 'Vaccinations'}
                                    {isActive('/appointments') && 'Appointments'}
                                </h5>
                                <small className="text-muted">
                                    Welcome back, {userName || 'User'}
                                </small>
                            </div>
                            
                            <div className="d-flex align-items-center gap-2">                    
                                <button 
                                    className="btn btn-light d-flex align-items-center gap-2"
                                    onClick={() => navigate('/profile')}
                                >
                                    <div 
                                        className="rounded-circle bg-primary d-flex align-items-center justify-content-center"
                                        style={{ width: '30px', height: '30px' }}
                                    >
                                        <span className="text-white small fw-bold">
                                            {userName?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <span className="d-none d-md-inline small">{userName || 'User'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-grow-1 p-4" style={{ backgroundColor: '#f5f5f5' }}>
                    {children}
                </main>

                {/* Footer */}
                <footer className="bg-white border-top py-3">
                    <div className="container-fluid px-4">
                        <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                                &copy; 2026 HealthCare System. All rights reserved.
                            </small>
                            <small className="text-muted">
                                <FontAwesomeIcon icon={faShieldHalved} className="me-1" />
                                Secured System
                            </small>
                        </div>
                    </div>
                </footer>
            </div>

            {showLogoutPopup && (
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
                        zIndex: 2000
                    }}
                    onClick={() => setShowLogoutPopup(false)}
                >
                    <div 
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '30px',
                            width: '400px',
                            maxWidth: '90%',
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                            textAlign: 'center'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Warning Icon */}
                        <div style={{ marginBottom: '20px' }}>
                            <FontAwesomeIcon 
                                icon={faTriangleExclamation} 
                                style={{ 
                                    fontSize: '48px', 
                                    color: '#ffc107',
                                    backgroundColor: '#fff3cd',
                                    padding: '15px',
                                    borderRadius: '50%'
                                }} 
                            />
                        </div>
                        
                        {/* Title */}
                        <h5 style={{ marginBottom: '10px', fontWeight: 'bold', color: '#333' }}>
                            Konfirmasi Logout
                        </h5>
                        
                        {/* Message */}
                        <p style={{ color: '#666', marginBottom: '5px' }}>
                            Apakah Anda yakin ingin keluar?
                        </p>
                        <small style={{ color: '#999', display: 'block', marginBottom: '25px' }}>
                            Anda akan diarahkan ke halaman login
                        </small>
                        
                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button
                                onClick={() => setShowLogoutPopup(false)}
                                style={{
                                    padding: '10px 25px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    backgroundColor: 'white',
                                    color: '#666',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#f5f5f5';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'white';
                                }}
                            >
                                <FontAwesomeIcon icon={faCircleXmark} style={{ marginRight: '8px' }} />
                                Batal
                            </button>
                            <button
                                onClick={handleLogout}
                                style={{
                                    padding: '10px 25px',
                                    border: 'none',
                                    borderRadius: '8px',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#c82333';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#dc3545';
                                }}
                            >
                                <FontAwesomeIcon icon={faCircleCheck} style={{ marginRight: '8px' }} />
                                Ya, Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}