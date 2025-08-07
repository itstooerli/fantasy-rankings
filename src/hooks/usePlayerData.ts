/**
 * @file usePlayerData.ts
 * @description React hook for managing NFL player data and user rankings in localStorage.
 *
 * This hook:
 *  - Loads player data from localStorage or fetches it from /data/players.json on first use
 *  - Initializes user rankings from a base dataset if not present
 *  - Provides functions to save and reset user rankings
 *  - Intended for use in components that need access to player data and ranking state
 */
import { useEffect, useState } from "react";
import type { CleanPlayer } from "../utils/parsePlayers";

const BASE_KEY = "players-base";
const USER_KEY = "players-user";

/**
 * Custom React hook for loading, saving, and resetting NFL player data and user rankings.
 *
 * @returns {object} - Contains player data, saveUserPlayers, and resetUserPlayers functions.
 */
export function usePlayerData() {
  const [players, setPlayers] = useState<CleanPlayer[] | null>(null);

  // Load once on app init
  useEffect(() => {
    const userData = localStorage.getItem(USER_KEY);
    if (userData) {
      setPlayers(JSON.parse(userData));
    } else {
      fetchBaseAndInit();
    }
  }, []);

  /**
   * Loads base player data from localStorage or fetches it from /data/players.json if not present.
   * Initializes user rankings with the base data.
   */
  async function fetchBaseAndInit() {
    const base = localStorage.getItem(BASE_KEY);
    if (base) {
      const parsed = JSON.parse(base);
      localStorage.setItem(USER_KEY, JSON.stringify(parsed));
      setPlayers(parsed);
    } else {
      const res = await fetch("/data/players.json");
      const cleanPlayers: CleanPlayer[] = await res.json();
      localStorage.setItem(BASE_KEY, JSON.stringify(cleanPlayers));
      localStorage.setItem(USER_KEY, JSON.stringify(cleanPlayers));
      setPlayers(cleanPlayers);
    }
  }

  /**
   * Saves the user's current player rankings to localStorage and updates state.
   * @param {CleanPlayer[]} newPlayers - The updated player rankings.
   */
  function saveUserPlayers(newPlayers: CleanPlayer[]) {
    setPlayers(newPlayers);
    localStorage.setItem(USER_KEY, JSON.stringify(newPlayers));
  }

  /**
   * Resets the user's player rankings to the base dataset stored in localStorage.
   */
  function resetUserPlayers() {
    const base = localStorage.getItem(BASE_KEY);
    if (base) {
      const parsed = JSON.parse(base);
      setPlayers(parsed);
      localStorage.setItem(USER_KEY, JSON.stringify(parsed));
    }
  }

  return { players, saveUserPlayers, resetUserPlayers };
}
