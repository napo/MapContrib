

define([

	'underscore',
	'backbone',
	'marionette',
	'bootstrap',
	'templates',
	'leaflet',

	'view/userColumn',
	'view/shareColumn',
	'view/contribColumn',
	'view/editSettingColumn',
	'view/editPoiColumn',
	'view/editTileColumn',
	'view/tipOfTheDay',
],
function (

	_,
	Backbone,
	Marionette,
	Bootstrap,
	templates,
	L,

	userColumnView,
	shareColumnView,
	contribColumnView,
	editSettingColumnView,
	editPoiColumnView,
	editTileColumnView,
	tipOfTheDayView
) {

	'use strict';

	return Marionette.LayoutView.extend({

		template: JST['main.html'],

		ui: {

			'map': '#main_map',
			'toolbarButtons': '.toolbar .toolbar_btn',

			'controlToolbar': '#control_toolbar',
			'zoomInButton': '#control_toolbar .zoom_in_btn',
			'zoomOutButton': '#control_toolbar .zoom_out_btn',
			'locateButton': '#control_toolbar .locate_btn',
			'controlPoiButton': '#control_toolbar .poi_btn',
			'controlTileButton': '#control_toolbar .tile_btn',

			'userToolbar': '#user_toolbar',
			'userButton': '#user_toolbar .user_btn',
			'shareButton': '#user_toolbar .share_btn',
			'contribButton': '#user_toolbar .contrib_btn',
			'editButton': '#user_toolbar .edit_btn',

			'helpToolbar': '#help_toolbar',
			'helpButton': '#help_toolbar .help_btn',

			'editToolbar': '#edit_toolbar',
			'editSettingButton': '#edit_toolbar .setting_btn',
			'editPoiButton': '#edit_toolbar .poi_btn',
			'editTileButton': '#edit_toolbar .tile_btn',
		},

		regions: {

			'userColumn': '#rg_user_column',
			'shareColumn': '#rg_share_column',
			'contribColumn': '#rg_contrib_column',
			'editSettingColumn': '#rg_edit_setting_column',
			'editPoiColumn': '#rg_edit_poi_column',
			'editTileColumn': '#rg_edit_tile_column',

			'tipOfTheDay': '#rg_tip_of_the_day',
		},

		events: {

			'click @ui.zoomInButton': 'onZoomIn',
			'click @ui.zoomOutButton': 'onZoomOut',

			'click @ui.userButton': 'onClickUser',
			'click @ui.shareButton': 'onClickShare',
			'click @ui.contribButton': 'onClickContrib',
			'click @ui.editButton': 'onClickEdit',
			'click @ui.editSettingButton': 'onClickEditSetting',
			'click @ui.editPoiButton': 'onClickEditPoi',
			'click @ui.editTileButton': 'onClickEditTile',
		},

		initialize: function () {

			var self = this;

			this._radio = Backbone.Wreqr.radio.channel('global');
		},

		onRender: function () {

			this.ui.toolbarButtons.tooltip({

				'container': 'body',
				'delay': {

					'show': 500,
					'hide': 0
				}
			});


			this._userColumnView = new userColumnView();
			this._shareColumnView = new shareColumnView();
			this._contribColumnView = new contribColumnView();
			this._editSettingColumnView = new editSettingColumnView();
			this._editPoiColumnView = new editPoiColumnView();
			this._editTileColumnView = new editTileColumnView();

			this.getRegion('userColumn').show( this._userColumnView );
			this.getRegion('shareColumn').show( this._shareColumnView );
			this.getRegion('contribColumn').show( this._contribColumnView );
			this.getRegion('editSettingColumn').show( this._editSettingColumnView );
			this.getRegion('editPoiColumn').show( this._editPoiColumnView );
			this.getRegion('editTileColumn').show( this._editTileColumnView );

			this.getRegion('tipOfTheDay').show( new tipOfTheDayView() );
		},

		onShow: function () {

			this._map = L.map(this.ui.map[0], { 'zoomControl': false });

			this._map.setView([44.82921, -0.5834], 12);

			L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {

				'attribution': '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			})
			.addTo(this._map);
		},

		onZoomIn: function () {

			this._map.zoomIn();
		},

		onZoomOut: function () {

			this._map.zoomOut();
		},

		onClickUser: function () {

			this.ui.userButton.blur();
			this._userColumnView.open();
		},

		onClickShare: function () {

			this.ui.shareButton.blur();
			this._shareColumnView.open();
		},

		onClickContrib: function () {

			this.ui.contribButton.blur();
			this._contribColumnView.open();
		},

		onClickEdit: function () {

			this.ui.editButton.blur();
			this.ui.editToolbar.toggleClass('open');
		},

		onClickEditSetting: function () {

			this.ui.editSettingButton.blur();
			this._editSettingColumnView.open();
		},

		onClickEditPoi: function () {

			this.ui.editPoiButton.blur();
			this._editPoiColumnView.open();
		},

		onClickEditTile: function () {

			this.ui.editTileButton.blur();
			this._editTileColumnView.open();
		},
	});
});