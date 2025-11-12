
import { HistoryItem, User } from '../types';

export const getHistory = (user: User): HistoryItem[] => {
    if (!user || !user.email) return [];
    try {
        const historyJson = localStorage.getItem(`history_${user.email}`);
        return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
        console.error("Failed to parse history from localStorage", error);
        return [];
    }
};

export const addHistoryItem = (user: User, item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    if (!user || !user.email) return;
    try {
        const history = getHistory(user);
        const newHistoryItem: HistoryItem = {
            ...item,
            id: new Date().toISOString() + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
        };
        // Keep history to a reasonable size, e.g., 50 items
        const updatedHistory = [newHistoryItem, ...history].slice(0, 50);
        localStorage.setItem(`history_${user.email}`, JSON.stringify(updatedHistory));
    } catch (error) {
        console.error("Failed to save history item to localStorage", error);
    }
};
