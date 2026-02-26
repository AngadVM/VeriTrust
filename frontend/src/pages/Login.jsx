import React, { useState } from 'react';
import '../styles/Login.css';
import bgImage from '../assets/BG.png';
import vtLogo from '../assets/VT_logo.png';

const Login = () => {
    const [privateKey, setPrivateKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                // Try to extract just the private key part if it's from our export format
                if (content.includes('Private Key:\n')) {
                    const extractedKey = content.split('Private Key:\n')[1].trim();
                    setPrivateKey(extractedKey);
                } else {
                    setPrivateKey(content.trim());
                }
            };
            reader.readAsText(file);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!privateKey.trim()) {
            setError('Please provide a private key.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Backend expects POST /login with private key
            const response = await fetch('http://localhost:3000/login', { // change
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ private_key: privateKey })
            });

            const data = await response.json();

            if (response.ok) {
                // Assuming the backend sends a JWT token
                const token = data.token || data.jwt;
                if (token) {
                    localStorage.setItem('veritrust_token', token);
                    // Also store user info if provided
                    if (data.user) {
                        localStorage.setItem('veritrust_user', JSON.stringify(data.user));
                    }
                    // Redirect to profile page
                    window.location.href = '/profile';
                } else {
                    setError('Login successful, but no token received.');
                }
            } else {
                setError(data.message || 'Login failed. Invalid private key.');
            }
        } catch (err) {
            setError('Connection error. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container hero-background-container">
            <div className="auth-wrapper glass-panel">
                <div className="auth-side-image" style={{ backgroundImage: `url(${bgImage})` }}>
                    <div className="auth-image-overlay">
                        <div className="auth-top">
                            <div className="auth-logo">
                                <img src={vtLogo} alt="VeriTrust Logo" className="auth-logo-icon" />
                                <span>VeriTrust</span>
                            </div>
                            <a href="/" className="back-link">Back to website &rarr;</a>
                        </div>
                        <div className="auth-quote">
                            <h3>Secure Your Future,</h3>
                            <p>Trust the Process</p>
                        </div>
                        <div className="auth-indicators">
                            <span className="indicator"></span>
                            <span className="indicator active"></span>
                            <span className="indicator"></span>
                        </div>
                    </div>
                </div>
                <div className="auth-side-form">
                    <div className="auth-form-content">
                        <h2>Welcome back</h2>
                        <p className="subtitle">New to VeriTrust? <a href="/register">Create an account</a></p>

                        <form onSubmit={handleLogin}>
                            <div className="input-group">
                                <textarea
                                    id="privateKey"
                                    className="key-textarea"
                                    value={privateKey}
                                    onChange={(e) => setPrivateKey(e.target.value)}
                                    placeholder="Enter your Private Key here..."
                                    required
                                />
                            </div>

                            <div className="file-upload-wrapper">
                                <div className="divider"><span>OR</span></div>
                                <label className="file-upload-label">
                                    <input
                                        type="file"
                                        accept=".txt"
                                        onChange={handleFileChange}
                                        className="file-input"
                                    />
                                    <span>📁 Upload Keys File</span>
                                </label>
                            </div>

                            {error && <div className="error-message">{error}</div>}

                            <button type="submit" disabled={loading} className="submit-btn login-submit">
                                {loading ? 'Authenticating...' : 'Log in Securely'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
