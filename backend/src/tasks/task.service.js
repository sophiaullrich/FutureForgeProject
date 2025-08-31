const { db } = require('../firebase');
const { v4: uuidv4 } = require('uuid');

const TASK_COLLECTION = 'taskCollection';

async function getAllTasks() {
  try {
    const snapshot = await db.collection(TASK_COLLECTION).get();
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return tasks;
  } catch (error) {
    console.error('Error getting tasks:', error);
    throw error;
  }
}

async function createTask(taskData) {
  try {
    const taskRef = db.collection(TASK_COLLECTION).doc();
    await taskRef.set(taskData);
    const createdTask = { id: taskRef.id, ...taskData };
    return createdTask;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

async function updateTask(taskId, updateData) {
  try {
    const taskRef = db.collection(TASK_COLLECTION).doc(taskId);
    await taskRef.update(updateData);
    const updatedDoc = await taskRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
}

async function deleteTask(taskId) {
  try {
    await db.collection(TASK_COLLECTION).doc(taskId).delete();
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}

module.exports = {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
};
