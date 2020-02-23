const TerserPlugin = require('terser-webpack-plugin')

module.exports = (env) => {
    const plugins = (env && env.production) ? ["transform-remove-console"] : []
    
    return {
        entry: "./src/entry.js",
        output: {
            path: __dirname + "/dist/unpacked/",
            filename: "stop-scrolling.js"
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: "babel-loader",
                    options: { plugins }
                }
            ]
        },
        optimization: {
            minimize: true,
            minimizer: [new TerserPlugin({
                terserOptions: {
                    output: {
                      comments: false,
                    },
                  },
                extractComments: false
            })]
        }
    }
}
