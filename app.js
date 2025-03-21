// Task Manager Application

// DOM Elements
const taskForm = document.getElementById('task-form');
const taskLists = {
    upcoming: document.getElementById('upcoming-task-list'),
    ongoing: document.getElementById('ongoing-task-list'),
    completed: document.getElementById('completed-task-list'),
    missed: document.getElementById('missed-task-list')
};
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const loadingSpinner = document.getElementById('loading-spinner');
const themeToggle = document.getElementById('theme-toggle');
const notificationArea = document.getElementById('notification-area');

// Task Template
const taskTemplate = document.getElementById('task-template');

// State Management
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let draggedTask = null;

// Initialize the application
function initApp() {
    // Event Listeners
    taskForm.addEventListener('submit', handleTaskSubmit);
    
    // Tab navigation
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // Theme toggle
    themeToggle.addEventListener('change', toggleTheme);
    
    // Check localStorage for theme preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        themeToggle.checked = true;
    }
    
    // Request notification permission
    requestNotificationPermission();
    
    // Load tasks from localStorage and render them
    renderTasks();
    
    // Set up task timers
    setTaskTimers();
    
    // Log event propagation demonstration
    document.addEventListener('click', logEventCapture, true);  // Capturing phase
    document.addEventListener('click', logEventBubble, false); // Bubbling phase
    
    // Check for tasks every minute
    setInterval(checkTasksStatus, 60000);
}

// Simulated API for fetching tasks
async function fetchTasks() {
    loadingSpinner.classList.add('active');
    
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get tasks from localStorage instead of a real API for this demo
        return tasks;
    } catch (error) {
        showNotification('Error fetching tasks. ' + error.message, 'error');
        throw error;
    } finally {
        loadingSpinner.classList.remove('active');
    }
}

// Handle task submission
function handleTaskSubmit(event) {
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
        id: Date.now().toString(),
        title,
        description,
        priority,
        dueDate: dueDate.toISOString(),
        status: 'upcoming',
        createdAt: new Date().toISOString()
    };
    
    // Add to tasks array
    tasks.push(newTask);
    
    // Save to localStorage
    saveTasksToLocalStorage();
    
    // Render tasks
    renderTasks();
    
    // Set timer for the new task
    setTaskTimer(newTask);
    
    // Reset form
    taskForm.reset();
    
    // Show success notification
    showNotification('Task created successfully!', 'success');
}

// Render all tasks to their respective lists
async function renderTasks() {
    try {
        // Fetch tasks (simulating API call)
        const tasksData = await fetchTasks();
        
        // Clear all task lists
        Object.values(taskLists).forEach(list => list.innerHTML = '');
        
        // Sort tasks by priority and due date
        const sortedTasks = [...tasksData].sort((a, b) => {
            // First sort by priority
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            // Then sort by due date
            return new Date(a.dueDate) - new Date(b.dueDate);
        });
        
        // Render each task
        sortedTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            if (taskLists[task.status]) {
                taskLists[task.status].appendChild(taskElement);
            }
        });
        
    } catch (error) {
        console.error('Error rendering tasks:', error);
        showNotification('Failed to load tasks.', 'error');
    }
}

// Create task DOM element from task data
function createTaskElement(task) {
    // Clone the template
    const taskElement = document.importNode(taskTemplate.content, true).querySelector('.task-item');
    
    // Set task ID
    taskElement.setAttribute('data-id', task.id);
    
    // Set task content
    taskElement.querySelector('.task-title').textContent = task.title;
    taskElement.querySelector('.task-description').textContent = task.description || 'No description';
    
    // Format due date
    const dueDate = new Date(task.dueDate);
    const formattedDate = dueDate.toLocaleDateString() + ' at ' + dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    taskElement.querySelector('.task-due-date').textContent = 'Due: ' + formattedDate;
    
    // Set time left
    updateTimeLeft(taskElement, task);
    
    // Set priority class
    const priorityElement = taskElement.querySelector('.task-priority');
    priorityElement.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
    priorityElement.classList.add('priority-' + task.priority);
    
    // Add missed class if task is missed
    if (task.status === 'missed') {
        taskElement.classList.add('missed');
    }
    
    // Add event listeners for buttons
    const completeBtn = taskElement.querySelector('.btn-complete');
    const editBtn = taskElement.querySelector('.btn-edit');
    const deleteBtn = taskElement.querySelector('.btn-delete');
    
    completeBtn.addEventListener('click', () => completeTask(task.id));
    editBtn.addEventListener('click', () => editTask(task.id));
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    
    // Add drag and drop event listeners
    taskElement.addEventListener('dragstart', dragStart);
    taskElement.addEventListener('dragend', dragEnd);
    taskElement.addEventListener('dragover', dragOver);
    taskElement.addEventListener('dragleave', dragLeave);
    taskElement.addEventListener('drop', drop);
    
    return taskElement;
}

