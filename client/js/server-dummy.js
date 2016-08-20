// Server Dummy

var Models = require('./models');

var Server = {};

Server.callbacks = {
  'client init'               : [],
  'client update'             : [],
  'server update nearby items': [],
  'server update zone items'  : []
};

Server.on = function (event, callback) {
  if(Server.callbacks[event]) {
    Server.callbacks[event].push(callback);
  }
}

Server.emit = function (event, data) {
  if(Server.callbacks[event]) {
    Server.callbacks[event].forEach(function (callback, index) {
      callback(data);
    });
  }
}

Server.items = [];

function initialize () {

  // When client connects, scatter items around them.
  Server.on('client init', function (data) {
    Server.items = scatterItems(data.centerLng, data.centerLat, data.spread);
    Server.emit('server update zone items', Server.items);
  });

  // When client position updates, figure out which items are close to them.
  Server.on('client update', function (data) {
    var nearbyItems = Server.items.filter(function (item, index) {
      var lngDiff = item.get('longitude') - data.longitude,
          latDiff = item.get('latitude')  - data.latitude,
          diff    = Math.abs(Math.sqrt(lngDiff * lngDiff + latDiff * latDiff));
      if(diff < 0.00005) return true;
    });

    // Alert the client that there are some items close to them (or not).
    Server.emit('server update nearby items', nearbyItems);
  })
}

function scatterItems (centerLng, centerLat, spread) {
  var items = [],
      totalItems = 5,
      itemModel, itemView, latitude, longitude;
  for(var i=0; i<totalItems; i++) {
    latitude = centerLat + (Math.random() * spread) * (Math.random() < 0.5 ? 1 : -1);
    longitude = centerLng + (Math.random() * spread) * (Math.random() < 0.5 ? 1 : -1);
    itemModel = new Models.ItemModel({
      label: 'Item ' + i,
      latitude: latitude,
      longitude: longitude
    });
    // itemView = new ItemMarker(map, itemModel);
    items.push(itemModel);
  }
  return items;
}

// Initialize server
initialize();

// Return Server
module.exports =  Server;