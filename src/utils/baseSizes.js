/**
 * Map of Unit Name -> Base Size definition.
 * Sizes are in mm.
 * If a unit has multiple base sizes (e.g. chars), we primarily list the most common one.
 * We can expand this structure to include oval sizes e.g. "60x35mm".
 */
import baseSizesData from './baseSizes.json';

/**
 * Map of Unit Name -> Base Size definition.
 * Sizes are in mm.
 * If a unit has multiple base sizes (e.g. chars), we primarily list the most common one.
 * We can expand this structure to include oval sizes e.g. "60x35mm".
 */
export const baseSizes = baseSizesData;

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

// Helper to get custom sizes from storage
function getCustomBaseSizes() {
    try {
        const stored = localStorage.getItem('tokenGen_customBaseSizes');
        return stored ? JSON.parse(stored) : {};
    } catch (e) {
        console.warn('Failed to parse (or read) custom base sizes', e);
        return {};
    }
}

/**
 * Normalizes unit name to try and find a match.
 * Priority:
 * 1. Custom User Saved Size (LocalStorage)
 * 2. Static Database (JSON)
 * 3. Heuristics
 */
export function getBaseSize(unitName) {
    if (!unitName) return null;

    // 1. Check Custom Storage
    const customSizes = getCustomBaseSizes();
    if (customSizes[unitName]) return customSizes[unitName];

    // 2. Check Static Database
    // Direct match
    if (baseSizes[unitName]) return baseSizes[unitName];

    // Try singular/plural variations (very basic)
    if (unitName.endsWith('s') && baseSizes[unitName.slice(0, -1)]) {
        return baseSizes[unitName.slice(0, -1)];
    }

    // Case insensitive check for Static Database
    const lower = unitName.toLowerCase();
    for (const key in baseSizes) {
        if (key.toLowerCase() === lower) return baseSizes[key];
    }

    // Case insensitive check for Custom Storage
    for (const key in customSizes) {
        if (key.toLowerCase() === lower) return customSizes[key];
    }

    // Partial match heuristic?
    return null;
}

/**
 * Saves a user-defined base size for a unit name.
 */
export function saveBaseSize(unitName, size) {
    if (!unitName || !size) return;
    try {
        const customSizes = getCustomBaseSizes();
        customSizes[unitName] = size;
        localStorage.setItem('tokenGen_customBaseSizes', JSON.stringify(customSizes));
        console.log(`Saved custom size for ${unitName}: ${size}`);
    } catch (e) {
        console.error('Failed to save custom base size', e);
    }
}
