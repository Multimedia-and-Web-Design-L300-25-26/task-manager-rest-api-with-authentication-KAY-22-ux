import Task from "../models/Task.js";

export const createTask = async (request, response) => {
  try {
    // Get task data from request body
    const { title, description } = request.body;

    // Validate that title is provided (required field)
    if (!title) {
      return response.status(400).json({
        success: false,
        message: "Please provide a task title",
      });
    }

    // Create new task with owner set to authenticated user
    const newTask = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : "",
      owner: req.user._id, // Owner is the authenticated user
    });

    // Return created task
    response.status(201).json({
      success: true,
      message: "Task created successfully",
      task: newTask,
    });
  } catch (error) {
    console.error("Create task error:", error);
    response.status(500).json({
      success: false,
      message: "Error creating task",
    });
  }
};

export const getTasks = async (request, response) => {
  try {
    // Find all tasks where owner matches authenticated user ID
    // Sort by creation date (newest first)
    const tasks = await Task.find({ owner: request.user._id })
      .sort({ createdAt: -1 })
      .populate("owner", "name email");

    // Return tasks
    response.status(200).json({
      success: true,
      message: "Tasks retrieved successfully",
      count: tasks.length,
      tasks: tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    response.status(500).json({
      success: false,
      message: "Error retrieving tasks",
    });
  }
};

export const deleteTask = async (request, response) => {
  try {
    // Get task ID from URL parameters
    const taskId = request.params.id;

    // Find the task by ID
    const task = await Task.findById(taskId);

    // Check if task exists
    if (!task) {
      return response.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if authenticated user is the owner of the task
    // Convert to string for comparison since they are ObjectIds
    if (task.owner.toString() !== request.user._id.toString()) {
      return response.status(403).json({
        success: false,
        message: "You are not authorized to delete this task",
      });
    }

    // Delete the task
    await Task.findByIdAndDelete(taskId);

    // Return success response
    response.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    response.status(500).json({
      success: false,
      message: "Error deleting task",
    });
  }
};

export const updateTask = async (request, response) => {
  try {
    // Get task ID from URL parameters
    const taskId = request.params.id;

    // Get update data from request body
    const { title, description, completed } = req.body;

    // Find the task by ID
    const task = await Task.findById(taskId);

    // Check if task exists
    if (!task) {
      return response.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if authenticated user is the owner of the task
    if (task.owner.toString() !== req.user._id.toString()) {
      return reponse.status(403).json({
        success: false,
        message: "You are not authorized to update this task",
      });
    }

    // Update task fields if provided
    if (title) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (completed !== undefined) task.completed = completed;

    // Save updated task
    await task.save();

    // Return updated task
    response.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: task,
    });
  } catch (error) {
    console.error("Update task error:", error);
    response.status(500).json({
      success: false,
      message: "Error updating task",
    });
  }
};
