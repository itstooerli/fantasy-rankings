/**
 * @file fetchPlayers.ts
 * @description Script to fetch full NFL player data from the Sleeper API and save it locally.
 *
 * This script:
 *  - Calls the Sleeper API's `/players/nfl` endpoint
 *  - Ensures a local `src/data` directory exists
 *  - Writes the full JSON response to `players-full.json` with human-readable formatting
 *  - Intended for pre-build data population or manual refresh of player data
 */

import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __filename and __dirname equivalents in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// See https://docs.sleeper.com/ for API details
const SLEEPER_API = "https://api.sleeper.app/v1/players/nfl";

/**
 * Fetches NFL players from the Sleeper API and writes them to `src/data/players-full.json`.
 */
async function fetchAndSavePlayers() {
  try {
    const res = await fetch(SLEEPER_API);
    const players = await res.json();

    const outputDir = path.resolve(__dirname, "../src/data");
    const outputPath = path.join(outputDir, "players-full.json");

    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save formatted JSON
    fs.writeFileSync(outputPath, JSON.stringify(players, null, 2));
    console.log(`✅ Players saved to ${outputPath}`);
  } catch (err) {
    console.error("❌ Failed to fetch players:", err);
  }
}

fetchAndSavePlayers();
