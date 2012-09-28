var SECOND = 1000;
var MINUTE = 1000 * 60;
var HOUR = 1000 * 60 * 60;
var DAY = 1000 * 60 * 60 * 24;
var MAX_NUMBER = 9007199254740992;

var timeRanges = [
    {lt: MINUTE, divide: SECOND, singular: ' sec ago', plural: ' secs ago'}
  , {lt: HOUR, divide: MINUTE, singular: ' min ago', plural: ' mins ago'}
  , {lt: DAY, divide: HOUR, singular: ' hour ago', plural: ' hrs ago'}
  , {lt: MAX_NUMBER, divide: DAY, singular: ' day ago', plural: ' days ago'}
];

app.View.Layout = Backbone.View.extend({
    el: 'body'
  , start: function () {
        this.currentPage = null;
        this.HREF_EXTERNAL_FLAG = '1';
        this.partials = {};

        this.view = {};
        this.view.currentPages = [];

        this.$page = $('#page');

        // Routes
        this.$el.on('click', 'a', $.proxy(this.onAnchorClick, this));

        // Initialize singletons.
        this.router = {};
        this.router.game = new app.Router.Game();

        // TODO. add config data into the session.
        // Debugging.
        _(this.router).each(function (router, routerName) {
            router.on('all', function () {
                var args = Array.prototype.slice.call(arguments);
                args.unshift(routerName);
                console.log(args);
            });
        });
    }
  , formatTime: function (ts, format) {
        var now = (new Date()).getTime();
        if (format === 'ago') {
            var diff = now - ts;
            var msg = '';
            if (diff < 1000) {
                diff = 1000;
            }
            for (var i = 0, ii = timeRanges.length; i < ii; ++i) {
                var tr = timeRanges[i];
                if (diff < tr.lt) {
                    var num = Math.floor(diff/tr.divide);
                    if (num === 1) {
                        msg = num + tr.singular;
                    } else {
                        msg = num + tr.plural;
                    }
                    break;
                }
            }
            return msg;
        }
    }
  , getDb: function () {return this.db;}
  , getScroll: function () {return this.scroll;}
  , getSession: function () {return this.session;}
  , onAnchorClick: function (event) {
        event.preventDefault();
        var $currentTarget = $(event.currentTarget);
        var href = $currentTarget.attr('href');
        var type = $currentTarget.attr('data-type');

        if (type === this.HREF_EXTERNAL_FLAG) {
            location.href = href;
            console.log('Leaving site');
            return;
        }

        // Don't do anything if don't go anywhere! This is default for buttons with js listeners.
        if (href === '#') {
            return;
        }

        var newFragment = Backbone.history.getFragment(href);
        if (Backbone.history.fragment === newFragment) {
            // Need to null out Backbone.history.fragment because navigate method will ignore
            // when it is the same as newFragment
            Backbone.history.fragment = null;
        }

        Backbone.history.navigate(href, {trigger: true});
    }
  , template: function (namespace, name, data) {
        //TODO: should cache {namespace, name, data} triple so that if data is same.. send back html
        var key = namespace + '/' + name;

        // Create the template function if it doesn't exist.
        if (_.isUndefined(this.partials[key])) {

            // If the template exists, create template function; else set null flag.
            if (_.isUndefined(app.templates[key])) {
                this.partials[key] = null;
            } else {
                this.partials[key] = _.template(app.templates[key]);
            }
        }

        // If null, give up. Otherwise, just render.
        if (_.isNull(this.partials[key])) {
            console.log('No such partial: ' + key);
            return '';
        } else {
            return this.partials[key].call(this, data);
        }
    }
  , getLayoutHTML: function (type) {
        if (type === 'standard') {
            var html = app.template('misc', 'layout');
        }
        return html;
    }
  , renderLayout: function (type) {
        var html = this.getLayoutHTML(type);
        this.$page.html(html);
    }
  , visit: function (view, data) {
        if (!this.currentPage) {
            this.renderLayout(app.Page[view].getLayoutType());
            var newPage = new app.Page[view](data);
            newPage.renderInitial();
            this.currentPage = newPage;
        } else {
            if (app.Page[view].getLayoutType() !== this.currentPage.getLayoutType()) {
                this.renderLayout(app.Page[view].getLayoutType());
            }
            var newPage = new app.Page[view](data);
            newPage.renderInitial();
            this.currentPage = newPage;
        }
    }
});
