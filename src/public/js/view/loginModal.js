

define([

	'underscore',
	'backbone',
	'marionette',
	'bootstrap',
	'templates',
],
function (

	_,
	Backbone,
	Marionette,
	Bootstrap,
	templates
) {

	'use strict';

	return Marionette.LayoutView.extend({

		template: JST['loginModal.html'],

		behaviors: {

			'modal': {},
		},

		ui: {

			'modal': '#login_modal',
		},

		initialize: function () {

			var self = this;

			this._radio = Backbone.Wreqr.radio.channel('global');
		},

		close: function () {

			this.triggerMethod('close');
		},
	});
});
