import React, { useState } from 'react';
import '../styles/Register.css';
import bgImage from '../assets/BG.png';
import vtLogo from '../assets/VT_logo.png';

const Register = () => {
    const [name, setName] = useState('');
    const [keyPair, setKeyPair] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`http://localhost:3000/register?name=${encodeURIComponent(name)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (response.ok) {
                setKeyPair({
                    publicKey: data.publicKey || data.public_key,
                    privateKey: data.privateKey || data.private_key
                });
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('Connection error. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (!keyPair) return;

        const keyData = `Public Key:\n${keyPair.publicKey}\n\nPrivate Key:\n${keyPair.privateKey}`;
        const blob = new Blob([keyData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${name.replace(/\s+/g, '_')}_veritrust_keys.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="register-container hero-background-container">
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
                            <span className="indicator active"></span>
                            <span className="indicator"></span>
                            <span className="indicator"></span>
                        </div>
                    </div>
                </div>
                <div className="auth-side-form">
                    <div className="auth-form-content">
                        <h2>Create an account</h2>
                        <p className="subtitle">Already have an account? <a href="/login">Log in</a></p>

                        {!keyPair ? (
                            <form onSubmit={handleRegister}>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Full Name"
                                        required
                                    />
                                </div>

                                <div className="checkbox-group">
                                    <input type="checkbox" id="terms" required />
                                    <label htmlFor="terms">I agree to the <a href="#">Terms & Conditions</a></label>
                                </div>

                                {error && <div className="error-message">{error}</div>}
                                <button type="submit" disabled={loading} className="submit-btn register-submit">
                                    {loading ? 'Creating account...' : 'Create account'}
                                </button>
                            </form>
                        ) : (
                            <div className="keys-container">
                                <div className="success-message">Successfully registered!</div>
                                <p className="warning-text">
                                    Please save your keys immediately. You will need your Private Key to login.
                                </p>

                                <div className="key-box">
                                    <label>Public Key</label>
                                    <textarea readOnly value={keyPair.publicKey} />
                                </div>

                                <div className="key-box">
                                    <label>Private Key</label>
                                    <textarea readOnly value={keyPair.privateKey} />
                                </div>

                                <button onClick={handleExport} className="submit-btn register-submit">
                                    Export Keys (.txt)
                                </button>
                                <div className="login-link">
                                    <a href="/login">Proceed to Login</a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
