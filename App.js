import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import { useRef, useState, useEffect } from 'react';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { db } from './components/config';


export default function App() {
  const [markers, setMarkers] = useState([])
  const [region, setRegion] = useState({
    latitude: 55,
    longitude: 12,
    latitudeDelta: 20,
    longitudeDelta: 20,
  })

  const mapView = useRef(null) //ref til mapview 
  const locationSubscription = useRef(null) //når vi lukker appen skal den ikke lytte mere
  const [selectedImage, setSelectedImage] = useState(null);


  useEffect(() => {
    async function startListening(){
      let {status} = await Location.requestForegroundPermissionsAsync()
      if(status !== 'granted'){
        alert('Permission not granted')
        return
      }
      locationSubscription.current = await Location.watchPositionAsync({
        distanceInterval: 100,
        accuracy: Location.Accuracy.High,

      }, (lokation)=>{
        const newRegion = {
          latitude: lokation.coords.latitude,
          longitude: lokation.coords.longitude,
          latitudeDelta: 20,
          longitudeDelta: 20,
        }
        setRegion(newRegion) //Flytter kortet til den nye region
        if(mapView.current){
          mapView.current.animateToRegion(newRegion)
        }
      })
    }
    startListening()
    return ()=>{
      if(locationSubscription.current){
        locationSubscription.current.remove()
      }
    }
  }, [])

  async function selectImage() {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }
  
    let pickerResult = await ImagePicker.launchImageLibraryAsync();
  
    if (pickerResult.canceled === true) {
      return;
    }
  
    setSelectedImage(pickerResult.uri);
  }
  
  function addMarker(data){
    const {latitude, longitude} = data.nativeEvent.coordinate;
    const newMarker = {
      coordinate: {latitude, longitude},
      key: data.timeStamp,
      title: 'New Marker',
      image: selectedImage
    };
    setMarkers([...markers, newMarker]);
    setSelectedImage(null);  // Reset the selected image
  }

function onMarkerPressed(text){
  alert("You pressed "+text)
}


  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onLongPress={(data) => {
          selectImage().then(() => {
            if (selectedImage) {
              addMarker(data);
            }
          });
        }}        
        >
          {
            markers.map(marker => (
              <Marker
                coordinate={marker.coordinate}
                key={marker.key}
                title={marker.title}
                onPress={() => onMarkerPressed(marker.title)}
                image={marker.image ? { uri: marker.image } : null}
              />
            ))            
          }
      </MapView>
      </View>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
});