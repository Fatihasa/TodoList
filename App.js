
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Task from './components/Task';
import { MaterialIcons } from '@expo/vector-icons';

const categoryColors = {
  Personal: '#FFE4E1', // Pink
  Work: '#E6F7FF', // Light Blue
  Shopping: '#FFFACD', // Yellow
  Others: '#E8F5E9', // Light Green
};

export default function App() {
  const [task, setTask] = useState('');
  const [category, setCategory] = useState('Personal');
  const [deadline, setDeadline] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [taskItems, setTaskItems] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastRemovedTasks, setLastRemovedTasks] = useState([]);
  const [subtaskText, setSubtaskText] = useState('');

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setIsDarkMode(savedTheme === 'dark');
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const handleAddTask = () => {
    if (task.trim()) {
      const timestamp = new Date().getTime();
      const formattedDeadline = deadline ? new Date(deadline).toISOString() : null;
      setTaskItems([
        ...taskItems,
        {
          text: task.trim(),
          category,
          deadline: formattedDeadline,
          completed: false,
          favorite: false,
          subtasks: [],
          expanded: false,
          key: `${task.trim()}_${timestamp}`,
        },
      ]);
      setTask('');
      setCategory('Personal');
      setDeadline(null);
    }
  };

  const handleAddSubtask = (taskIndex) => {
    if (subtaskText.trim()) {
      const updatedTasks = [...taskItems];
      updatedTasks[taskIndex].subtasks.push({
        text: subtaskText.trim(),
        completed: false,
        key: `${subtaskText.trim()}_${new Date().getTime()}`,
      });
      setTaskItems(updatedTasks);
      setSubtaskText('');
    }
  };

  const toggleTaskCompletion = (index) => {
    const itemsCopy = [...taskItems];
    itemsCopy[index].completed = !itemsCopy[index].completed;
    setTaskItems(itemsCopy);
  };

  const toggleSubtaskCompletion = (taskIndex, subtaskIndex) => {
    const updatedTasks = [...taskItems];
    updatedTasks[taskIndex].subtasks[subtaskIndex].completed = !updatedTasks[taskIndex].subtasks[subtaskIndex].completed;
    setTaskItems(updatedTasks);
  };

  const toggleTaskFavorite = (index) => {
    const itemsCopy = [...taskItems];
    itemsCopy[index].favorite = !itemsCopy[index].favorite;
    setTaskItems(itemsCopy);
  };

  const toggleTaskExpansion = (index) => {
    const updatedTasks = [...taskItems];
    updatedTasks[index].expanded = !updatedTasks[index].expanded;
    setTaskItems(updatedTasks);
  };

  const clearCompletedTasks = () => {
    const completedTasks = taskItems.filter((item) => item.completed);
    const remainingTasks = taskItems.filter((item) => !item.completed);

    setLastRemovedTasks([...completedTasks]); // Save a shallow copy of completed tasks
    setTaskItems(remainingTasks);
  };

  const undoLastAction = () => {
    if (lastRemovedTasks.length > 0) {
      setTaskItems((prevTasks) => [...prevTasks, ...lastRemovedTasks]); // Append last removed tasks to the current tasks
      setLastRemovedTasks([]);
    }
  };

  const renderItem = ({ item, drag, isActive }) => {
    const isOverdue = item.deadline && new Date(item.deadline) < new Date() && !item.completed;

    return (
      <View
        style={[
          styles(isDarkMode).taskRow,
          isActive && styles(isDarkMode).activeTask,
          isOverdue && styles(isDarkMode).overdueTask,
        ]}
      >
        <View
          style={[
            styles(isDarkMode).taskContainer,
            { backgroundColor: categoryColors[item.category] || (isDarkMode ? '#1F1F1F' : '#FFF') },
          ]}
        >
          <TouchableOpacity
            onLongPress={drag}
            onPress={() => toggleTaskCompletion(taskItems.findIndex((t) => t.key === item.key))}
          >
            <Task
              text={`${item.text}${item.deadline ? ` (Due: ${new Date(item.deadline).toLocaleDateString()})` : ''}`}
              category={item.category}
              isCompleted={item.completed}
            />
          </TouchableOpacity>
          <View style={styles(isDarkMode).taskActions}>
            <TouchableOpacity onPress={() => toggleTaskFavorite(taskItems.findIndex((t) => t.key === item.key))}>
              <MaterialIcons
                name={item.favorite ? 'star' : 'star-border'}
                size={24}
                color={item.favorite ? '#FFD700' : isDarkMode ? '#FFF' : '#000'}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleTaskExpansion(taskItems.findIndex((t) => t.key === item.key))}>
              <MaterialIcons
                name={item.expanded ? 'expand-less' : 'expand-more'}
                size={24}
                color={isDarkMode ? '#FFF' : '#000'}
              />
            </TouchableOpacity>
          </View>
        </View>
        {item.expanded && (
          <View style={styles(isDarkMode).subtasksContainer}>
            {item.subtasks.map((subtask, subIndex) => (
              <View key={subtask.key} style={styles(isDarkMode).subtaskRow}>
                <TouchableOpacity onPress={() => toggleSubtaskCompletion(taskItems.findIndex((t) => t.key === item.key), subIndex)}>
                  <Text style={subtask.completed ? styles(isDarkMode).subtaskCompleted : styles(isDarkMode).subtaskText}>
                    {subtask.text}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles(isDarkMode).addSubtaskRow}>
              <TextInput
                style={styles(isDarkMode).subtaskInput}
                placeholder="Add a subtask"
                placeholderTextColor={isDarkMode ? '#999' : '#666'}
                value={subtaskText}
                onChangeText={(text) => setSubtaskText(text)}
              />
              <TouchableOpacity onPress={() => handleAddSubtask(taskItems.findIndex((t) => t.key === item.key))}>
                <MaterialIcons name="add" size={24} color={isDarkMode ? '#FFF' : '#000'} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  const filteredTasks = taskItems.filter((task) =>
    task.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = ['Personal', 'Work', 'Shopping', 'Others'];

  return (
    <GestureHandlerRootView style={styles(isDarkMode).container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <View style={styles(isDarkMode).header}>
          <Text style={styles(isDarkMode).headerTitle}>Today's Tasks</Text>
          <View style={styles(isDarkMode).themeToggleContainer}>
            <Text style={styles(isDarkMode).themeToggleText}>
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>
        </View>

        <TextInput
          style={styles(isDarkMode).searchBar}
          placeholder="Search tasks..."
          placeholderTextColor={isDarkMode ? '#999' : '#666'}
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />

        <View style={{ flex: 1 }}>
          <DraggableFlatList
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
            data={filteredTasks}
            renderItem={renderItem}
            keyExtractor={(item) => item.key}
            onDragEnd={({ data }) => setTaskItems(data)}
          />
        </View>

        {taskItems.some((item) => item.completed) && (
          <TouchableOpacity style={styles(isDarkMode).clearButton} onPress={clearCompletedTasks}>
            <Text style={styles(isDarkMode).clearButtonText}>Clear Completed Tasks</Text>
          </TouchableOpacity>
        )}

        {lastRemovedTasks.length > 0 && (
          <TouchableOpacity style={styles(isDarkMode).undoButton} onPress={undoLastAction}>
            <Text style={styles(isDarkMode).undoButtonText}>Undo</Text>
          </TouchableOpacity>
        )}

        <View style={styles(isDarkMode).writeTaskWrapper}>
          <View style={styles(isDarkMode).row}>
            <TextInput
              style={styles(isDarkMode).input}
              placeholder="Write a task"
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
              value={task}
              onChangeText={(text) => {
                if (text.length <= 50) setTask(text);
              }}
            />
            <TouchableOpacity onPress={handleAddTask}>
              <View style={styles(isDarkMode).addWrapper}>
                <Text style={styles(isDarkMode).addText}>+</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles(isDarkMode).row}>
            <Picker
              selectedValue={category}
              style={styles(isDarkMode).picker}
              onValueChange={(value) => setCategory(value)}
            >
              {categories.map((cat, index) => (
                <Picker.Item key={index} label={cat} value={cat} />
              ))}
            </Picker>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <View style={styles(isDarkMode).datePickerButton}>
                <Text style={styles(isDarkMode).datePickerText}>
                  {deadline ? new Date(deadline).toLocaleDateString() : 'Set Deadline'}
                </Text>
              </View>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDeadline(selectedDate);
                }}
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}

const styles = (isDarkMode) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: isDarkMode ? '#121212' : '#F5F5F5' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: isDarkMode ? '#FFF' : '#000' },
    themeToggleContainer: { flexDirection: 'row', alignItems: 'center' },
    themeToggleText: { fontSize: 16, marginRight: 10, color: isDarkMode ? '#FFF' : '#000' },
    searchBar: {
      padding: 10,
      marginHorizontal: 20,
      marginBottom: 10,
      backgroundColor: isDarkMode ? '#333' : '#FFF',
      borderRadius: 8,
      color: isDarkMode ? '#FFF' : '#000',
      borderWidth: 1,
      borderColor: isDarkMode ? '#444' : '#DDD',
    },
    taskRow: {
      flexDirection: 'column',
      marginVertical: 5,
    },
    taskContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 10,
      borderRadius: 10,
    },
    taskActions: { flexDirection: 'row', alignItems: 'center' },
    subtasksContainer: {
      paddingLeft: 20,
      paddingTop: 10,
    },
    subtaskRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
    subtaskText: { fontSize: 16, color: isDarkMode ? '#FFF' : '#000' },
    subtaskCompleted: { fontSize: 16, color: '#888', textDecorationLine: 'line-through' },
    addSubtaskRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    subtaskInput: {
      flex: 1,
      padding: 10,
      backgroundColor: isDarkMode ? '#333' : '#FFF',
      borderRadius: 8,
      color: isDarkMode ? '#FFF' : '#000',
      borderWidth: 1,
      borderColor: isDarkMode ? '#444' : '#DDD',
    },
    writeTaskWrapper: {
      padding: 10,
      backgroundColor: isDarkMode ? '#222' : '#FFF',
      borderTopWidth: 1,
      borderColor: isDarkMode ? '#444' : '#DDD',
    },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 5 },
    input: {
      flex: 1,
      marginRight: 10,
      padding: 10,
      backgroundColor: isDarkMode ? '#333' : '#FFF',
      borderRadius: 8,
      color: isDarkMode ? '#FFF' : '#000',
    },
    picker: { flex: 1, color: isDarkMode ? '#FFF' : '#000' },
    datePickerButton: { padding: 10, borderRadius: 8, backgroundColor: isDarkMode ? '#444' : '#EEE' },
    datePickerText: { color: isDarkMode ? '#FFF' : '#000' },
    addWrapper: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 25 },
    addText: { fontSize: 24, color: isDarkMode ? '#FFF' : '#000' },
    clearButton: {
      marginVertical: 10,
      alignSelf: 'center',
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: '#FF6B6B',
      borderRadius: 8,
    },
    clearButtonText: { fontSize: 16, color: '#FFF', fontWeight: 'bold' },
    undoButton: {
      marginVertical: 10,
      alignSelf: 'center',
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: '#4CAF50',
      borderRadius: 8,
    },
    undoButtonText: { fontSize: 16, color: '#FFF', fontWeight: 'bold' },
  });
