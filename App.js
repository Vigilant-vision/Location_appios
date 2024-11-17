import React, { useState,useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import * as Location from 'expo-location';

export default function App() {
  const [errorMsg, setErrorMsg] = useState(null);
  const [serverMessage, setServerMessage] = useState('');
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Request location permissions on app start
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
    })();

    const interval = setInterval(sendLocationToServer, 1000);
    return () => clearInterval(interval); 
  }, []);

  // Function to send location to the server
  const sendLocationToServer = async () => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;

      const locationResponse = await fetch('http://13.53.214.212:3000/retrieve-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latitude, longitude }),
      });

      const locationData = await locationResponse.json();
      setServerMessage(locationData.message || 'Location sent successfully');
    } catch (error) {
      console.error('Error sending location:', error);
      setServerMessage('Error occurred while sending location');
    }
  };
  useEffect(() => {
    const animateRotation = () => {
      rotateAnim.setValue(0);
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000, 
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => animateRotation());     };

    animateRotation();
  }, [rotateAnim]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'], 
  });

  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <Animated.View
          style={[
            styles.animatedBorder,
            { transform: [{ rotate: rotateInterpolate }] },
          ]}
        />
        <View style={styles.textContainer}>
          <Text style={styles.errorText}>{errorMsg || 'Sending location to server...'}</Text>
          <Text style={styles.serverMessage}>{serverMessage}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', 
    backgroundColor: '#fff', 
  },
  circle: {
    width: 200, 
    height: 200,
    borderRadius: 100, 
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative', 
  },
  animatedBorder: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 100, 
    borderWidth: 10,
    borderColor: '#5bc0de', 
    backgroundColor: 'transparent', 
  },
  textContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d9534f',
    textAlign: 'center',
  },
  serverMessage: {
    fontSize: 16,
    color: '#5bc0de',
    textAlign: 'center',
  },
});
