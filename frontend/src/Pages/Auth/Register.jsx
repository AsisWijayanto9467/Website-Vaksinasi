import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../Services/api';

export default function Register() {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        id_card_number: "",
        password: "",
        confirmPassword: "",
        name: "",
        born_date: "",
        gender: "",
        address: "",
        regional_id: ""
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Validasi password
        if (formData.password !== formData.confirmPassword) {
            setError("Password dan konfirmasi password tidak cocok");
            setLoading(false);
            return;
        }

        try {
            const res = await api.post("/auth/register", {
                id_card_number: formData.id_card_number,
                password: formData.password,
                name: formData.name,
                born_date: formData.born_date,
                gender: formData.gender,
                address: formData.address,
                regional_id: formData.regional_id
            });

            // Simpan token dan data user ke localStorage
            const { data } = res.data;
            
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify({
                role: data.role,
                name: data.name,
                born_date: data.born_date,
                gender: data.gender,
                address: data.address,
                regional: data.regional
            }));

            // Redirect ke dashboard
            navigate("/dashboard");
            
        } catch (err) {
            if(err.response) {
                const data = err.response.data;

                if(data.errors) {
                    const message = Object.values(data.errors).flat().join(" | ");
                    setError(message);
                } else if(data.message) {
                    setError(data.message);
                } else {
                    setError("Terjadi kesalahan server");
                }
            } else if(err.request) {
                setError("Kesalahan jaringan. Periksa koneksi Anda.");
            } else {
                setError("Terjadi error");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="container d-flex justify-content-center align-items-center vh-100 bg-light py-4">
                <div className="card shadow" style={{ minWidth: 300, maxWidth: 500, width: "100%" }}>
                    <div className="p-4">
                        <h4 className="text-center mb-3">Register</h4>

                        {error && (
                            <div className="alert alert-danger">{error}</div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">ID Card Number</label>
                                <input 
                                    className="form-control" 
                                    type="text" 
                                    name="id_card_number"
                                    value={formData.id_card_number} 
                                    onChange={handleChange} 
                                    placeholder="Masukkan nomor ID card"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Nama Lengkap</label>
                                <input 
                                    className="form-control" 
                                    type="text" 
                                    name="name"
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    placeholder="Masukkan nama lengkap"
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Tanggal Lahir</label>
                                <input 
                                    className="form-control" 
                                    type="date" 
                                    name="born_date"
                                    value={formData.born_date} 
                                    onChange={handleChange} 
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Jenis Kelamin</label>
                                <select 
                                    className="form-select" 
                                    name="gender"
                                    value={formData.gender} 
                                    onChange={handleChange} 
                                    required
                                >
                                    <option value="">Pilih jenis kelamin</option>
                                    <option value="male">Laki-laki</option>
                                    <option value="female">Perempuan</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Alamat</label>
                                <textarea 
                                    className="form-control" 
                                    name="address"
                                    value={formData.address} 
                                    onChange={handleChange} 
                                    placeholder="Masukkan alamat lengkap"
                                    rows="2"
                                    required
                                ></textarea>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Regional ID</label>
                                <input 
                                    className="form-control" 
                                    type="number" 
                                    name="regional_id"
                                    value={formData.regional_id} 
                                    onChange={handleChange} 
                                    placeholder="Masukkan ID regional"
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Password</label>
                                <input 
                                    className="form-control" 
                                    type="password" 
                                    name="password"
                                    value={formData.password} 
                                    onChange={handleChange} 
                                    placeholder="Masukkan password (min. 6 karakter)"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Konfirmasi Password</label>
                                <input 
                                    className="form-control" 
                                    type="password" 
                                    name="confirmPassword"
                                    value={formData.confirmPassword} 
                                    onChange={handleChange} 
                                    placeholder="Konfirmasi password"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className="mb-3">
                                <span>Sudah punya akun? <Link to="/">Login</Link></span>
                            </div>

                            <button 
                                className="btn btn-primary w-100" 
                                type="submit" 
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Mendaftarkan...
                                    </>
                                ) : "Register"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}