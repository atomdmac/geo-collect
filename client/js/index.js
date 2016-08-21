var token    = require('../token');
var $        = require('zepto-browserify').$;
var _        = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var mapboxgl = require('mapbox-gl');
var Models   = require('./models');
var Views    = require('./views');
var ngeohash = require('ngeohash');

var user,
    marker,
    coords, 
    map, 
    currentGeohashes = {}, 
    geohashes, 
    mapBounds,
    geoOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 2000
    },
    geohashPrecision = 7,
    socket = io();

// Item System
var groundCollectionInstance = new Models.ItemCollection();
var groundViewInstance = new Views.GroundView(groundCollectionInstance);

var inventoryModelInstance = new Models.ItemCollection(); 
var inventoryViewInstance = new Views.InventoryView(inventoryModelInstance);

// Debug System
var updateCount = 0;
var DebugModel = Backbone.Model.extend({
  defaults: {
    'latitude': 0,
    'longitude': 0,
    'accuracy': 0,
    'freshness': false
  },
  initialize: function () {},
});

var debugModelInstance = new DebugModel;

var DebugView = Backbone.View.extend({
  model: debugModelInstance,
  initialize: function () {
    // TODO: Create DebugView element dynamically.
    this.el = $('#debug-view');

    this.listenTo(debugModelInstance, 'change', this.render);
  },
  render: function () {
    $('#debug-latitude',  this.el).html(this.model.get('latitude'));
    $('#debug-longitude', this.el).html(this.model.get('longitude'));
    $('#debug-accuracy',  this.el).html(this.model.get('accuracy'));
    $('#debug-freshness', this.el).html(this.model.get('freshness') ? ':-)' : ':-(');
  }
});

var debugViewInstance = new DebugView;

// Init connection.
socket.on('login confirmed', onLoginSuccess);
// TODO: Add a login creen.
socket.emit('login', 'IMATESTUSER');

function onLoginSuccess(msg) {
  user = msg;
  localStorage.username = user.name;
  navigator.geolocation.getCurrentPosition(buildMap);
}

function buildMap(position) {
  coords = [position.coords.longitude, position.coords.latitude];
  mapboxgl.accessToken = token.MAPBOX_TOKEN;
  mapOptions = {
    container: 'map-view',
    style: 'mapbox://styles/zatch/ciro86ffa001ag8nfwckgk2r3',
    center: coords,
    minZoom: 17,
    maxZoom: 19,
    scrollZoom: false,
    boxZoom: false,
//    dragPan: false,
    keyboard: false,
    doubleClickZoom: false
  };
  map = new mapboxgl.Map(mapOptions);
  map.on('load', function () {
    $('#loading-view').addClass('hidden');
    $('#map-view').removeClass('hidden');
    setTimeout(function () {
      $('#debug-view').removeClass('hidden');
    }, 500);
    
    socket.on('geohash update', onGeohashUpdate);
    socket.emit('map loaded');

    // Create a marker to represent the user.
    marker = new mapboxgl.Marker($('<div id="player-marker"></div>')[0])
      .setLngLat([0, 0])
      .addTo(map);

    mapWatch = navigator.geolocation.watchPosition(positionUpdate, positionError, geoOptions);
    positionUpdate(position);
  });
}

function onGeohashUpdate(msg) {
  var newItems,
      lcv = 0,
      iCoords;
  if (!!msg['sample-item'].length) {
    newItems = msg['sample-item'];
  }
  else {
    newItems = [msg];
  }

  newItems.forEach(function (itemData, index) {
    console.log('makin it!');
    

    new Views.ItemMarkerView(map, new Models.ItemModel({
      label: itemData.uuid,
      latitude: itemData.coords.latitude,
      longitude: itemData.coords.longitude
    }));

  });
}

function positionUpdate (position) {

  // Update debug UI
  updateDebug(position);

  // !!! DEBUG !!!
  if(!updateCount /*&& position.coords.accuracy < 20*/) {
    updateCount++;
  }

  coords = [position.coords.longitude, position.coords.latitude];

  mapBounds = map.getBounds(); // Get the bounds of the visible map
  geohashes = ngeohash.bboxes(mapBounds._sw.lat, mapBounds._sw.lng, mapBounds._ne.lat, mapBounds._ne.lng, geohashPrecision); // Get all geohashes within the bounds
  
  // Leave geohashes we aren't in anymore.
  for (var geohash in currentGeohashes) {
    if(!geohashes.includes(geohash)) {
      leaveGeohash(geohash);
    }
  }
  
  // Subscribe to any new hashes we've moved into.
  geohashes.forEach(function(geohash) {
    if(!currentGeohashes[geohash]) {
      joinGeohash(geohash);
    }
  });

  // TODO: Calculate nearby items.
  /*
  var nearbyItems = Server.items.filter(function (item, index) {
    var lngDiff = item.get('longitude') - data.longitude,
        latDiff = item.get('latitude')  - data.latitude,
        diff    = Math.abs(Math.sqrt(lngDiff * lngDiff + latDiff * latDiff));
    if(diff < 0.00005) return true;
  });
  */

  marker.setLngLat([position.coords.longitude, position.coords.latitude]);
  map.jumpTo({
    center: [position.coords.longitude, position.coords.latitude], 
    zoom: 19
  });

}

function positionError (error) {
  debugModelInstance.set('freshness', false);
}

function updateDebug (position) {
  debugModelInstance.set('latitude',  position.coords.latitude);
  debugModelInstance.set('longitude', position.coords.longitude);
  debugModelInstance.set('accuracy',  position.coords.accuracy);
  debugModelInstance.set('freshness', true);
}

function leaveGeohash(sGeohash) {
  console.log('no longer in:',sGeohash);

  // Request to unsubscribe from geohash updates from server.
  socket.emit('leave geohash', sGeohash);

  // TODO: Remove geohash item markers from map.

  // Delete geohash from local store.
  delete currentGeohashes[sGeohash];
}

function joinGeohash(sGeohash) {
  // Don't attempt to join geohahses we've already joined.
  if (!!currentGeohashes[sGeohash]) {
    throw 'Already joined geohash ' + sGeohash + '. Join aborted.';
    return;
  }

  console.log('now in:',sGeohash);

  // Set up placeholder object to be populated by server response.
  currentGeohashes[sGeohash] = {};

  // Request to subscribe to geohash updates from server.
  socket.emit('join geohash', sGeohash);
}