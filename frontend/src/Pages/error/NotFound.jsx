import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function NotFound() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    const handleGoBack = () => {
        if (user?.role === "admin") {
            navigate("/admin/dashboard");
        } else if (user?.role === "medical" || user?.role === "doctor" || user?.role === "officer") {
            navigate("/medical/dashboard");
        } else if (user?.role === "society") {
            navigate("/dashboard");
        } else {
            navigate("/");
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="text-center">
                <h1 className="display-1 fw-bold text-primary">404</h1>
                <h2 className="mb-3">Halaman Tidak Ditemukan</h2>
                <p className="text-muted mb-4">
                    Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
                </p>
                <div className="d-flex justify-content-center gap-2">
                    <button 
                        className="btn btn-primary" 
                        onClick={handleGoBack}
                    >
                        <i className="bi bi-house-door me-2"></i>
                        Kembali ke Dashboard
                    </button>
                    <Link to="/" className="btn btn-outline-secondary">
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Ke Halaman Login
                    </Link>
                </div>
            </div>
        </div>
    );
}