// Update the time left display for a task
function updateTimeLeft(taskElement, task) {
    const timeLeftElement = taskElement.querySelector('.task-time-left');
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    
    // Calculate time difference
    const timeDiff = dueDate - now;
    
    if (timeDiff <= 0) {
        timeLeftElement.textContent = 'Overdue!';
        timeLeftElement.style.color = 'var(--danger-color)';
        return;
    }
    
    // Calculate days, hours, minutes
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    let timeLeftText = '';
    if (days > 0) {
        timeLeftText += `${days}d `;
    }
    if (hours > 0 || days > 0) {
        timeLeftText += `${hours}h `;
    }
    timeLeftText += `${minutes}m`;
    
    timeLeftElement.textContent = 'Time left: ' + timeLeftText;
    
    // Color code based on urgency
    if (timeDiff < 1000 * 60 * 60) { // Less than 1 hour
        timeLeftElement.style.color = 'var(--danger-color)';
    } else if (timeDiff < 1000 * 60 * 60 * 24) { // Less than 1 day
        timeLeftElement.style.color = 'var(--warning-color)';
    } else {
        timeLeftElement.style.color = 'var(--success-color)';
    }
}

// Set timers for all tasks
function setTaskTimers() {
    tasks.forEach(task => setTaskTimer(task));
}

// Set timer for a specific task
function setTaskTimer(task) {
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const timeDiff = dueDate - now;
    
    if (timeDiff <= 0) {
        // Task is already due
        if (task.status === 'upcoming') {
            updateTaskStatus(task.id, 'missed');
        }
        return;
    }
    
    // Set a timer for when the task is due
    setTimeout(() => {
        // When timer expires, move task to ongoing or missed
        if (task.status === 'upcoming') {
            updateTaskStatus(task.id, 'ongoing');
            
            // Show notification
            showNotification(`Task "${task.title}" is now active!`, 'warning');
            sendBrowserNotification(`Task started: ${task.title}`, 'Your task is now active and needs attention.');
        }
    }, timeDiff);
    
    // Set a notification for 1 hour before due time
    if (timeDiff > 60 * 60 * 1000) {
        setTimeout(() => {
            showNotification(`Task "${task.title}" is due in 1 hour!`, 'warning');
            sendBrowserNotification(`Task reminder: ${task.title}`, 'This task is due in 1 hour.');
        }, timeDiff - 60 * 60 * 1000);
    }
}

// Check all tasks and update their status
function checkTasksStatus() {
    const now = new Date();
    
    tasks.forEach(task => {
        const dueDate = new Date(task.dueDate);
        
        // If task is due and still upcoming, move to ongoing
        if (dueDate <= now && task.status === 'upcoming') {
            updateTaskStatus(task.id, 'ongoing');
        }
        
        // If task is overdue by more than 1 hour and still ongoing, move to missed
        if ((now - dueDate) > 60 * 60 * 1000 && task.status === 'ongoing') {
            updateTaskStatus(task.id, 'missed');
            showNotification(`Task "${task.title}" has been missed!`, 'error');
        }
    });
    
    // Re-render tasks to update time left displays
    renderTasks();
}

// Update a task's status
function updateTaskStatus(taskId, newStatus) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].status = newStatus;
        saveTasksToLocalStorage();
        renderTasks();
    }
}

