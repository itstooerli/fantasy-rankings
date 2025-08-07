/**
 * @file parsePlayers.ts
 * @description Utility functions for cleaning and filtering raw NFL player data for fantasy rankings.
 *
 * This module:
 *  - Defines types for raw and cleaned player objects
 *  - Filters and transforms raw player data to include only relevant fantasy positions
 *  - Provides functions to parse player data from arrays or objects
 *  - Intended for use in data preparation and transformation before displaying or storing player info
 */

type RawPlayer = {
  player_id: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  position?: string;
  team?: string;
  age?: number;
  status?: string;
  default_rank?: number;
};

export type CleanPlayer = {
  id: string;
  name: string;
  position: string;
  team: string;
  age?: number;
  default_rank?: number;
};

const fantasyPositions = new Set(["QB", "RB", "WR", "TE", "DEF", "K"]);

/**
 * Filters and transforms an array of RawPlayer objects into CleanPlayer objects.
 * Only includes players with valid IDs, relevant fantasy positions, and active status.
 *
 * @param {RawPlayer[]} players - Array of raw player objects from external data sources.
 * @returns {CleanPlayer[]} - Array of cleaned and sorted player objects for fantasy rankings.
 */
function parsePlayers(players: RawPlayer[]): CleanPlayer[] {
  return players
    .filter(
      (p) =>
        p.player_id &&
        fantasyPositions.has(p.position || "") &&
        (p.status === "Active" || !p.status)
    )
    .map((p) => ({
      id: p.player_id,
      name: p.full_name || `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim(),
      position: p.position ?? "",
      team: p.team ?? "",
      age: p.age,
      default_rank: p.default_rank,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Parses player data from an object keyed by player IDs.
 *
 * @param {Record<string, RawPlayer>} raw - Object containing raw player data keyed by player_id.
 * @returns {CleanPlayer[]} - Array of cleaned player objects.
 */
export function parsePlayersFromObject(
  raw: Record<string, RawPlayer>
): CleanPlayer[] {
  return parsePlayers(Object.values(raw));
}

/**
 * Parses player data from an array of RawPlayer objects.
 *
 * @param {RawPlayer[]} raw - Array of raw player objects.
 * @returns {CleanPlayer[]} - Array of cleaned player objects.
 */
export function parsePlayersFromArray(raw: RawPlayer[]): CleanPlayer[] {
  return parsePlayers(raw);
}
