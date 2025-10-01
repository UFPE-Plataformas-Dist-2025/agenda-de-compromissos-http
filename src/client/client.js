import axios from 'axios';
import { createInterface } from 'readline';
import { processUserInput } from './commandHandler.js';
import { handleError } from './errorHandler.js';
import { showConnectionAnimation, showWelcomeMessage, showCommandTutorial, showGoodbyeScreen, displaySessionReport} from './messages.js';

// --- Configuration ---
const API_URL = 'http://localhost:3000';

// Object to store session statistics
const sessionStats = {
    totalCommands: 0,
    successful: {
        ADD: 0,
        UPDATE: 0,
        DELETE: 0,
        LIST: 0,
    },
    errors: {
        user: 0,
        api: 0,
        connection: 0,
    }
};

// --- Initialization ---
const rl = createInterface({ input: process.stdin, output: process.stdout });
rl.setPrompt('\n> ');

// --- Helper Functions for Commands ---
function displaySuccess(response, showTable = false) {
    console.log(`\n ${response.data.mensagem || 'Operation carried out successfully!'}`);
    if (showTable && response.data.dados) {
        let dataToDisplay = Array.isArray(response.data.dados) ? response.data.dados : [response.data.dados];

        if (dataToDisplay.length > 0) {
            const formattedData = dataToDisplay.map(item => {
                const newItem = { ...item }; 
                if (newItem.createdAt) {
                    newItem.createdAt = new Date(newItem.createdAt).toLocaleString('pt-BR');
                }
                return newItem;
            });
            console.table(formattedData);
        }
    }
}

async function handleListCommand(data) {
    const filter = data.filter.toUpperCase() !== 'ALL' ? `?date=${data.filter}` : '';
    const response = await axios.get(`${API_URL}/appointments${filter}`);
    displaySuccess(response, true);
}

async function handleAddCommand(data) {
    const response = await axios.post(`${API_URL}/appointments`, data);
    displaySuccess(response);
}

async function handleUpdateCommand(data) {
    const { id, field, newValue } = data;
    const response = await axios.patch(`${API_URL}/appointments/${id}`, {
        [field.toLowerCase()]: newValue
    });
    displaySuccess(response);
}

async function handleDeleteCommand(data) {
    const { id } = data;
    const response = await axios.delete(`${API_URL}/appointments/${id}`, { timeout: 5000 });
    displaySuccess(response);
}

// --- Main Readline Event Handler ---
rl.on('line', async (line) => {
    const input = line.trim();
    if (!input) {
        rl.prompt();
        return;
    }
    
    sessionStats.totalCommands++;

    const [command] = input.split(' ');
    const commandUpper = command.toUpperCase();

    const localCommands = {
        'HELP': () => showCommandTutorial(),
        'CLEAR': () => { console.clear(); showWelcomeMessage(); },
        'EXIT': () => {
            displaySessionReport(sessionStats);
            showGoodbyeScreen();
            rl.close();
        }
    };

    if (localCommands[commandUpper]) {
        localCommands[commandUpper]();
        if (commandUpper !== 'EXIT') rl.prompt();
        return;
    }

    const result = processUserInput(input);
    if (!result.success) {
        if (result.errorCode) handleError(result.errorCode);
        sessionStats.errors.user++;
        rl.prompt();
        return;
    }

    try {
        const apiCommands = {
            'LIST': () => handleListCommand(result.data),
            'ADD': () => handleAddCommand(result.data),
            'UPDATE': () => handleUpdateCommand(result.data),
            'DELETE': () => handleDeleteCommand(result.data),
        };

        if (apiCommands[result.command]) {
            await apiCommands[result.command]();
            if (Object.prototype.hasOwnProperty.call(sessionStats.successful, result.command)) {
                sessionStats.successful[result.command]++;
            }
        }

    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            console.error('\n❌ Error: The server took too long to respond (timeout).');
            sessionStats.errors.connection++;
        } else if (error.response) {
            const status = error.response.status;
            const message = error.response.data.mensagem || 'The server returned an unexpected error response.';
            console.error(`\n❌ API Error (${status}): ${message}`);
            sessionStats.errors.api++;
        } else {
            console.error('\n❌ Connection error: Could not connect to the server. Please check if the server is online.');
            sessionStats.errors.connection++;
        }
    }

    rl.prompt();
});

// --- Initial Connection ---
showConnectionAnimation(() => {
    showWelcomeMessage();
    rl.prompt();
});