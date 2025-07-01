const { v4: uuidv4 } = require('uuid');

class TaskService {
  constructor() {
    this.tasks = [];
  }

  validateTask(task, isUpdate = false) {
    const requiredFields = ['title', 'dueDate', 'assignee'];
    if (!isUpdate) {
      for (let field of requiredFields) {
        if (!task[field]) return `${field} is required`;
      }
    }
    return null; 
  }

  create(taskDto) {
    const error = this.validateTask(taskDto);
    if (error) throw { status: 400, message: error };

    const task = {
      id: uuidv4(),
      title: taskDto.title,
      dueDate: taskDto.dueDate,
      assignee: taskDto.assignee,
      assigneeType: taskDto.assigneeType || 'team',
      priority: taskDto.priority || 'Medium',
      status: taskDto.status || 'To Do'
    };

    this.tasks.push(task);
    return task;
  }

  findAll() {
    return this.tasks;
  }

  findById(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) throw { status: 404, message: 'Task not found' };
    return task;
  }

  update(id, updates) {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) throw { status: 404, message: 'Task not found' };

    const error = this.validateTask(updates, true);
    if (error) throw { status: 400, message: error };

    this.tasks[index] = { ...this.tasks[index], ...updates };
    return this.tasks[index];
  }

  delete(id) {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) throw { status: 404, message: 'Task not found' };
    this.tasks.splice(index, 1);
  }

  assign(id, payload) {
    const task = this.findById(id);
    const { assignee } = payload;

    if (!assignee) {
      throw { status: 400, message: 'Assignee is required' };
    }

    task.assignee = assignee;
    return task;
  }
}

module.exports = new TaskService();
