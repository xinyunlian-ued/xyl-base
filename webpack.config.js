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
            }
            ]
        }
    }
        ;
}
