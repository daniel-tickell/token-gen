import { parseList } from './parser.js';

const testInput = `
Knight Castellan (410pts): Plasma decimator, Titanic feet, 2x Twin meltagun, Volcano lance, 2 shieldbreaker missile launchers and twin siegebreaker cannon, 2x Shieldbreaker missile launcher, Twin siegebreaker cannon
Knight Paladin (375pts): Questoris heavy stubber, Rapid-fire battle cannon, Meltagun, Reaper chainsword
Tech-Priest Dominus (100pts): Magos Questoris, Omnissian axe, Macrostubber, Volkite blaster
Tech-Priest Manipulus (60pts): Omnissian staff, Magnarail lance

10x Skitarii Rangers (85pts)
10x Skitarii Vanguard (95pts)

Armiger Helverin (140pts): 2x Armiger autocannon, Armoured feet, Questoris heavy stubber
Armiger Helverin (140pts): 2x Armiger autocannon, Armoured feet, Questoris heavy stubber
Armiger Warglaive (140pts): Reaper chain-cleaver, Thermal spear, Questoris heavy stubber
Armiger Warglaive (140pts): Reaper chain-cleaver, Thermal spear, Questoris heavy stubber

Callidus Assassin (100pts): Neural shredder, Phase sword and poison blades
5x Grey Knights Terminator Squad (210pts)
`;

// Helper for node env without crypto (if using node < 19 without flag, but usually fine in recent node)
if (!globalThis.crypto) {
    globalThis.crypto = { randomUUID: () => Math.random().toString(36).substring(7) };
}

console.log("Parsing test input...");
const result = parseList(testInput);
console.log(JSON.stringify(result, null, 2));
