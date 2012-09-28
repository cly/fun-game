var GamePage = app.Page.GamePage = app.Page.StandardPage.extend({
    initialize: function () {
        this.renderMainInitial();
        this.getGame().on('change', this.renderMain, this);
        this.getGame().on('error', this.renderError, this);
    }
  , events: {
        'click #cooperate-button': 'onCooperateClick'
      , 'click #betray': 'onBetrayClick'
    }
  , destroy: function () {
        this.undelegateEvents();
        this.getGame().off('change', this.renderMainInitial, this);
    }
  , el: '#page'
  , getGame: function () {return this.options.game;}
  , renderError: function () {
        console.log('error');
    }
  , renderMain: function () {
        console.log('rendermain');
    }
  , renderMainInitial: function () {
    }
  , onBetrayClick: function () {
    }
  , onCooperateClick: function () {
    }
}, {
    getLayoutType: function () {return 'standard';}
});

