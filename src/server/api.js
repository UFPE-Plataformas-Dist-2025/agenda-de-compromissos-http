import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), 'server', 'appointments.json');

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Data Logic ---
let appointments = [];
let nextAppointmentId = 1;

function loadAppointmentsFromFile() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf-8');
            const parsedData = data ? JSON.parse(data) : [];
            if (Array.isArray(parsedData)) {
                appointments = parsedData;
                if (appointments.length > 0) {
                    nextAppointmentId = Math.max(...appointments.map(app => app.id)) + 1;
                }
                console.log(`[INFO] Successfully loaded ${appointments.length} appointments from ${DATA_FILE}`);
            }
        } else {
            console.log(`[INFO] Data file not found at ${DATA_FILE}. A new one will be created.`);
        }
    } catch (err) {
        console.error('[ERROR] Could not load data from file:', err);
        appointments = [];
    }
}

function saveAppointmentsToFile() {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(appointments, null, 2));
        console.log(`[INFO] Appointments saved to ${DATA_FILE}`);
    } catch (err) {
        console.error('[ERROR] Could not save data to file:', err);
    }
}

function sendResponse(res, status, data, message, httpCode) {
    res.status(httpCode).json({ status, dados: data, mensagem: message });
}

// --- API Routes (Endpoints) ---

app.get('/appointments', (req, res) => {
    const { date } = req.query;
    let results = appointments;
    if (date) {
        results = appointments.filter(app => app.date === date);
    }
    const message = results.length === 0 ? 'No appointments found.' : `${results.length} appointment(s) found.`;
    sendResponse(res, 'SUCCESS', results, message, 200);
});

app.post('/appointments', (req, res) => {
    const { date, time, duration, title } = req.body;
    if (!date || !time || !duration || !title) {
        return sendResponse(res, 'ERROR', null, "Missing required fields.", 400);
    }
    const newAppointment = { id: nextAppointmentId++, createdAt: new Date().toISOString(), ...req.body };
    appointments.push(newAppointment);
    saveAppointmentsToFile();
    console.log('[INFO] New appointment added:', newAppointment);
    sendResponse(res, 'SUCCESS', newAppointment, 'Appointment added successfully.', 201);
});

app.patch('/appointments/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendResponse(res, 'ERROR', null, 'Invalid ID format.', 400);

    const appointmentIndex = appointments.findIndex(app => app.id === id);
    if (appointmentIndex === -1) {
        return sendResponse(res, 'ERROR', null, `Appointment with ID ${id} not found.`, 404);
    }
    appointments[appointmentIndex] = { ...appointments[appointmentIndex], ...req.body };
    saveAppointmentsToFile();
    const updatedAppointment = appointments[appointmentIndex];
    console.log(`[INFO] Appointment ${id} updated:`, updatedAppointment);
    sendResponse(res, 'SUCCESS', updatedAppointment, `Appointment ${id} updated successfully.`, 200);
});

app.delete('/appointments/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendResponse(res, 'ERROR', null, 'Invalid ID format.', 400);
    
    const appointmentIndex = appointments.findIndex(app => app.id === id);
    if (appointmentIndex === -1) {
        return sendResponse(res, 'ERROR', null, `Appointment with ID ${id} not found.`, 404);
    }
    const [deletedAppointment] = appointments.splice(appointmentIndex, 1);
    saveAppointmentsToFile();
    console.log(`[INFO] Appointment ${id} deleted.`);
    sendResponse(res, 'SUCCESS', deletedAppointment, `Appointment ${id} deleted successfully.`, 200);
});

// --- Server Initialization ---
loadAppointmentsFromFile();
app.listen(PORT, () => {
    console.log(`[INFO] RESTful API server running at http://localhost:${PORT}`);
});