import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHeartPulse,
    faGauge,
    faComments,
    faSyringe,
    faCalendarCheck,
    faUser,
    faRightFromBracket,
    faBars,
    faTimes,
    faStethoscope,
    faUserNurse,
    faListCheck,
} from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

export default function MainPublic({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
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
    };

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user'));
    const userRole = userData?.role;
    const userName = userData?.name;

    const isAdmin = userRole === 'admin';
    const isDoctor = userRole === 'doctor';
    const isOfficer = userRole === 'officer';
    const isSociety = userRole === 'society';

    // Get display role
    const getDisplayRole = () => {
        if (isAdmin) return 'Administrator';
        if (isDoctor) return 'Doctor';
        if (isOfficer) return 'Officer';
        if (isSociety) return 'Society Member';
        return 'User';
    };

    // Get role icon
    const getRoleIcon = () => {
        if (isDoctor) return faStethoscope;
        if (isOfficer) return faUserNurse;
        if (isAdmin) return faGauge;
        return faUser;
    };

    // Get role badge color
    const getRoleBadgeColor = () => {
        if (isDoctor) return 'success';
        if (isOfficer) return 'info';
        if (isAdmin) return 'warning';
        return 'primary';
    };

    // Get dashboard path based on role
    const getDashboardPath = () => {
        if (isDoctor) return '/doctor/dashboard';
        if (isOfficer) return '/officer/dashboard';
        if (isSociety) return '/dashboard';
        return '/dashboard';
    };

    // Get navigation items based on role
    const getNavItems = () => {
        if (isDoctor) {
            return [
                { path: '/doctor/dashboard', icon: faGauge, label: 'Dashboard' },
            { path: '/doctor/consultation', icon: faComments, label: 'Konsultasi' },
            { path: '/doctor/vaccination-history', icon: faSyringe, label: 'Vaksinasi' },
            ];
        } else if (isOfficer) {
            return [
                { path: '/officer/dashboard', icon: faGauge, label: 'Dashboard' },
                { path: '/officer/manage-vaccination', icon: faListCheck, label: 'Verifikasi Vaksinasi' },
            ];
        } else if (isSociety) {
            return [
                { path: '/dashboard', icon: faGauge, label: 'Dashboard' },
                { path: '/consultations', icon: faComments, label: 'Konsultasi' },
                { path: '/spot-vaccination', icon: faCalendarCheck, label: 'Spots' },
                { path: '/vaccination', icon: faSyringe, label: 'Vaksinasi' },
            ];
        }
        return [];
    };

    const navItems = getNavItems();

    // Get gradient color based on role
    const getNavbarGradient = () => {
        if (isDoctor) return 'linear-gradient(135deg, #166534 0%, #16a34a 100%)';
        if (isOfficer) return 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)';
        if (isSociety) return 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)';
        return 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)';
    };

    // Get icon color based on role
    const getIconColor = () => {
        if (isDoctor) return '#16a34a';
        if (isOfficer) return '#3b82f6';
        return '#2563eb';
    };

    return (
        <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#f0f4f8' }}>
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg sticky-top shadow-sm" 
                 style={{ 
                     background: getNavbarGradient(),
                     boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                 }}>
                <div className="container-fluid px-4 py-2">
                    {/* Brand */}
                    <span 
                        className="navbar-brand text-white fw-bold d-flex align-items-center gap-2" 
                        style={{ fontSize: '1.2rem', cursor: 'pointer' }}
                        onClick={() => navigate(getDashboardPath())}
                    >
                        <div className="bg-white rounded-circle d-flex align-items-center justify-content-center" 
                             style={{ width: '35px', height: '35px' }}>
                            <FontAwesomeIcon icon={faHeartPulse} style={{ color: getIconColor(), fontSize: '1.1rem' }} />
                        </div>
                        HealthCare
                    </span>

                    {/* Mobile Toggle */}
                    <button 
                        className="navbar-toggler border-0"
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        style={{ boxShadow: 'none' }}
                    >
                        <FontAwesomeIcon 
                            icon={mobileMenuOpen ? faTimes : faBars} 
                            className="text-white fs-5" 
                        />
                    </button>

                    {/* Navbar Content */}
                    <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`} id="navbarNav">
                        {/* Navigation Links */}
                        <div className="navbar-nav me-auto mt-2 mt-lg-0">
                            {navItems.map((item, index) => (
                                <button
                                    key={index}
                                    className={`btn d-flex align-items-center gap-2 mx-1 my-1 ${
                                        isActive(item.path) 
                                            ? 'btn-light fw-semibold' 
                                            : 'text-white'
                                    }`}
                                    onClick={() => {
                                        navigate(item.path);
                                        setMobileMenuOpen(false);
                                    }}
                                    style={{
                                        borderRadius: '8px',
                                        transition: 'all 0.2s ease',
                                        backgroundColor: isActive(item.path) ? '#ffffff' : 'transparent',
                                        border: isActive(item.path) ? '1px solid #ffffff' : '1px solid transparent',
                                        color: isActive(item.path) ? '#1e293b' : '#ffffff'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive(item.path)) {
                                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
                                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive(item.path)) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.borderColor = 'transparent';
                                        }
                                    }}
                                >
                                    <FontAwesomeIcon icon={item.icon} style={{ fontSize: '0.9rem' }} />
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        {/* Right Side - User Info & Logout */}
                        <div className="d-flex align-items-center gap-3 mt-2 mt-lg-0">
                            {/* User Info */}
                            <div className="d-flex align-items-center gap-2 text-white">
                                <div className="bg-white rounded-circle d-flex align-items-center justify-content-center"
                                     style={{ width: '38px', height: '38px' }}>
                                    <FontAwesomeIcon 
                                        icon={getRoleIcon()} 
                                        style={{ color: getIconColor(), fontSize: '1.1rem' }} 
                                    />
                                </div>
                                <div className="d-none d-md-block">
                                    <div className="fw-semibold small" style={{ lineHeight: '1.2' }}>
                                        {userName || 'User'}
                                    </div>
                                    <span 
                                        className={`badge bg-${getRoleBadgeColor()} mt-1`} 
                                        style={{ fontSize: '0.65rem' }}
                                    >
                                        {getDisplayRole()}
                                    </span>
                                </div>
                            </div>

                            {/* Logout Button */}
                            <button 
                                className="btn d-flex align-items-center gap-2 text-white"
                                onClick={() => setShowLogoutModal(true)}
                                style={{
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                                    e.currentTarget.style.borderColor = '#ef4444';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                                }}
                            >
                                <FontAwesomeIcon icon={faRightFromBracket} style={{ fontSize: '0.9rem' }} />
                                <span className="d-none d-md-inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="py-3 text-center text-muted" style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
                <small>
                    &copy; {new Date().getFullYear()} HealthCare System. All rights reserved.
                    {isDoctor && ' - Doctor Portal'}
                    {isOfficer && ' - Officer Portal'}
                    {isSociety && ' - Society Portal'}
                </small>
            </footer>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
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
                    onClick={() => setShowLogoutModal(false)}
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
                            <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center"
                                 style={{ width: '80px', height: '80px' }}>
                                <FontAwesomeIcon 
                                    icon={faRightFromBracket} 
                                    style={{ 
                                        fontSize: '36px', 
                                        color: '#f59e0b'
                                    }} 
                                />
                            </div>
                        </div>
                        
                        {/* Title */}
                        <h5 style={{ marginBottom: '10px', fontWeight: 'bold', color: '#1e293b' }}>
                            Konfirmasi Logout
                        </h5>
                        
                        {/* Message */}
                        <p style={{ color: '#64748b', marginBottom: '5px' }}>
                            Apakah Anda yakin ingin keluar?
                        </p>
                        <small style={{ color: '#94a3b8', display: 'block', marginBottom: '25px' }}>
                            Anda akan diarahkan ke halaman login
                        </small>
                        
                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                style={{
                                    padding: '10px 25px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    backgroundColor: 'white',
                                    color: '#64748b',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    transition: 'all 0.2s',
                                    fontSize: '0.95rem'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#f8fafc';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'white';
                                }}
                            >
                                <FontAwesomeIcon icon={faTimes} style={{ marginRight: '8px' }} />
                                Batal
                            </button>
                            <button
                                onClick={handleLogout}
                                style={{
                                    padding: '10px 25px',
                                    border: 'none',
                                    borderRadius: '8px',
                                    backgroundColor: '#dc2626',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    transition: 'all 0.2s',
                                    fontSize: '0.95rem'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#b91c1c';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#dc2626';
                                }}
                            >
                                <FontAwesomeIcon icon={faRightFromBracket} style={{ marginRight: '8px' }} />
                                Ya, Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}