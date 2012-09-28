var Game = app.Model.Game = Backbone.Model.extend({
    initialize: function () {}
  , urlRoot: function () {return '/api/1/games';}
  , getId: function () {return this.id;}
});

app.Collection.Games = Backbone.Collection.extend({
    model: app.Model.Game
});
