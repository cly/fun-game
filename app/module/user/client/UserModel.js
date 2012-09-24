//TODO make sure ownerId is valid
//TODO Make sure use fbUserId in getImageUrl

var User = app.Model.User = Backbone.Model.extend({
    initialize: function () {}
  , urlRoot: function () {return '/api/1/users';}
  , parse: function (response) {
        var result = {};
        result = response.user;
        return result;
    }
  , isNewUser: function () {return this.get('isNewUser');}
  , getEmail: function () {return this.get('email');}
  , getFirstName: function () {return this.get('firstName') || 'User';}
  , getFbUserId: function () {return this.get('fbUserId');}
  , getFbUsername: function () {return this.get('fbUsername');}
  , getId: function () {
        return this.id;
    }
  , getImageUrl: function (type) {
        if (type === 'square') {
            return 'https://graph.facebook.com/' + this.getFbUsername() + '/picture?type=square';
        } else {
            return 'https://graph.facebook.com/' + this.getFbUsername() + '/picture?type=square';
        }
    }
  , getLastName: function () {return this.get('lastName') || 'User';}
  , getName: function () {return $.trim(this.getFirstName() + ' ' + this.getLastName());}
  , getPassword: function () {return this.get('password');}
  , getUrl: function () {return '/' + this.getId();}
  , getUsername: function () {return this.get('username');}
  , hasMinimalData: function () {
        if (this.getPassword() && this.getPassword().length >= User.PASSWORD_MIN_LENGTH
            && this.getFirstName() && this.getFirstName().length >= User.FIRST_NAME_MIN_LENGTH
            && this.getLastName() && this.getLastName().length >= User.LAST_NAME_MIN_LENGTH
            && this.getUsername() && this.getUsername().length >= User.USERNAME_MIN_LENGTH
            && this.get('isUsernameValid')) {
            return true;
        } else {
            return false;
        }
    }
  , isUsernameValid: function (cb) {
        var user = new app.Model.User({id: this.getUsername()});
        user.fetch({
            success: function () {
                return cb(null, false);
            }
          , error: function () {
                return cb(null, true);
            }
        });
    }
  , toUserImage: function (size) {
        if (size === 'small') {
            return app.template('user', 'userImageSmall', {user: this});
        } else if (size === 'medium') {
            return app.template('user', 'userImageMedium', {user: this});
        }
    }
  , validate: function (attrs) {
        if (attrs.password && attrs.password.length < User.PASSWORD_MIN_LENGTH) {
            return 'passwordTooShort';
        }
    }
});
User.PASSWORD_MIN_LENGTH = 4;
User.FIRST_NAME_MIN_LENGTH = 1;
User.LAST_NAME_MIN_LENGTH = 1;
User.USERNAME_MIN_LENGTH = 3;

app.Collection.Users = Backbone.Collection.extend({
    model: app.Model.User
});
