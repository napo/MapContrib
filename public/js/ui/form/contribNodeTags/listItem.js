
import Marionette from 'backbone.marionette';
import CONST from '../../../const';
import listItemTemplate from './listItem.ejs';
import { formatBytes, basename } from '../../../core/utils';
import KeyField from '../fields/key';
import TextField from '../fields/text';
import NumberField from '../fields/number';
import FileField from '../fields/file';


export default Marionette.LayoutView.extend({
    template: listItemTemplate,

    ui: {
        'formGroups': '.form-group',
        'nonOsmWarning': '.non_osm_warning',
    },

    regions: {
        'key': '.rg_key',
        'value': '.rg_value',
    },

    initialize() {
        this.listenTo(this.model.collection, 'sync', this.onCollectionUpdate);
        this.listenTo(this.model.collection, 'reset', this.onCollectionUpdate);
        this.listenTo(this.model.collection, 'update', this.onCollectionUpdate);
    },

    onRender() {
        document.l10n.localizeNode( this.el );

        const fieldOptions = {
            model: this.model,
            iDPresetsHelper: this.options.iDPresetsHelper,
        };

        this._keyField = new KeyField( fieldOptions );
        this.getRegion('key').show( this._keyField );

        switch (this.model.get('type')) {
            case 'text':
                this._valueField = new TextField( fieldOptions );
                break;
            case 'number':
                this._valueField = new NumberField( fieldOptions );
                break;
            case 'file':
                this._valueField = new FileField( fieldOptions );
                break;
            default:
                this._valueField = new TextField( fieldOptions );
        }

        this.getRegion('value').show( this._valueField );


        if (this.model.get('keyReadOnly')) {
            this._keyField.disable();
        }

        if (this.model.get('valueReadOnly')) {
            this._valueField.disable();
        }

        if (this.model.get('keyReadOnly') || this.model.get('valueReadOnly')) {
            this._valueField.disableRemoveBtn();
        }

        if (this.model.get('nonOsmData')) {
            this._valueField.disableRemoveBtn();
            this.ui.nonOsmWarning.removeClass('hide');
        }

        this.onCollectionUpdate();
    },

    onCollectionUpdate() {
        if (this.model.get('keyReadOnly') || this.model.get('valueReadOnly')) {
            return;
        }

        if ( this.model.get('nonOsmData') ) {
            return;
        }

        const osmTags = this.model.collection.where({
            'nonOsmData': false
        });

        if (osmTags.length === 1) {
            this._valueField.disableRemoveBtn();
        }
        else {
            this._valueField.enableRemoveBtn();
        }
    },

    isFileTag() {
        if ( this.model.get('type') === CONST.tagType.file ) {
            return true;
        }

        return false;
    },

    valueIsNotEmpty() {
        return this._valueField.isNotEmpty();
    },

    showErrorFeedback() {
        this.ui.formGroups.addClass('has-feedback has-error');
    },

    hideErrorFeedback() {
        this.ui.formGroups.removeClass('has-feedback has-error');
    },
});
