/**
 * SDS §9 decision-support rules (REACH Annex II, Reg. (EU) 2020/878).
 * "Applicable" means the SDS entry must be addressed, not that fresh testing is mandatory.
 * "Assess" deliberately avoids inferring non-applicability from physical state alone.
 */
export const PROPERTIES = [
  { id:"a", name:"Physical state", basis:"9.1(a)" },
  { id:"b", name:"Colour", basis:"9.1(b)" },
  { id:"c", name:"Odour", basis:"9.1(c)" },
  { id:"d", name:"Melting point / freezing point", basis:"9.1(d)" },
  { id:"e", name:"Boiling point / initial boiling point and boiling range", basis:"9.1(e)" },
  { id:"f", name:"Flammability", basis:"9.1(f)" },
  { id:"g", name:"Lower and upper explosion limit", basis:"9.1(g)" },
  { id:"h", name:"Flash point", basis:"9.1(h)" },
  { id:"i", name:"Auto-ignition temperature", basis:"9.1(i)" },
  { id:"j", name:"Decomposition temperature", basis:"9.1(j)" },
  { id:"k", name:"pH", basis:"9.1(k)" },
  { id:"l", name:"Kinematic viscosity", basis:"9.1(l)" },
  { id:"m", name:"Solubility", basis:"9.1(m)" },
  { id:"n", name:"Partition coefficient n-octanol/water (log value)", basis:"9.1(n)" },
  { id:"o", name:"Vapour pressure", basis:"9.1(o)" },
  { id:"p", name:"Density and/or relative density", basis:"9.1(p)" },
  { id:"q", name:"Relative vapour density", basis:"9.1(q)" },
  { id:"r", name:"Particle characteristics", basis:"9.1(r)" }
];

export const HAZARD_CLASSES = [
  ["Explosives", "Shock/impact/friction sensitivity, confinement effects, thermal stability and relevant packaging."],
  ["Flammable gases", "Explosion limits, TCi and fundamental burning velocity where relevant."],
  ["Aerosols", "Flammable component mass fraction when relevant under the aerosol provision."],
  ["Oxidising gases", "Oxygen-equivalency coefficient or calculated/tested oxidising power."],
  ["Gases under pressure", "Critical or pseudo-critical temperature."],
  ["Flammable liquids", "Sustained combustibility; flash and boiling points already belong in 9.1."],
  ["Flammable solids", "Burning rate/time and wetted-zone test results."],
  ["Self-reactive substances and mixtures", "Decomposition, detonation, deflagration and confinement effects."],
  ["Pyrophoric liquids", "Spontaneous ignition or filter-paper charring."],
  ["Pyrophoric solids", "Spontaneous ignition and change of pyrophoricity over time."],
  ["Self-heating substances and mixtures", "Ignition, maximum temperature rise and screening-test results."],
  ["Substances/mixtures emitting flammable gases on contact with water", "Gas identity, spontaneous ignition and evolution rate."],
  ["Oxidising liquids", "Spontaneous ignition when mixed with cellulose."],
  ["Oxidising solids", "Spontaneous ignition when mixed with cellulose."],
  ["Organic peroxides", "Decomposition/detonation/deflagration and confinement effects."],
  ["Corrosive to metals", "Metals affected, corrosion rate and material compatibility."],
  ["Desensitised explosives", "Desensitising agent, decomposition energy, corrected burning rate and explosive properties."]
];

export const SAFETY_CHARACTERISTICS = [
  ["Mechanical sensitivity", "Consider for energetic or impact/friction-sensitive materials."],
  ["Self-accelerating polymerisation temperature", "Consider when hazardous polymerisation can occur."],
  ["Formation of explosible dust/air mixtures", "Relevant to combustible powders; not gases, liquids or fully oxidised solids without combustible dust risk."],
  ["Acid/alkaline reserve", "Consider for strongly acidic or alkaline products and skin/eye hazard assessments."],
  ["Evaporation rate", "Consider when volatile liquid evaporation influences exposure or fire risk."],
  ["Miscibility", "Consider when liquid/liquid behaviour matters for safe use."],
  ["Conductivity", "Consider when static electricity or electrical behaviour affects safety."],
  ["Corrosiveness", "Consider where compatibility with equipment/packaging matters."],
  ["Gas group", "Consider when selection of explosion-protected equipment is relevant."],
  ["Redox potential", "Consider if oxidation/reduction behaviour matters."],
  ["Radical formation potential", "Consider for relevant reactive substances or nanoforms."],
  ["Photocatalytic properties", "Consider for relevant photoactive substances or nanoforms."]
];

export const STATUS = Object.freeze({
  APPLICABLE: "applicable",
  NOT_APPLICABLE: "not-applicable",
  ASSESS: "assess"
});

