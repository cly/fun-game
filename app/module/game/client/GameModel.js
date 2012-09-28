var Game = app.Model.Game = Backbone.Model.extend({
    initialize: function () {}
  , urlRoot: function () {return '/api/1/games';}
  , getId: function () {return this.id;}
});

app.Collection.Games = Backbone.Collection.extend({
    model: app.Model.Game
});

var BetableGame = app.Model.BetableGame = Backbone.Model.extend({
    initialize: function () {}
  , getGameId: function () {return this.option.gameId;}
  , getAccessToken: function () {return this.option.accessToken;}

});

var config = __APP.session.betable;//.get('betable');
console.log(config);
var sdk = new Betable(config.gameId, config.accessToken);
sdk.canIGamble(function(d) { console.log(d); });

var betData = {
    currency: 'GBP'
  , economy: 'sandbox'
  , wager: '1.00'
};

var onBetResponse = function (d, xhr) {
    console.log(d);
};

sdk.bet(betData, onBetResponse, function (e) {
    console.log(e);
});
