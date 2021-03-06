
import $ from 'jquery';
import Wreqr from 'backbone.wreqr';
import Marionette from 'backbone.marionette';
import template from '../../templates/linkColumn.ejs';
import templateIframe from '../../templates/linkColumnIframe.ejs';


export default Marionette.LayoutView.extend({
    template: template,
    templateIframe: templateIframe,

    behaviors: {
        'l20n': {},
        'column': {},
    },

    ui: {
        'column': '#link_column',
        'autoSelects': '.auto_select',
        'iframeCode': '#iframe_code',
        'iframeWidth': '#iframe_width',
        'iframeHeight': '#iframe_height',
        'iframeWidthUnit': '#iframe_width_unit',
        'iframeHeightUnit': '#iframe_height_unit',
        'iframeWidthUnitDropdown': '#iframe_width_unit_dropdown',
        'iframeHeightUnitDropdown': '#iframe_height_unit_dropdown',
    },

    events: {
        'click @ui.autoSelects': 'onClickAutoSelects',
        'keyup @ui.iframeWidth, @ui.iframeHeight': 'renderIframeCode',
        'change @ui.iframeWidth, @ui.iframeHeight': 'renderIframeCode',
        'click @ui.iframeWidthUnitDropdown a': 'onClickWidthUnit',
        'click @ui.iframeHeightUnitDropdown a': 'onClickHeightUnit',
    },

    modelEvents: {
        'change': 'render'
    },

    templateHelpers: function () {

        return {
            'url': this.getUrl(),
            'iframeWidth': MAPCONTRIB.config.shareIframeWidth,
            'iframeWidthUnit': MAPCONTRIB.config.shareIframeWidthUnit,
            'iframeHeight': MAPCONTRIB.config.shareIframeHeight,
            'iframeHeightUnit': MAPCONTRIB.config.shareIframeHeightUnit,
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

    onRender: function () {
        this.renderIframeCode();
    },

    renderIframeCode: function () {
        var html = this.templateIframe({
            'url': this.getUrl(),
            'iframeWidth': this.ui.iframeWidth.val(),
            'iframeHeight': this.ui.iframeHeight.val(),
            'iframeWidthUnit': (this.ui.iframeWidthUnit.html() == 'px') ? '' : this.ui.iframeWidthUnit.html(),
            'iframeHeightUnit': (this.ui.iframeHeightUnit.html() == 'px') ? '' : this.ui.iframeHeightUnit.html(),
            'subLinkMessage': document.l10n.getSync('linkColumn_seeBigger'),
        });

        this.ui.iframeCode.html( html );
    },

    onClickAutoSelects: function (e) {
        e.target.select();
    },

    onClickWidthUnit: function (e) {
        e.preventDefault();

        this.ui.iframeWidthUnit.html( $(e.target).data('unit') );

        this.renderIframeCode();
    },

    onClickHeightUnit: function (e) {
        e.preventDefault();

        this.ui.iframeHeightUnit.html( $(e.target).data('unit') );

        this.renderIframeCode();
    },

    getUrl: function () {
        return window.location.protocol +
        '//'+
        window.location.host +
        this.model.buildPath();
    },
});
