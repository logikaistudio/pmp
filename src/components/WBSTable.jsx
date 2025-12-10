import React, { useState } from 'react';
import { useWBS } from '../context/WBSContext';
import { useAuth } from '../context/AuthContext';

// Calculate timeline (duration in days)
const calculateTimeline = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays}d`;
};

// Status badge styling
const getStatusStyle = (status) => {
    const styles = {
        'On Track': { bg: 'rgba(74, 222, 128, 0.1)', color: '#4ade80' },
        'At Risk': { bg: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24' },
        'Delayed': { bg: 'rgba(248, 113, 113, 0.1)', color: '#f87171' }
    };
    return styles[status] || styles['On Track'];
};

const WBSTable = () => {
    const { wbsData, addWBSItem, updateWBSItem, deleteWBSItem, resetWBSData } = useWBS();
    const { user } = useAuth();
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [isAdding, setIsAdding] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null); // ID of item to delete
    const [newItemForm, setNewItemForm] = useState({
        id: '',
        name: '',
        weight: 0,
        progress: 0,
        level: 0,
        startDate: '',
        endDate: '',
        status: 'On Track',
        dependencies: []
    });

    // Calculate total weight - ONLY Main Tasks (Level 0)
    const totalWeight = wbsData?.filter(item => item.level === 0).reduce((sum, item) => sum + item.weight, 0) || 0;
    const isValidWeight = totalWeight === 100;

    // Check user permissions
    const canAdd = user?.permissions?.add || false;
    const canEdit = user?.permissions?.edit || false;
    const canDelete = user?.permissions?.delete || false;

    const handleEdit = (item) => {
        setEditingId(item.id);
        setEditForm(item);
    };

    const handleSave = () => {
        updateWBSItem(editingId, editForm);
        setEditingId(null);
        setEditForm({});
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleDelete = (id) => {
        console.log('Delete button clicked for ID:', id);
        setDeleteConfirm(id);
    };

    const confirmDelete = () => {
        console.log('Confirming delete for ID:', deleteConfirm);
        try {
            const result = deleteWBSItem(deleteConfirm);
            console.log('Delete result:', result);
            console.log('Remaining items:', wbsData.length - 1);
        } catch (error) {
            console.error('Error deleting WBS item:', error);
            alert('Failed to delete item. Please try again.');
        }
        setDeleteConfirm(null);
    };

    const cancelDelete = () => {
        console.log('Delete cancelled');
        setDeleteConfirm(null);
    };

    const handleAddNew = () => {
        if (!newItemForm.id || !newItemForm.name) {
            alert('Please fill in ID and Task Name');
            return;
        }
        addWBSItem(newItemForm);
        setNewItemForm({
            id: '',
            name: '',
            weight: 0,
            progress: 0,
            level: 0,
            startDate: '',
            endDate: '',
            status: 'On Track',
            dependencies: []
        });
        setIsAdding(false);
    };

    const handleCancelAdd = () => {
        setNewItemForm({
            id: '',
            name: '',
            weight: 0,
            progress: 0,
            level: 0,
            startDate: '',
            endDate: '',
            status: 'On Track',
            dependencies: []
        });
        setIsAdding(false);
    };

    return (
        <div className="glass-card animate-fade-in" style={{ width: '100%', overflowX: 'auto' }}>
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Work Breakdown Structure</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Task Timeline, Weights and Progress Distribution</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {canAdd && (
                        <button
                            onClick={() => {
                                if (window.confirm('Reset all WBS data to initial state? This will clear all your changes.')) {
                                    resetWBSData();
                                }
                            }}
                            className="btn btn-secondary"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        >
                            🔄 Reset Data
                        </button>
                    )}
                    {canAdd && !isAdding && (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="btn btn-primary"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        >
                            + Add WBS Item
                        </button>
                    )}
                </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>ID</th>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Task Name</th>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>Timeline</th>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Start Date</th>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>End Date</th>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>Weight (%)</th>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Dependencies</th>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Progress</th>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>Status</th>
                        {(canEdit || canDelete) && (
                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Actions</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {isAdding && (
                        <tr style={{ borderBottom: '2px solid var(--color-primary)', backgroundColor: 'rgba(56, 189, 248, 0.05)' }}>
                            <td style={{ padding: '1rem' }}>
                                <input
                                    type="text"
                                    placeholder="e.g. 6.0"
                                    value={newItemForm.id}
                                    onChange={(e) => setNewItemForm({ ...newItemForm, id: e.target.value })}
                                    style={{
                                        width: '80px',
                                        padding: '0.5rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-sm)',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </td>
                            <td style={{ padding: '1rem' }}>
                                <input
                                    type="text"
                                    placeholder="Task Name"
                                    value={newItemForm.name}
                                    onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-sm)',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.9rem'
                                    }}
                                />
                                <select
                                    value={newItemForm.level}
                                    onChange={(e) => setNewItemForm({ ...newItemForm, level: parseInt(e.target.value) })}
                                    style={{
                                        width: '100%',
                                        marginTop: '0.5rem',
                                        padding: '0.5rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-sm)',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    <option value="0">📋 Main Task (Level 0)</option>
                                    <option value="1">  └─ Sub Task (Level 1)</option>
                                    <option value="2">    └─ Sub-Sub Task (Level 2)</option>
                                </select>
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'center' }}>-</td>
                            <td style={{ padding: '1rem' }}>
                                <input
                                    type="date"
                                    value={newItemForm.startDate}
                                    onChange={(e) => setNewItemForm({ ...newItemForm, startDate: e.target.value })}
                                    style={{
                                        padding: '0.5rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-sm)',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.85rem'
                                    }}
                                />
                            </td>
                            <td style={{ padding: '1rem' }}>
                                <input
                                    type="date"
                                    value={newItemForm.endDate}
                                    onChange={(e) => setNewItemForm({ ...newItemForm, endDate: e.target.value })}
                                    style={{
                                        padding: '0.5rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-sm)',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.85rem'
                                    }}
                                />
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={newItemForm.weight}
                                    onChange={(e) => setNewItemForm({ ...newItemForm, weight: parseInt(e.target.value) || 0 })}
                                    style={{
                                        width: '60px',
                                        padding: '0.5rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-sm)',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.85rem',
                                        textAlign: 'center'
                                    }}
                                />
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                <select
                                    value={newItemForm.status}
                                    onChange={(e) => setNewItemForm({ ...newItemForm, status: e.target.value })}
                                    style={{
                                        padding: '0.5rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-sm)',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    <option value="On Track">On Track</option>
                                    <option value="At Risk">At Risk</option>
                                    <option value="Delayed">Delayed</option>
                                </select>
                            </td>
                            <td style={{ padding: '1rem' }}>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={newItemForm.progress}
                                    onChange={(e) => setNewItemForm({ ...newItemForm, progress: parseInt(e.target.value) || 0 })}
                                    style={{
                                        width: '60px',
                                        padding: '0.5rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-sm)',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.85rem',
                                        textAlign: 'center'
                                    }}
                                />
                            </td>
                            <td style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={handleAddNew} className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
                                        ✓ Add
                                    </button>
                                    <button onClick={handleCancelAdd} className="btn btn-ghost" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
                                        Cancel
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )}
                    {wbsData.map((item) => {
                        const statusStyle = getStatusStyle(item.status);
                        const isEditing = editingId === item.id;

                        return (
                            <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                                <td style={{ padding: '1rem', fontWeight: 500 }}>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editForm.id}
                                            onChange={(e) => setEditForm({ ...editForm, id: e.target.value })}
                                            style={{
                                                width: '80px',
                                                padding: '0.5rem',
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: 'var(--radius-sm)',
                                                color: 'var(--text-primary)',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                    ) : item.id}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {isEditing ? (
                                        <>
                                            <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.5rem',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    color: 'var(--text-primary)',
                                                    fontSize: '0.9rem'
                                                }}
                                            />
                                            <select
                                                value={editForm.level}
                                                onChange={(e) => setEditForm({ ...editForm, level: parseInt(e.target.value) })}
                                                style={{
                                                    width: '100%',
                                                    marginTop: '0.5rem',
                                                    padding: '0.5rem',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    color: 'var(--text-primary)',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                <option value="0">📋 Main Task (Level 0)</option>
                                                <option value="1">  └─ Sub Task (Level 1)</option>
                                                <option value="2">    └─ Sub-Sub Task (Level 2)</option>
                                            </select>
                                        </>
                                    ) : (
                                        <span style={{ paddingLeft: `${item.level * 1.5}rem`, display: 'block', fontWeight: item.level === 0 ? 600 : 400 }}>
                                            {item.name}
                                        </span>
                                    )}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <span style={{
                                        background: 'rgba(139, 92, 246, 0.1)',
                                        color: '#a78bfa',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        fontWeight: 500
                                    }}>
                                        {calculateTimeline(item.startDate, item.endDate)}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            value={editForm.startDate}
                                            onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                                            style={{
                                                padding: '0.5rem',
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: 'var(--radius-sm)',
                                                color: 'var(--text-primary)',
                                                fontSize: '0.85rem'
                                            }}
                                        />
                                    ) : item.startDate}
                                </td>
                                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            value={editForm.endDate}
                                            onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                                            style={{
                                                padding: '0.5rem',
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: 'var(--radius-sm)',
                                                color: 'var(--text-primary)',
                                                fontSize: '0.85rem'
                                            }}
                                        />
                                    ) : item.endDate}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    {isEditing ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            <input
                                                type="number"
                                                value={editForm.weight}
                                                onChange={(e) => setEditForm({ ...editForm, weight: parseInt(e.target.value) || 0 })}
                                                disabled={item.isCalculated}
                                                style={{
                                                    width: '60px',
                                                    padding: '0.5rem',
                                                    background: item.isCalculated ? 'rgba(100,100,100,0.2)' : 'rgba(255,255,255,0.05)',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    color: 'var(--text-primary)',
                                                    fontSize: '0.85rem',
                                                    textAlign: 'center',
                                                    cursor: item.isCalculated ? 'not-allowed' : 'text'
                                                }}
                                            />
                                            {item.isCalculated && (
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                    Auto-calc
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="badge" style={{
                                            background: 'rgba(56, 189, 248, 0.1)',
                                            color: '#38bdf8',
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            fontSize: '0.8rem',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            {item.isCalculated && <span title="Auto-calculated from children">🧮</span>}
                                            {item.weight}%
                                        </span>
                                    )}
                                </td>
                                <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                                    {isEditing ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <select
                                                value={editForm.dependencies?.[0]?.predecessorId || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (value) {
                                                        setEditForm({
                                                            ...editForm,
                                                            dependencies: [{
                                                                predecessorId: value,
                                                                type: editForm.dependencies?.[0]?.type || 'FS'
                                                            }]
                                                        });
                                                    } else {
                                                        setEditForm({ ...editForm, dependencies: [] });
                                                    }
                                                }}
                                                style={{
                                                    padding: '0.5rem',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    color: 'var(--text-primary)',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                <option value="">No dependency</option>
                                                {wbsData.filter(w => w.id !== item.id).map(w => (
                                                    <option key={w.id} value={w.id}>{w.id} - {w.name}</option>
                                                ))}
                                            </select>
                                            {editForm.dependencies?.length > 0 && (
                                                <select
                                                    value={editForm.dependencies[0].type}
                                                    onChange={(e) => setEditForm({
                                                        ...editForm,
                                                        dependencies: [{
                                                            ...editForm.dependencies[0],
                                                            type: e.target.value
                                                        }]
                                                    })}
                                                    style={{
                                                        padding: '0.5rem',
                                                        background: 'rgba(255,255,255,0.05)',
                                                        border: '1px solid var(--border-color)',
                                                        borderRadius: 'var(--radius-sm)',
                                                        color: 'var(--text-primary)',
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    <option value="FS">Finish-Start (FS)</option>
                                                    <option value="SS">Start-Start (SS)</option>
                                                    <option value="SF">Start-Finish (SF)</option>
                                                    <option value="FF">Finish-Finish (FF)</option>
                                                </select>
                                            )}
                                        </div>
                                    ) : (
                                        <span style={{ color: 'var(--text-secondary)' }}>
                                            {item.dependencies?.length > 0
                                                ? item.dependencies.map(dep => `${dep.predecessorId} (${dep.type})`).join(', ')
                                                : '-'
                                            }
                                        </span>
                                    )}
                                </td>
                                <td style={{ padding: '1rem', width: '20%' }}>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            value={editForm.progress}
                                            onChange={(e) => setEditForm({ ...editForm, progress: parseInt(e.target.value) || 0 })}
                                            style={{
                                                width: '60px',
                                                padding: '0.5rem',
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: 'var(--radius-sm)',
                                                color: 'var(--text-primary)',
                                                fontSize: '0.85rem',
                                                textAlign: 'center'
                                            }}
                                        />
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {item.isCalculated && <span title="Auto-calculated from children">🧮</span>}
                                            <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{
                                                    width: `${item.progress}%`,
                                                    height: '100%',
                                                    background: 'var(--color-primary)',
                                                    borderRadius: '3px'
                                                }}></div>
                                            </div>
                                            <span style={{ fontSize: '0.8rem', minWidth: '35px' }}>{item.progress}%</span>
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    {isEditing ? (
                                        <select
                                            value={editForm.status}
                                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                            style={{
                                                padding: '0.5rem',
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: 'var(--radius-sm)',
                                                color: 'var(--text-primary)',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            <option value="On Track">On Track</option>
                                            <option value="On Going">On Going</option>
                                            <option value="At Risk">At Risk</option>
                                            <option value="Delayed">Delayed</option>
                                        </select>
                                    ) : (
                                        <span style={{
                                            background: statusStyle.bg,
                                            color: statusStyle.color,
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                            display: 'inline-block'
                                        }}>
                                            {item.status}
                                        </span>
                                    )}
                                </td>
                                {(canEdit || canDelete) && (
                                    <td style={{ padding: '1rem' }}>
                                        {isEditing ? (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={handleSave} className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
                                                    Save
                                                </button>
                                                <button onClick={handleCancel} className="btn btn-ghost" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {canEdit && (
                                                    <button onClick={() => handleEdit(item)} className="btn btn-ghost" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
                                                        ✏️ Edit
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button onClick={() => handleDelete(item.id)} className="btn btn-ghost" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', color: '#f87171' }}>
                                                        🗑️
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
                <tfoot>
                    <tr style={{ borderTop: '2px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                        <td colSpan={canEdit || canDelete ? "5" : "5"} style={{ padding: '1rem', fontWeight: 600, fontSize: '0.9rem' }}>
                            Total Weight Validation
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <span style={{
                                background: isValidWeight ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                                color: isValidWeight ? '#4ade80' : '#f87171',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '0.85rem',
                                fontWeight: 600
                            }}>
                                {totalWeight}%
                            </span>
                        </td>
                        <td colSpan={canEdit || canDelete ? "3" : "2"} style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {isValidWeight ? '✓ Valid' : '⚠ Must equal 100%'}
                        </td>
                    </tr>
                </tfoot>
            </table>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
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
                        maxWidth: '400px',
                        width: '100%',
                        animation: 'fadeIn 0.2s ease-out'
                    }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
                            Confirm Delete
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            Are you sure you want to delete WBS item <strong style={{ color: 'var(--text-primary)' }}>{deleteConfirm}</strong>? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button onClick={cancelDelete} className="btn btn-ghost">
                                Cancel
                            </button>
                            <button onClick={confirmDelete} className="btn btn-primary" style={{ background: '#f87171' }}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WBSTable;
