## Prerequisites

* Node.js
* Visual Studio Code

## Using
Open **SP.ProjectTaskWeb** folder with **Visual Studio Code**.

`cd scripts/sp-react`

`npm install --save-dev webpack webpack-cli webpack-dev-server @babel/core @babel/cli @babel/runtime @babel/plugin-proposal-class-properties @babel/preset-typescript @babel/preset-env @babel/preset-react babel-loader css-loader html-loader source-map-loader style-loader clean-webpack-plugin mini-css-extract-plugin html-webpack-plugin file-loader`

`npm install --save-dev sass-loader node-sass postcss-loader raw-loader`

`npm install @babel/plugin-transform-runtime react react-dom office-ui-fabric-react reactstrap moment react-infinite-scroller`

`npm install url-polyfill current-script-polyfill whatwg-fetch abortcontroller-polyfill promise-polyfill babel-polyfill` - for IE browser

`npm install --save-dev @ckeditor/ckeditor5-dev-webpack-plugin @ckeditor/ckeditor5-dev-utils @ckeditor/ckeditor5-theme-lark`
`npm install --save @ckeditor/ckeditor5-react @ckeditor/ckeditor5-build-classic`

`npm run build` - to pack into ./dist

`npm run build:min` - to minimize into ./dist

`npm start` - run dev server
