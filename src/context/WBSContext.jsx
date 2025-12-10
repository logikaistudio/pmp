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
    // Level 0: Main Tasks (will be auto-calculated from children)
    { id: '1.0', name: 'Project Start', weight: 10, progress: 100, level: 0, startDate: '2023-11-01', endDate: '2023-11-15', status: 'On Track', dependencies: [], isCalculated: true },
    // Level 1: Children of 1.0
    { id: '1.1', name: 'Requirements', weight: 5, progress: 100, level: 1, startDate: '2023-11-01', endDate: '2023-11-08', status: 'On Track', dependencies: [] },
    { id: '1.2', name: 'Planning', weight: 5, progress: 100, level: 1, startDate: '2023-11-08', endDate: '2023-11-15', status: 'On Track', dependencies: [{ predecessorId: '1.1', type: 'FS' }] },

    // Level 0: Main Task
    { id: '2.0', name: 'Design', weight: 20, progress: 80, level: 0, startDate: '2023-11-16', endDate: '2023-11-30', status: 'On Track', dependencies: [], isCalculated: true },
    // Level 1: Children of 2.0
    { id: '2.1', name: 'UI Mockups', weight: 10, progress: 100, level: 1, startDate: '2023-11-16', endDate: '2023-11-23', status: 'On Track', dependencies: [{ predecessorId: '1.2', type: 'FS' }] },
    { id: '2.2', name: 'Database Schema', weight: 10, progress: 60, level: 1, startDate: '2023-11-23', endDate: '2023-11-30', status: 'At Risk', dependencies: [{ predecessorId: '2.1', type: 'FS' }] },

    // Level 0: Main Task
    { id: '3.0', name: 'Development', weight: 40, progress: 20, level: 0, startDate: '2023-12-01', endDate: '2023-12-31', status: 'On Track', dependencies: [], isCalculated: true },
    // Level 1: Children of 3.0
    { id: '3.1', name: 'Frontend', weight: 20, progress: 30, level: 1, startDate: '2023-12-01', endDate: '2023-12-15', status: 'On Track', dependencies: [{ predecessorId: '2.1', type: 'FS' }] },
    { id: '3.2', name: 'Backend', weight: 20, progress: 10, level: 1, startDate: '2023-12-01', endDate: '2023-12-15', status: 'Delayed', dependencies: [{ predecessorId: '2.2', type: 'FS' }] },

    // Level 0: Main Tasks (no children - can be edited)
    { id: '4.0', name: 'Testing', weight: 20, progress: 0, level: 0, startDate: '2023-12-16', endDate: '2023-12-25', status: 'On Track', dependencies: [], isCalculated: false },
    { id: '5.0', name: 'Deployment', weight: 10, progress: 0, level: 0, startDate: '2023-12-26', endDate: '2023-12-31', status: 'On Track', dependencies: [], isCalculated: false },
];

export const WBSProvider = ({ children }) => {
    const [wbsData, setWBSData] = useState(() => {
        // Load from localStorage on mount
        const saved = localStorage.getItem('wbsData');
        if (saved) {
            return JSON.parse(saved);
        }
        // If no saved data, use initial data (will be calculated below)
        return initialWBSData;
    });

    useEffect(() => {
        // On first mount, if using initial data, run calculation to ensure consistency
        const saved = localStorage.getItem('wbsData');
        if (!saved) {
            console.log('First load - calculating parent metrics for initial data');
            const calculated = calculateParentMetrics(initialWBSData);
            setWBSData(calculated);
            saveToStorage(calculated);
        }
    }, []);

    const saveToStorage = (data) => {
        localStorage.setItem('wbsData', JSON.stringify(data));
    };

    // Calculate parent task metrics from children (supports multi-level hierarchy)
    const calculateParentMetrics = (data) => {
        // Create a deep copy to avoid reference issues
        let result = JSON.parse(JSON.stringify(data));

        // Helper function to get parent ID
        const getParentId = (childId) => {
            const parts = childId.split('.');
            if (parts.length < 2) return null;

            // Critical Fix: If it's a Level 0 task (e.g., '1.0', '2.0'), it has NO parent.
            if (parts.length === 2 && parts[1] === '0') return null;

            parts.pop();
            // If we popped and handled L0 above, then for '1.1' -> parts=['1'] -> returns '1.0'
            // For '1.1.1' -> parts=['1','1'] -> returns '1.1'
            if (parts.length === 1) {
                return parts[0] + '.0';
            }
            return parts.join('.');
        };

        // Helper to check if item has children in the CURRENT dataset
        const hasChildren = (itemId) => {
            return result.some(item => getParentId(item.id) === itemId);
        };

        // 1. First Pass: Identifikasi mana yang Parent (Auto) dan mana Leaf (Manual)
        // Kita reset status isCalculated berdasarkan kondisi real-time data
        result = result.map(item => {
            const isParent = hasChildren(item.id);
            return {
                ...item,
                isCalculated: isParent, // Parent = Auto, Leaf = Manual
                // Hapus properti manualEdit jika ada, biar bersih
                manualEdit: undefined
            };
        });

        // 2. Second Pass: Calculate Weight & Progress for Parents (Bottom-Up)
        // Sort tasks by ID length descending (Deepest level first: 1.1.1 -> 1.1 -> 1.0)
        // Ini memastikan saat kita hitung level 1, level 2 sudah beres angkanya.
        const sortedIds = result.map(i => i.id).sort((a, b) => b.length - a.length);

        sortedIds.forEach(id => {
            const itemIndex = result.findIndex(i => i.id === id);
            if (itemIndex === -1) return;

            const item = result[itemIndex];

            // Hanya proses jika ini adalah Parent (punya anak)
            if (item.isCalculated) {
                // Cari anak-anak langsung (direct children)
                const children = result.filter(child => getParentId(child.id) === item.id);

                if (children.length > 0) {
                    // Sum Weights
                    const totalWeight = children.reduce((sum, child) => sum + (child.weight || 0), 0);

                    // Weighted Average Progress
                    // (Progress Child * Weight Child) / Total Weight Parent
                    let weightedProgressSum = 0;
                    children.forEach(child => {
                        weightedProgressSum += (child.progress || 0) * (child.weight || 0);
                    });

                    const avgProgress = totalWeight > 0 ? Math.round(weightedProgressSum / totalWeight) : 0;

                    // Update Parent Value
                    result[itemIndex] = {
                        ...item,
                        weight: totalWeight,
                        progress: avgProgress
                    };
                }
            }
        });

        return result;
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

        const totalWeight = wbsData.reduce((sum, item) => sum + item.weight, 0);
        const weightedProgress = wbsData.reduce((sum, item) =>
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

    // Reset WBS data to initial state
    const resetWBSData = () => {
        console.log('Resetting WBS data to initial state');
        localStorage.removeItem('wbsData');
        const calculated = calculateParentMetrics(initialWBSData);
        console.log('Reset data:', calculated);
        setWBSData(calculated);
        saveToStorage(calculated);
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
