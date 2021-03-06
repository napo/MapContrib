
import Marionette from 'backbone.marionette';
import MarkedHelper from '../../../helper/marked';
import listItemTemplate from './listItem.ejs';


export default Marionette.ItemView.extend({
    template: listItemTemplate,

    tagName: 'li',

    attributes: {
        'role': 'presentation',
    },

    ui: {
        'link': '.top_link',
        'description': '.description',
    },

    events: {
        'click @ui.link a': 'onClickInnerLink',
        'click @ui.link': 'onClick'
    },

    onClick: function (e) {
        if ( this.ui.link.attr('href') === '#' ) {
            e.preventDefault();
        }

        const callback = this.model.get('callback');

        if (callback) {
            callback();
        }
    },

    onRender: function () {
        this.ui.description.html(
            MarkedHelper.render( this.model.get('description') )
        )
        .removeClass('hide');
    },

    onClickInnerLink: function (e) {
        e.stopPropagation();
    },
});
