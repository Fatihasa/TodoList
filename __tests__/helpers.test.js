// helpers.test.js
import {
    toggleTheme,
    addTask,
    clearCompletedTasks,
    undoLastAction,
  } from '../helpers';
  
  describe('Helpers', () => {
    describe('toggleTheme', () => {
      it('toggles from light to dark mode', async () => {
        const AsyncStorageMock = { setItem: jest.fn() };
        const result = await toggleTheme(false, AsyncStorageMock);
        expect(result).toBe('dark');
        expect(AsyncStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
      });
  
      it('toggles from dark to light mode', async () => {
        const AsyncStorageMock = { setItem: jest.fn() };
        const result = await toggleTheme(true, AsyncStorageMock);
        expect(result).toBe('light');
        expect(AsyncStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
      });
    });
  
    describe('addTask', () => {
      it('does not add a task if the text is empty', () => {
        const taskItems = [];
        const newTask = { text: '', category: 'Work', deadline: '2025-01-01' };
        const updatedTasks = addTask(taskItems, newTask);
        expect(updatedTasks).toHaveLength(0);
      });
  
      it('adds a task with all properties', () => {
        const taskItems = [];
        const newTask = { text: 'New Task', category: 'Work', deadline: '2025-01-01' };
        const updatedTasks = addTask(taskItems, newTask);
  
        expect(updatedTasks).toHaveLength(1);
        expect(updatedTasks[0]).toMatchObject({
          text: 'New Task',
          category: 'Work',
          deadline: '2025-01-01',
          completed: false,
          favorite: false,
          subtasks: [],
          expanded: false,
        });
      });
  
      it('retains existing tasks when adding a new one', () => {
        const taskItems = [{ text: 'Existing Task', completed: false }];
        const newTask = { text: 'New Task', category: 'Work' };
        const updatedTasks = addTask(taskItems, newTask);
        expect(updatedTasks).toHaveLength(2);
        expect(updatedTasks[0].text).toBe('Existing Task');
        expect(updatedTasks[1].text).toBe('New Task');
      });
    });
  
    describe('clearCompletedTasks', () => {
      it('removes only completed tasks', () => {
        const taskItems = [
          { text: 'Task 1', completed: true },
          { text: 'Task 2', completed: false },
        ];
        const { remainingTasks, completedTasks } = clearCompletedTasks(taskItems);
  
        expect(remainingTasks).toHaveLength(1);
        expect(remainingTasks[0]).toMatchObject({ text: 'Task 2', completed: false });
        expect(completedTasks).toHaveLength(1);
        expect(completedTasks[0]).toMatchObject({ text: 'Task 1', completed: true });
      });
  
      it('does nothing if no tasks are completed', () => {
        const taskItems = [{ text: 'Task 1', completed: false }];
        const { remainingTasks, completedTasks } = clearCompletedTasks(taskItems);
  
        expect(remainingTasks).toEqual(taskItems);
        expect(completedTasks).toHaveLength(0);
      });
    });
  
    describe('undoLastAction', () => {
      it('restores removed tasks', () => {
        const taskItems = [{ text: 'Task 2', completed: false }];
        const lastRemovedTasks = [{ text: 'Task 1', completed: true }];
        const updatedTasks = undoLastAction(taskItems, lastRemovedTasks);
  
        expect(updatedTasks).toHaveLength(2);
        expect(updatedTasks).toEqual(
          expect.arrayContaining([
            { text: 'Task 2', completed: false },
            { text: 'Task 1', completed: true },
          ])
        );
      });
  
      it('does nothing if no tasks were removed', () => {
        const taskItems = [{ text: 'Task 2', completed: false }];
        const lastRemovedTasks = [];
        const updatedTasks = undoLastAction(taskItems, lastRemovedTasks);
  
        expect(updatedTasks).toEqual(taskItems);
      });
    });
  });
  