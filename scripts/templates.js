/**
 * Flatfinder Elite / Weak templates.
 *
 * "These templates change creature level by 2 rather than 1, even outside of
 *  levels -1 through 1. When applying these templates to creatures of level -1, 0
 *  or 1, do not adjust damage or HP values."
 *
 * PF2e's native Elite/Weak adjustment already applies the +/-2 to the creature's
 * checks, DCs, AC, saves and HP, but shifts the *level* by only +/-1. This wraps the
 * NPC's derived-data step to bump the level by an extra step so the effective level
 * change is +/-2, which is what Flatfinder's encounter math and Incapacitation rule
 * key off of.
 *
 * For base creatures of level -1, 0 or 1, Flatfinder says not to change HP/damage;
 * the bundled "FF Adjustments" effects cover that edge case, so here we leave the
 * native HP handling untouched and only correct the level.
 */

import { MODULE_ID } from "./constants.js";
import { getSetting } from "./settings.js";

/** Apply the extra +/-1 level step for Flatfinder Elite/Weak NPCs. */
function applyFlatfinderLevelStep(actor) {
  try {
    if (actor?.type !== "npc") return;
    const adjustment = actor.system?.attributes?.adjustment;
    if (adjustment !== "elite" && adjustment !== "weak") return;
    const level = actor.system?.details?.level;
    if (!level || typeof level.value !== "number") return;
    level.value += adjustment === "elite" ? 1 : -1;
  } catch (err) {
    console.error(`${MODULE_ID} | Failed to apply Flatfinder Elite/Weak level step`, err);
  }
}

/**
 * Resolve the concrete NPC document class. PF2e registers a proxy as
 * CONFIG.Actor.documentClass, so the real subclass must come from
 * CONFIG.PF2e.Actor.documentClasses.
 */
function getNpcClass() {
  return CONFIG?.PF2e?.Actor?.documentClasses?.npc ?? null;
}

export function registerEliteWeak() {
  if (!getSetting("eliteWeakLevel")) return;

  const npcClass = getNpcClass();
  if (!npcClass?.prototype) {
    console.warn(
      `${MODULE_ID} | Could not locate the PF2e NPC document class; Elite/Weak level step disabled.`
    );
    return;
  }

  if (globalThis.libWrapper) {
    libWrapper.register(
      MODULE_ID,
      "CONFIG.PF2e.Actor.documentClasses.npc.prototype.prepareDerivedData",
      function (wrapped, ...args) {
        const result = wrapped(...args);
        applyFlatfinderLevelStep(this);
        return result;
      },
      "WRAPPER"
    );
  } else {
    const original = npcClass.prototype.prepareDerivedData;
    npcClass.prototype.prepareDerivedData = function (...args) {
      const result = original.apply(this, args);
      applyFlatfinderLevelStep(this);
      return result;
    };
  }

  refreshAdjustedNpcs();
  console.log(`${MODULE_ID} | Flatfinder Elite/Weak level adjustment active (+/-2 levels).`);
}

/**
 * Initial data preparation runs before this wrapper is installed, so re-prepare any
 * already-loaded Elite/Weak NPCs (world actors and tokens on the active scene) to
 * reflect the +/-2 level immediately rather than only on the next refresh.
 */
function refreshAdjustedNpcs() {
  const needsStep = (actor) =>
    actor?.type === "npc" &&
    ["elite", "weak"].includes(actor.system?.attributes?.adjustment);

  try {
    for (const actor of game.actors ?? []) {
      if (!needsStep(actor)) continue;
      actor.reset?.();
      if (actor.sheet?.rendered) actor.sheet.render(false);
    }
    for (const token of canvas?.tokens?.placeables ?? []) {
      const actor = token.actor;
      if (actor?.isToken && needsStep(actor)) actor.reset?.();
    }
  } catch (err) {
    console.error(`${MODULE_ID} | Failed to refresh Elite/Weak NPCs`, err);
  }
}
