import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';

const ProjectInfo = () => {
    const { projectInfo, updateProjectInfo } = useProject();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(projectInfo);

    // Update formData when projectInfo from context changes (e.g., on initial load or external update)
    // This useEffect is crucial to keep formData in sync with projectInfo when not editing
    React.useEffect(() => {
        if (!isEditing) {
            setFormData(projectInfo);
        }
    }, [projectInfo, isEditing]);

    const handleSave = () => {
        updateProjectInfo(formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData(projectInfo); // Revert to the current context state
        setIsEditing(false);
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="glass-card animate-fade-in" style={{ marginBottom: '2rem' }}>
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Project Information</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Project Details and Ownership</p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="btn btn-ghost"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    >
                        ✏️ Edit
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={handleCancel}
                            className="btn btn-ghost"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="btn btn-primary"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        >
                            💾 Save
                        </button>
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {/* Project Name */}
                <div>
                    <label style={{
                        display: 'block',
                        color: 'var(--text-muted)',
                        fontSize: '0.8rem',
                        marginBottom: '0.5rem',
                        fontWeight: 500
                    }}>
                        Project Name
                    </label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={formData.projectName}
                            onChange={(e) => handleChange('projectName', e.target.value)}
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
                        />
                    ) : (
                        <p style={{
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            padding: '0.5rem 0'
                        }}>
                            {projectInfo.projectName}
                        </p>
                    )}
                </div>

                {/* Project Owner */}
                <div>
                    <label style={{
                        display: 'block',
                        color: 'var(--text-muted)',
                        fontSize: '0.8rem',
                        marginBottom: '0.5rem',
                        fontWeight: 500
                    }}>
                        Project Owner
                    </label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={formData.projectOwner}
                            onChange={(e) => handleChange('projectOwner', e.target.value)}
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
                        />
                    ) : (
                        <p style={{
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            padding: '0.5rem 0'
                        }}>
                            {projectInfo.projectOwner}
                        </p>
                    )}
                </div>

                {/* Pelaksana */}
                <div>
                    <label style={{
                        display: 'block',
                        color: 'var(--text-muted)',
                        fontSize: '0.8rem',
                        marginBottom: '0.5rem',
                        fontWeight: 500
                    }}>
                        Pelaksana (Executor)
                    </label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={formData.pelaksana}
                            onChange={(e) => handleChange('pelaksana', e.target.value)}
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
                        />
                    ) : (
                        <p style={{
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            padding: '0.5rem 0'
                        }}>
                            {projectInfo.pelaksana}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectInfo;