// Complete a task
function completeTask(taskId) {
    updateTaskStatus(taskId, 'completed');
    showNotification('Task completed!', 'success');
}

// Edit a task
function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Fill the form with task data
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-description').value = task.description || '';
    document.getElementById('task-priority').value = task.priority;
    
    // Format the date and time for the datetime-local input
    const dueDate = new Date(task.dueDate);
    const formattedDate = dueDate.toISOString().slice(0, 16);
    document.getElementById('task-due-date').value = formattedDate;
    
    // Delete the original task
    deleteTask(taskId, false);
    
    // Scroll to the form
    document.querySelector('.task-form-container').scrollIntoView({ behavior: 'smooth' });
    
    // Show notification
    showNotification('Task ready for editing. Update and submit the form.', 'info');
}

// Delete a task
function deleteTask(taskId, showConfirmation = true) {
    if (showConfirmation && !confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasksToLocalStorage();
    renderTasks();
    
    if (showConfirmation) {
        showNotification('Task deleted.', 'success');
    }
}

// Save tasks to localStorage
function saveTasksToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Switch between tabs
function switchTab(tabName) {
    // Update active tab button
    tabButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update active tab content
    tabContents.forEach(content => {
        if (content.id === tabName + '-tasks') {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

// Toggle between light and dark themes
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission();
    }
}

// Send browser notification
function sendBrowserNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body,
            icon: 'https://cdn-icons-png.flaticon.com/512/2098/2098402.png'
        });
    }
}

// Show in-app notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notificationArea.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Drag and Drop functionality for task reordering
function dragStart(e) {
    this.classList.add('dragging');
    draggedTask = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.getAttribute('data-id'));
    
    // Log for demonstration of event handling
    console.log('%cDrag started', 'color: blue');
}

function dragEnd() {
    this.classList.remove('dragging');
    const taskLists = document.querySelectorAll('.task-list');
    taskLists.forEach(list => list.classList.remove('drag-over'));
    
    // Log for demonstration of event handling
    console.log('%cDrag ended', 'color: blue');
}

function dragOver(e) {
    e.preventDefault();
    if (this.classList.contains('task-list')) {
        this.classList.add('drag-over');
    } else if (this.closest('.task-list')) {
        this.closest('.task-list').classList.add('drag-over');
    }
    return false;
}

function dragLeave() {
    if (this.classList.contains('task-list')) {
        this.classList.remove('drag-over');
    } else if (this.closest('.task-list')) {
        this.closest('.task-list').classList.remove('drag-over');
    }
}

function drop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Find the target task list
    const targetList = this.classList.contains('task-list') 
        ? this 
        : this.closest('.task-list');
    
    if (!targetList || !draggedTask) return false;
    
    // Remove the drag-over class
    targetList.classList.remove('drag-over');
    
    // Get the target list's corresponding status
    let newStatus;
    if (targetList.id === 'upcoming-task-list') newStatus = 'upcoming';
    else if (targetList.id === 'ongoing-task-list') newStatus = 'ongoing';
    else if (targetList.id === 'completed-task-list') newStatus = 'completed';
    else if (targetList.id === 'missed-task-list') newStatus = 'missed';
    else return false;
    
    // Get the dragged task's ID and update its status
    const taskId = draggedTask.getAttribute('data-id');
    updateTaskStatus(taskId, newStatus);
    
    return false;
}

// Event propagation demonstration
function logEventCapture(e) {
    // Log only for specific elements for demonstration purposes
    if (e.target.classList.contains('task-item') || 
        e.target.classList.contains('task-title') ||
        e.target.classList.contains('btn-complete')) {
        console.log(`%cCAPTURE: ${e.target.nodeName} with class "${e.target.className}"`, 'color: red');
    }
}

function logEventBubble(e) {
    // Log only for specific elements for demonstration purposes
    if (e.target.classList.contains('task-item') || 
        e.target.classList.contains('task-title') ||
        e.target.classList.contains('btn-complete')) {
        console.log(`%cBUBBLE: ${e.target.nodeName} with class "${e.target.className}"`, 'color: green');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp); 