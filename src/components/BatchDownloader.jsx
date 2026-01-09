import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useFont } from '@react-three/drei';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import JSZip from 'jszip';
// We need to export TokenModel from TokenPreview or copy it.
// I will assume I need to export TokenModel from TokenPreview.jsx first.
// BUT for now I'll create this file and then go fix TokenPreview to export TokenModel.

import { TokenModel } from './TokenPreview'; // I will add this named export to TokenPreview.

export default function BatchDownloader({ units, baseColor, textColor, tokenHeight, textHeight }) {
    const [isGenerating, setIsGenerating] = useState(false);
    // Preload font to ensure Text3D is ready faster
    useFont.preload('/fonts/helvetiker_regular.typeface.json');
    const [progress, setProgress] = useState(0);
    const sceneRefs = useRef({});

    const handleDownloadAll = async () => {
        if (units.length === 0) return;
        setIsGenerating(true);
        setProgress(0);

        // Wait for render cycle (Text3D loading)
        // A simple timeout is crude but usually sufficient for local text generation if fonts are preloaded.
        // Better way: Check if meshes are ready? 
        // We will wait 2 seconds to be safe.
        setTimeout(async () => {
            try {
                const zip = new JSZip();
                const exporter = new STLExporter();

                // Process each unit
                for (let i = 0; i < units.length; i++) {
                    const unit = units[i];
                    if (!unit) continue;
                    const group = sceneRefs.current[unit.id];

                    if (group) {
                        // Validate meshes to prevent STLExporter crash
                        const badMeshes = [];
                        group.traverse((child) => {
                            if (child.isMesh) {
                                if (!child.geometry || !child.geometry.attributes || !child.geometry.attributes.position) {
                                    console.warn("Invalid geometry found on", child);
                                    badMeshes.push(child);
                                }
                            }
                        });

                        // Remove bad meshes from the scene graph to strictly prevent exporter crash
                        badMeshes.forEach(child => {
                            if (child.parent) child.parent.remove(child);
                        });


                        const stlData = exporter.parse(group, { binary: true });
                        const blob = new Blob([stlData], { type: 'application/octet-stream' });

                        // Handle quantity
                        const count = unit.quantity || 1;
                        const safeName = (unit.name || 'token').replace(/[^a-z0-9]/gi, '_');

                        if (count > 1) {
                            // Create a folder or just multiple files?
                            // User said "create that many instances". 
                            // Suggests multiple files.
                            for (let c = 1; c <= count; c++) {
                                zip.file(`${safeName}_${c}.stl`, blob);
                            }
                        } else {
                            zip.file(`${safeName}.stl`, blob);
                        }
                    }
                    setProgress(((i + 1) / units.length) * 100);
                }

                const content = await zip.generateAsync({ type: "blob" });

                // Trigger download
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = "warhammer_tokens.zip";
                link.click();

            } catch (err) {
                console.error("Export failed", err);
                alert("Failed to generate zip: " + err.message);
            } finally {
                setIsGenerating(false);
            }
        }, 4000);
    };

    return (
        <div>
            {!isGenerating ? (
                <button className="btn" onClick={handleDownloadAll} disabled={units.length === 0}>
                    Download All as ZIP
                </button>
            ) : (
                <div className="btn" style={{ cursor: 'wait' }}>
                    Generating... {Math.round(progress)}%
                </div>
            )}

            {/* Hidden Canvas for Generation */}
            {/* We render ALL units here but hidden */}
            {isGenerating && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '1px', height: '1px', opacity: 0, pointerEvents: 'none', zIndex: -1 }}>
                    <Canvas>
                        <React.Suspense fallback={null}>
                            {units.map((unit, i) => (
                                /* Position them far apart just in case, though they are in separate groups ref'd by us */
                                <group key={unit.id} position={[i * 100, 0, 0]}>
                                    <TokenModel
                                        unit={unit}
                                        exportRef={(el) => sceneRefs.current[unit.id] = el}
                                        baseColor={baseColor}
                                        textColor={textColor}
                                        tokenHeight={tokenHeight}
                                        textHeight={textHeight}
                                    />
                                </group>
                            ))}
                        </React.Suspense>
                    </Canvas>
                </div>
            )}
        </div>
    );
}
