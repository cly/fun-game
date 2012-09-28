app.Router.Game = Backbone.Router.extend({
    routes: {
        'game/:id': 'showGame'
    }
  , showGame: function (id) {
        console.log('showgame' + id);
    }
});
