// Laedt dist/app.js kopflos in einen vm-Kontext und gibt Physik und Geometrie frei.
//
// Warum kopflos: requestAnimationFrame steht still, sobald das Browserfenster
// verdeckt ist. Eine Pruefung im Browser meldet dann faelschlich "nichts bewegt sich".
// Hier wird step() direkt getrieben, deterministisch und ohne Bildschirm.
//
// Die Attrappen sind absichtlich stumpf: app.js zeichnet beim Laden nichts, aber es
// liest DOM-Knoten und haengt Ereignisse an. Alles davon darf ins Leere laufen.

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const APP = path.join(__dirname, '..', 'dist', 'app.js');

function createStubs() {
  const noop = () => {};
  const gradient = { addColorStop: noop };
  const ctx = new Proxy({}, {
    get: (_t, key) => {
      if (key === 'createLinearGradient' || key === 'createRadialGradient') return () => gradient;
      if (key === 'measureText') return () => ({ width: 0 });
      return noop;
    },
    set: () => true
  });
  const element = () => ({
    innerHTML: '', textContent: '', value: '0', hidden: false, children: [], style: {},
    classList: { toggle: noop, add: noop, remove: noop, contains: () => false },
    addEventListener: noop, setAttribute: noop, getContext: () => ctx,
    prepend: noop, replaceChildren: noop, appendChild: noop, remove: noop,
    scrollIntoView: noop, setPointerCapture: noop, releasePointerCapture: noop,
    getBoundingClientRect: () => ({ top: 0, left: 0 }),
    get lastElementChild() { return null; }
  });
  const cache = {};
  const document = {
    querySelector: sel => cache[sel] || (cache[sel] = element()),
    querySelectorAll: () => [],
    createElement: () => element(),
    addEventListener: noop,
    hidden: false
  };
  const sandbox = {
    document, console, Math, JSON, Date, String, Number, Array, Object,
    performance: { now: () => Date.now() },
    requestAnimationFrame: noop,
    addEventListener: noop
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  return sandbox;
}

// Der angehaengte Block laeuft im selben Gueltigkeitsbereich wie app.js und kommt
// deshalb an die per const/let deklarierten Namen heran, die sonst unerreichbar waeren.
const EXPORTS = `
;globalThis.__api = {
  step, makeBall, resetGame, collideBalls, launch, catmull, keys,
  get balls() { return balls }, set balls(v) { balls = v },
  get reserve() { return reserve },
  get locks() { return locks },
  get simTime() { return simTime },
  set ballSaveUntil(v) { ballSaveUntil = v },
  geometry: { R, W, H, PF_CENTER, walls, slings, posts, bumpers, aprons,
              flippers, rampPaths, plungerPath, oneWayGate }
};`;

function load() {
  const sandbox = createStubs();
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(APP, 'utf8') + EXPORTS, sandbox);
  return sandbox.__api;
}

module.exports = { load, APP };
