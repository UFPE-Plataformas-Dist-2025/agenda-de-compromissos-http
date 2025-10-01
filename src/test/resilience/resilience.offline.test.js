import axios from 'axios';
const API_URL = 'http://localhost:3000';

describe('Resilience Tests (Server Offline)', () => {
    test('should handle server offline error gracefully', async () => {
        // This test must be run while the server is NOT running.
        await expect(axios.get(`${API_URL}/appointments`))
            .rejects.toHaveProperty('code', 'ECONNREFUSED');
    });
});