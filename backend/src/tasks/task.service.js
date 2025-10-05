const { db } = require('../firebase');

const TASK_COLLECTION = 'tasks';

async function getAllTasks() {
  try {
    const snapshot = await db.collection(TASK_COLLECTION).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting tasks:', error);
    throw error;
  }
}

async function createTask(taskData) {
  try {
    const taskRef = db.collection(TASK_COLLECTION).doc();
    const assignedEmails = taskData.assignedUsers.map(u => u.email);
    await taskRef.set({ ...taskData, assignedEmails });
    return { id: taskRef.id, ...taskData };
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

module.exports = { getAllTasks, createTask, updateTask, deleteTask };
