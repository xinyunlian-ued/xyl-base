const path = require('path');

module.exports = function (env) {
    const root = path.join(__dirname, `./src/${env.target}/test`);
    return {
        entry: path.join(root, 'test.tsx'),
        output: {
            path: root,
            filename: "test.js"
        },
        devtool: 'source-map',
        resolve: {
            alias: {
                'react': 'inferno-compat',
                'react-dom': 'inferno-compat'
            },
            extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
        },
        module: {
            rules: [{
                test: /\.less$/,
                use: [
                    'style-loader', {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1
                        }
                    },
                    'less-loader'
                ]
            }, {
                test: /\.tsx?$/,
                loader: "awesome-typescript-loader",
                exclude: [/node_modules/, /build/]
            }]
        }
    }
};


// const PrepackWebpackPlugin = require('prepack-webpack-plugin').default;
//
// const root = path.join(__dirname);
//
// const configuration = {};
//
// module.exports = {
//     entry: path.join(root, 'src', 'App.tsx'),
//     output: {
//         path: path.join(root, 'build'),
//         filename: "App.js"
//     },
//     devtool: 'source-map',
//     resolve: {
//         alias: {
//             'react': 'inferno-compat',
//             'react-dom': 'inferno-compat'
//         },
//         extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
//     },
//     module: {
//         rules: [{
//             test: /\.less$/,
//             use: [
//                 'style-loader', {
//                     loader: 'css-loader',
//                     options: {
//                         importLoaders: 1
//                     }
//                 },
//                 'less-loader'
//             ]
//         }, {
//             test: /\.tsx?$/,
//             loader: "awesome-typescript-loader",
//             exclude: [/node_modules/, /build/]
//         }]
//     },
//     plugins: [
//         new PrepackWebpackPlugin(configuration)
//     ]
// }
//
