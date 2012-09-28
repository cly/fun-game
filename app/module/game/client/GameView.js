var GamePage = app.Page.GamePage = app.Page.StandardPage.extend({
    initialize: function () {
        this.getGame().on('change', this.renderMainInitial, this);
    }
  , destroy: function () {
        this.undelegateEvents();
        this.getGame().off('change', this.renderMainInitial, this);
    }
  , el: '#main-container'
  , getLayoutType: function () {return GamePage.getLayoutType();}
  , getGame: function () {return this.options.game;}
  , renderMain: function () {
    }
  , renderMainInitial: function () {
        this.renderMain();
    }
}, {
    getLayoutType: function () {return 'standard';}
});

