# Advanced Task Management System

A feature-rich task scheduling and management application built with modern JavaScript concepts. This application allows users to create, schedule, and manage tasks with automatic status updates and intuitive UI interactions.

![Advanced Task Manager Screenshot](https://via.placeholder.com/800x450.png?text=Advanced+Task+Manager)

## Features

### Core Functionality
- **Task Creation & Scheduling**: Create tasks with titles, descriptions, priority levels, and due dates/times
- **Automatic Sorting**: Tasks automatically sorted based on priority (High, Medium, Low)
- **Task Execution & Auto-Completion**: Tasks automatically move to "Ongoing" when they reach their scheduled time
- **Status Tracking**: Separate tabs for Upcoming, Ongoing, Completed, and Missed tasks
- **Time Tracking**: Visual countdown for each task showing remaining time

### Advanced JavaScript Implementations
- **DOM Manipulation**: Dynamic UI updates when tasks are modified
- **Event Handling**: Efficient event delegation and event propagation logging
- **Asynchronous JavaScript**: Simulated API calls with loading spinners and setTimeout for task scheduling
- **Promise-based Operations**: Async/await pattern for data operations
- **Local Storage**: Persistent task data across page reloads
- **Error Handling**: Try/catch blocks for handling various error scenarios

### Bonus Features
- **Drag-and-Drop Task Reordering**: Move tasks between different status categories using HTML5 Drag API
- **Dark Mode Toggle**: Switch between light and dark themes with persistent preference
- **Push Notifications**: Browser notifications for task reminders and status changes
- **Responsive Design**: Works seamlessly across devices of all sizes

## Installation & Setup

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No additional dependencies or installations required

### Running the Application

#### Option 1: Local Setup
1. Clone this repository to your local machine
   ```
   git clone https://github.com/yourusername/advanced-task-manager.git
   ```
2. Navigate to the project directory
   ```
   cd advanced-task-manager
   ```
3. Open `index.html` in your web browser

#### Option 2: Quick Start
Simply double-click the `index.html` file to open it in your default browser.

## Usage Guide

1. **Creating a Task**:
   - Fill in the task creation form at the top of the page
   - Provide a title, optional description, priority level, and due date/time
   - Click "Add Task" to create the task

2. **Managing Tasks**:
   - Tasks will automatically move between tabs based on their status
   - Use the tab navigation to view tasks in different states
   - Click "Complete" on a task to mark it as completed
   - Drag tasks between different tabs to manually change their status

3. **Editing & Deleting**:
   - Click the "Edit" button on a task to load it into the form for editing
   - Click the "Delete" button to remove a task permanently

4. **Dark Mode**:
   - Toggle the switch in the header to switch between light and dark themes

## Implementation Details

The application demonstrates several advanced JavaScript concepts:

- **Event Bubbling & Capturing**: Event propagation is logged to the console for educational purposes
- **Closure & Scope**: Proper encapsulation of functionality
- **Asynchronous Processing**: Simulated API calls and timed operations
- **Template Usage**: HTML templates for efficient DOM manipulation
- **IIFE Pattern**: Proper namespace management
- **Modern ES6+ Features**: Arrow functions, template literals, destructuring, etc.

## Browser Support

This application works in all modern browsers that support ES6+ features:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgements

- Font Awesome for the icons
- Flaticon for the notification icons 