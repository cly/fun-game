app.Router.User = Backbone.Router.extend({
    routes: {
        'about': 'about'
      , '?page=logout': 'logout'
      , ':userId': 'userPage'
      , 'auth/:network': 'auth'
      , '': 'feed'
    }
  , auth: function (network) {
        if (network === 'facebook') {
            location.href = '/auth/facebook';
        }
    }
  , about: function () {
        console.log('about');
    }
  , logout: function () {
        location.href = '/?page=logout';
    }
  , userPage: function (userId) {
        var user = new app.Model.User({id: userId});
        app.visit('UserPage', {user: user});
        user.fetch({
            success: function (model) {
                app.getDb().addUser(model);
            }
        });
    }
});
