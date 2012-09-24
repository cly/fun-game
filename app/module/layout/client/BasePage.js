app.Page.BasePage = Backbone.View.extend({

});

app.Page.StandardPage = app.Page.BasePage.extend({
    getPrimaryNav: function () {
        return this.primaryNav;
    }
  , getTertiaryNav: function () {
        return this.tertiaryNav;
    }
  , renderFooter: function () {
        this.footer = new app.View.Footer({el: '#footer'});
        this.footer.render();
    }
  , renderInitial: function () {
        if (!app.currentPage) {
            this.renderMainLoading();
            this.renderPrimaryNav();
            this.renderTertiaryNav();
            this.renderFooter();
        } else {
            this.renderMainLoading();
            this.renderPrimaryNav();
            this.renderTertiaryNav();
            this.renderFooter();
            app.currentPage.destroy();
        }
    }
  , renderMainLoading: function () {
        this.$('#main-body').html('');
    }
  , renderPrimaryNav: function () {
        if (app.currentPage instanceof app.Page.StandardPage
         && app.currentPage.getPrimaryNav() instanceof app.View.PrimaryNav) {
            this.primaryNav = app.currentPage.getPrimaryNav();
        } else {
            this.primaryNav = new app.View.PrimaryNav({el: '#primary-nav'});
            this.primaryNav.render();
        }
    }
  , renderTertiaryNav: function () {
        this.tertiaryNav = new app.View.TertiaryNav({el: '#tertiary-nav'});
        this.tertiaryNav.render();
    }
});

app.View.SecondaryNav = Backbone.View.extend({
    getUser: function () {
        return this.options.user;
    }
  , render: function () {
        var html = '';
        this.$el.html(html);
        return this;
    }
  , renderCurrentPathname: function (pathname) {
        var clazz = 'active';
        this.$('a').parent().removeClass('active');
        this.$('a[href="' + pathname + '"]').parent().addClass('active');
    }
});

app.View.TertiaryNav = Backbone.View.extend({
    initialize: function () {
    }
  , render: function () {
        var html = '';
        if (this.$el.html() !== html) {
            this.$el.html(html);
        }
        return this;
    }
});

app.View.PrimaryNav = Backbone.View.extend({
    initialize: function () {
    }
  , events: {
        'click #nav-account-link': 'toggleMenuDropDown'
    }
  , render: function () {
        var html = app.template('misc', 'primaryNav', {user: app.session.getUser()});
        if (this.$el.html() !== html) {
            this.$el.html(html);
        }
        return this;
    }
  , toggleMenuDropDown: function (event) {
        this.$('.menu-dropdown-list').toggle();
    }
});

app.View.Footer = Backbone.View.extend({
    render: function () {
        var html = app.template('misc', 'footer');
        if (this.$el.html() !== html) {
            this.$el.html(html);
        }
        return this;
    }
});
