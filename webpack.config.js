'use strict';

const NODE_ENV = process.env.NODE_ENV || 'prod';

module.exports = {

    entry: './src/index',
    output: {
		path : __dirname + '/build',
        filename: "build.js"
    },

    watch: NODE_ENV === 'dev',
    watchOptions: {
        aggregateTimeout: 100
    }
};
