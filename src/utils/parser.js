/**
 * Parses raw text input into a list of units with quantities.
 * @param {string} text - The raw text from Battlescribe or manual entry.
 * @returns {Array<{name: string, quantity: number, original: string}>}
 */
export function parseList(text) {
    const lines = text.split(/\n/);
    const units = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Skip Battlescribe headers/footers
        if (trimmed.startsWith('+') || trimmed.startsWith('Configuration') || trimmed.includes('Detachment')) {
            continue;
        }

        // New logic: Everything before " (" is the name candidate
        // Example: "Knight Castellan (410pts): ..." -> "Knight Castellan"

        // Split by " (" to get name part
        // But careful with things like "Termagants (10)" if existing logic relied on different split.

        // Clean name strategy:
        // 1. Split at first " (" or just "(" if preceded by space?
        // Let's try splitting at "("
        const parenIndex = trimmed.indexOf('(');

        let namePart = trimmed;
        if (parenIndex !== -1) {
            namePart = trimmed.substring(0, parenIndex).trim();
        }

        // Now extract quantity from namePart ("10x Skitarii" -> 10, "Skitarii")
        let name = namePart;
        let quantity = 1;

        const prefixMatch = namePart.match(/^(\d+)x?\s+(.+)/i);
        if (prefixMatch) {
            quantity = parseInt(prefixMatch[1], 10);
            name = prefixMatch[2];
        } else {
            const suffixMatch = namePart.match(/(.+)\s+x?(\d+)$/i);
            if (suffixMatch) {
                name = suffixMatch[1];
                quantity = parseInt(suffixMatch[2], 10);
            }
        }

        // Clean up
        name = name.replace(/\[.*?\]/g, '').trim();
        name = name.replace(/:$/, '').trim();

        // Ignore weapon lines or bullets
        // Usually names don't start with "." or "-"
        if (name.length < 2 || name.startsWith('-') || name.startsWith('.')) continue;

        if (name) {
            units.push({
                id: crypto.randomUUID(),
                name: name,
                quantity: quantity,
                original: trimmed
            });
        }
    }

    return units;
}
