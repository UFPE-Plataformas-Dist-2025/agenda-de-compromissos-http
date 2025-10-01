const validCommands = ['ADD', 'LIST', 'UPDATE', 'DELETE'];

export function processUserInput(line) {
    const input = line.trim();
    if (!input) return { success: false };

    const [command] = input.split(' ');
    const commandUpper = command.toUpperCase();

    if (!validCommands.includes(commandUpper)) {
        return { success: false, errorCode: 'INVALID_COMMAND' };
    }

    switch (commandUpper) {
        case 'ADD': {
            const addRegex = /^ADD\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+"([^"]+)"(?:\s+"([^"]+)")?$/i;
            const match = input.match(addRegex);
            if (!match) return { success: false, errorCode: 'INVALID_ADD_FORMAT' };
            
            const [, date, time, duration, title, description] = match;
            return {
                success: true,
                command: 'ADD',
                data: { date, time, duration: parseInt(duration), title, description: description || '' }
            };
        }

        case 'LIST': {
            const listRegex = /^LIST(\s+[^\s]+)?$/i;
            const match = input.match(listRegex);
            if (!match) return { success: false, errorCode: 'INVALID_LIST_FORMAT' };
            
            const [, filter] = input.split(' ');
            return { success: true, command: 'LIST', data: { filter: filter || 'ALL' } };
        }

        case 'UPDATE': {
            const updateRegex = /^UPDATE\s+(\d+)\s+([^\s"]+)\s+"([^"]+)"$/i;
            const match = input.match(updateRegex);
            if (!match) return { success: false, errorCode: 'INVALID_UPDATE_FORMAT' };
            
            const [, id, field, newValue] = match;
            return { success: true, command: 'UPDATE', data: { id, field, newValue } };
        }

        case 'DELETE': {
            const deleteRegex = /^DELETE\s+(\d+)$/i;
            const match = input.match(deleteRegex);
            if (!match) return { success: false, errorCode: 'INVALID_DELETE_FORMAT' };
            
            const [, id] = match;
            return { success: true, command: 'DELETE', data: { id } };
        }
    }

    return { success: false, errorCode: 'UNKNOWN_ERROR' };
}