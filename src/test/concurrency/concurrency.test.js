import axios from 'axios';
import { startServer, stopServer } from '../../server/api.js';

const API_URL = 'http://localhost:3000';

describe('Concurrency Stress Tests', () => {

    // Manages the server lifecycle
    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        await startServer();
    });

    afterAll(async () => {
        await stopServer();
    });

    // Ensures the database is clean before each test
    beforeEach(async () => {
        await axios.post(`${API_URL}/testing/reset`);
    });

    test('should handle a mix of concurrent operations (CRUD) without data corruption', async () => {
        // --- 1. PREPARATION (SETUP) ---
        const initialAppointments = [];
        for (let i = 1; i <= 5; i++) {
            initialAppointments.push({ date: "2025-11-11", time: "10:00", duration: 10, title: `Initial Appointment ${i}` });
        }
        await Promise.all(initialAppointments.map(app => axios.post(`${API_URL}/appointments`, app)));
    
        // --- 2. CONCURRENT EXECUTION ---
        const concurrentPromises = [
            axios.post(`${API_URL}/appointments`, { date: "2025-11-11", time: "11:00", duration: 15, title: `Concurrent Add 1` }),
            axios.post(`${API_URL}/appointments`, { date: "2025-11-11", time: "12:00", duration: 15, title: `Concurrent Add 2` }),

            axios.patch(`${API_URL}/appointments/2`, { title: '--- TITLE UPDATED ---' }),
            axios.patch(`${API_URL}/appointments/3`, { duration: 999 }),
            
            axios.delete(`${API_URL}/appointments/5`),

            axios.get(`${API_URL}/appointments`),
            axios.get(`${API_URL}/appointments?date=2025-11-11`),
        ];

        await Promise.all(concurrentPromises);

        // --- 3. Verification---
        const finalStateResponse = await axios.get(`${API_URL}/appointments`);
        const finalAppointments = finalStateResponse.data.dados;
        
        expect(finalAppointments.length).toBe(6);

        const deletedApp = finalAppointments.find(app => app.id === 5);
        expect(deletedApp).toBeUndefined();

        const updatedApp1 = finalAppointments.find(app => app.id === 2);
        expect(updatedApp1.title).toBe('--- TITLE UPDATED ---');

        const updatedApp2 = finalAppointments.find(app => app.id === 3);
        expect(updatedApp2.duration).toBe(999);

        console.log('Final state of the database after stress test:', finalAppointments);
    });
});