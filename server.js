// Simple Express server for Task Manager backend (Optional)
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'tasks.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files from current directory

// Initialize data file if it doesn't exist
async function initDataFile() {
    try {
        await fs.access(DATA_FILE);
    } catch (error) {
        // File doesn't exist, create it with empty tasks array
        await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
    }
}

// API Routes
// Get all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: 'Failed to read tasks' });
    }
});

// Add new task
app.post('/api/tasks', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const tasks = JSON.parse(data);
        
        const newTask = {
            ...req.body,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
        };
        
        tasks.push(newTask);
        await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2));
        
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// Update task
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const tasks = JSON.parse(data);
        
        const taskId = req.params.id;
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex === -1) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        // Update task with new data
        tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
        await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2));
        
        res.json(tasks[taskIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const tasks = JSON.parse(data);
        
        const taskId = req.params.id;
        const filteredTasks = tasks.filter(t => t.id !== taskId);
        
        if (filteredTasks.length === tasks.length) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        await fs.writeFile(DATA_FILE, JSON.stringify(filteredTasks, null, 2));
        
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// Start server
async function startServer() {
    await initDataFile();
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`- Static files being served from current directory`);
        console.log(`- API endpoints available at /api/tasks`);
    });
}

startServer().catch(error => {
    console.error('Failed to start server:', error);
}); 