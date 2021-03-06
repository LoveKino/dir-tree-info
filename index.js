'use stirct';

let fs = require('fs');
let path = require('path');
let promisify = require('es6-promisify');
let minimatch = require('minimatch');
let readdir = promisify(fs.readdir);
let stat = promisify(fs.stat);

let getFilesToc = (filesTree, nameHandler) => {
    return getFileLines(filesTree, nameHandler, 0).join('\n');
};

let getFileLines = (file, nameHandler = id, depth = 0) => {
    let {
        name,
        type,
        files
    } = file;

    let unitSpace = '    ',
        connectSpace = '│   ',
        adjoinSpace = '│──',
        lastAdjoinSpace = '└──';

    name = nameHandler(name, file);

    if (type === 'file') {
        return [name];
    } else if (type === 'directory') {
        let nextDepth = ++depth;

        let nexts = files.map((file) => getFileLines(file, nameHandler, nextDepth));

        let lines = nexts.reduce((prev, next, index) => {
            let space = index === nexts.length - 1 ? unitSpace : connectSpace;
            return prev.concat(next.map((line, lineIndex) => {
                if (lineIndex === 0) {
                    if (index === nexts.length - 1) return lastAdjoinSpace + line;
                    return adjoinSpace + line;
                } else {
                    return space + line;
                }
            }));
        }, []);

        lines.unshift(name);

        return lines;
    }
};

/**
 * get project toc
 *
 * @return
 * {
 *      files: [],
 *      name,
 *      type,
 *      path
 * }
 */
let filesTree = (dir, opts = {}, name = '.', depth = 0) => {
    let {
        maxDepth = 5, ignores = ['node_modules', '.git', '*.DS_Store', '*.swp', '*.swn', '.*']
    } = opts;

    if (depth > maxDepth) return null;

    return readdir(dir).then((files) => {
        return Promise.all(files.filter((file) => {
            return ignores.findIndex((ignore) => minimatch(file, ignore)) === -1;
        }).map((file) => {
            let filepath = path.join(dir, file);
            return stat(filepath).then((stats) => {
                if (stats.isDirectory()) {
                    let nextDepth = ++depth;
                    return filesTree(filepath, opts, file, nextDepth);
                } else if (stats.isFile()) {
                    return {
                        name: file,
                        path: filepath,
                        type: 'file'
                    };
                }
            });
        })).then((nexts) => {
            return {
                files: nexts.filter((file) => !!file),
                name,
                type: 'directory',
                path: dir
            };
        });
    });
};

let id = v => v;

module.exports = {
    getFilesToc,
    filesTree,
    getFileLines
};
