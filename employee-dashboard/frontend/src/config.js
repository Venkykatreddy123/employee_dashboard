const getBaseUrl = () => {
    let url = process.env.REACT_APP_API_URL || 'https://empdashboard.onrender.com/api';
    if (!url.includes('/api')) {
        url = url.replace(/\/$/, '') + '/api';
    }
    return url.replace(/\/$/, '') + '/';
};

const getSocketUrl = () => {
    return process.env.REACT_APP_SOCKET_URL || 'https://empdashboard.onrender.com';
};

export const API_BASE_URL = getBaseUrl();
export const SOCKET_URL = getSocketUrl();
