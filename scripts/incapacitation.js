/**
 * Flatfinder Incapacitation adjustment.
 *
 * Flatfinder replaces the core Incapacitation rule with:
 *   "A creature of higher level than the source of an incapacitation effect gains
 *    an untyped bonus to its save equal to twice the level difference, up to a
 *    maximum of +10. A spell is treated as level equal to twice its rank."
 *
 * PF2e does not expose a clean per-roll modifier-injection hook for defender saves,
 * so this is implemented as a post-roll annotation: when a saving throw against an
 * incapacitation effect resolves, the badge shows the Flatfinder bonus and the
 * resulting degree of success (recomputed against the original DC). The GM applies
 * the adjusted outcome.
 */

import { DEGREE_LABELS } from "./constants.js";
import { asElement, getSetting } from "./settings.js";

/** Resolve the originating item for a save message, if discoverable. */
function getOriginItem(message, context) {
  const uuid =
    message.flags?.pf2e?.origin?.uuid ??
    context?.origin?.uuid ??
    context?.item?.uuid ??
    null;
  if (!uuid) return null;
  try {
    return fromUuidSync(uuid);
  } catch (err) {
    return null;
  }
}

/** True when this save is against an incapacitation effect. */
function isIncapacitation(context, item) {
  const options = context?.options ?? [];
  if (options.some((o) => typeof o === "string" && o.includes("incapacitation"))) {
    return true;
  }
  const traits = context?.traits ?? [];
  if (traits.some((t) => (t?.value ?? t) === "incapacitation")) return true;

  const itemTraits = item?.system?.traits?.value ?? item?.traits ?? [];
  const list = itemTraits instanceof Set ? [...itemTraits] : itemTraits;
  return Array.isArray(list) && list.includes("incapacitation");
}

/**
 * Effective level of the incapacitation source. A spell counts as twice its rank;
 * everything else uses its own level.
 */
function getSourceLevel(item, context) {
  if (!item) {
    // Fall back to an origin:level: roll option when present.
    const opt = (context?.options ?? []).find((o) =>
      /^origin:(?:item:)?level:-?\d+$/.test(o ?? "")
    );
    if (opt) return Number(opt.split(":").pop());
    return null;
  }
  if (item.type === "spell") {
    const rank = item.rank ?? item.system?.level?.value ?? item.level;
    return typeof rank === "number" ? rank * 2 : null;
  }
  const level = item.level ?? item.system?.details?.level?.value ?? item.system?.level?.value;
  return typeof level === "number" ? level : null;
}

function naturalD20(roll) {
  const die = roll?.dice?.find((d) => d.faces === 20);
  if (!die) return null;
  const active = die.results?.find((r) => r.active) ?? die.results?.[0];
  return active?.result ?? die.total ?? null;
}

/** Degree of success (0..3) for a total vs DC, including nat 1/20 shifts. */
function degreeOfSuccess(total, dc, natural) {
  const delta = total - dc;
  let degree;
  if (delta >= 10) degree = 3;
  else if (delta >= 0) degree = 2;
  else if (delta <= -10) degree = 0;
  else degree = 1;

  if (natural === 20) degree = Math.min(degree + 1, 3);
  else if (natural === 1) degree = Math.max(degree - 1, 0);
  return degree;
}

export function renderIncapacitationBadge(message, html) {
  const root = asElement(html);
  if (!root) return;
  root.querySelector(".flatfinder-incapacitation")?.remove();

  if (!getSetting("incapacitation")) return;

  const context = message.flags?.pf2e?.context;
  if (context?.type !== "saving-throw") return;

  const item = getOriginItem(message, context);
  if (!isIncapacitation(context, item)) return;

  const actor = message.actor;
  const targetLevel = actor?.level ?? actor?.system?.details?.level?.value;
  const sourceLevel = getSourceLevel(item, context);
  if (typeof targetLevel !== "number" || typeof sourceLevel !== "number") return;

  const diff = targetLevel - sourceLevel;
  if (diff <= 0) return; // Only a higher-level target benefits.

  const bonus = Math.min(diff * 2, 10);

  const roll = message.rolls?.[0];
  const dc = context?.dc?.value;
  let resultLine = game.i18n.format("PF2E-FLATFINDER.Incapacitation.Bonus", { bonus });

  if (roll && typeof roll.total === "number" && typeof dc === "number") {
    const natural = naturalD20(roll);
    const before = degreeOfSuccess(roll.total, dc, natural);
    const after = degreeOfSuccess(roll.total + bonus, dc, natural);
    const afterLabel = game.i18n.localize(DEGREE_LABELS[after]);
    resultLine = game.i18n.format("PF2E-FLATFINDER.Incapacitation.Result", {
      bonus,
      degree: afterLabel,
    });
    if (after !== before) {
      const beforeLabel = game.i18n.localize(DEGREE_LABELS[before]);
      resultLine += ` (${beforeLabel} → ${afterLabel})`;
    }
  }

  const badge = document.createElement("div");
  badge.className = "flatfinder-incapacitation";
  badge.dataset.tooltip = game.i18n.format("PF2E-FLATFINDER.Incapacitation.Tooltip", {
    diff,
    bonus,
    target: targetLevel,
    source: sourceLevel,
  });
  badge.innerHTML =
    `<span class="ff-caption">${game.i18n.localize("PF2E-FLATFINDER.Incapacitation.Caption")}</span>` +
    `<span class="ff-label">${resultLine}</span>`;

  const content = root.querySelector(".message-content") ?? root;
  const diceRoll = content.querySelector(".dice-roll");
  if (diceRoll) diceRoll.insertAdjacentElement("afterend", badge);
  else content.appendChild(badge);
}
