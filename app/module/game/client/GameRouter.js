app.Router.Game = Backbone.Router.extend({
    routes: {
        '': 'showGame'
      , '/': 'showGame'
    }
  , showGame: function () {
        var gameData = app.session.betable;
        var pdGame = new app.Model.PDGame(gameData);
        var pdGameView = new app.Page.GamePage({game: pdGame});
    }
});
