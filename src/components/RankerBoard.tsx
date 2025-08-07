/**
 * @file RankerBoard.tsx
 * @description React component that renders the player ranking board with drag-and-drop support.
 */

import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { usePlayerData } from "../hooks/usePlayerData";
import { type CleanPlayer } from "../utils/parsePlayers";

/**
 * Card component renders a single draggable player item.
 * It uses useSortable hook from @dnd-kit/sortable to provide drag & drop capabilities.
 *
 * @param player - The player data object to display.
 * @returns React element representing a draggable card for the player.
 */
const Card: React.FC<{ player: CleanPlayer }> = ({ player }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: player.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "1rem",
    margin: "0.5rem 0",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
    cursor: "grab",
    userSelect: "none" as const,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <strong>{player.name}</strong> - {player.position}, {player.team}
    </div>
  );
};

/**
 * RankerBoard component manages the full player ranking UI.
 * It:
 *  - fetches players from a custom hook,
 *  - sorts them by default_rank initially,
 *  - allows drag-and-drop reordering using dnd-kit,
 *  - and displays static rank numbers alongside draggable cards.
 *
 * @returns React element representing the entire ranking board with drag and drop.
 */
const RankerBoard: React.FC = () => {
  const { players } = usePlayerData();
  const [localPlayers, setLocalPlayers] = useState<CleanPlayer[]>([]);

  // Sync once players load
  useEffect(() => {
    if (players) {
      // Sort players by default_rank ascending (lowest rank first)
      const sorted = [...players].sort((a, b) => {
        // Handle missing default_rank gracefully
        const rankA = a.default_rank ?? Infinity;
        const rankB = b.default_rank ?? Infinity;
        return rankA - rankB;
      });
      setLocalPlayers(sorted);
    }
  }, [players]);

  // Initialize sensors for drag detection with pointer sensor and a small activation distance
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  /**
   * Handler called when drag ends.
   * Reorders the localPlayers array to reflect the new order after dragging.
   * 
   * @param event - DragEndEvent containing active and over draggable items
   */
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setLocalPlayers((prevPlayers: CleanPlayer[]) => {
      const oldIndex = prevPlayers.findIndex((p) => p.id === active.id);
      const newIndex = prevPlayers.findIndex((p) => p.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return prevPlayers;

      return arrayMove(prevPlayers, oldIndex, newIndex);
    });
  }

  const boardStyle = {
    backgroundColor: "#1e293b", // cool blue-gray draft board background
    padding: "2rem",
    borderRadius: "12px",
    width: "400px",
    minHeight: "400px",
    margin: "2rem auto",
    boxShadow: "0 0 10px rgba(0,0,0,0.3)",
  };

  if (!localPlayers) {
    return <div style={boardStyle}>Loading Players...</div>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={localPlayers.map((p) => p.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          style={{
            ...boardStyle,
            display: "flex",
            gap: "1rem",
          }}
        >
          {/* Left static rank column */}
          <div
            style={{
              width: "3rem",
              color: "#ccc",
              fontWeight: "bold",
              userSelect: "none",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {localPlayers
              .slice()
              .sort(
                (a, b) =>
                  (a.default_rank ?? Infinity) - (b.default_rank ?? Infinity)
              )
              .map((player) => (
                <div
                  key={`rank-${player.id}`}
                  style={{
                    height: "48px", // matches card height
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#334155", // subtle dark box bg
                    borderRadius: "6px",

                    fontSize: "1rem",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    userSelect: "none",
                    margin: "5px 0",
                  }}
                >
                  {player.default_rank ?? "-"}
                </div>
              ))}
          </div>

          {/* Right draggable cards */}
          <div style={{ flex: 1 }}>
            {localPlayers.map((player) => (
              <Card key={player.id} player={player} />
            ))}
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default RankerBoard;
