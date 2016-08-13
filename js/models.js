var $        = require('zepto-browserify').$;
var Backbone = require('backbone');
Backbone.$ = $;

// Individual items
var ItemModel = Backbone.Model.extend({
  defaults: {
    owner: null,
    label: 'A Thing',
    latitude: 0,
    longitude: 0
  }
});

// A list of items.
var ItemCollection = Backbone.Collection.extend({
  model: ItemModel
});

// Return objects offered by this module.
module.exports = {
  ItemModel: ItemModel,
  ItemCollection: ItemCollection
};