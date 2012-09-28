var GamePage = app.Page.GamePage = app.Page.StandardPage.extend({
    initialize: function () {
        this.renderMain();
        this.getGame().on('change', this.renderMain, this);
        this.getGame().on('error', this.renderError, this);
    }
  , events: {
        'click #cooperate': 'onCooperateClick'
      , 'click #betray': 'onBetrayClick'
    }
  , destroy: function () {
        this.undelegateEvents();
        this.getGame().off('change', this.renderMain, this);
    }
  , el: '#page'
  , getGame: function () {return this.options.game;}
  , renderError: function () {
        console.log('error');
    }
  , renderMain: function () {
        this.$el.html(app.template('game', 'main', {game: this.getGame()}));
    }
  , onBetrayClick: function () {
        this.getGame().betray();
        return false;
    }
  , onCooperateClick: function () {
        this.getGame().cooperate();
        return false;
    }
}, {
    getLayoutType: function () {return 'standard';}
});
