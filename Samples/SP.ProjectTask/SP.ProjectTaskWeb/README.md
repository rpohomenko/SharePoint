## Prerequisites

* Node.js
* Visual Studio Code

## Using
Open **SP.ProjectTaskWeb** folder with **Visual Studio Code**.

`cd scripts/sp-react`

`npm install --save-dev webpack webpack-cli webpack-dev-server @babel/core @babel/cli @babel/runtime @babel/plugin-proposal-class-properties @babel/preset-typescript @babel/preset-env @babel/preset-react babel-loader css-loader html-loader source-map-loader style-loader clean-webpack-plugin mini-css-extract-plugin html-webpack-plugin`

`npm install --save-dev sass-loader node-sass`

`npm install @babel/plugin-transform-runtime react react-dom office-ui-fabric-react reactstrap`

`npm install url-polyfill whatwg-fetch abortcontroller-polyfill promise-polyfill` - for IE browser

`npm run build` - to pack into ./dist

`npm run build:min` - to minimize into ./dist

`npm start` - run dev server