export function evaluate(input = {}) {
  const {
    state = "liquid",
    kind = "substance",
    aerosol = false,
    chemistry = "unknown",
    phContext = "unknown",
    solidForm = "unknown"
  } = input;
  if (!["solid","liquid","gas"].includes(state)) throw new RangeError("state must be solid, liquid or gas");
  if (!["substance","mixture"].includes(kind)) throw new RangeError("kind must be substance or mixture");
  if (!["unknown","organic","inorganic","ionic-liquid"].includes(chemistry)) throw new RangeError("invalid chemistry");
  if (!["unknown","aqueous","non-polar","insoluble","water-reactive"].includes(phContext)) throw new RangeError("invalid pH context");
  if (!["unknown","particulate","monolithic"].includes(solidForm)) throw new RangeError("invalid solid form");

  const rows = new Map();
  const add = (id, status, reason, guidance) => rows.set(id,{status,reason,guidance});

  add("a",STATUS.APPLICABLE,"Physical state is required for every substance and mixture.","Report solid, liquid or gas under the CLP definitions at standard conditions (generally 20 °C and 101.3 kPa).");
  add("b",STATUS.APPLICABLE,"Colour is required for the material as supplied.","Describe the colour; 'various' may be used for multiple mixture colour variants covered by one SDS.");
  add("c",STATUS.ASSESS,"Give a qualitative odour description where known or described in literature.","Include the odour threshold if available. 'Odourless' is different from 'not applicable'.");

  add("d",state==="gas"?STATUS.NOT_APPLICABLE:STATUS.APPLICABLE,
    state==="gas"?"Annex II explicitly excludes gases.":"Melting/freezing information applies to solids and liquids.",
    state==="gas"?"Suggested entry: Not applicable (gas).":"For waxes/pastes a softening point/range may replace a melting point. State if a mixture cannot technically be measured or if decomposition/sublimation occurs.");
  add("e",STATUS.APPLICABLE,
    "The boiling-point requirement has no blanket exclusion based solely on physical state.",
    "Report the boiling point/range at standard pressure when meaningful. Note decomposition, sublimation or method limits. If a mixture cannot technically be determined, report the lowest-boiling ingredient as specified in Annex II.");
  add("f",STATUS.APPLICABLE,"Annex II states flammability applies to gases, liquids and solids.","Indicate whether ignitable, even if not classified as flammable. Do not confuse 'not classified' with 'not combustible'.");

  add("g",state==="solid"?STATUS.NOT_APPLICABLE:STATUS.ASSESS,
    state==="solid"?"Annex II expressly excludes solids from gas/vapour explosion limits.":"Depends on whether a flammable gas or vapour atmosphere can form; physical state alone is insufficient.",
    state==="solid"?"Suggested entry: Not applicable (solid). Assess combustible dust under 9.2.2(c).":"For flammable liquids, at least the lower explosion limit should be indicated; consider higher-temperature determination where standard temperature is unsuitable.");
  add("h",state==="solid"||state==="gas"||aerosol?STATUS.NOT_APPLICABLE:STATUS.APPLICABLE,
    aerosol?"Annex II expressly excludes aerosols from this 9.1 entry.":state==="solid"?"Annex II expressly excludes solids.":state==="gas"?"Annex II expressly excludes gases.":"Flash point applies to liquids (other than aerosols).",
    aerosol?"Suggested entry: Not applicable (aerosol). Assess aerosol flammability separately.":state!=="liquid"?"Suggested entry: Not applicable ("+state+").":"Report mixture flash point if available; otherwise the lowest-flash-point ingredients as Annex II requires. A negative test result is not 'N/A'.");
  add("i",state==="solid"?STATUS.NOT_APPLICABLE:STATUS.APPLICABLE,
    state==="solid"?"Annex II limits this entry to gases and liquids.":"Annex II specifically applies this entry to gases and liquids.",
    state==="solid"?"Suggested entry: Not applicable (solid). Solid ignition hazards may still need reporting elsewhere.":"For mixtures use the mixture value if available; otherwise list the ingredients with the lowest auto-ignition temperatures.");

  add("j",STATUS.ASSESS,"Applies to self-reactives, organic peroxides and any other product that may decompose, regardless of physical state.",
    "If relevant report SADT (and volume) or decomposition onset, identifying which. If no decomposition observed state the tested temperature limit. Do not infer 'N/A' from missing data.");

  if(state==="gas") {
    add("k",STATUS.NOT_APPLICABLE,"Annex II explicitly excludes gases.","Suggested entry: Not applicable (gas).");
  } else if(phContext==="non-polar"||phContext==="insoluble"||phContext==="water-reactive") {
    const label={ "non-polar":"non-polar/aprotic material","insoluble":"water-insoluble material","water-reactive":"material that reacts with water" }[phContext];
    add("k",STATUS.ASSESS,"The selected "+label+" may prevent a meaningful aqueous pH measurement, but this needs product-specific justification.",
      "Record 'Not applicable' only if a meaningful aqueous pH cannot be established. Explain the reason; consider available acidity/alkalinity information.");
  } else {
    add("k",phContext==="aqueous"?STATUS.APPLICABLE:STATUS.ASSESS,
      phContext==="aqueous"?"An aqueous sample/solution is specified; aqueous pH should be addressed.":"A pH value must be linked to an aqueous medium, not assumed from state alone.",
      state==="solid"?"If an aqueous solution/suspension is meaningful, report its pH and test concentration. If not, explain why.":"For aqueous liquid report pH as supplied. For non-aqueous material, assess whether a meaningful aqueous pH exists.");
  }

  add("l",state==="liquid"?STATUS.APPLICABLE:STATUS.NOT_APPLICABLE,
    state==="liquid"?"Kinematic viscosity applies to liquids.":"Annex II restricts kinematic viscosity to liquids.",
    state==="liquid"?"Report mm²/s (and test temperature when relevant); indicate thixotropic or rheopectic behaviour for non-Newtonian liquids.":"Suggested entry: Not applicable ("+state+").");
  add("m",STATUS.APPLICABLE,"Water solubility must be addressed for each state; insoluble is a result, not 'N/A'.",
    "Report water solubility/miscibility; for mixtures specify full or partial solubility. If nanoforms are present, report dissolution rate in relevant media.");

  if(chemistry==="inorganic"||chemistry==="ionic-liquid") {
    add("n",STATUS.NOT_APPLICABLE,"Annex II excludes "+(chemistry==="inorganic"?"inorganic substances":"ionic liquids")+" from log Kow.",
      "Suggested entry: Not applicable ("+(chemistry==="inorganic"?"inorganic substance":"ionic liquid")+"). For relevant nanoforms, assess dispersion stability instead.");
  } else if(kind==="mixture") {
    add("n",STATUS.ASSESS,"Annex II says log Kow does not generally apply to mixtures, but this is not an unconditional exclusion.",
      "Normally record 'Not generally applicable to the mixture'; if reporting individual ingredients identify each ingredient. Assess whether exceptions or nanoform dispersion stability are relevant.");
  } else {
    add("n",chemistry==="organic"?STATUS.APPLICABLE:STATUS.ASSESS,
      chemistry==="organic"?"For an organic substance that is not an ionic liquid, log Kow is generally relevant.":"Applicability depends on chemistry: Annex II excludes inorganic substances and ionic liquids.",
      "If available, report log Kow and specify whether tested or calculated. For nanoforms to which log Kow does not apply, give dispersion stability.");
  }

  add("o",state==="liquid"?STATUS.APPLICABLE:STATUS.ASSESS,
    state==="liquid"?"Vapour pressure applies to liquid substances/mixtures.":"Solids may sublime and liquefied gases may have saturation pressure; state alone cannot establish 'N/A'.",
    "Report at standard temperature; volatile fluids also require 50 °C. For liquid mixtures/liquefied-gas mixtures follow the mixture-specific range or most-volatile-ingredient provisions.");
  add("p",state==="gas"?STATUS.NOT_APPLICABLE:STATUS.APPLICABLE,
    state==="gas"?"Annex II limits this entry to liquids and solids.":"Annex II applies density/relative density to liquids and solids.",
    state==="gas"?"Suggested entry: Not applicable (gas).":"Report absolute density (units) and/or dimensionless relative density (reference water at 4 °C); legitimate product ranges are possible.");
  add("q",state==="solid"?STATUS.NOT_APPLICABLE:STATUS.APPLICABLE,
    state==="solid"?"Annex II limits relative vapour density to gases and liquids.":"Relative gas/vapour density applies, referenced to air at 20 °C.",
    state==="solid"?"Suggested entry: Not applicable (solid).":"Report relative gas/vapour density (air = 1), and note the relevant conditions.");
  if(state!=="solid") {
    add("r",STATUS.NOT_APPLICABLE,"Annex II restricts particle characteristics to solids.","Suggested entry: Not applicable ("+state+").");
  } else if(solidForm==="monolithic") {
    add("r",STATUS.ASSESS,"The material is described as monolithic; particle-size measurements may not be meaningful for the supplied form.",
      "If justified, explain that it is non-particulate as supplied; consider particles/dust arising from foreseeable grinding or cutting.");
  } else {
    add("r",STATUS.APPLICABLE,"Annex II applies particle characteristics to solids.",
      "Report median equivalent diameter, calculation basis and variation range where meaningful. Describe relevant nanoform characteristics or cross-reference them.");
  }

  return PROPERTIES.map(property=>({ ...property, ...rows.get(property.id) }));
}
