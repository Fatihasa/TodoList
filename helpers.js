// helpers.js

/**
 * Toggle the current theme and return the new theme.
 * @param {boolean} isDarkMode - Current theme mode.
 * @param {object} AsyncStorage - AsyncStorage object for storing the theme.
 * @returns {Promise<string>} - The new theme mode ('dark' or 'light').
 */
export const toggleTheme = async (isDarkMode, AsyncStorage) => {
  const newTheme = !isDarkMode ? 'dark' : 'light';
  await AsyncStorage.setItem('theme', newTheme);
  return newTheme;
};

/**
 * Add a new task to the task list.
 * @param {Array} taskItems - The current list of tasks.
 * @param {Object} newTask - The new task object to add.
 * @returns {Array} - The updated task list.
 */
export const addTask = (taskItems, newTask) => {
  if (!newTask.text.trim()) return taskItems;
  return [
    ...taskItems,
    {
      ...newTask,
      completed: false,
      favorite: false,
      subtasks: [],
      expanded: false,
      key: `${newTask.text.trim()}_${Date.now()}`,
    },
  ];
};

/**
 * Remove completed tasks from the task list.
 * @param {Array} taskItems - The current list of tasks.
 * @returns {Object} - An object containing the updated task list and removed tasks.
 */
export const clearCompletedTasks = (taskItems) => {
  const completedTasks = taskItems.filter((task) => task.completed);
  const remainingTasks = taskItems.filter((task) => !task.completed);
  return { remainingTasks, completedTasks };
};

/**
 * Undo the last removal of completed tasks.
 * @param {Array} taskItems - The current list of tasks.
 * @param {Array} lastRemovedTasks - The last removed tasks to restore.
 * @returns {Array} - The updated task list.
 */
export const undoLastAction = (taskItems, lastRemovedTasks) => {
  return [...taskItems, ...lastRemovedTasks];
};
