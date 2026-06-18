/**
 * PF2e Flatfinder — module entry point.
 *
 * Registers settings and wires up the automation hooks for:
 *  - Competence-check result badges on skill (and optionally perception) chat cards.
 *  - The Flatfinder Incapacitation save adjustment annotation.
 *  - The Flatfinder Elite/Weak (+/-2 level) template correction.
 *  - The Flatfinder encounter XP/difficulty badge in the combat tracker.
 */

import { MODULE_ID } from "./constants.js";
import { registerSettings } from "./settings.js";
import { renderCompetenceBadge } from "./competence.js";
import { renderIncapacitationBadge } from "./incapacitation.js";
import { renderEncounterBudget } from "./encounter.js";
import { registerEliteWeak } from "./templates.js";

Hooks.once("init", () => {
  registerSettings();
});

Hooks.once("ready", () => {
  if (game.system?.id !== "pf2e") {
    console.warn(`${MODULE_ID} | The Pathfinder 2e system is required; automation disabled.`);
    return;
  }
  registerEliteWeak();
  console.log(`${MODULE_ID} | Flatfinder automation ready.`);
});

/** Combined chat-card handler (badges are idempotent and refresh on re-render). */
function onRenderChatMessage(message, html) {
  try {
    renderCompetenceBadge(message, html);
  } catch (err) {
    console.error(`${MODULE_ID} | Competence badge error`, err);
  }
  try {
    renderIncapacitationBadge(message, html);
  } catch (err) {
    console.error(`${MODULE_ID} | Incapacitation badge error`, err);
  }
}

// Foundry v13+ renders chat messages via renderChatMessageHTML (passing an HTMLElement).
Hooks.on("renderChatMessageHTML", onRenderChatMessage);

Hooks.on("renderCombatTracker", (app, html) => {
  try {
    renderEncounterBudget(app, html);
  } catch (err) {
    console.error(`${MODULE_ID} | Encounter budget error`, err);
  }
});
