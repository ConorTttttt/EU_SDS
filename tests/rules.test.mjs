import test from "node:test";
import assert from "node:assert/strict";
import { evaluate, PROPERTIES, HAZARD_CLASSES, SAFETY_CHARACTERISTICS, STATUS } from "../rules.mjs";

const byId = (rows, id) => {
  const result = rows.find(item => item.id === id);
  assert.ok(result, "expected 9.1(" + id + ")");
  return result;
};
const N = STATUS.NOT_APPLICABLE;
const A = STATUS.APPLICABLE;
const R = STATUS.ASSESS;

test("all 18 subsection 9.1 properties are returned in the legal order", () => {
  assert.equal(PROPERTIES.length, 18);
  assert.equal(HAZARD_CLASSES.length, 17);
  assert.equal(SAFETY_CHARACTERISTICS.length, 12);
  assert.equal(evaluate({state:"solid"}).map(p=>p.id).join(""), "abcdefghijklmnopqr");
  for(const state of ["solid","liquid","gas"]) {
    const rows = evaluate({state});
    assert.equal(rows.length,18);
    assert.ok(rows.every(r => r.reason && r.guidance && r.basis));
    assert.ok(rows.every(r => [A,N,R].includes(r.status)));
  }
});

test("solid: express exclusions and dust caveat", () => {
  const rows=evaluate({state:"solid"});
  for(const id of ["g","h","i","l","q"]) assert.equal(byId(rows,id).status,N,id);
  assert.equal(byId(rows,"f").status,A);
  assert.equal(byId(rows,"m").status,A);
  assert.equal(byId(rows,"r").status,A);
  assert.match(byId(rows,"g").guidance,/dust/i);
});

test("gas: express physical-state exclusions but not blanket solubility exemption", () => {
  const rows=evaluate({state:"gas"});
  for(const id of ["d","h","k","l","p","r"]) assert.equal(byId(rows,id).status,N,id);
  assert.equal(byId(rows,"f").status,A);
  assert.equal(byId(rows,"m").status,A);
  assert.equal(byId(rows,"q").status,A);
  assert.equal(byId(rows,"o").status,R);
});

test("liquid: required liquid properties, conditional explosion limits", () => {
  const rows=evaluate({state:"liquid"});
  for(const id of ["h","i","l","p","q"]) assert.equal(byId(rows,id).status,A,id);
  assert.equal(byId(rows,"r").status,N);
  assert.equal(byId(rows,"g").status,R);
});

test("aerosol presentation suppresses 9.1 flash point only", () => {
  const rows=evaluate({state:"liquid", aerosol:true});
  assert.equal(byId(rows,"h").status,N);
  assert.match(byId(rows,"h").reason,/aerosol/i);
  assert.equal(byId(rows,"l").status,A);
});

test("inorganic or ionic-liquid log Kow exclusions", () => {
  for (const chemistry of ["inorganic","ionic-liquid"]) {
    const rows=evaluate({state:"liquid",kind:"substance",chemistry});
    assert.equal(byId(rows,"n").status,N);
  }
});

test("mixture log Kow stays for assessment, not an unconditional exclusion", () => {
  const rows=evaluate({state:"liquid",kind:"mixture",chemistry:"unknown"});
  assert.equal(byId(rows,"n").status,R);
  assert.match(byId(rows,"n").reason,/not generally/i);
});

test("pH requires aqueous context for non-gases", () => {
  assert.equal(byId(evaluate({state:"liquid",phContext:"aqueous"}),"k").status,A);
  assert.equal(byId(evaluate({state:"liquid",phContext:"non-polar"}),"k").status,R);
  assert.equal(byId(evaluate({state:"solid",phContext:"insoluble"}),"k").status,R);
  assert.equal(byId(evaluate({state:"gas",phContext:"aqueous"}),"k").status,N);
});

test("monolithic solid particle characteristics not automatically excluded", () => {
  const rows=evaluate({state:"solid",solidForm:"monolithic"});
  assert.equal(byId(rows,"r").status,R);
  assert.match(byId(rows,"r").guidance,/dust|particulate/i);
});

test("no unsafe automatic N/A based only on absent data", () => {
  const solid=evaluate({state:"solid",kind:"mixture"});
  assert.equal(byId(solid,"j").status,R);
  assert.equal(byId(solid,"o").status,R);
  assert.equal(byId(solid,"c").status,R);
  const gas=evaluate({state:"gas"});
  assert.equal(byId(gas,"g").status,R);
});

test("unknown state and chemistry values are rejected", () => {
  assert.throws(()=>evaluate({state:"plasma"}),RangeError);
  assert.throws(()=>evaluate({state:"liquid",kind:"article"}),RangeError);
  assert.throws(()=>evaluate({state:"solid",chemistry:"guess"}),RangeError);
});
