import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const useIdle = (timeoutInMinutes = 5) => {
    const [isIdle, setIsIdle] = useState(false);
    const timeoutRef = useRef(null);

    useEffect(() => {
        const resetTimer = () => {
            if (isIdle) {
                setIsIdle(false);
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(async () => {
                setIsIdle(true);
                // Send idle update to backend
                try {
                    const token = localStorage.getItem('token');
                    if (token) {
                        await axios.put('http://localhost:5000/api/attendance/idle', 
                            { idle_minutes: timeoutInMinutes },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        console.log('Idle time reported to server');
                    }
                } catch (err) {
                    console.error('Failed to report idle time:', err);
                }
            }, timeoutInMinutes * 60 * 1000);
        };

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => document.addEventListener(event, resetTimer));

        resetTimer();

        return () => {
            events.forEach(event => document.removeEventListener(event, resetTimer));
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [isIdle, timeoutInMinutes]);

    return isIdle;
};

export default useIdle;
