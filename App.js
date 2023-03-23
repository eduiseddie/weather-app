import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, Animated, Dimensions } from 'react-native';
import ToastManager, { Toast } from 'toastify-react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Fontisto } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import *  as Location from 'expo-location';
import { useFonts } from 'expo-font';
import moment from 'moment/moment';
import api from './tools/api';
import 'moment/locale/pt-br';
import React from 'react';
moment.locale('pt-br');

export default function App() {

  // VARIABLES
  const [location, setLocation] = React.useState(null);
  const [forecast, setForecast] = React.useState(null);
  const [weather, setWeather] = React.useState(null);
  const [data, setData] = React.useState(null);

  const scrollX = new Animated.Value(0);

  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;

  // FONTS
  const [loaded] = useFonts({
    'Nunito-Regular': require('./assets/fonts/Nunito/static/Nunito-Regular.ttf'),
    'Nunito-Bold': require('./assets/fonts/Nunito/static/Nunito-Bold.ttf'),
  });

  // GET WEATHER
  const getWeather = async () => {
    api.get(`current.json?key=fd49c88d2894495684f122240232303&q=${location.coords.latitude},${location.coords.longitude}&aqi=no&lang=pt`)
      .then((response) => {
        setWeather(response.data);
      })
      .catch((error) => {
        Toast.error(error.response.data.message);
      })
  }

  // GET FORECAST
  const getForecast = async () => {
    api.get(`forecast.json?key=fd49c88d2894495684f122240232303&q=${location.coords.latitude},${location.coords.longitude}&days=3&aqi=no&alerts=no&lang=pt`)
      .then((response) => {
        setForecast(response.data);
        setData(response.data.forecast.forecastday[0].hour);
      })
      .catch((error) => {
        Toast.error(error.response.data.message);
      })
  }

  // FUNCTIONS
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
    if (location) {
      getWeather();
      getForecast();
    }
    getLocation();
  }, [location]);

  if (!loaded) {
    return null;
  }
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} mode="padding">
        <ToastManager />
        <StatusBar style="auto" />
        <View style={styles.header}>
          <Text style={[styles.titleHeader, { fontFamily: 'Nunito-Regular' }]}>{weather?.location.name}, {weather?.location.region}</Text>
          <Text style={[styles.subtitleHeader, { fontFamily: 'Nunito-Regular' }]}>{weather?.location.country}</Text>
        </View>
        <View style={[styles.main, { width: width, height: height / 2 }]}>
          <Text style={[styles.subtitleMain, { fontFamily: 'Nunito-Regular' }]}>{moment().format('LT')}</Text>
          <Text style={[styles.titleMain, { fontFamily: 'Nunito-Bold' }]}>{parseInt(weather?.current.temp_c)}°C</Text>
          <Text style={[styles.subtitleMain, { fontFamily: 'Nunito-Regular' }]}>{weather?.current.condition.text}</Text>
          <View style={styles.wind}>
            <Fontisto name="wind" size={22} color="#01497c" />
            <Text style={[styles.textWind, { fontFamily: 'Nunito-Regular' }]}>{parseInt(weather?.current.wind_kph)}m/s</Text>
          </View>
        </View>
        <Animated.ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={() => {
            Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false })
          }}
          scrollEventThrottle={30}
          contentContainerStyle={{flexGrow: 1}}
        >
          {
            data?.map((item, index) => {
              return (
                <View key={index} style={[styles.block, { width: width / 5, height: height / 2 }]}>
                  <Text style={[styles.subtitleBlock, { fontFamily: 'Nunito-Regular' }]}>{moment(item.time).format('LT')}</Text>
                  <Text style={[styles.titleBlock, { fontFamily: 'Nunito-Bold' }]}>{parseInt(item.temp_c)}°C</Text>
                  <Text style={[styles.subtitleBlock, { fontFamily: 'Nunito-Regular' }]}>{item.condition.text}</Text>
                </View>
              )
            })
          }
        </Animated.ScrollView>
        <View style={styles.footer}>
          {
            forecast?.forecast.forecastday.map((item, index) => {
              return (
                <View key={index} style={styles.item}>
                  <Text style={[styles.itemText, { fontFamily: 'Nunito-Regular', width: '60%' }]}>{moment(item.date).format('dddd')}, {moment(item.date).format('DD MMMM')}</Text>
                  <Text style={[styles.itemText, { fontFamily: 'Nunito-Regular', width: '20%', textAlign: 'center' }]}>{parseInt(item.day.maxtemp_c)}°C</Text>
                  <Text style={[styles.itemText, { fontFamily: 'Nunito-Regular', width: '20%', textAlign: 'center' }]}>{parseInt(item.day.mintemp_c)}°C</Text>
                </View>
              )
            })
          }
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 20,
    width: '100%',
    justifyContent: 'space-around',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleHeader: {
    color: '#01497c',
    fontSize: RFValue(14),
  },
  subtitleHeader: {
    color: '#01497c',
    fontSize: RFValue(12),
  },
  main: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  titleMain: {
    color: '#012a4a',
    fontSize: RFValue(100),
  },
  subtitleMain: {
    color: '#01497c',
    fontSize: RFValue(14),
  },
  wind: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
  },
  textWind: {
    color: '#01497c',
    fontSize: RFValue(15),
    marginLeft: 5,
  },
  footer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  itemText: {
    color: '#012a4a',
    fontSize: RFValue(12),
  },
  block: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  titleBlock: {
    color: '#012a4a',
    fontSize: RFValue(22),
  },
  subtitleBlock: {
    color: '#01497c',
    fontSize: RFValue(8),
    textAlign: 'center',
  },
});
