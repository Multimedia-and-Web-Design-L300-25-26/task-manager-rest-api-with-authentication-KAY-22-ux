import express from "express";
import Task from "../models/Task.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all task routes
router.use(authMiddleware);

// POST /api/tasks
router.post("/", async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Please provide a task title",
      });
    }

    const newTask = new Task({
      title,
      description: description || "",
      owner: req.user._id,
    });

    await newTask.save();

    // Return the task directly
    res.status(201).json(newTask);
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({
      message: "Error creating task",
      error: error.message,
    });
  }
});

// GET /api/tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({ owner: req.user._id }).sort({
      createdAt: -1,
    });

    // Return array directly
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({
      message: "Error retrieving tasks",
      error: error.message,
    });
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req, res) => {
  try {
    const taskId = req.params.id;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    if (task.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to delete this task",
      });
    }

    await Task.findByIdAndDelete(taskId);

    res.status(200).json(task);
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      message: "Error deleting task",
      error: error.message,
    });
  }
});

export default router;