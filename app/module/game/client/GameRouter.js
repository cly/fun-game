app.Router.Game = Backbone.Router.extend({
    routes: {
        '/': 'showGame'
    }
  , showGame: function (id) {
        console.log('showgame' + id);
    }
});
