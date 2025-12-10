import React, { useState, useEffect } from 'react';
import { getUsers, addUser, updateUser, deleteUser } from '../utils/users';
import { useAuth } from '../context/AuthContext';

const SettingsModal = ({ onClose }) => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        role: 'User',
        permissions: {
            add: false,
            edit: false,
            delete: false,
            view: true
        }
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = () => {
        setUsers(getUsers());
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingId) {
            updateUser(editingId, formData);
        } else {
            addUser(formData);
        }

        resetForm();
        loadUsers();
    };

    const handleDelete = (userId) => {
        if (userId === currentUser.userId) {
            alert('Cannot delete your own account');
            return;
        }
        if (confirm('Are you sure you want to delete this user?')) {
            deleteUser(userId);
            loadUsers();
        }
    };

    const handleEdit = (user) => {
        setEditingId(user.id);
        setFormData({
            username: user.username,
            password: user.password,
            name: user.name,
            role: user.role,
            permissions: user.permissions || {
                add: false,
                edit: false,
                delete: false,
                view: true
            }
        });
        setIsAdding(true);
    };

    const resetForm = () => {
        setFormData({
            username: '',
            password: '',
            name: '',
            role: 'User',
            permissions: {
                add: false,
                edit: false,
                delete: false,
                view: true
            }
        });
        setIsAdding(false);
        setEditingId(null);
    };

    const getRoleBadgeStyle = (role) => {
        const styles = {
            'Admin': { bg: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa' },
            'Reporter': { bg: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' },
            'User': { bg: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8' }
        };
        return styles[role] || styles['User'];
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
            zIndex: 1000,
            padding: '1rem'
        }}>
            <div className="glass-card" style={{
                width: '100%',
                maxWidth: '800px',
                maxHeight: '90vh',
                overflow: 'auto',
                animation: 'fadeIn 0.3s ease-out'
            }}>
                <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Settings</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            User & Role Management
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost"
                        style={{ padding: '0.5rem 1rem' }}
                    >
                        ✕ Close
                    </button>
                </div>

                {/* Add/Edit User Form */}
                {isAdding ? (
                    <div style={{
                        padding: '1.5rem',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1.5rem'
                    }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
                            {editingId ? 'Edit User' : 'Add New User'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                                        Username *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: 'var(--radius-md)',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.9rem',
                                            outline: 'none',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                                        Password *
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: 'var(--radius-md)',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.9rem',
                                            outline: 'none',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: 'var(--radius-md)',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.9rem',
                                            outline: 'none',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                                        Role *
                                    </label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: 'var(--radius-md)',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.9rem',
                                            outline: 'none',
                                            fontFamily: 'inherit'
                                        }}
                                    >
                                        <option value="User">User</option>
                                        <option value="Reporter">Reporter</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                            </div>

                            {/* Permissions Section */}
                            <div style={{
                                marginTop: '1.5rem',
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-color)'
                            }}>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                                    Permissions
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                                    {['add', 'edit', 'delete', 'view'].map((perm) => (
                                        <div key={perm} style={{
                                            padding: '0.75rem',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid var(--border-color)'
                                        }}>
                                            <label style={{
                                                display: 'block',
                                                color: 'var(--text-muted)',
                                                fontSize: '0.75rem',
                                                marginBottom: '0.5rem',
                                                textTransform: 'capitalize',
                                                fontWeight: 500
                                            }}>
                                                {perm}
                                            </label>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                                                    <input
                                                        type="radio"
                                                        name={`perm-${perm}`}
                                                        checked={formData.permissions[perm] === true}
                                                        onChange={() => setFormData({
                                                            ...formData,
                                                            permissions: { ...formData.permissions, [perm]: true }
                                                        })}
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>Yes</span>
                                                </label>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                                                    <input
                                                        type="radio"
                                                        name={`perm-${perm}`}
                                                        checked={formData.permissions[perm] === false}
                                                        onChange={() => setFormData({
                                                            ...formData,
                                                            permissions: { ...formData.permissions, [perm]: false }
                                                        })}
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>No</span>
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button type="button" onClick={resetForm} className="btn btn-ghost">
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingId ? 'Update User' : 'Add User'}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="btn btn-primary"
                        style={{ marginBottom: '1.5rem' }}
                    >
                        + Add New User
                    </button>
                )}

                {/* Users Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                                <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Username</th>
                                <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Name</th>
                                <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Role</th>
                                <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => {
                                const roleStyle = getRoleBadgeStyle(user.role);
                                return (
                                    <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '0.75rem', fontSize: '0.9rem' }}>{user.username}</td>
                                        <td style={{ padding: '0.75rem', fontSize: '0.9rem' }}>{user.name}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span style={{
                                                background: roleStyle.bg,
                                                color: roleStyle.color,
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: 500
                                            }}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="btn btn-ghost"
                                                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="btn btn-ghost"
                                                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', color: '#f87171' }}
                                                    disabled={user.id === currentUser.userId}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
