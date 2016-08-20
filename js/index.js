var token    = require('../token');
var $        = require('zepto-browserify').$;
var _        = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var mapboxgl = require('mapbox-gl');
var Models   = require('./models');
var Views    = require('./views');
var Server   = require('./server-dummy');

mapboxgl.accessToken = token.MAPBOX_TOKEN;
var map = new mapboxgl.Map({
  container: 'map-view',
  style: 'mapbox://styles/mapbox/streets-v9'
});

// ---
// Item System
var groundCollectionInstance = new Models.ItemCollection();
var groundViewInstance = new Views.GroundView(groundCollectionInstance);

// Called when client first recieves list of items in the area.
Server.on('server update zone items', function (data) {
  data.forEach(function (itemModel, index) {
    var itemMarker = new Views.ItemMarkerView(map, itemModel)
  });
});

Server.on('server update nearby items', function (data) {
  groundCollectionInstance.reset();
  data.forEach(function (itemModel, index) {
    groundCollectionInstance.add(itemModel);
  });
});

var inventoryModelInstance = new Models.ItemCollection(); 
var inventoryViewInstance = new Views.InventoryView(inventoryModelInstance);

// Add debug items
inventoryViewInstance.collection.add({label: 'Another Thing!'});

// Debug System
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

// Create a marker to represent the user.
var marker = new mapboxgl.Marker($('<div id="player-marker"></div>')[0])
  .setLngLat([0, 0])
  .addTo(map);

// Center on user.
var navOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 2000
};
var watchId = navigator.geolocation.watchPosition(positionUpdate, positionError, navOptions);

// !!! DEBUG !!!
var updateCount = 0;

function positionUpdate (position) {

  // Update debug UI
  updateDebug(position);

  // !!! DEBUG !!!
  if(!updateCount /*&& position.coords.accuracy < 20*/) {
    updateCount++;

    Server.emit('client init', {
      centerLng: position.coords.longitude,
      centerLat: position.coords.latitude,
      spread   : 0.0001
    });
  }

  $('#loading-view').addClass('hidden');
  $('#map-view').removeClass('hidden');
  setTimeout(function () {
    $('#debug-view').removeClass('hidden');
  }, 500);

  marker.setLngLat([position.coords.longitude, position.coords.latitude])
  map.flyTo({
    center: [position.coords.longitude, position.coords.latitude], 
    zoom: 19
  });

  // Alert the server of my updated position.
  Server.emit('client update', {
    latitude : position.coords.latitude, 
    longitude: position.coords.longitude
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

var items = [];
function scatterItems (centerLng, centerLat, spread) {
  var totalItems = 10,
    itemModel, itemView, latitude, longitude;
  for(var i=0; i<totalItems; i++) {
    latitude = centerLat + (Math.random() * spread) * (Math.random() < 0.5 ? 1 : -1);
    longitude = centerLng + (Math.random() * spread) * (Math.random() < 0.5 ? 1 : -1);
    itemModel = new Models.ItemModel({
      label: 'Item ' + i,
      latitude: latitude,
      longitude: longitude
    });
    itemView = new ItemMarker(map, itemModel);
    items.push(itemModel);
  }
}
