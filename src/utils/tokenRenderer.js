export const PIXELS_PER_MM = 20;

/**
 * Draws a 2D token to the provided canvas context.
 * @param {HTMLCanvasElement} canvas
 * @param {Object} unit - The unit data object
 * @param {Object} options - { baseColor, textColor, hasBevel, hasRing }
 */
export function drawTokenToCanvas(canvas, unit, options = {}) {
    if (!canvas || !unit) return;

    const {
        baseColor = '#333333',
        textColor = '#ffd700',
        hasRing = false
    } = options; // We ignore 'hasBevel' for 2D generally, or maybe simulate it with a border?

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Determine Dimensions
    const sizeStr = unit.baseSize || '32mm';
    let widthMm = 32;
    let depthMm = 32;
    let isRect = sizeStr.toLowerCase().includes('rect');

    const match = sizeStr.match(/(\d+)(?:x(\d+))?/);
    if (match) {
        widthMm = parseInt(match[1]);
        depthMm = match[2] ? parseInt(match[2]) : widthMm;
    }

    // Check for oval
    const isOval = !isRect && (widthMm !== depthMm || sizeStr.toLowerCase().includes('oval'));

    const widthPx = widthMm * PIXELS_PER_MM;
    const heightPx = depthMm * PIXELS_PER_MM;

    // Set canvas size (this clears the canvas too)
    canvas.width = widthPx;
    canvas.height = heightPx;

    // 2. Draw Base
    ctx.fillStyle = baseColor;

    if (isRect) {
        ctx.fillRect(0, 0, widthPx, heightPx);
    } else if (isOval) {
        ctx.beginPath();
        ctx.ellipse(widthPx / 2, heightPx / 2, widthPx / 2, heightPx / 2, 0, 0, 2 * Math.PI);
        ctx.fill();
    } else {
        // Circle
        ctx.beginPath();
        ctx.arc(widthPx / 2, heightPx / 2, widthPx / 2, 0, 2 * Math.PI);
        ctx.fill();
    }

    // 3. Draw Ring (Optional)
    if (hasRing) {
        ctx.lineWidth = 2 * PIXELS_PER_MM; // 2mm ring
        ctx.strokeStyle = textColor;

        // Inset slightly so it doesn't get clipped
        const inset = ctx.lineWidth / 2;

        if (isRect) {
            ctx.strokeRect(inset, inset, widthPx - inset * 2, heightPx - inset * 2);
        } else if (isOval) {
            ctx.beginPath();
            ctx.ellipse(widthPx / 2, heightPx / 2, widthPx / 2 - inset, heightPx / 2 - inset, 0, 0, 2 * Math.PI);
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.arc(widthPx / 2, heightPx / 2, widthPx / 2 - inset, 0, 2 * Math.PI);
            ctx.stroke();
        }
    }

    // 4. Draw Text
    const text = (unit.name || "Unit Name").trim();
    if (!text) return;

    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Calculate max font size
    // Start with a heuristic: Font size roughly 30% of smaller dimension
    const minDim = Math.min(widthPx, heightPx);
    let fontSize = minDim * 0.3;

    // Scale adjustment
    if (unit.scaleAdjustment) {
        fontSize *= unit.scaleAdjustment;
    }

    ctx.font = `bold ${fontSize}px sans-serif`;

    // Split text into lines if necessary?
    // Project spec says "flat text on the top". 
    // The 3D version splits words. We should try to replicate that behavior.
    const words = text.split(/\s+/).filter(w => w.length > 0);

    // Simple line layout
    const lineHeight = fontSize * 1.2;
    const totalTextHeight = words.length * lineHeight;

    // Check if it fits, if not, scale down
    // This is a naive fit similar to the 3D version's logic
    // We want some margin
    const margin = minDim * 0.1;
    const maxW = widthPx - (hasRing ? 4 * PIXELS_PER_MM : margin * 2);
    const maxH = heightPx - (hasRing ? 4 * PIXELS_PER_MM : margin * 2);

    // Measure widest line
    let maxWidth = 0;
    words.forEach(word => {
        const w = ctx.measureText(word).width;
        if (w > maxWidth) maxWidth = w;
    });

    // Scale down if needed
    let scale = 1;
    if (maxWidth > maxW) {
        scale = Math.min(scale, maxW / maxWidth);
    }
    if (totalTextHeight > maxH) {
        scale = Math.min(scale, maxH / totalTextHeight);
    }

    // Apply scale to font
    fontSize *= scale;
    ctx.font = `bold ${fontSize}px sans-serif`;

    // Re-calc line height
    const finalLineHeight = fontSize * 1.2;
    const startY = (heightPx - (words.length * finalLineHeight)) / 2 + (finalLineHeight / 2);

    words.forEach((word, i) => {
        ctx.fillText(word, widthPx / 2, startY + (i * finalLineHeight));
    });
}
