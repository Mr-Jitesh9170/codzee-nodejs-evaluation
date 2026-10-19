const Task = require('../models/Task')

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }

    return res.status(200).json({
      success: true,
      data: task
    })
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID'
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch task'
    })
  }
}

const updateTask = async (req, res) => {
  try {
    const allowedFields = ['title', 'description', 'completed', 'dueDate']
    const updates = {}

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one valid field to update'
      })
    }

    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    })

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }

    return res.status(200).json({
      success: true,
      data: task
    })
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID'
      })
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update task'
    })
  }
}

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id)

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    })
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID'
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to delete task'
    })
  }
}

// Create a task
const createTask = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body
    if (typeof title !== 'string' || title.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Title must contain at least 3 characters'
      })
    }

    if (
      dueDate !== undefined &&
      dueDate !== null &&
      Number.isNaN(Date.parse(dueDate))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid due date'
      })
    }

    const task = await Task.create({
      title,
      description,
      dueDate
    })

    return res.status(201).json({
      success: true,
      data: task
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create task'
    })
  }
}

// Get all tasks

const getTasks = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    )

    const filter = {}

    if (req.query.completed !== undefined) {
      if (!['true', 'false'].includes(req.query.completed)) {
        return res.status(400).json({
          success: false,
          message: 'completed must be true or false'
        })
      }

      filter.completed = req.query.completed === 'true'
    }

    const skip = (page - 1) * limit

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Task.countDocuments(filter)
    ])

    return res.status(200).json({
      success: true,
      count: tasks.length,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: tasks
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks'
    })
  }
}

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
}
