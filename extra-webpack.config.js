module.exports = {
    module: {
        rules: [
            {
                test: /\.js$/,
                include: [
                    path.resolve(__dirname, "node_modules/plotly.js")
                ],
                loader: 'ify-loader'
            }
        ]
    },
};