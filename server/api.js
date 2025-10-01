// server/api.js
import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), 'server', 'appointments.json');

// --- Middlewares ---
// Habilita o CORS para permitir requisições do cliente web
app.use(cors());
// Habilita o parsing de JSON no corpo das requisições (essencial para POST e PATCH)
app.use(express.json());

// --- Lógica de Dados (reaproveitada do servidor TCP) ---
let appointments = [];
let nextAppointmentId = 1;

function loadAppointmentsFromFile() {
    // (Copie a função loadAppointmentsFromFile do seu server.js original)
    // ... Lógica para ler o appointments.json ...
    // Exemplo simplificado:
    if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE);
        appointments = JSON.parse(data);
        if (appointments.length > 0) {
            nextAppointmentId = Math.max(...appointments.map(a => a.id)) + 1;
        }
    }
}

function saveAppointmentsToFile() {
    // (Copie a função saveAppointmentsToFile do seu server.js original)
    fs.writeFileSync(DATA_FILE, JSON.stringify(appointments, null, 2));
}

// --- Rotas da API (Endpoints) ---

// GET /appointments - Listar agendamentos (com filtro opcional por data)
app.get('/appointments', (req, res) => {
    const { date } = req.query; // Pega o parâmetro da URL, ex: ?date=2025-12-25
    let results = appointments;
    if (date) {
        results = appointments.filter(app => app.date === date);
    }
    res.status(200).json(results);
});

// POST /appointments - Adicionar novo agendamento
app.post('/appointments', (req, res) => {
    // CORREÇÃO: Remova 'description' desta linha
    const { date, time, duration, title } = req.body;

    // A validação continua a mesma
    if (!date || !time || !duration || !title) {
        return res.status(400).json({ message: "Campos obrigatórios ausentes." });
    }

    // O restante da função permanece igual. O 'description' (se existir)
    // será adicionado normalmente pelo spread operator (...req.body).
    const newAppointment = { id: nextAppointmentId++, ...req.body };
    appointments.push(newAppointment);
    saveAppointmentsToFile();
    res.status(201).json(newAppointment);
});

// PATCH /appointments/:id - Atualizar um agendamento
app.patch('/appointments/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const updates = req.body;
    const appointmentIndex = appointments.findIndex(app => app.id === id);

    if (appointmentIndex === -1) {
        return res.status(404).json({ message: "Agendamento não encontrado." });
    }

    // Atualiza o objeto com os novos dados
    appointments[appointmentIndex] = { ...appointments[appointmentIndex], ...updates };
    saveAppointmentsToFile();
    res.status(200).json(appointments[appointmentIndex]);
});

// DELETE /appointments/:id - Deletar um agendamento
app.delete('/appointments/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const appointmentIndex = appointments.findIndex(app => app.id === id);

    if (appointmentIndex === -1) {
        return res.status(404).json({ message: "Agendamento não encontrado." });
    }

    appointments.splice(appointmentIndex, 1);
    saveAppointmentsToFile();
    res.status(204).send(); // 204 No Content - sucesso, sem corpo de resposta
});


// --- Inicialização do Servidor ---
loadAppointmentsFromFile();
app.listen(PORT, () => {
    console.log(`API RESTful rodando em http://localhost:${PORT}`);
});