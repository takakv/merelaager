module.exports = {
    entry: __dirname + "/src/admin.js",
    module: {
        rules: [
            {
                test: /\.js$/,
                include: __dirname + "/src",
                loader: "babel-loader"
            }
        ]
    },
    output: {
        filename: "admin.js",
        path: __dirname + "/public/media/scripts"
    }
};