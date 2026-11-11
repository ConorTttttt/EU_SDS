# EU SDS — Section 9 applicability calculator

A static, browser-based decision-support tool for **REACH Annex II, Section 9** (Regulation (EC) No 1907/2006 as amended by Regulation (EU) 2020/878). Select a product's **physical state** and **substance/mixture** status to review which of the 18 properties in subsection 9.1 are applicable, not applicable, or require further assessment. Optional details refine certain decisions.

## Start

Open `index.html` in a modern browser, or publish the repository using **GitHub Pages** (Settings → Pages → Deploy from a branch → main → /root). No backend, account or dependencies are required.

## Reading the results

- **Applicable**: the entry should be addressed. A numerical result is not necessarily available.
- **Not applicable**: Annex II provides an explicit physical-state exclusion or the additional user-supplied detail supports a specific exclusion. Document the reason.
- **Assess**: physical state alone does **not** justify non-applicability. Gather product-specific data and state if data are unavailable.

All **18** subsection 9.1 entries must be addressed. The list in **9.2** is *selective*: disclose other information where relevant to safe use, not every hazard class with a generic 'N/A'.

The calculator is an **authoring aid**, not a regulatory compliance determination. Physical state alone is insufficient to decide many properties; do not treat 'Assess' as an exemption. Product composition, form, conditions of use, classification and test/literature data must be considered. It does not calculate physical properties or create a complete SDS.

## Sources

- REACH Annex II, §9.1(a)–(r), §9.2.1 and §9.2.2 as amended by [Commission Regulation (EU) 2020/878](https://eur-lex.europa.eu/eli/reg/2020/878/oj).
- ECHA, *Guidance on the compilation of safety data sheets*, Version 4.0 (December 2020), §3.9.
- REACH consolidated regulation: https://eur-lex.europa.eu/eli/reg/2006/1907

## Run tests

```sh
node --test tests/*.test.mjs
```

## Features

- Solid, liquid and gas with optional aerosol presentation.
- Substance/mixture distinction, inorganic/ionic-liquid refinement, aqueous pH context and particulate-solid context.
- Legal basis and suggested SDS text for each decision.
- Filter/search, copy an authoring checklist, export CSV, and print.

© Contributors. No legal advice.
