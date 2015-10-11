module.exports = {
    entry: "./src/entry.js",
    output: {
        path: __dirname + "/dist/unpacked/",
        filename: "stop-scrolling.js"
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader", query: {stage: 0}}
        ]
    }
};