import { writeFileSync, mkdirSync } from "node:fs";
const covers = [
  ["THE QUIET", "FOREST", "ELENA WOODS", "#263f37", "#d5d0a5", "forest"],
  ["A UNIVERSE", "OF QUESTIONS", "DANIEL REED", "#243b50", "#d9d5b8", "space"],
  ["LETTERS FROM", "YESTERDAY", "AMELIA HART", "#a77451", "#f8ead0", "letter"],
  ["THE LITTLE", "MOON EXPLORER", "MAYA CHEN", "#9aaca0", "#f6e9b7", "moon"],
  ["THE ART OF", "SLOWING DOWN", "OLIVER JAMES", "#d6c4a3", "#394b39", "sun"],
  ["BEYOND THE", "BLUE HORIZON", "SOFIA BENNETT", "#4f7882", "#f0e3c5", "sea"],
  ["THE HIDDEN", "GARDEN", "ISABEL GREEN", "#4c6046", "#ead9a5", "forest"],
  [
    "WONDERS OF THE",
    "NATURAL WORLD",
    "NOAH BROOKS",
    "#5c7459",
    "#eee6c8",
    "sun",
  ],
  [
    "STORIES OF THE",
    "SILK ROAD",
    "LEILA AHMED",
    "#8c644d",
    "#f5dfaf",
    "letter",
  ],
];
mkdirSync(new URL("../public/covers/", import.meta.url), { recursive: true });
for (let i = 0; i < covers.length; i++) {
  const [line1, line2, author, bg, fg, type] = covers[i];
  const shapes = {
    forest: `<circle cx="150" cy="230" r="73" fill="${fg}" opacity=".7"/><path d="M40 337 105 190 170 337Z" fill="#456855"/><path d="M125 348 193 170 260 348Z" fill="#1b3a30"/><path d="M85 350 140 222 195 350Z" fill="#648168"/><path d="M105 310v55m88-70v70m-53-42v42" stroke="${fg}" opacity=".7" stroke-width="3"/>`,
    space: `<g stroke="${fg}" fill="none" opacity=".8"><circle cx="150" cy="252" r="69"/><ellipse cx="150" cy="252" rx="110" ry="31" transform="rotate(-32 150 252)"/><circle cx="150" cy="252" r="37"/></g><circle cx="150" cy="252" r="7" fill="${fg}"/><g fill="${fg}"><circle cx="66" cy="195" r="3"/><circle cx="248" cy="177" r="2"/><circle cx="239" cy="315" r="3"/><circle cx="86" cy="325" r="2"/><circle cx="204" cy="227" r="5"/><circle cx="130" cy="155" r="2"/></g>`,
    letter: `<g transform="rotate(-12 150 255)"><rect x="65" y="174" width="170" height="153" rx="2" fill="${fg}" opacity=".9"/><path d="m65 217 85 60 85-60M65 327l63-67m107 67-63-67" fill="none" stroke="${bg}" stroke-width="2"/><path d="M91 199h99m-99 11h76" stroke="${bg}" opacity=".6"/><circle cx="150" cy="276" r="13" fill="${bg}" opacity=".75"/></g>`,
    moon: `<circle cx="155" cy="234" r="64" fill="${fg}"/><circle cx="182" cy="215" r="59" fill="${bg}"/><g fill="${fg}"><path d="m67 174 3 9 9 3-9 3-3 9-3-9-9-3 9-3ZM229 276l3 9 9 3-9 3-3 9-3-9-9-3 9-3Z"/><circle cx="234" cy="171" r="2"/><circle cx="90" cy="289" r="3"/></g><path d="M45 340q105-54 210 0" fill="none" stroke="${fg}" stroke-width="2"/>`,
    sun: `<circle cx="150" cy="235" r="62" fill="${fg}" opacity=".7"/><g fill="none" stroke="${fg}" stroke-width="1.5"><path d="M47 321q70-36 206 0M47 333q105-25 206 0M47 345q105-16 206 0"/><path d="M150 143v-17m67 43 12-12M83 169l-12-12m-18 78H36m211 0h17"/></g>`,
    sea: `<circle cx="150" cy="217" r="52" fill="${fg}" opacity=".8"/><path d="M25 257q60-31 125 0t125 0v108H25Z" fill="#355b69"/><path d="M25 293q60-25 125 0t125 0M25 320q60-25 125 0t125 0M25 347q60-25 125 0t125 0" fill="none" stroke="${fg}" opacity=".6"/><path d="m150 222 28 22h-56Z" fill="${fg}"/><path d="M150 222v-31" stroke="${fg}"/>`,
  }[type];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"><rect width="300" height="450" fill="${bg}"/><rect x="15" y="15" width="270" height="420" fill="none" stroke="${fg}" opacity=".45"/><path d="M8 0v450" stroke="#000" opacity=".16" stroke-width="5"/><text x="150" y="47" fill="${fg}" font-family="Georgia,serif" font-size="8" letter-spacing="3" text-anchor="middle">THE BOOKNOOK COLLECTION</text><text x="150" y="94" fill="${fg}" font-family="Georgia,serif" font-size="23" text-anchor="middle" letter-spacing="1">${line1}</text><text x="150" y="123" fill="${fg}" font-family="Georgia,serif" font-size="22" text-anchor="middle" letter-spacing=".7">${line2}</text>${shapes}<path d="M115 386h70" stroke="${fg}" opacity=".6"/><text x="150" y="411" fill="${fg}" font-family="Georgia,serif" font-size="11" text-anchor="middle" letter-spacing="2">${author}</text></svg>`;
  writeFileSync(
    new URL(`../public/covers/book-${i + 1}.svg`, import.meta.url),
    svg,
  );
}
writeFileSync(
  new URL("../public/covers/fallback.svg", import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450"><rect width="300" height="450" fill="#315d45"/><rect x="20" y="20" width="260" height="410" fill="none" stroke="#d9d9b6"/><text x="150" y="210" text-anchor="middle" font-family="Georgia" font-size="28" fill="#eee8cb">BookNook</text><text x="150" y="245" text-anchor="middle" font-family="Georgia" font-size="13" fill="#eee8cb">A story waiting to be read.</text></svg>`,
);
