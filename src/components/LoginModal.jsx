import React, { useState } from 'react';
import { authenticateUser } from '../utils/users';

const LoginModal = ({ onClose, onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        const session = authenticateUser(username, password);
        if (session) {
            onLogin(session);
            onClose();
        } else {
            setError('Invalid username or password');
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="glass-card" style={{
                width: '100%',
                maxWidth: '400px',
                margin: '1rem',
                animation: 'fadeIn 0.3s ease-out'
            }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Login</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    Enter your credentials to access the dashboard
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{
                            display: 'block',
                            color: 'var(--text-muted)',
                            fontSize: '0.85rem',
                            marginBottom: '0.5rem',
                            fontWeight: 500
                        }}>
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoFocus
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--text-primary)',
                                fontSize: '0.95rem',
                                outline: 'none',
                                fontFamily: 'inherit'
                            }}
                            placeholder="Enter username"
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            color: 'var(--text-muted)',
                            fontSize: '0.85rem',
                            marginBottom: '0.5rem',
                            fontWeight: 500
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--text-primary)',
                                fontSize: '0.95rem',
                                outline: 'none',
                                fontFamily: 'inherit'
                            }}
                            placeholder="Enter password"
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '0.75rem',
                            background: 'rgba(248, 113, 113, 0.1)',
                            border: '1px solid rgba(248, 113, 113, 0.3)',
                            borderRadius: 'var(--radius-md)',
                            color: '#f87171',
                            fontSize: '0.85rem',
                            marginBottom: '1rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-ghost"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            Login
                        </button>
                    </div>
                </form>

                <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(56, 189, 248, 0.05)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    textAlign: 'center',
                    fontStyle: 'italic'
                }}>
                    powered by : <span style={{ fontWeight: 'bold', color: '#38bdf8' }}>LOGIKAI.Studio</span>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
