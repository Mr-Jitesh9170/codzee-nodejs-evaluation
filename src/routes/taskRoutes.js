
const express = require("express");
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const router = express.Router();

router.route("/")
  .post(createTask)
  .get(getTasks);

router.route("/:id")
  .get(getTaskById)
  .patch(updateTask)
  .delete(deleteTask);

module.exports = router;
