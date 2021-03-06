
import Wreqr from 'backbone.wreqr';
import Marionette from 'backbone.marionette';
import template from '../../templates/infoDisplayColumn.ejs';

export default Marionette.LayoutView.extend({
    template: template,

    behaviors: {
        'l20n': {},
        'column': {
            'destroyOnClose': true,
            'appendToBody': true,
        },
    },

    ui: {
        'column': '.info_display_column',
        'content': '.info_content',
        'footer': '.sticky-footer',
        'editBtn': '.edit_btn',
    },

    initialize: function () {
        this._radio = Wreqr.radio.channel('global');
    },

    onRender: function () {
        this.ui.content.append( this.options.content );

        if (this.options.layerModel.get('dataEditable') && this.options.isLogged) {
            this.ui.editBtn.on( 'click', this.options.editAction );
            this.ui.footer.removeClass('hide');
        }
    },

    open: function () {
        this.triggerMethod('open');
        return this;
    },

    close: function () {
        this.triggerMethod('close');
        return this;
    },

    onBeforeOpen: function () {
        this._radio.vent.trigger('column:closeAll', [ this.cid ]);
        this._radio.vent.trigger('widget:closeAll', [ this.cid ]);
    },
});
