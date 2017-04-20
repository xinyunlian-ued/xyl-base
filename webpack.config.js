const path = require('path');
module.exports = {
    entry: "./src/App.tsx",
    output: {
        path: path.join(__dirname, 'lib'),
        filename: "App.js"
    },
    // Currently we need to add '.ts' to the resolve.extensions array.
    resolve: {
        modules: ['src', "node_modules"],
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },

    // Source maps support ('inline-source-map' also works)
    devtool: 'source-map',

    // Add the loader for .ts files.
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: 'awesome-typescript-loader',
            options: {
                transpileOnly: true
            }
        }]
    }
};