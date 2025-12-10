import React, { createContext, useContext, useState, useEffect } from 'react';

const WBSContext = createContext();

export const useWBS = () => {
    const context = useContext(WBSContext);
    if (!context) {
        throw new Error('useWBS must be used within WBSProvider');
    }
    return context;
};

const initialWBSData = [
    // All tasks Level 0 (Flat List)
    { id: '1', name: 'Project Start', weight: 10, progress: 100, level: 0, startDate: '2023-11-01', endDate: '2023-11-15', status: 'On Track', dependencies: [] },
    { id: '2', name: 'Requirements', weight: 5, progress: 100, level: 0, startDate: '2023-11-01', endDate: '2023-11-08', status: 'On Track', dependencies: [] },
    { id: '3', name: 'Planning', weight: 5, progress: 100, level: 0, startDate: '2023-11-08', endDate: '2023-11-15', status: 'On Track', dependencies: [{ predecessorId: '2', type: 'FS' }] },
    { id: '4', name: 'Design', weight: 20, progress: 80, level: 0, startDate: '2023-11-16', endDate: '2023-11-30', status: 'On Track', dependencies: [] },
    { id: '5', name: 'UI Mockups', weight: 10, progress: 100, level: 0, startDate: '2023-11-16', endDate: '2023-11-23', status: 'On Track', dependencies: [{ predecessorId: '3', type: 'FS' }] },
    { id: '6', name: 'Database Schema', weight: 10, progress: 60, level: 0, startDate: '2023-11-23', endDate: '2023-11-30', status: 'At Risk', dependencies: [{ predecessorId: '5', type: 'FS' }] },
    { id: '7', name: 'Development', weight: 40, progress: 20, level: 0, startDate: '2023-12-01', endDate: '2023-12-31', status: 'On Track', dependencies: [] },
    { id: '8', name: 'Frontend', weight: 20, progress: 30, level: 0, startDate: '2023-12-01', endDate: '2023-12-15', status: 'On Track', dependencies: [{ predecessorId: '6', type: 'FS' }] },
    { id: '9', name: 'Backend', weight: 20, progress: 10, level: 0, startDate: '2023-12-01', endDate: '2023-12-15', status: 'Delayed', dependencies: [{ predecessorId: '7', type: 'FS' }] },
    { id: '10', name: 'Testing', weight: 20, progress: 0, level: 0, startDate: '2023-12-16', endDate: '2023-12-25', status: 'On Track', dependencies: [] },
    { id: '11', name: 'Deployment', weight: 10, progress: 0, level: 0, startDate: '2023-12-26', endDate: '2023-12-31', status: 'On Track', dependencies: [] },
];

export const WBSProvider = ({ children }) => {
    const [wbsData, setWBSData] = useState(() => {
        const saved = localStorage.getItem('wbsData');
        if (saved) return JSON.parse(saved);
        return initialWBSData;
    });

    useEffect(() => {
        const saved = localStorage.getItem('wbsData');
        if (!saved) {
            saveToStorage(initialWBSData); // Just save, no recalc
        }
    }, []);

    const saveToStorage = (data) => {
        localStorage.setItem('wbsData', JSON.stringify(data));
    };

    // NO AUTOMATIC CALCULATION
    // Returns data as-is, ensuring everything is treated as manual.
    const calculateParentMetrics = (data) => {
        if (!data) return [];
        // Just return data. No hierarchy logic. No aggregation.
        return data.map(item => ({
            ...item,
            isCalculated: false, // Force false
            level: 0 // Force flat
        }));
    };

    const addWBSItem = (item) => {
        const newData = [...wbsData, item];
        const calculated = calculateParentMetrics(newData);
        setWBSData(calculated);
        saveToStorage(calculated);
    };

    const updateWBSItem = (id, updates) => {
        // 1. Update data dasar dulu
        const newData = wbsData.map(item => {
            if (item.id === id) {
                return { ...item, ...updates };
            }
            return item;
        });

        // 2. Jalankan Full Calculation ulang
        // Fungsi ini sekarang pintar: dia akan detect ulang mana parent mana child,
        // dan menghitung ulang semua angka dari bawah ke atas.
        const calculated = calculateParentMetrics(newData);

        setWBSData(calculated);
        saveToStorage(calculated);
    };

    const deleteWBSItem = (id) => {
        console.log('Deleting WBS item with ID:', id);
        const newData = wbsData.filter(item => item.id !== id);
        const calculated = calculateParentMetrics(newData);
        console.log('New WBS data after delete:', calculated);
        setWBSData(calculated);
        saveToStorage(calculated);
        return true;
    };

    // Calculate overall project progress (weighted average)
    const calculateOverallProgress = () => {
        if (!wbsData || wbsData.length === 0) return 0;

        // Only calculate based on Main Tasks (Level 0) to avoid double counting
        const mainTasks = wbsData.filter(item => item.level === 0);

        if (mainTasks.length === 0) return 0;

        const totalWeight = mainTasks.reduce((sum, item) => sum + item.weight, 0);
        const weightedProgress = mainTasks.reduce((sum, item) =>
            sum + (item.progress * item.weight / 100), 0
        );
        return totalWeight > 0 ? Math.round(weightedProgress / totalWeight * 100) : 0;
    };

    // Generate S-Curve data from WBS
    const generateSCurveData = () => {
        if (!wbsData || wbsData.length === 0) {
            return [{ date: new Date().toISOString().split('T')[0], planned: 0, actual: 0 }];
        }

        // Only use Level 0 (Main Tasks) for S-Curve
        const mainTasks = wbsData.filter(item => item.level === 0);

        if (mainTasks.length === 0) {
            return [{ date: new Date().toISOString().split('T')[0], planned: 0, actual: 0 }];
        }

        // Sort by end date
        const sorted = [...mainTasks].sort((a, b) =>
            new Date(a.endDate) - new Date(b.endDate)
        );

        const data = [];
        let cumulativePlanned = 0;
        let cumulativeActual = 0;

        sorted.forEach((item) => {
            cumulativePlanned += item.weight;
            cumulativeActual += (item.progress * item.weight / 100);

            data.push({
                date: item.endDate,
                planned: Math.round(cumulativePlanned),
                actual: Math.round(cumulativeActual)
            });
        });

        return data.length > 0 ? data : [{ date: new Date().toISOString().split('T')[0], planned: 0, actual: 0 }];
    };

    // Reset WBS data to EMPTY state (Clear All)
    const resetWBSData = () => {
        console.log('Clearing all WBS data');
        localStorage.removeItem('wbsData');
        const emptyData = [];
        setWBSData(emptyData);
        saveToStorage(emptyData);
    };

    const value = {
        wbsData,
        addWBSItem,
        updateWBSItem,
        deleteWBSItem,
        calculateOverallProgress,
        generateSCurveData,
        resetWBSData
    };

    return (
        <WBSContext.Provider value={value}>
            {children}
        </WBSContext.Provider>
    );
};
