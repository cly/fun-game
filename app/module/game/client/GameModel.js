var PDGame = app.Model.PDGame = Backbone.Model.extend({
    initialize: function () {
console.log(JSON.stringify(arguments));
        this._myWinnings = 0;
        this._friendWinnings = 0;
    }
  , betData: function () {
        return {
            currency: 'GBP'
          , economy: 'sandbox'
          , wager: '1.00'
        };
    }
  , betray: function () {
        var self = this;
        this._myAction = 'betray';
        if (!this._betrayGame) {
            var conf = this.get('betray');
            var game = new Betable(conf.gameId, conf.accessToken);
            this._betrayGame = game;
        }
        self._betrayGame.bet(self.betData(), function (d, xhr) {
            self._friendAction = d.outcome;
            self._myPayout = d.payout;
            self._myWinnings += parseFloat(self._myPayout);
            self._friendWinnings += parseFloat(self.getFriendPayout());
            self.trigger('change');
        }, function (e) {
            console.log('error' + e);
            self.trigger('error');
        })
    }
  , cooperate: function () {
        var self = this;
        this._myAction = 'cooperate';
        if (!this._cooperateGame) {
            var conf = this.get('cooperate');
            var game = new Betable(conf.gameId, conf.accessToken);
            this._cooperateGame = game;
        }
        this._cooperateGame.bet(this.betData(), function (d, xhr) {
            self._friendAction = d.outcome;
            self._myPayout = d.payout;
            self._myWinnings += parseFloat(self._myPayout);
            self._friendWinnings += parseFloat(self.getFriendPayout());
            self.trigger('change');
        }, function (e) {
            console.log('error' + e);
            self.trigger('error');
        })
    }
  , getMyWinnings: function () {return this._myWinnings;}
  , getFriendWinnings: function () {return this._friendWinnings;}
  , getMyAction: function () {return this._myAction;}
  , getFriendAction: function () {return this._friendAction;}
  , getMyPayout: function () {
        return this._myPayout;
    }
  , getFriendPayout: function () {
        var ma = this.getMyAction();
        var fa = this.getFriendAction();
        if (ma == 'cooperate' && fa == 'cooperate') {
            return '5.00';
        } else if (ma == 'cooperate' && fa == 'betray') {
            return '2.00';
        } else if (ma == 'betray' && fa == 'betray') {
            return '0.00';
        } else if (ma == 'betray' && fa == 'cooperate') {
            return '0.00';
        } else {
            return '0.00';
        }
    }
});
