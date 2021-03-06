
import Wreqr from 'backbone.wreqr';
import Marionette from 'backbone.marionette';
import template from '../../templates/loginModal.ejs';


export default Marionette.LayoutView.extend({
    template: template,

    behaviors: {
        'l20n': {},
        'modal': {
            'appendToBody': true
        },
    },

    ui: {
        'modal': '#login_modal',
    },

    templateHelpers: function () {
        return {
            'successRedirect': this.options.authSuccessCallback,
            'failRedirect': this.options.authFailCallback,
        };
    },

    initialize: function () {
        this._radio = Wreqr.radio.channel('global');
    },

    onBeforeOpen: function () {
        this._radio.vent.trigger('column:closeAll', [ this.cid ]);
        this._radio.vent.trigger('widget:closeAll', [ this.cid ]);
    },

    open: function () {
        this.triggerMethod('open');
        return this;
    },

    close: function () {
        this.triggerMethod('close');
        return this;
    },
});
