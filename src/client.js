import axios from 'axios';
import { createInterface } from 'readline';
import { processUserInput } from './commandHandler.js';
import { handleError } from './errorHandler.js';
import { showConnectionAnimation, showWelcomeMessage, showCommandTutorial, showGoodbyeScreen } from './messages.js';

// --- Configuration ---
const API_URL = 'http://localhost:3000';

// --- Initialization ---
const rl = createInterface({ input: process.stdin, output: process.stdout });
rl.setPrompt('\n> ');

// --- Helper Functions for Commands ---
function displaySuccess(response) {
    console.log(`\n✅ ${response.data.mensagem || 'Operation carried out successfully!'}`);
    if (response.data.dados) {
        const dataAsArray = Array.isArray(response.data.dados) ? response.data.dados : [response.data.dados];
        if (dataAsArray.length > 0) {
            console.table(dataAsArray);
        }
    }
}

async function handleListCommand(data) {
    const filter = data.filter.toUpperCase() !== 'ALL' ? `?date=${data.filter}` : '';
    const response = await axios.get(`${API_URL}/appointments${filter}`);
    displaySuccess(response);
}

async function handleAddCommand(data) {
    // Não precisa mais de regex aqui! Apenas usa os dados recebidos.
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
    const [command] = input.split(' ');
    const commandUpper = command.toUpperCase();

    const localCommands = {
        'HELP': () => showCommandTutorial(),
        'CLEAR': () => { console.clear(); showWelcomeMessage(); },
        'EXIT': () => { showGoodbyeScreen(); rl.close(); }
    };

    if (localCommands[commandUpper]) {
        localCommands[commandUpper]();
        if (commandUpper !== 'EXIT') rl.prompt();
        return;
    }

    const result = processUserInput(input);
    if (!result.success) {
      if (result.errorCode) handleError(result.errorCode);
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
      }

    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            console.error('\n❌ Error: The server took too long to respond (timeout).');

        } else if (error.response) {
            const status = error.response.status;
            const message = error.response.data.mensagem || 'The server returned an unexpected error response.';
            console.error(`\n❌ API Error (${status}): ${message}`);

        } else {
            console.error('\n❌ Connection error: Could not connect to the server. Please check if the server is online.');
        }
    }

    rl.prompt();
});

// --- Initial Connection ---
showConnectionAnimation(() => {
    showWelcomeMessage();
    rl.prompt();
});