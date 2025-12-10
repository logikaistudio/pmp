import React, { createContext, useContext, useState, useEffect } from 'react';

const ProjectContext = createContext();

export const useProject = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProject must be used within ProjectProvider');
    }
    return context;
};

export const ProjectProvider = ({ children }) => {
    const [projectInfo, setProjectInfo] = useState({
        projectName: 'Project Alpha',
        projectOwner: 'John Doe',
        pelaksana: 'Development Team A'
    });

    useEffect(() => {
        // Load from localStorage on mount
        const saved = localStorage.getItem('projectInfo');
        if (saved) {
            setProjectInfo(JSON.parse(saved));
        }
    }, []);

    const updateProjectInfo = (newInfo) => {
        setProjectInfo(newInfo);
        localStorage.setItem('projectInfo', JSON.stringify(newInfo));
    };

    const value = {
        projectInfo,
        updateProjectInfo
    };

    return (
        <ProjectContext.Provider value={value}>
            {children}
        </ProjectContext.Provider>
    );
};
