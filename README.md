# Salla Watcher Vite Plugin

Watcher plugin to develop [Salla](https://salla.com) themes with [Vite](https://vitejs.dev/).

## Installation
```
npm install vite-plugin-salla-watcher --save-dev
```
```
yarn add -D vite-plugin-salla-watcher
```

## Usage
```
import { defineConfig } from 'vite'
import { sallaWatcher } from "vite-plugin-salla-watcher"

export default defineConfig({
  plugins: [sallaWatcher()],
})

```
