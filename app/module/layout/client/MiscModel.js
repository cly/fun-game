app.Model.Session = Backbone.Model.extend({
    initialize: function () {
        this.set({user: new app.Model.User(this.get('user'))}, {silent: true});
    }
  , getUser: function () {return this.get('user');}
});
