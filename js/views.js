var $        = require('zepto-browserify').$;
var _        = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var mapboxgl = require('mapbox-gl');

// Generic Sidebar view
var SideBarView = Backbone.View.extend({
  events: {
    'click nav': 'toggleOpen'
  },
  initialize: function (collection) {
    this.ul = $('ul', this.el);
    this.collection = collection;
    this.listenTo(this.collection, 'update', this.render);
  },
  render: function () {
    var self = this;
    this.ul.empty();
    this.collection.forEach(function (item, index) {
      var li = self.template(item.toJSON());
      self.ul.append(li);
    });
  },
  toggleOpen: function () {
    this.$el.toggleClass('off');
  }
});

// Display items on the ground near the player.
var GroundView = SideBarView.extend({
  el: '#ground-view',
  template: _.template($('#item-list-ground-view').html())
});

// Display items carried by the player.
var InventoryView = SideBarView.extend({
  el: '#inventory-view',
  template: _.template($('#item-list-inventory-view').html())
});

var ItemMarkerView = Backbone.View.extend({
  initialize: function (map, itemModel) {
    this.map = map;
    this.itemModel = itemModel;
    this.marker = new mapboxgl.Marker(this.el);
    this.marker.setLngLat([
      this.itemModel.get('longitude'),
      this.itemModel.get('latitude')
    ]);

    this.listenTo(itemModel, 'move', this.move);
    this.listenTo(itemModel, 'pick-up', this.remove);
    this.render();
  },
  move: function () {
    this.marker.setLngLat([
      this.itemModel.get('longitude'), 
      this.itemModel.get('latitude')
    ]);
  },
  render: function () {
    this.marker.addTo(this.map);
  }
});

// Return objects offered by this module.
module.exports = {
  SideBarView: SideBarView,
  GroundView: GroundView,
  InventoryView: InventoryView,
  ItemMarkerView: ItemMarkerView
};