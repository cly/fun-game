app.Page.UserPage = app.Page.StandardPage.extend({
    initialize: function () {
        this.getUser().on('change', this.renderMainInitial, this);
    }
  , destroy: function () {
        this.undelegateEvents();
        this.getUser().off('change', this.renderMainInitial, this);
    }
  , el: '#main-container'
  , getLayoutType: function () {return app.Page.UserPage.getLayoutType();}
  , getUser: function () {
        return this.options.user;
    }
  , renderMain: function () {
    }
  , renderMainInitial: function () {
        this.renderMain();
    }
}, {
    getLayoutType: function () {return 'standard';}
});

