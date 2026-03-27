import { useState, useEffect } from 'react';
import axios from 'axios';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('/notifications');
            setNotifications(response.data);
            setUnreadCount(response.data.filter(n => !n.read).length);
        } catch (err) {
            console.error('Fetch Notifications Error:', err.message);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await axios.put(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (err) {
            console.error('Mark Read Error:', err.message);
        }
    };

    return { notifications, unreadCount, fetchNotifications, markAsRead };
};
