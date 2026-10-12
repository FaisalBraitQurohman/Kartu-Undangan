import { mkdir, writeFile } from "node:fs/promises";
await mkdir("public/previews", { recursive: true });
const designs = [
  [
    "minimalist-ivory",
    "#faf8f4",
    "#3b302b",
    '<rect x="32" y="28" width="336" height="464" rx="168" fill="none" stroke="#b59a75" stroke-width="1"/><path d="M0 450Q60 380 70 300M330 180Q355 90 400 40" stroke="#a3a587" fill="none"/>',
    '<text x="200" y="205">Alya</text><text x="200" y="265" font-size="32">&amp;</text><text x="200" y="330">Rizky</text>',
  ],
  [
    "royal-elegant",
    "#302820",
    "#dbc29b",
    '<rect x="20" y="20" width="360" height="480" fill="none" stroke="#b59a75"/><rect x="28" y="28" width="344" height="464" fill="none" stroke="#b59a75" opacity=".5"/><path d="M170 100L200 70L230 100L200 130Z" fill="none" stroke="#b59a75"/>',
    '<text x="200" y="222">Alya</text><text x="200" y="282" font-size="32">&amp;</text><text x="200" y="345">Rizky</text>',
  ],
  [
    "romantic-bloom",
    "#f5e7e3",
    "#5f3d3b",
    '<g fill="#cb9696" opacity=".4">' +
      Array.from(
        { length: 8 },
        (_, i) =>
          `<ellipse cx="340" cy="325" rx="38" ry="80" transform="rotate(${i * 45} 340 390)"/>`,
      ).join("") +
      '</g><circle cx="340" cy="390" r="25" fill="#d9bda0"/><path d="M330 410Q310 450 290 520" fill="none" stroke="#87977b" stroke-width="2"/>',
    '<text x="140" y="195">Alya</text><text x="120" y="264" font-size="32">&amp;</text><text x="150" y="335">Rizky</text>',
  ],
  [
    "emerald-garden",
    "#214438",
    "#f5ead3",
    '<path d="M32 492V200Q32 32 200 32Q368 32 368 200V492Z" fill="none" stroke="#bfae85"/><g stroke="#abc2a0" fill="none">' +
      Array.from(
        { length: 5 },
        (_, i) =>
          `<path d="M${10 + i * 12} ${490 - i * 35}q-25-30-15-50q30 10 35 30M${390 - i * 12} ${90 + i * 35}q20 30 10 50q-30-10-35-30"/>`,
      ).join("") +
      "</g>",
    '<text x="200" y="210">Alya</text><text x="200" y="275" font-size="32">&amp;</text><text x="200" y="340">Rizky</text>',
  ],
];
for (const [key, bg, fg, decor, names] of designs)
  await writeFile(
    `public/previews/${key}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="520" viewBox="0 0 400 520"><rect width="400" height="520" fill="${bg}"/>${decor}<g fill="${fg}" text-anchor="middle" font-family="Georgia,serif" font-size="58">${names}</g><g fill="${fg}" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" letter-spacing="2"><text x="200" y="155">UNDANGAN PERNIKAHAN</text><text x="200" y="415">12 JUNI 2027</text></g></svg>`,
  );
