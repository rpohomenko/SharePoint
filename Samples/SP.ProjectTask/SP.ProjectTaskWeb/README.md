## Prerequisites

* Node.js
* Visual Studio Code

## Using
Open **Visual Studio Code** and open the folder with **SP.ProjectTaskWeb** project.

`cd scripts/sp-react`

`npm install --save-dev @babel/core @babel/plugin-proposal-class-properties @babel/preset-typescript @babel/preset-env @babel/preset-react babel-loader webpack webpack-cli css-loader html-loader source-map-loader style-loader clean-webpack-plugin sass-loader mini-css-extract-plugin postcss-loader autoprefixer`

`npm install react react-dom office-ui-fabric-react`

`npm run build` - to pack into ./dist
`npm run build:min` - to minimize into ./dist

`npm start` - run dev server