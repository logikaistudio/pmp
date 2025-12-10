// Simple user management utilities with localStorage persistence

const STORAGE_KEY = 'pm_users';
const SESSION_KEY = 'pm_session';

// Default admin user
const DEFAULT_USERS = [
    {
        id: '1',
        username: 'admin',
        password: 'admin123', // In production, this should be hashed
        role: 'Admin',
        name: 'Administrator',
        permissions: {
            add: true,
            edit: true,
            delete: true,
            view: true
        },
        createdAt: new Date().toISOString()
    }
];

// Initialize users in localStorage if not exists
export const initializeUsers = () => {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    }
};

// Get all users
export const getUsers = () => {
    const users = localStorage.getItem(STORAGE_KEY);
    return users ? JSON.parse(users) : DEFAULT_USERS;
};

// Add new user
export const addUser = (userData) => {
    const users = getUsers();
    const newUser = {
        id: Date.now().toString(),
        ...userData,
        permissions: userData.permissions || {
            add: false,
            edit: false,
            delete: false,
            view: true
        },
        createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    return newUser;
};

// Update user
export const updateUser = (userId, updates) => {
    const users = getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        return users[index];
    }
    return null;
};

// Delete user
export const deleteUser = (userId) => {
    const users = getUsers();
    const filtered = users.filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
};

// Authenticate user
export const authenticateUser = (username, password) => {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        const session = {
            userId: user.id,
            username: user.username,
            role: user.role,
            name: user.name,
            permissions: user.permissions || {
                add: false,
                edit: false,
                delete: false,
                view: true
            },
            loginAt: new Date().toISOString()
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return session;
    }
    return null;
};

// Get current session
export const getCurrentSession = () => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
};

// Logout
export const logout = () => {
    localStorage.removeItem(SESSION_KEY);
};

// Check if user has permission
export const hasPermission = (requiredRole) => {
    const session = getCurrentSession();
    if (!session) return false;

    const roleHierarchy = { 'Admin': 3, 'Reporter': 2, 'User': 1 };
    const userLevel = roleHierarchy[session.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
};
