import "./style.css";

const stage = document.querySelector<HTMLElement>("#typing-stage");
const field = document.querySelector<HTMLElement>(".code-field");
const floatingCode = document.querySelector<HTMLElement>("#floating-code");
const globalAir = document.querySelector<HTMLElement>("#global-air");
const sceneAir = document.querySelector<SVGGElement>("#scene-air");
const windToggle = document.querySelector<HTMLButtonElement>("#wind-toggle");
const fieldToggle = document.querySelector<HTMLButtonElement>("#field-wind-toggle");
const windLabel = document.querySelector<HTMLElement>("#wind-label");
const windStatus = document.querySelector<HTMLElement>("#wind-status");
const screenCode = document.querySelector<HTMLElement>("#screen-code");

let windOn = true;
let screenTimer = 0;

/* ---------- Live C# on the monitor ---------- */
const screenLines = [
  'using System;',
  '',
  'public class Elmamun',
  '{',
  `    public string Name = "Elma'mun";`,
  '    public string Handle = "abul_farajj";',
  '    public string Role = "fundev";',
  '',
  '    public string[] Projects = {',
  '        "NUNSA-FUD",',
  '        "Yap",',
  '        "Ashaari"',
  '    };',
  '',
  '    public string[] Stack = {',
  '        "C#", "JavaScript", "TypeScript",',
  '        "React", "Next.js", "Firebase",',
  '        "Node.js", "Express.js", "MySQL",',
  '        "MongoDB"',
  '    };',
  '',
  '    public string[] Languages = {',
  '        "English", "Yoruba", "Arabic",',
  '        "Hausa", "Nigerian Pidgin",',
  '        "Turkish (beginner)"',
  '    };',
  '',
  '    public string Interests =',
  '        "History, culture, linguistics";',
  '',
  '    public void KeepBuilding()',
  '    {',
  '        Console.WriteLine("Keep building.");',
  '    }',
  '}'
];

const escapeHtml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Minimal C# highlighter: strings, keywords, types. Safe against partially typed lines. */
function highlight(line: string): string {
  const token = /("(?:[^"\\]|\\.)*"?)|\b(using|public|class|void|new|return)\b|\b(string|System|Console)\b/g;
  let out = "";
  let last = 0;
  for (const match of line.matchAll(token)) {
    const index = match.index ?? 0;
    out += escapeHtml(line.slice(last, index));
    const cls = match[1] ? "str" : match[2] ? "kw" : "ty";
    out += `<span class="${cls}">${escapeHtml(match[0])}</span>`;
    last = index + match[0].length;
  }
  return out + escapeHtml(line.slice(last));
}

function renderScreen(buffer: string) {
  if (!screenCode) return;
  const lines = buffer.split("\n");
  const editor = screenCode.parentElement;
  screenCode.innerHTML = lines
    .map((line, i) => {
      const cursor = i === lines.length - 1 ? '<span class="screen-cursor"></span>' : "";
      return `<span class="ln"><i class="no">${String(i + 1).padStart(2, "0")}</i>${highlight(line)}${cursor}</span>`;
    })
    .join("");
  if (editor) editor.scrollTop = editor.scrollHeight; // keep the newest line in view
}

let screenLineIndex = 0;
let screenCharIndex = 0;
let screenBuffer = "";

function typeOnMonitor() {
  if (!screenCode) return;
  const line = screenLines[screenLineIndex] ?? "";
  if (screenCharIndex < line.length) {
    screenBuffer += line[screenCharIndex++];
    renderScreen(screenBuffer);
    screenTimer = window.setTimeout(typeOnMonitor, line[screenCharIndex - 1] === " " ? 22 : 42 + Math.random() * 45);
    return;
  }
  screenLineIndex++;
  screenCharIndex = 0;
  if (screenLineIndex >= screenLines.length) {
    screenTimer = window.setTimeout(() => {
      screenLineIndex = 0;
      screenBuffer = "";
      renderScreen("");
      screenTimer = window.setTimeout(typeOnMonitor, 450);
    }, 4200);
    return;
  }
  screenBuffer += "\n";
  renderScreen(screenBuffer);
  screenTimer = window.setTimeout(typeOnMonitor, line.length === 0 ? 180 : 180 + Math.random() * 200);
}
renderScreen("");
screenTimer = window.setTimeout(typeOnMonitor, 1100);

/* ---------- Air current: three layers, one toggle ---------- */

