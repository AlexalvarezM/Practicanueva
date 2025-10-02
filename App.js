import { StyleSheet, Text, View, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { db } from './src/database/firebaseconfig';
import { collection, getDocs } from 'firebase/firestore';
import Productos from './src/views/Productos';

export default function App() {
  
  return (
    <>
      <Productos/>
    </>
  );
}