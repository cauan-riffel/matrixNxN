const fs = require("fs");
const { minify } = require("html-minifier-terser");

async function build() {
    const html = fs.readFileSync("index.html", "utf8");

    const result = await minify(html, {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeEmptyAttributes: true,
        minifyCSS: true,
        minifyJS: true
    });

    fs.mkdirSync("dist", { recursive: true });

    fs.writeFileSync("dist/index.html", result);
}

build();