const express = require('express');
const router = express.Router();
const {
    createTask,
    getAllTasks,
    getMyTasks,
    updateTaskStatus,
    deleteTask,
    getTaskStats
} = require('../controllers/tasks.controller');

const { protect, adminOnly } = require('../middleware/authMiddleware');


/* ADMIN ROUTES */

//Create task for employee
router.post('/', protect, adminOnly, createTask);

//Get all tasks of employees
router.get('/', protect, adminOnly, getAllTasks);

//Delete a task
router.delete('/:id', protect, adminOnly, deleteTask);

//Get stats
router.get('/stats', protect, adminOnly, getTaskStats);


/* EMPLOYEE ROUTES */

// Get tasks for employee
router.get('/my-tasks', protect, getMyTasks );

// Update status
router.patch('/:id/status', protect, updateTaskStatus);


module.exports = router;
