/**
 * Order helpers for a setlist.
 *
 * setlist.songIds can hold ids of songs that were deleted from the library. The screen only lists songs that
 * still exist, so a position in the visible list is not the same as a position in songIds.
 * Every edit therefore goes through the entry's `slot` (its real position in songIds).
 */
export interface SlotEntry<S> {
  song: S;
  /** position of this song in setlist.songIds */
  slot: number;
}

/** Songs of a set that still exist, each remembering its slot in songIds. */
export function buildEntries<S extends { id: string }>(songIds: string[], songs: S[]): SlotEntry<S>[] {
  const out: SlotEntry<S>[] = [];
  songIds.forEach((id, slot) => {
    const song = songs.find((s) => s.id === id);
    if (song) out.push({ song, slot });
  });
  return out;
}

/** New songIds with the two slots swapped. */
export function swapSlots(songIds: string[], slotA: number, slotB: number): string[] {
  const next = [...songIds];
  [next[slotA], next[slotB]] = [next[slotB], next[slotA]];
  return next;
}

/** New songIds without the given slot. */
export function removeSlot(songIds: string[], slot: number): string[] {
  return songIds.filter((_, i) => i !== slot);
}

/** Which visible row stays highlighted after rows `from` and `to` swap places. */
export function selectionAfterMove(selected: number, from: number, to: number): number {
  if (selected === from) return to;
  if (selected === to) return from;
  return selected;
}

/** Which visible row stays highlighted after row `removed` is taken out (`remaining` = rows left). */
export function selectionAfterRemove(selected: number, removed: number, remaining: number): number {
  if (removed < selected) return selected - 1; // keep the same song selected
  if (selected >= remaining) return Math.max(0, remaining - 1);
  return selected;
}
