define([
  'dojo/_base/declare',

  'jimu/BaseWidget'
], function(
  declare,
  BaseWidget
) {

  var clazz = declare([BaseWidget], {
    //these two properties are defined in the BaseWiget
    baseClass: 'say-hello',
    name: 'SayHello',

    // add additional properties here

    postCreate: function() {
      // summary:
      //      Overrides method of same name in dijit._Widget.
      // tags:
      //      private
      this.inherited(arguments);
      console.log('SayHello::postCreate', arguments);

      // add additional post constructor logic here
    },

    // start up child widgets
    startup: function() {
      // summary:
      //      Overrides method of same name in dijit._Widget.
      // tags:
      //      private
      this.inherited(arguments);
      console.log('SayHello::startup', arguments);
    },

    onOpen: function() {
      // summary:
      //      Overrides method of same name in jimu._BaseWidget.
      console.log('SayHello::onOpen', arguments);

      // add code to execute whenever the widget is opened
    },

    onClose: function() {
      // summary:
      //      Overrides method of same name in jimu._BaseWidget.
      console.log('SayHello::onClose', arguments);

      // add code to execute whenever the widget is closed
    }
  });

  return clazz;
});