const { db } = require("../firebase");

const tasksCollection = db.collection("tasks");

const getAllTasksForUser = async (userId) => {
    const snapshot = await tasksCollection
        .where("userId", "==", userId)
        .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const getTaskById = async (id, userId) => {
    const docRef = tasksCollection.doc(id);
    const taskDoc = await docRef.get();
    if (!taskDoc.exists || taskDoc.data().userId !== userId)
        throw new Error("Task not found or not owned by user");
    return { id: taskDoc.id, ...taskDoc.data() };
};

const createTask = async (taskData) => {
    const docRef = await tasksCollection.add(taskData);
    return { id: docRef.id, ...taskData };
};

const updateTask = async (id, taskData, userId) => {
    const docRef = tasksCollection.doc(id);
    const taskDoc = await docRef.get();
    if (!taskDoc.exists || taskDoc.data().userId !== userId)
        throw new Error("Task not found or not owned by user");
    await docRef.update(taskData);
    return { id, ...taskData };
};

const deleteTask = async (id, userId) => {
    const docRef = tasksCollection.doc(id);
    const taskDoc = await docRef.get();
    if (!taskDoc.exists || taskDoc.data().userId !== userId)
        throw new Error("Task not found or not owned by user");
    await docRef.delete();
    return { message: `Task ${id} deleted successfully` };
};

module.exports = {
    getAllTasksForUser,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
};