// 1) Fragments drifting through the hero scene (SVG text, scene coordinates).
const sceneFragments: Array<[string, number, number]> = [
  ['public class Elmamun', 18, 292],
  ['string Handle = "abul_farajj";', 36, 56],
  ['NUNSA-FUD', 440, 292],
  ['while (curious) Learn();', 430, 392],
  ['using System;', 28, 232],
  ['var projects = new List<Project>();', 330, 14],
  ['Console.WriteLine("still becoming");', 120, 440],
  ['if (idea != null) Build(idea);', 380, 270],
  ['history.ForEach(lesson => Learn(lesson));', 20, 380],
  ['return BuildSomethingUseful();', 360, 440]
];
function createSceneAir() {
  if (!sceneAir) return;
  const ns = "http://www.w3.org/2000/svg";
  sceneFragments.forEach(([textContent, x, y], index) => {
    const el = document.createElementNS(ns, "text");
    el.textContent = textContent;
    el.setAttribute("x", String(x));
    el.setAttribute("y", String(y));
    el.style.setProperty("--dur", `${17 + (index % 5) * 3.2}s`);
    el.style.setProperty("--delay", `${-(index * 2.3)}s`);
    sceneAir.appendChild(el);
  });
}
createSceneAir();

// 2) Words drifting through the "code in the atmosphere" section.
const floatingWords = [
  'string Handle = "abul_farajj";', 'public class Elmamun { }',
  'NUNSA-FUD Voting · student election platform', 'C# · JavaScript · TypeScript',
  'React + Next.js', 'Firebase · Node.js · Express.js',
  'MongoDB · MySQL', 'HTML · CSS · JavaScript',
  'English · Yoruba · Arabic', 'Hausa · Nigerian Pidgin · Turkish',
  'history.map(lesson => learn(lesson));', 'build(); learn(); repeat();',
  'curiosity is a feature, not a bug;', 'culture + code + curiosity',
  'every project teaches something new;', 'console.log("still becoming");',
  'NUNSA-FUD', 'string Role = "fundev";'
];
function createFloatingCode() {
  if (!floatingCode) return;
  floatingWords.forEach((word, index) => {
    const span = document.createElement("span");
    span.textContent = word;
    span.style.setProperty("--left", `${(index * 37 + 7) % 92}%`);
    span.style.setProperty("--top", `${(index * 23 + 5) % 90}%`);
    span.style.setProperty("--duration", `${10 + (index % 8) * 1.9}s`);
    span.style.setProperty("--delay", `${-(index % 11) * 1.7}s`);
    span.style.setProperty("--rot", `${(index % 5 - 2) * 2}deg`);
    floatingCode.appendChild(span);
  });
}
createFloatingCode();

// 3) A very faint page-wide current.
function createGlobalAir() {
  if (!globalAir) return;
  const fragments = ["public class Elmamun", "C# · C · JavaScript", "NUNSA-FUD", 'string Role = "fundev";', "React · Next.js", "Yoruba · Arabic · Hausa", "Windows", "build(); learn();", "HTML · CSS · JavaScript", "history → ideas"];
  fragments.forEach((fragment, index) => {
    const span = document.createElement("span");
    span.textContent = fragment;
    span.style.setProperty("--air-x", `${(index * 17 + 4) % 94}%`);
    span.style.setProperty("--air-y", `${(index * 29 + 8) % 96}%`);
    span.style.setProperty("--air-duration", `${24 + (index % 6) * 7}s`);
    span.style.setProperty("--air-delay", `${-(index * 3)}s`);
    globalAir.appendChild(span);
  });
}
createGlobalAir();

function setWind(nextState: boolean) {
  windOn = nextState;
  document.body.classList.toggle("air-current-off", !windOn);
  stage?.classList.toggle("wind-off", !windOn);
  field?.classList.toggle("wind-off", !windOn);
  if (windLabel) windLabel.textContent = windOn ? "AIR CURRENT ON" : "AIR CURRENT OFF";
  if (windStatus) windStatus.textContent = windOn ? "AIR CURRENT: ON" : "AIR CURRENT: OFF";
  if (windToggle) {
    windToggle.setAttribute("aria-pressed", String(windOn));
    windToggle.title = windOn ? "Air current is on. Code drifts through the scene." : "Air current is off. Watch the presenter type in still air.";
  }
  if (fieldToggle) fieldToggle.textContent = windOn ? "TURN AIR CURRENT OFF ↘" : "TURN AIR CURRENT ON ↗";
}
windToggle?.addEventListener("click", () => setWind(!windOn));
fieldToggle?.addEventListener("click", () => setWind(!windOn));
setWind(true);

/* ---------- Motion preferences and small interactions ---------- */
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
if (reducedMotion.matches) {
  window.clearTimeout(screenTimer);
  renderScreen(screenLines.join("\n"));
}

// Gentle parallax on the in-scene fragments while the current is on.
stage?.addEventListener("pointermove", (event: PointerEvent) => {
  if (!windOn || event.pointerType === "touch") return;
  const rect = stage.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  sceneAir?.style.setProperty("--pointer-x", `${x * 12}px`);
  sceneAir?.style.setProperty("--pointer-y", `${y * 8}px`);
});
stage?.addEventListener("pointerleave", () => {
  sceneAir?.style.removeProperty("--pointer-x");
  sceneAir?.style.removeProperty("--pointer-y");
});

document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", () => {
    const target = link.getAttribute("href");
    if (target && target.length > 1) document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
  });
});
