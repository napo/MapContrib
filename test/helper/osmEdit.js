
import 'babel-polyfill';
import assert from 'assert';

import OsmEditHelper from '../../src/public/js/helper/osmEdit';



describe('OsmEditHelper', () => {
    describe('_buildChangesetXML', () => {
        it('Should return a serialized changeset XML', () => {
            const expected = '<osm><changeset><tag k="created_by" v="a string"/><tag k="comment" v="another string"/></changeset></osm>';

            let osmEdit = new OsmEditHelper();

            osmEdit.setChangesetCreatedBy('a string');
            osmEdit.setChangesetComment('another string');

            let returnedXml = osmEdit._buildChangesetXml();

            assert.strictEqual(returnedXml, expected);
        });
    });

    describe('_buildXml', () => {
        it('Should return a serialized node XML', () => {
            const expected = '<osm><node version="0" lat="42.3" lon="0.2" uid="3569284" timestamp="2016-03-24T12:21:30.546Z" display_name="Walter White" changeset="85964251"><tag k="a key" v="a value"/><tag k="another key" v="another value"/></node></osm>';

            let osmEdit = new OsmEditHelper();

            osmEdit.setType('node');
            osmEdit.setVersion(0);
            osmEdit.setLatitude(42.3);
            osmEdit.setLongitude(0.2);
            osmEdit.setUid(3569284);
            osmEdit.setTimestamp('2016-03-24T12:21:30.546Z');
            osmEdit.setDisplayName('Walter White');
            osmEdit.setTags({
                'a key': 'a value',
                'another key': 'another value'
            });


            let returnedXml = osmEdit._buildXml(85964251);

            assert.strictEqual(returnedXml, expected);
        });
    });
});
