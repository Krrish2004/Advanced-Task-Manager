# Backend Integration Guide

This document explains how to integrate the Task Manager frontend with the provided Node.js/Express backend.

## Prerequisites

To use the backend integration, you'll need:

1. Node.js (v14 or later) installed on your system
2. npm (comes with Node.js)

## Setup Instructions

1. Install dependencies

```bash
npm install
```

2. Start the server

```bash
npm start
```

For development with auto-restart on code changes:

```bash
npm run dev
```

The server will run on http://localhost:3000 by default.

## Frontend Integration

To connect the frontend to the backend, you need to modify the `app.js` file. Look for the following functions and update them to use the API endpoints instead of localStorage:

### 1. Fetch Tasks

Replace the `fetchTasks` function with:

```javascript
// Fetch tasks from API
async function fetchTasks() {
    loadingSpinner.classList.add('active');
    
    try {
        const response = await fetch('/api/tasks');
        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }
        
        const data = await response.json();
        tasks = data; // Update the local tasks array
        return data;
    } catch (error) {
        showNotification('Error fetching tasks. ' + error.message, 'error');
        throw error;
    } finally {
        loadingSpinner.classList.remove('active');
    }
}
```

### 2. Handle Task Submit

Update the `handleTaskSubmit` function to use the API:

```javascript
// Handle task submission
async function handleTaskSubmit(event) {
    event.preventDefault();
    
    // Get form values
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const priority = document.getElementById('task-priority').value;
    const dueDate = new Date(document.getElementById('task-due-date').value);
    
    // Validate form
    if (!title || !dueDate) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    if (dueDate < new Date()) {
        showNotification('Due date cannot be in the past.', 'error');
        return;
    }
    
    // Create new task object
    const newTask = {
        title,
        description,
        priority,
        dueDate: dueDate.toISOString(),
        status: 'upcoming'
    };
    
    try {
        loadingSpinner.classList.add('active');
        
        // Send the task to the API
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newTask)
        });
        
        if (!response.ok) {
            throw new Error('Failed to create task');
        }
        
        const createdTask = await response.json();
        
        // Add to local tasks array
        tasks.push(createdTask);
        
        // Render tasks
        renderTasks();
        
        // Set timer for the new task
        setTaskTimer(createdTask);
        
        // Reset form
        taskForm.reset();
        
        // Show success notification
        showNotification('Task created successfully!', 'success');
    } catch (error) {
        showNotification('Error creating task: ' + error.message, 'error');
    } finally {
        loadingSpinner.classList.remove('active');
    }
}
```

### 3. Update Task Status

Update the `updateTaskStatus` function:

```javascript
// Update a task's status
async function updateTaskStatus(taskId, newStatus) {
    try {
        loadingSpinner.classList.add('active');
        
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update task');
        }
        
        const updatedTask = await response.json();
        
        // Update the task in the local array
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex] = updatedTask;
        }
        
        // Re-render tasks
        renderTasks();
    } catch (error) {
        showNotification('Error updating task: ' + error.message, 'error');
    } finally {
        loadingSpinner.classList.remove('active');
    }
}
```

### 4. Delete Task

Update the `deleteTask` function:

```javascript
// Delete a task
async function deleteTask(taskId, showConfirmation = true) {
    if (showConfirmation && !confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    try {
        loadingSpinner.classList.add('active');
        
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete task');
        }
        
        // Remove from local array
        tasks = tasks.filter(task => task.id !== taskId);
        
        // Re-render tasks
        renderTasks();
        
        if (showConfirmation) {
            showNotification('Task deleted.', 'success');
        }
    } catch (error) {
        showNotification('Error deleting task: ' + error.message, 'error');
    } finally {
        loadingSpinner.classList.remove('active');
    }
}
```

### 5. Remove localStorage References

Remove the following function as it's no longer needed:

```javascript
// Save tasks to localStorage
function saveTasksToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}
```

And remove all calls to this function throughout the code.

## Testing the Integration

1. Start the server
2. Open http://localhost:3000 in your browser
3. Create, update, and delete tasks to verify the API integration works

## API Endpoints Reference

| Endpoint          | Method | Description                 | Request Body                           | Response                      |
|-------------------|--------|-----------------------------|----------------------------------------|-------------------------------|
| `/api/tasks`      | GET    | Get all tasks               | -                                      | Array of task objects         |
| `/api/tasks`      | POST   | Create a new task           | Task object without id                 | Created task with id          |
| `/api/tasks/:id`  | PUT    | Update a task               | Task object or partial task properties | Updated task object           |
| `/api/tasks/:id`  | DELETE | Delete a task               | -                                      | 204 No Content                |

## Troubleshooting

- If you see CORS errors in the console, ensure the server is running and the CORS middleware is properly configured.
- If tasks aren't loading, check the network tab in the browser's developer tools to see if the API requests are succeeding.
- Make sure the server is running on port 3000, or update the API URLs in the frontend code to match the correct port. 