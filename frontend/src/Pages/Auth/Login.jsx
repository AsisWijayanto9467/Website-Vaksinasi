import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [idCardNumber, setIdCardNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", {
        id_card_number: idCardNumber,
        password: password,
      });

      const { token, role, name, ...userData } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          role: role,
          name: name,
          ...userData,
        }),
      );

      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (
        role === "medical" ||
        role === "doctor" ||
        role === "officer"
      ) {
        navigate("/medical/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      if (err.response) {
        const data = err.response.data;

        if (data.errors) {
          const message = Object.values(data.errors).flat().join(" | ");
          setError(message);
        } else if (data.message) {
          setError(data.message);
        } else {
          setError("Terjadi kesalahan server");
        }
      } else if (err.request) {
        setError("Kesalahan jaringan. Periksa koneksi Anda.");
      } else {
        setError("Terjadi error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container d-flex justify-content-center align-items-center vh-100 bg-light">
        <div
          className="card shadow"
          style={{ minWidth: 300, maxWidth: 400, width: "100%" }}
        >
          <div className="p-4">
            <h4 className="text-center mb-3">Login</h4>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">ID Card Number</label>
                <input
                  className="form-control"
                  type="text"
                  value={idCardNumber}
                  onChange={(e) => setIdCardNumber(e.target.value)}
                  placeholder="Masukkan nomor ID card"
                  required
                  minLength={6}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  className="form-control"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
                />
              </div>

              <div className="mb-3">
                <span>
                  Belum punya akun? <Link to="/register">Register</Link>
                </span>
              </div>

              <button
                className="btn btn-primary w-100"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
