import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Task from './components/Task';

export default function App() {
  const [task, setTask] = useState('');
  const [category, setCategory] = useState('Personal');
  const [taskItems, setTaskItems] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

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
      setTaskItems([...taskItems, { text: task.trim(), category, completed: false, key: `${taskItems.length}` }]);
      setTask('');
      setCategory('Personal');
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
      <Task text={item.text} category={item.category} isCompleted={item.completed} />
    </TouchableOpacity>
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

        <View style={{ flex: 1 }}>
          <DraggableFlatList
            contentContainerStyle={{ paddingBottom: 60 }} // Adjust padding for better layout
            data={taskItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.key}
            onDragEnd={({ data }) => setTaskItems(data)}
            ListEmptyComponent={() => (
              <Text style={styles(isDarkMode).emptyMessage}>No tasks yet. Add a new task!</Text>
            )}
          />
        </View>

        {taskItems.some((item) => item.completed) && (
          <TouchableOpacity style={styles(isDarkMode).clearButton} onPress={clearCompletedTasks}>
            <Text style={styles(isDarkMode).clearButtonText}>Clear Completed Tasks</Text>
          </TouchableOpacity>
        )}

        <View style={styles(isDarkMode).writeTaskWrapper}>
          <TextInput
            style={styles(isDarkMode).input}
            placeholder="Write a task"
            placeholderTextColor={isDarkMode ? '#999' : '#666'}
            value={task}
            onChangeText={(text) => setTask(text)}
          />
          <Picker
            selectedValue={category}
            style={styles(isDarkMode).picker}
            onValueChange={(value) => setCategory(value)}
          >
            {categories.map((cat, index) => (
              <Picker.Item key={index} label={cat} value={cat} />
            ))}
          </Picker>
          <TouchableOpacity onPress={handleAddTask}>
            <View style={styles(isDarkMode).addWrapper}>
              <Text style={styles(isDarkMode).addText}>+</Text>
            </View>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}

const styles = (isDarkMode) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#121212' : '#F5F5F5',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 50,
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDarkMode ? '#FFF' : '#000',
    },
    themeToggleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    themeToggleText: {
      fontSize: 16,
      color: isDarkMode ? '#FFF' : '#000',
      marginRight: 10,
    },
    taskContainer: {
      backgroundColor: isDarkMode ? '#1F1F1F' : '#FFF',
      marginVertical: 5,
      borderRadius: 10,
      padding: 10,
    },
    activeTask: {
      backgroundColor: isDarkMode ? '#333333' : '#EFEFEF',
    },
    emptyMessage: {
      textAlign: 'center',
      marginTop: 20,
      fontSize: 16,
      color: isDarkMode ? '#AAA' : '#666',
    },
    clearButton: {
      marginVertical: 10,
      alignSelf: 'center',
      padding: 10,
      backgroundColor: '#FF6B6B',
      borderRadius: 5,
    },
    clearButtonText: {
      color: '#FFF',
      fontWeight: 'bold',
    },
    writeTaskWrapper: {
      padding: 10, // Reduced padding
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDarkMode ? '#222' : '#fff',
      borderTopWidth: 1,
      borderColor: isDarkMode ? '#444' : '#ddd',
    },
    input: {
      paddingVertical: 12,
      paddingHorizontal: 15,
      backgroundColor: isDarkMode ? '#333' : '#FFF',
      borderRadius: 60,
      borderColor: isDarkMode ? '#444' : '#C0C0C0',
      borderWidth: 1,
      flex: 1,
      marginRight: 10,
      color: isDarkMode ? '#FFF' : '#000',
    },
    picker: {
      width: 100,
      color: isDarkMode ? '#FFF' : '#000',
    },
    addWrapper: {
      width: 60,
      height: 60,
      backgroundColor: isDarkMode ? '#333' : '#FFF',
      borderRadius: 60,
      justifyContent: 'center',
      alignItems: 'center',
      borderColor: isDarkMode ? '#444' : '#C0C0C0',
      borderWidth: 1,
    },
    addText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDarkMode ? '#FFF' : '#000',
    },
  });
