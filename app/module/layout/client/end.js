// Start layout.
_.extend(app, new app.View.Layout());
app.start();

// Handle site navigation.
Backbone.history.start({pushState: true});
