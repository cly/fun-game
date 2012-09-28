app.Router.Game = Backbone.Router.extend({
    routes: {
        '': 'showGame'
      , '/': 'showGame'
    }
  , showGame: function () {
        // Instantiate a new model.
        var gameData = app.session.betable;
        var pdGame = new app.Model.PDGame(gameData);
        pdGame.cooperate();
        var pdGameView = new app.Page.GamePage({game: pdGame});
        // Bind model to the view.
        // Render view.
    }
});
