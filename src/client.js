
import { createInterface } from 'readline';
import { processUserInput } from './commandHandler.js';
import { handleError } from './errorHandler.js';
import { showConnectionAnimation, showWelcomeMessage, showCommandTutorial, showGoodbyeScreen } from './messages.js';

// --- Configuration ---


// --- Initialization ---
const rl = createInterface({ input: process.stdin, output: process.stdout });
rl.setPrompt('\n> ');

// --- Readline Event Handler ---
rl.on('line', (line) => {
  const input = line.trim();
  const commandUpper = input.split(' ')[0].toUpperCase();

  if (commandUpper === 'HELP') {
    showCommandTutorial();
    rl.prompt();
    return;
  }
  if (commandUpper === 'CLEAR') {
    showWelcomeMessage();
    rl.prompt();
    return;
  }
  if (commandUpper === 'EXIT') {
    showGoodbyeScreen();
    rl.close();
    return;
  }

  const result = processUserInput(input);

  if (result.success) {
    console.log(`[DEBUG] Command formatted: "${result.commandToSend.trim()}"`);
    rl.write(result.commandToSend);
  } else if (result.errorCode) {
    handleError(result.errorCode);
    rl.prompt();
  } else {
    rl.prompt();
  }
});

// --- Initial Connection ---
showConnectionAnimation(() => {
    console.log('Attempting to connect to the server...');
    showWelcomeMessage();
    rl.prompt();
});