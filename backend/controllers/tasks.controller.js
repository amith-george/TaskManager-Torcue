const mongoose = require('mongoose');
const Task = require('../models/tasks.model');
const responseHandler = require('../utils/responseHandler');

// Create tasks for an employee
const createTask = async (req,res) => {
    const { title, date, deadline, assignedTo } = req.body;
    const io = req.app.get('io');

    try {
        const newTask = await Task.create({
            title,
            date,
            deadline,
            assignedTo,
            status: 'To Do'
        });

        const populatedTask = await newTask.populate('assignedTo', 'email');

        const employeeId = populatedTask.assignedTo._id.toString();
        io.to(employeeId).emit('task_created', populatedTask);

        io.to('admin-room').emit('task_created', populatedTask);

        return responseHandler.success(res, "Task Created successfully.", populatedTask, 201);
    } catch (error) {
        console.error("Error creating task: ", error);
        return responseHandler.error(res, "Server error creating task.", 500, error);
    }
};


// Get all tasks of employees for admin
const getAllTasks = async (req,res) => {
    try {
        const { search, filter, status } = req.query;

        let query = {};

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        if (status === 'completed') {
            query.status = 'Completed';
        } else if (status === 'active') {
            query.status = { $ne: 'Completed' };
        }

        if (filter === 'urgent') {
            const today = new Date();
            
            const tomorrowEnd = new Date(today);
            tomorrowEnd.setDate(today.getDate()+1);
            tomorrowEnd.setHours(23,59,59,999);

            query.deadline = {
                $lte: tomorrowEnd
            };

            query.status = { $ne: 'Completed' };
        }

        const tasks = await Task.find(query)
            .populate('assignedTo', 'email')
            .sort({ deadline: 1 });

            return responseHandler.success(res, "All tasks fetched successfully.", tasks);

    } catch (error) {
        console.error("Error fetching all tasks: ", error);
        return responseHandler.error(res, "Server error fetching all tasks.", 500, error);
    }
};


// Get tasks of an employee (for employee)
const getMyTasks = async (req, res) => {
    try{
        const tasks = await Task.find({ assignedTo: req.user._id })
            .sort({ deadline: 1 });
        
        return responseHandler.success(res, "My tasks fetched successfully.", tasks);
    } catch(error) {
        console.error("Error fetching my tasks: ", error);
        return responseHandler.error(res, "Server error fetching your tasks.",500, error);
    }
};


// Update task of an employee
const updateTaskStatus = async (req,res) => {
    const { status } = req.body;
    const taskId = req.params.id;
    const io = req.app.get('io');

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return responseHandler.error(res, "Invalid Task ID format.", 400);
    }


    try {
        const task = await Task.findById(taskId);

        if(!task){
            return responseHandler.error(res, "Task not found.", 404);
        }

        if (task.assignedTo.toString() !== req.user._id.toString() && req.user.role !== 'admin'){
            return responseHandler.error(res, "Not authorized to update task.", 403);
        }

        if (task.status === 'Completed') {
            return responseHandler.error(res, "Completed tasks cannot be updated", 400);
        }

        task.status = status;
        await task.save();

        await task.populate('assignedTo','email');

        const employeeId = task.assignedTo._id.toString();
        io.to(employeeId).emit('task_updated', task);

        io.to('admin-room').emit('task_updated', task);

        return responseHandler.success(res, "Task updated successfully.", task);
    } catch(error) {
        console.error("Error updating task: ", error);
        return responseHandler.error(res, "Server error updating task.", 500, error);
    }
};


// Delete a task
const deleteTask = async (req, res) => {
    const taskId = req.params.id;
    const io = req.app.get('io');

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return responseHandler.error(res, "Invalid Task ID format.", 400);
    }

    try {
        
        const taskToDelete = await Task.findById(taskId);

        if (!taskToDelete) {
            return responseHandler.error(res, "Task not found.", 404);
        }

        const employeeId = taskToDelete.assignedTo.toString();

        await Task.findByIdAndDelete(taskId);

        io.to(employeeId).emit('task_deleted', taskId);
        io.to('admin-room').emit('task_deleted', taskId);

        return responseHandler.success(res, "Task deleted successfully.");
    } catch (error) {
        return responseHandler.error(res, "Server error deleting task.", 500, error);
    }
};

// Get statistics
const getTaskStats = async (req,res) => {
    try {
        const today = new Date();
        const tomorrowStart = new Date(today);
        tomorrowStart.setDate(today.getDate()+1);
        tomorrowStart.setHours(0,0,0,0);

        const tomorrowEnd = new Date(tomorrowStart);
        tomorrowEnd.setHours(23,59,59,999);

        const [total,completed,active,urgent] = await Promise.all([
            Task.countDocuments({}),
            Task.countDocuments({ status: 'Completed' }),
            Task.countDocuments({ status: { $ne: 'Completed' }}),
            Task.countDocuments({
                status: { $ne: 'Completed' },
                deadline: { $lte: tomorrowEnd }
            })
        ]);

        return responseHandler.success(res, "Task stats fetched successfully.", {
            total,
            completed,
            active,
            urgent
        });
    } catch (error) {
        console.error("Error fetching stats: ", error);
        return responseHandler.error(res, "Server error fetching stats.", 500, error);
    }
};



module.exports = {
    createTask,
    getAllTasks,
    getMyTasks,
    updateTaskStatus,
    deleteTask,
    getTaskStats
};


