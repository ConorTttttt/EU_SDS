import { evaluate, STATUS, HAZARD_CLASSES, SAFETY_CHARACTERISTICS } from "./rules.mjs";

const $ = id => document.getElementById(id);
const form = $("calculator-form");
const list = $("result-list");
const statusNames = {
  [STATUS.APPLICABLE]: "Applicable",
  [STATUS.NOT_APPLICABLE]: "Not applicable",
  [STATUS.ASSESS]: "Needs assessment"
};
let current = [];

function options() {
  const data = new FormData(form);
  return {
    state: data.get("state") || "liquid",
    kind: data.get("kind") || "substance",
    aerosol: $("aerosol").checked,
    chemistry: data.get("chemistry") || "unknown",
    phContext: data.get("phContext") || "unknown",
    solidForm: data.get("solidForm") || "unknown"
  };
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function appendLabeledText(parent, label, value) {
  const p = element("p");
  p.append(element("strong", null, label), document.createTextNode(value));
  parent.append(p);
}

function renderRow(row) {
  const card = element("article", "result-card");
  const header = element("div", "result-main");
  const index = element("span", "property-index", row.id.toUpperCase());
  const name = element("div", "property-name", row.name);
  const basis = element("small", "property-ref", "REACH Annex II · " + row.basis);
  name.append(basis);
  const badge = element("span", "status status-" + row.status, statusNames[row.status]);
  header.append(index, name, badge);
  const detail = element("div", "result-detail");
  appendLabeledText(detail, "Why: ", row.reason);
  appendLabeledText(detail, "Authoring note: ", row.guidance);
  card.append(header, detail);
  return card;
}

function profileText(input) {
  return (input.aerosol ? "aerosol-presented " : "") + input.state + " " + input.kind;
}

function render() {
  const input = options();
  current = evaluate(input);
  $("selected-profile").textContent = profileText(input);

  const counts = {
    [STATUS.APPLICABLE]: 0,
    [STATUS.NOT_APPLICABLE]: 0,
    [STATUS.ASSESS]: 0
  };
  current.forEach(row => counts[row.status]++);
  $("count-applicable").textContent = String(counts[STATUS.APPLICABLE]);
  $("count-not-applicable").textContent = String(counts[STATUS.NOT_APPLICABLE]);
  $("count-assess").textContent = String(counts[STATUS.ASSESS]);

  const query = $("search").value.trim().toLocaleLowerCase();
  const filter = $("filter").value;
  const visible = current.filter(row =>
    (filter === "all" || row.status === filter) &&
    (!query || [row.name, row.basis, row.reason, row.guidance, row.id].join(" ").toLocaleLowerCase().includes(query))
  );
  list.replaceChildren(...visible.map(renderRow));
  $("no-results").hidden = visible.length > 0;
}

function renderExtras(id, rows) {
  const target = $(id);
  for (const [name, description] of rows) {
    const item = element("div", "extra-item");
    item.append(element("strong", null, name), element("p", null, description));
    target.append(item);
  }
}

function checklistText() {
  return [
    "# EU SDS — Section 9.1 applicability",
    "Profile: " + profileText(options()),
    "Source: REACH Annex II §9.1, Regulation (EU) 2020/878",
    "Statuses are an authoring aid, not a compliance determination.",
    "",
    ...current.map(row =>
      "- [ ] 9.1(" + row.id + ") " + row.name + " — " + statusNames[row.status] +
      "\n  Why: " + row.reason + "\n  Note: " + row.guidance
    )
  ].join("\n");
}

async function copyChecklist() {
  const value = checklistText();
  try {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
    await navigator.clipboard.writeText(value);
    feedback("Checklist copied.");
  } catch {
    // Fallback for browsers without Clipboard API permission.
    const text = element("textarea");
    text.value = value;
    text.style.position = "fixed";
    text.style.left = "-10000px";
    document.body.append(text);
    text.select();
    try {
      if (!document.execCommand("copy")) throw new Error("Copy unavailable");
      feedback("Checklist copied.");
    } catch {
      feedback("Copy blocked by browser. Use the CSV export instead.");
    } finally {
      text.remove();
    }
  }
}

function csvEscape(value) {
  // Quote every field, doubling embedded quotes. Guard formula injection
  // should a spreadsheet application open the file.
  const source = String(value);
  const safe = /^[=+\-@\t\r]/.test(source) ? "'" + source : source;
  return '"' + safe.replaceAll('"', '""') + '"';
}

function downloadCSV() {
  const headings = ["Reference","Property","Status","Reason","Authoring note","Profile"];
  const rows = [
    headings,
    ...current.map(row=>[row.basis,row.name,statusNames[row.status],row.reason,row.guidance,profileText(options())])
  ];
  const csv = "\uFEFF" + rows.map(cols=>cols.map(csvEscape).join(",")).join("\r\n");
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const anchor = element("a");
  anchor.href = url;
  anchor.download = "EU_SDS_section_9_applicability.csv";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  feedback("CSV exported.");
}

function feedback(message) { $("feedback").textContent = message; }

form.addEventListener("change", render);
form.addEventListener("input", render);
form.addEventListener("reset", () => {
  // Form values are not reset until the reset event completes.
  queueMicrotask(() => { $("search").value = ""; $("filter").value = "all"; feedback(""); render(); });
});
$("search").addEventListener("input", render);
$("filter").addEventListener("change", render);
$("copy").addEventListener("click", copyChecklist);
$("csv").addEventListener("click", downloadCSV);
$("print").addEventListener("click", () => window.print());

renderExtras("hazard-classes", HAZARD_CLASSES);
renderExtras("other-characteristics", SAFETY_CHARACTERISTICS);
render();
