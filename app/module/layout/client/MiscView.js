//http://ejohn.org/blog/learning-from-twitter/
app.Model.Scroll = Backbone.Model.extend({
    initialize: function () {
        var self = this;
        this.$win = $(window);
        this.hasScrolled = false;

        this.$win.on('scroll', function () {
            self.hasScrolled = true;
        });

        setInterval(function () {
            if (self.hasScrolled) {
                self.hasScrolled = false;
                self.trigger('scroll');
            }
        }, 200);
    }
  , getScrollTop: function () {
        return this.$win.scrollTop();
    }
  , getWindowHeight: function () {
        return this.$win.height();
    }
  , getViewPortBottom: function () {
        return this.getScrollTop() + this.getWindowHeight();
    }
  , scrollToTop: function () {
        this.$win.scrollTop(0);
    }
  , enableScroll: function (cb, ctx) {
        this.on('scroll', cb, ctx);
    }
  , disableScroll: function (cb, ctx) {
        this.off('scroll', cb, ctx);
    }
});

app.View.Modal = Backbone.View.extend({
    initialize: function () {
        this.render();
    }
  , destroy: function () {
    }
  , el: '#modal'
  , events: {
    }
  , render: function () {
    }
});

app.View.SignupModal = app.View.Modal.extend({
    initialize: function () {
        this.render();
    }
  , events: {
        'keydown #input-username': 'onUsernameChange'
      , 'keydown #input-password': 'onPasswordChange'
      , 'click #submit': 'onSubmit'
    }
  , updateSubmit: function () {
        var self = this;
        if (self.model.hasMinimalData()) {
            self.$('#submit').removeClass('disabled');
        } else {
            self.$('#submit').addClass('disabled');
        }
    }
  , onPasswordChange: function (event) {
        var self = this;
        setTimeout(function () {
            var $password = $(event.currentTarget);
            var password = $password.val();
            var success = self.model.set({password: password}, {silent: true});

            if (password.length < app.Model.User.PASSWORD_MIN_LENGTH) {
                $password.siblings('.help-block').html('Too short');
                $password.siblings('.help-inline').removeClass('successText').addClass('errorText')
                    .html('<i class="icon-remove icon-large"></i>');
            } else {
                $password.siblings('.help-block').html('Supreme!');
                $password.siblings('.help-inline').removeClass('errorText').addClass('successText')
                    .html('<i class="icon-ok icon-large"></i>');
            }
            self.updateSubmit();
        }, 0);
    }
  , onSubmit: function (event) {
        var self = this;
        self.model.save({}, {
            success: function (model, response) {
                self.model.clear({silent: true});
                self.model.set(response);
                self.renderSuccess();
            }
          , error: function (model, response) {
                console.log('error');
                //TODO: Error state, possibly refresh page or something.
                //or flash error.
            }
        });
    }
  , render: function () {
        var html = app.template('misc', 'modalSignUp', {user: this.model});
        this.$el.html(html);
        this.$el.find('#modal-sign-up').modal({
            backdrop: 'static'
          , keyboard: false
        });
    }
  , renderSuccess: function () {
        this.$el.find('#modal-sign-up').modal('hide');
        var html = app.template('misc', 'modalSignUpSuccess', {user: this.model});
        this.$el.html(html);
        this.$el.find('#modal-sign-up-success').modal();
        this.$el.find('#modal-sign-up-success').on('hide', function () {
            location.href = '/';
        })
    }
});

app.View.NavBreadcrumb = Backbone.View.extend({
    el: '#nav-breadcrumb'
  , initialize: function () {
    }
  , render: function () {
        this.$el.html('hihihi');
    }
});

