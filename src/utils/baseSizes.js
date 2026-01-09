/**
 * Map of Unit Name -> Base Size definition.
 * Sizes are in mm.
 * If a unit has multiple base sizes (e.g. chars), we primarily list the most common one.
 * We can expand this structure to include oval sizes e.g. "60x35mm".
 */
export const baseSizes = {
    // Space Marines
    "Intercessors": "32mm",
    "Intercessor Squad": "32mm",
    "Assault Intercessors": "32mm",
    "Assault Intercessor Squad": "32mm",
    "Hellblasters": "32mm",
    "Hellblaster Squad": "32mm",
    "Inceptors": "40mm",
    "Inceptor Squad": "40mm",
    "Terminators": "40mm",
    "Terminator Squad": "40mm",
    "Bladeguard Veterans": "40mm",
    "Bladeguard Veteran Squad": "40mm",
    "Captain": "40mm",
    "Lieutenant": "40mm",
    "Redemptor Dreadnought": "90mm",

    // Tyranids
    "Termagants": "25mm",
    "Termagant": "25mm",
    "Hormagaunts": "25mm",
    "Hormagaunt": "25mm",
    "Genestealers": "25mm",
    "Genestealer": "25mm",
    "Tyranid Warriors": "50mm",
    "Tyranid Warrior": "50mm",
    "Hive Tyrant": "60mm",
    "Winged Hive Tyrant": "60mm",
    "Exocrine": "120x92mm", // Oval

    // Necrons
    "Necron Warriors": "32mm",
    "Necron Warrior": "32mm",
    "Immortals": "32mm",
    "Skorpekh Destroyers": "50mm",
    "Overlord": "40mm",
    "Monolith": "160mm", // No base usually, but huge

    // Imperial Knights
    "Knight Castellan": "170x105mm", // Oval
    "Knight Paladin": "170x105mm",
    "Armiger Helverin": "100mm",
    "Armiger Warglaive": "100mm",

    // AdMech
    "Tech-Priest Dominus": "50mm",
    "Tech-Priest Manipulus": "50mm",
    "Skitarii Rangers": "25mm",
    "Skitarii Vanguard": "25mm",

    // Agents
    "Callidus Assassin": "32mm",

    // Grey Knights
    "Grey Knights Terminator Squad": "40mm",

    // Generic / Default
    "Infantry": "32mm",
    "Character": "40mm",
    "Vehicle": "None",
};

/**
 * Common standard base sizes for the dropdown
 */
export const commonBaseSizes = [
    "25mm",
    "28.5mm",
    "32mm",
    "40mm",
    "50mm",
    "60mm",
    "80mm",
    "90mm",
    "100mm",
    "130mm",
    "160mm",
    "60x35mm",
    "75x42mm",
    "90x52mm",
    "105x70mm",
    "120x92mm",
    "170x105mm"
];

/**
 * Normalizes unit name to try and find a match.
 */
export function getBaseSize(unitName) {
    // Direct match
    if (baseSizes[unitName]) return baseSizes[unitName];

    // Try singular/plural variations (very basic)
    if (unitName.endsWith('s') && baseSizes[unitName.slice(0, -1)]) {
        return baseSizes[unitName.slice(0, -1)];
    }

    // Case insensitive check
    const lower = unitName.toLowerCase();
    for (const key in baseSizes) {
        if (key.toLowerCase() === lower) return baseSizes[key];
    }

    // Partial match heuristic?
    return null;
}
