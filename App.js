import ToastManager, { Toast } from 'toastify-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { Fontisto } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import *  as Location from 'expo-location';
import api from './tools/api';
import React from 'react';

export default function App() {

  // VARIABLES
  const [location, setLocation] = React.useState(null);
  const [weather, setWeather] = React.useState(null);

  // GET WEATHER
  const getWeather = async () => {
    api.get(`current.json?key=fd49c88d2894495684f122240232303&q=${location.coords.latitude},${location.coords.longitude}&aqi=no&lang=pt`)
      .then((response) => {
        setWeather(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        Toast.error(error.response.data.message);
      })
  }

  // GET LOCATION
  function getLocation() {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Toast.error('Permission to access location was denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }

  // USE EFFECT
  React.useEffect(() => {
    if (location) getWeather();
    getLocation();
  }, [location]);

  return (
    <View style={styles.container}>
      <ToastManager />
      <StatusBar style="auto" />
      <Text>{weather?.location.name}, {weather?.location.region}</Text>
      <Text>{weather?.location.country}</Text>
      <Text>{weather?.current.temp_c}°C</Text>
      <Text>{weather?.current.condition.text}</Text>
      <View>
        <Fontisto name="wind" size={25} color="#3a5a40" />
        <Text>{weather?.current.wind_kph}m/s</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
