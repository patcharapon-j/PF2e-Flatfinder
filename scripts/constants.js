/**
 * Shared constants for the PF2e Flatfinder module.
 */

export const MODULE_ID = "pf2e-flatfinder";

/**
 * Competence-check thresholds (Flatfinder v2.2, "Table: Competence Check thresholds").
 * Bands are ordered from worst (index 0) to best (index 7). A roll's band is the
 * highest band whose `min` is <= the check total. Totals below 0 fall into index 0.
 */
export const COMPETENCE_BANDS = [
  { key: "unbelievable", min: -Infinity, label: "PF2E-FLATFINDER.Competence.Band.Unbelievable" },
  { key: "gross", min: 0, label: "PF2E-FLATFINDER.Competence.Band.Gross" },
  { key: "poor", min: 5, label: "PF2E-FLATFINDER.Competence.Band.Poor" },
  { key: "decent", min: 10, label: "PF2E-FLATFINDER.Competence.Band.Decent" },
  { key: "solid", min: 15, label: "PF2E-FLATFINDER.Competence.Band.Solid" },
  { key: "impressive", min: 20, label: "PF2E-FLATFINDER.Competence.Band.Impressive" },
  { key: "amazing", min: 25, label: "PF2E-FLATFINDER.Competence.Band.Amazing" },
  { key: "extraordinary", min: 30, label: "PF2E-FLATFINDER.Competence.Band.Extraordinary" },
];

/**
 * The Proficiency-without-Level creature XP table referenced by Flatfinder's
 * Encounter Building chapter, keyed by (creature level - party level).
 */
export const PWL_XP_BY_DIFF = {
  "-7": 9,
  "-6": 12,
  "-5": 14,
  "-4": 18,
  "-3": 21,
  "-2": 26,
  "-1": 32,
  "0": 40,
  "1": 48,
  "2": 60,
  "3": 72,
  "4": 90,
  "5": 108,
  "6": 135,
  "7": 160,
};

export const PWL_DIFF_MIN = -7;
export const PWL_DIFF_MAX = 7;

/**
 * Standard PF2e encounter budget, expressed for a party of 4 with the
 * per-extra-character adjustment that scales the budget for other party sizes.
 */
export const ENCOUNTER_BUDGET = {
  trivial: { base: 40, perPc: 10 },
  low: { base: 60, perPc: 15 },
  moderate: { base: 80, perPc: 20 },
  severe: { base: 120, perPc: 30 },
  extreme: { base: 160, perPc: 40 },
};

export const DEGREE_LABELS = [
  "PF2E-FLATFINDER.Degree.CriticalFailure",
  "PF2E-FLATFINDER.Degree.Failure",
  "PF2E-FLATFINDER.Degree.Success",
  "PF2E-FLATFINDER.Degree.CriticalSuccess",
];
