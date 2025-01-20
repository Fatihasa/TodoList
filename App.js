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

export default function App() {
  const [task, setTask] = useState('');
  const [category, setCategory] = useState('Personal');
  const [deadline, setDeadline] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [taskItems, setTaskItems] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // Search query state

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setIsDarkMode(savedTheme === 'dark');
      }
    };
    loadTheme();
  }, []);

  const handleAddTask = () => {
    if (task.trim()) {
      const timestamp = new Date().getTime(); // Ensure unique key
      const formattedDeadline = deadline ? new Date(deadline).toLocaleString() : 'No Deadline';
      setTaskItems([
        ...taskItems,
        {
          text: task.trim(),
          category,
          deadline: formattedDeadline,
          completed: false,
          key: `${task.trim()}_${timestamp}`,
        },
      ]);
      setTask('');
      setCategory('Personal');
      setDeadline(null);
    }
  };

  const toggleTaskCompletion = (index) => {
    const itemsCopy = [...taskItems];
    itemsCopy[index].completed = !itemsCopy[index].completed;
    setTaskItems(itemsCopy);
  };

  const clearCompletedTasks = () => {
    setTaskItems(taskItems.filter((item) => !item.completed));
  };

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const renderItem = ({ item, drag, isActive }) => (
    <TouchableOpacity
      style={[styles(isDarkMode).taskContainer, isActive && styles(isDarkMode).activeTask]}
      onLongPress={drag}
      onPress={() => toggleTaskCompletion(taskItems.findIndex((t) => t.key === item.key))}
    >
      <Task text={`${item.text} (${item.deadline})`} category={item.category} isCompleted={item.completed} />
    </TouchableOpacity>
  );

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
            data={filteredTasks} // Use filtered tasks here
            renderItem={renderItem}
            keyExtractor={(item) => item.key}
            onDragEnd={({ data }) => setTaskItems(data)}
            ListEmptyComponent={() => (
              <View style={styles(isDarkMode).emptyStateContainer}>
                <Text style={styles(isDarkMode).emptyMessage}>
                  {searchQuery ? 'No matching tasks found!' : 'No tasks for today! Add a task to get started.'}
                </Text>
              </View>
            )}
          />
        </View>

        {taskItems.some((item) => item.completed) && (
          <TouchableOpacity style={styles(isDarkMode).clearButton} onPress={clearCompletedTasks}>
            <Text style={styles(isDarkMode).clearButtonText}>Clear Completed Tasks</Text>
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
    taskContainer: { marginVertical: 5, borderRadius: 10, padding: 10, backgroundColor: isDarkMode ? '#1F1F1F' : '#FFF' },
    activeTask: { backgroundColor: isDarkMode ? '#333333' : '#EFEFEF' },
    emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyMessage: { fontSize: 16, fontWeight: 'bold', color: isDarkMode ? '#AAA' : '#333', textAlign: 'center' },
    clearButton: { marginVertical: 10, alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#FF6B6B', borderRadius: 8 },
    clearButtonText: { fontSize: 16, color: '#FFF', fontWeight: 'bold' },
    writeTaskWrapper: { padding: 10, backgroundColor: isDarkMode ? '#222' : '#FFF', borderTopWidth: 1, borderColor: isDarkMode ? '#444' : '#DDD' },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 5 },
    input: { flex: 1, marginRight: 10, padding: 10, backgroundColor: isDarkMode ? '#333' : '#FFF', borderRadius: 8, color: isDarkMode ? '#FFF' : '#000' },
    picker: { flex: 1, color: isDarkMode ? '#FFF' : '#000' },
    datePickerButton: { padding: 10, borderRadius: 8, backgroundColor: isDarkMode ? '#444' : '#EEE' },
    datePickerText: { color: isDarkMode ? '#FFF' : '#000' },
    addWrapper: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: isDarkMode ? '#333' : '#FFF', borderRadius: 25, borderWidth: 1, borderColor: isDarkMode ? '#444' : '#DDD' },
    addText: { fontSize: 24, color: isDarkMode ? '#FFF' : '#000' },
  });
