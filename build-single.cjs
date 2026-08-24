const fs = require('fs');
const path = require('path');
const { build } = require('esbuild');

async function main() {
  const result = await build({
    entryPoints: ['src/App.jsx'],
    bundle: true,
    minify: true,
    format: 'iife',
    target: 'es2020',
    outfile: 'dist/bundle.js',
    jsx: 'automatic',
    loader: {
      '.jsx': 'jsx',
    },
  });

  const bundleContent = fs.readFileSync('dist/bundle.js', 'utf8');
  
  const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Focus Self - 专注力控制系统</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Noto Serif SC', serif; background: #0a0a1a; color: #e5e7eb; min-height: 100vh; }
    #root { min-height: 100vh; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>${bundleContent}</script>
</body>
</html>`;

  fs.writeFileSync('dist/index.html', htmlContent, 'utf8');
  console.log('Build completed! Output: dist/index.html');
}

main().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
