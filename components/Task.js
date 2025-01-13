import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Task = ({ text, category, isCompleted }) => {
  const categoryColors = {
    Personal: '#FFD700',
    Work: '#87CEFA',
    Shopping: '#32CD32',
    Others: '#FF6347',
  };

  return (
    <View style={[styles.item, isCompleted && styles.completedItem]}>
      <View style={styles.itemLeft}>
        <View style={[styles.square, { backgroundColor: categoryColors[category] || '#55BCF6' }]}></View>
        <Text style={[styles.itemText, isCompleted && styles.completedText]}>{text}</Text>
      </View>
      <Text style={styles.category}>{category}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  completedItem: {
    opacity: 0.5,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  square: {
    width: 24,
    height: 24,
    borderRadius: 5,
    marginRight: 15,
  },
  itemText: {
    maxWidth: '70%',
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  category: {
    fontStyle: 'italic',
    color: '#888',
  },
});

export default Task;
