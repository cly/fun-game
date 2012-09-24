app.Model.Session = Backbone.Model.extend({
    initialize: function () {
        this.set({user: new app.Model.User(this.get('user'))}, {silent: true});
    }
  , getUser: function () {return this.get('user');}
});

app.Model.Database = Backbone.Model.extend({
    initialize: function () {
        this.users = new app.Collection.Users();
    }
  , addUser: function (user) {
        if (!this.users.get(user.id)) {
            this.users.add(user);
        }
    }
  , addUsers: function (users) {
        for (var i = 0, ii = users.length; i < ii; ++i) {
            var user = users[i];
            this.addUser(user);
        }
    }
  , getUser: function (id) {
        var user = this.users.get(id);
        return user;
    }
  , getUsers: function () {
        return this.users;
    }
});
