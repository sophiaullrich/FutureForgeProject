const { db } = require("../firebase");

const tasksCollection = db.collection("tasks");

const getAllTasks = async () => {
    const snapshot = await tasksCollection.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const getTaskById = async (id) => {
    const docRef = tasksCollection.doc(id);
    const taskDoc = await docRef.get();
    if (!taskDoc.exists) throw new Error("Task not found");
    return { id: taskDoc.id, ...taskDoc.data() };
};

const createTask = async (taskData) => {
    const docRef = await tasksCollection.add(taskData);
    return { id: docRef.id, ...taskData };
};

const updateTask = async (id, taskData) => {
    const docRef = tasksCollection.doc(id);
    await docRef.update(taskData);
    return { id, ...taskData };
};

const deleteTask = async (id) => {
    const docRef = tasksCollection.doc(id);
    await docRef.delete();
    return { message: `Task ${id} deleted successfully` };
};

module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
};
