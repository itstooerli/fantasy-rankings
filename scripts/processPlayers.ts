/**
 * @file processPlayers.ts
 * @description Script to process and match NFL player data with FantasyPros rankings, outputting a cleaned JSON file for the app.
 *
 * This script:
 *  - Loads full player data from players-full.json
 *  - Loads FantasyPros CSV rankings and normalizes player names
 *  - Matches and filters players by fuzzy name comparison
 *  - Adds default_rank from CSV to matched players
 *  - Warns about unmatched players
 *  - Outputs cleaned player data to public/data/players.json for use in the app
 *  - Intended for pre-build data transformation or manual refresh of rankings
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { parsePlayersFromArray } from '../src/utils/parsePlayers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const inputPath = path.resolve(__dirname, '../src/data/players-full.json');
const csvPath = path.resolve(__dirname, '../src/data/FantasyPros_2025_Draft_ALL_Rankings.csv');
const outputPath = path.resolve(__dirname, '../public/data/players.json');

/**
 * Utility to normalize player names for fuzzy matching between sources.
 * Removes punctuation, suffixes, and collapses spaces.
 *
 * @param {string} name - The player name to normalize.
 * @returns {string} - Normalized name string.
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z\s]/g, '') // remove punctuation/numbers
    .replace(/\b(jr|sr|ii|iii|iv)\b/g, '') // remove suffixes
    .replace(/\s+/g, ' ') // collapse spaces
    .trim();
}

/**
 * Parses FantasyPros CSV file and returns an array of player names and ranks.
 *
 * @param {string} filePath - Path to the CSV file.
 * @returns {Promise<{ name: string; rank: number }[]>} - Array of player name/rank objects.
 */
async function readCsvRankedPlayers(filePath: string): Promise<{ name: string; rank: number }[]> {
  const raw = await fs.readFile(filePath, 'utf-8');
  const lines = raw.split(/\r?\n/).filter(Boolean);

  // Parse header to find indices of "RK" and "PLAYER NAME"
  const header = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  const rankIndex = header.findIndex(h => h.toLowerCase() === 'rk');
  const nameIndex = header.findIndex(h => h.toLowerCase() === 'player name');

  if (rankIndex === -1) {
    throw new Error('❌ Could not find "RK" column in CSV header.');
  }
  if (nameIndex === -1) {
    throw new Error('❌ Could not find "PLAYER NAME" column in CSV header.');
  }

  // Parse remaining lines
  return lines.slice(1).map(line => {
    // Simple split on commas (assumes no commas inside quotes)
    const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').trim());
    const rank = Number(cols[rankIndex]);
    const name = normalizeName(cols[nameIndex] || '');
    return { name, rank };
  });
}

/**
 * Main function to process, match, and output cleaned player data for the app.
 */
async function parseAndSave() {
  try {
    // Load full players list
    const raw = await fs.readFile(inputPath, 'utf-8');
    const allPlayersObj: object = JSON.parse(raw);
    const allPlayers = Object.values(allPlayersObj);

    // Load CSV ranked players [{name, rank}]
    const csvRankedPlayers = await readCsvRankedPlayers(csvPath);
    const rankMap = new Map<string, number>();
    csvRankedPlayers.forEach(({ name, rank }) => rankMap.set(name, rank));

    // Filter full players by fuzzy name match
    const filtered = allPlayers.filter((player) => {
      const playerName = player.full_name || player.first_name + ' ' + player.last_name
      const norm = normalizeName(playerName || '');
      return rankMap.has(norm);
    });

    // Add rank to each filtered player
    filtered.forEach(player => {
      const playerName = player.full_name || (player.first_name + ' ' + player.last_name);
      const norm = normalizeName(playerName || '');
      player.default_rank = rankMap.get(norm) || null;
    });

    const matchedNames = new Set(filtered.map(p => normalizeName(p.full_name || p.first_name + ' ' + p.last_name || '')));
    const missingFromJson = csvRankedPlayers.filter(({ name }) => !matchedNames.has(name));

    if (missingFromJson.length > 0) {
      console.warn(`⚠️ ${missingFromJson.length} players from CSV were not found in players-full.json:`);
      missingFromJson.forEach(name => console.warn(` - ${name}`));
    } else {
      console.log('✅ All CSV players matched.');
    }

    // Apply your existing parser
    const parsed = parsePlayersFromArray(filtered);

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(parsed, null, 2));

    console.log(`✅ Matched ${parsed.length} players from CSV to players-full.json`);
  } catch (err) {
    console.error('❌ Error parsing players:', err);
  }
}

parseAndSave();
