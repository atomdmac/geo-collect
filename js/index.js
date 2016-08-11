mapboxgl.accessToken = MAPBOX_TOKEN;
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v9'
});

// Create a marker to represent the user.
var marker = new mapboxgl.Marker()
  .setLngLat([0, 0])
  .addTo(map);

// Center on user.
var navOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 2000
};
var watchId = navigator.geolocation.watchPosition(positionUpdate, positionError, navOptions);

function positionUpdate (position) {

  // Update debug UI
  updateDebug(position);
  document.getElementById('debug-freshness').innerHTML = ':)';

  marker.setLngLat([position.coords.longitude, position.coords.latitude])
  map.flyTo({
    center: [position.coords.longitude, position.coords.latitude], 
    zoom: 15
  });
}

function positionError (error) {
  document.getElementById('debug-freshness').innerHTML = ':(';
}

function updateDebug (position) {
  document.getElementById('debug-latitude').innerHTML = position.coords.latitude;
  document.getElementById('debug-longitude').innerHTML = position.coords.longitude;
  document.getElementById('debug-accuracy').innerHTML = position.coords.accuracy;
}