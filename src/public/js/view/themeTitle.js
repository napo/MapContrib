
import $ from 'jquery';
import Wreqr from 'backbone.wreqr';
import Marionette from 'backbone.marionette';
import CONST from '../const';
import MarkedHelper from '../helper/marked';
import template from '../../templates/themeTitle.ejs';


export default Marionette.LayoutView.extend({
    template: template,

    behaviors: {
        'l20n': {},
    },

    ui: {
        'titleWrapper': '#title',
        'title': '#title h1',
        'description': '#title .description',
        'descriptionButton': '#title .description_btn',
    },

    events: {
        'click @ui.descriptionButton': 'onClickDescription',
    },

    initialize: function () {
        this._radio = Wreqr.radio.channel('global');

        this._currentTitleColor = this.model.get('color');

        this.listenTo(this.model, 'change:name', this.setTitle);
        this.listenTo(this.model, 'change:description', this.setDescription);

        this._radio.commands.setHandler('ui:setTitleColor', this.commandSetTitleColor, this);
    },

    templateHelpers: function () {
        return {
            'description': MarkedHelper.render( this.model.get('description') ),
        };
    },

    onRender: function () {
        this.setTitle();

        if ( this.model.get('description') ) {
            this.ui.descriptionButton.removeClass('hide');
        }
    },

    onShow: function () {
        this.ui.descriptionButton.tooltip({
            'container': 'body',
            'delay': {
                'show': CONST.tooltip.showDelay,
                'hide': CONST.tooltip.hideDelay
            }
        })
        .on('click', function () {
            $(this)
            .blur()
            .tooltip('hide');
        });
    },

    setTitle: function () {
        let themeName = this.model.get('name');
        let appName = document.l10n.getSync('mapcontrib');

        if (themeName === appName) {
            document.title = appName;
        }
        else {
            document.title = document.l10n.getSync('pageTitleWithMapName', {
                'map': {
                    'name': themeName
                }
            });
        }

        this.ui.title.html(themeName);
    },

    commandSetTitleColor: function (color) {
        if ( this._currentTitleColor === color ) {
            return;
        }

        this.ui.titleWrapper
        .addClass( color )
        .removeClass( this._currentTitleColor );

        this._currentTitleColor = color;
    },

    setDescription: function () {
        var description = MarkedHelper.render( this.model.get('description') );

        if ( description ) {
            this.ui.description.html( description );
            this.ui.descriptionButton.removeClass('hide');
        }
        else {
            this.ui.description.html('');
            this.ui.descriptionButton.addClass('hide');
        }
    },

    onClickDescription: function () {
        this._radio.vent.trigger('column:closeAll');
        this._radio.vent.trigger('widget:closeAll');

        this.ui.titleWrapper.toggleClass('open');
    },
});
