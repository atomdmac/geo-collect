mapboxgl.accessToken = MAPBOX_TOKEN;
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v9'
});

// Center on user.
navigator.geolocation.getCurrentPosition(positionUpdate, positionError);

function positionUpdate (position) {
	console.log(position.coords);
	map.flyTo({
		center: [position.coords.longitude, position.coords.latitude], 
		zoom: 15
	});
}

function positionError (error) {
	alert(error.message);
}