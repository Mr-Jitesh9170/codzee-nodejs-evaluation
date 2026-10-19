const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
      validate: {
        validator: value => value.trim().length >= 3,
        message: 'Title must contain at least 3 non-whitespace characters'
      }
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    completed: {
      type: Boolean,
      default: false
    },
    dueDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Task', taskSchema)
