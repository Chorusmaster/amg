# AMG

AMG is a 2D pixel-art sandbox game for the web, inspired by Minecraft and Terraria.

## Technologies

* React
* Node.js
* HTML Canvas API
* TypeScript

## Project structure

The code in `frontend/src` is divided into:

* `game/` — game-specific classes and logic
* `engine/` — a custom 2D game engine developed alongside the game
* `game_ui/` — HTML-based UI elements displayed on top of the canvas

The `public/` folder contains game assets.

## Setup

```bash
cd frontend
npm install
npm run dev
```

## Features

* Block placement and breaking
* Player movement
* Chunk system
* Procedural world generation
* Easily configurable block and item registries using JSON
* Sunlight and shadows
* Inventory and hotbar
* Sprites, sprite sheets and animations
* Physics system

## To be done someday (or not)

* Trees and structures
* Enemies
* Optimization
* World saving, loading and unloading
* Liquid physics
* Multiplayer
