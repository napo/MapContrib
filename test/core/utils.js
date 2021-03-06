
import 'babel-polyfill';
import assert from 'assert';

import * as utils from '../../src/public/js/core/utils';



describe('Utils', () => {
    describe('basename', () => {
        it('Should return a basename', () => {
            const expected = 'myFile.jpg';
            const path = '/some/directories/to/go/to/myFile.jpg';

            let result = utils.basename(path);

            assert.equal(result, expected);
        });
    });

    describe('extensionname', () => {
        it('Should return a file extension', () => {
            const expected = 'jpg';
            const path = '/some/directories/to/go/to/myFile.jpg';

            let result = utils.extensionname(path);

            assert.equal(result, expected);
        });
    });

    describe('dirname', () => {
        it('Should return a directory', () => {
            const expected = '/some/directories/to/go/to';
            const path = '/some/directories/to/go/to/myFile.jpg';

            let result = utils.dirname(path);

            assert.equal(result, expected);
        });
    });

    describe('uuid', () => {
        it('Should return a well formed uniq ID', () => {
            const expectedType = 'string';
            const formatRegex = /^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/;

            let uuid = utils.uuid();

            assert.equal(typeof uuid, expectedType);
            assert.equal(formatRegex.test(uuid), true);
        });
    });
});
