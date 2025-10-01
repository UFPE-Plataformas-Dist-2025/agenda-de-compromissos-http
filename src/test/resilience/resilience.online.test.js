import axios from 'axios';
import { startServer, stopServer } from '../../server/api.js';

const API_URL = 'http://localhost:3000';

describe('Resilience Tests (Server Online)', () => {

    beforeAll(async () => {
        await startServer();
    });

    afterAll(async () => {
        await stopServer();
    });

    test('should handle server timeout error gracefully', async () => {
        await expect(axios.get(`${API_URL}/test-timeout`, { timeout: 3000 }))
            .rejects.toHaveProperty('code', 'ECONNABORTED');
    });
});