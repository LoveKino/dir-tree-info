'use strict';

let {
    filesTree
} = require('..');

let path = require('path');

describe('index', () => {
    it('base', () => {
        return filesTree(path.join(__dirname, './fixture/dir0')).then((ret) => {
            console.log(ret);
        });
    });
});
