
import _ from 'underscore';
import Wreqr from 'backbone.wreqr';
import Marionette from 'backbone.marionette';
import MarkedHelper from '../helper/marked';
import MapUi from '../ui/map';
import template from '../../templates/selectLayerListItem.ejs';
import CONST from '../const';
import InfoOverPassLayerColumnView from './infoOverPassLayerColumn';
import InfoGpxLayerColumnView from './infoGpxLayerColumn';
import InfoCsvLayerColumnView from './infoCsvLayerColumn';
import InfoGeoJsonLayerColumnView from './infoGeoJsonLayerColumn';


export default Marionette.ItemView.extend({
    template: template,

    tagName: 'a',

    className: 'list-group-item',

    attributes: {
        'href': '#',
    },

    modelEvents: {
        'change': 'render'
    },

    ui: {
        'visibilityCheckbox': '.visibility_checkbox',
        'zoomTip': '.zoom_tip',
        'infoLayerBtn': '.info_layer_btn',
    },

    events: {
        'click @ui.infoLayerBtn': 'onClickInfo', // Important : Has to be the first !
        'click a': 'onClickLink', // Important : Has to be the second !
        'click label': 'onClickLabel',
        'click': 'onClick',
    },

    initialize: function () {
        this._radio = Wreqr.radio.channel('global');

        var fragment = this._radio.reqres.request('theme:fragment'),
        storage = JSON.parse( localStorage.getItem( 'mapState-'+ fragment ) );


        this._fragment = fragment;

        if ( storage && storage.hiddenLayers && storage.hiddenLayers.indexOf(this.model.get('uniqid')) > -1 ) {
            this._layerIsVisible = false;
        }
        else {
            this._layerIsVisible = true;
        }

        this._radio.vent.on('map:zoomChanged', this.render, this);
    },

    templateHelpers: function () {
        return {
            'description': MarkedHelper.render( this.model.get('description') || '' ),
            'marker': MapUi.buildLayerHtmlIcon( this.model ),
        };
    },

    onDestroy: function () {
        this._radio.vent.off('map:zoomChanged');
    },

    onRender: function () {
        var currentZoom = this._radio.reqres.request('map:currentZoom'),
        n = (this.model.get('minZoom') - currentZoom) || 0;

        if ( n > 0 ) {
            this.ui.zoomTip
            .html( document.l10n.getSync('selectLayerColumn_needToZoom', {'n': n}) )
            .removeClass('hide');
        }
        else {
            this.ui.zoomTip
            .addClass('hide')
            .empty();
        }

        this.ui.visibilityCheckbox.prop('checked', this._layerIsVisible);
    },

    onClick: function (e) {
        e.stopPropagation();

        var newState,
        key = 'mapState-'+ this._fragment,
        oldState = JSON.parse( localStorage.getItem( key ) ) || {},
        hiddenLayers = oldState.hiddenLayers || [];

        this._layerIsVisible = this._layerIsVisible ? false : true;

        this.ui.visibilityCheckbox.prop('checked', this._layerIsVisible);

        if ( this._layerIsVisible ) {
            this._radio.commands.execute( 'map:showLayer', this.model );

            hiddenLayers = _.without( hiddenLayers, this.model.get('uniqid') );
        }
        else {
            this._radio.commands.execute( 'map:hideLayer', this.model );

            hiddenLayers = _.union( hiddenLayers, [this.model.get('uniqid')] );
        }

        newState = _.extend( oldState, { 'hiddenLayers': hiddenLayers } );
        localStorage.setItem( key, JSON.stringify( newState ) );
    },

    onClickLabel: function (e) {
        e.preventDefault();
    },

    onClickLink: function (e) {
        e.stopPropagation();
    },

    onClickInfo: function (e) {
        e.preventDefault();
        e.stopPropagation();

        switch (this.model.get('type')) {
            case CONST.layerType.overpass:
                new InfoOverPassLayerColumnView({
                    'model': this.model,
                }).open();
                break;
            case CONST.layerType.gpx:
                new InfoGpxLayerColumnView({
                    'model': this.model,
                }).open();
                break;
            case CONST.layerType.csv:
                new InfoCsvLayerColumnView({
                    'model': this.model,
                }).open();
                break;
            case CONST.layerType.geojson:
                new InfoGeoJsonLayerColumnView({
                    'model': this.model,
                }).open();
                break;
        }
    },
});
