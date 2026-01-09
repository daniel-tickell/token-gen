import React, { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { commonBaseSizes } from '../utils/baseSizes';

function TokenModel({ unit, exportRef }) {
    const textGroupRef = useRef();
    const [textScale, setTextScale] = useState(1);

    // Parse size from settings or unit
    const { width, depth } = useMemo(() => {
        // Use unit's baseSize (which is updated by parent)
        const sizeStr = unit?.baseSize || '32mm';
        const match = sizeStr.match(/(\d+)(?:x(\d+))?/);
        if (match) {
            const w = parseInt(match[1]);
            const d = match[2] ? parseInt(match[2]) : w;
            return { width: w, depth: d };
        }
        return { width: 32, depth: 32 };
    }, [unit?.baseSize]);

    const radius = width / 2;
    const baseHeight = 3;

    // Split words
    const words = useMemo(() => {
        const name = unit?.name || "Unit Name";
        return name.split(' ');
    }, [unit?.name]);

    // Constants for layout
    const fontSize = 5;
    const lineHeight = fontSize * 1.2;

    // Auto-fit logic for the GROUP
    useLayoutEffect(() => {
        if (textGroupRef.current) {
            // Box3 setFromObject computes bounding box of children (the words)
            // Note: Objects inside are rotated [-PI/2, 0, 0].
            // To retrieve meaningful dimensions for scaling the PARENT group (which scales X and Y),
            // we should measure them in their local coordinate system relative to the parent?

            // Actually, we are scaling the wrapper mesh which has the rotation.
            // Inside that mesh, the textGroupRef is aligned with X-Y plane (before the mesh rotates it to X-Z).
            // So we just need to measure the X and Y extent of the textGroupRef children.

            const box = new THREE.Box3().setFromObject(textGroupRef.current);
            if (!box.isEmpty()) {
                // Since the text is created on X-Y plane inside the group:
                const textWidth = box.max.x - box.min.x;
                const textHeight = box.max.y - box.min.y;

                const marginW = width * 0.15; // 15% margin
                const marginD = depth * 0.15;
                const availableWidth = width - marginW;
                const availableHeight = depth - marginD; // depth corresponds to local Y (height)

                const scaleW = availableWidth / textWidth;
                const scaleH = availableHeight / textHeight;

                let fitScale = Math.min(scaleW, scaleH);

                // Limit max scale to avoid huge text on large bases with short names
                if (fitScale > 1.5) fitScale = 1.5;

                setTextScale(fitScale);
            }
        }
    }, [words, width, depth]);

    return (
        <group ref={exportRef}>
            {/* The Base */}
            <mesh position={[0, baseHeight / 2, 0]} scale={[1, 1, depth / width]}>
                <cylinderGeometry args={[radius, radius, baseHeight, 64]} />
                <meshStandardMaterial color="#333333" />
            </mesh>

            {/* The Text Group Wrapper */}
            {/* This mesh handles the orientation (flat on base) and scale */}
            <mesh position={[0, baseHeight, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[textScale, textScale, 1]}>
                <group ref={textGroupRef}>
                    {words.map((word, i) => {
                        // Calculate vertical offset to center the stack
                        // Total height = words.length * lineHeight (roughly)
                        // Or accurately: (words.length - 1) * lineHeight distance between first and last centers.
                        // We want 0 to be the geometric center.

                        const yOffset = (words.length - 1 - i) * lineHeight - ((words.length - 1) * lineHeight) / 2;

                        return (
                            <group key={i} position={[0, yOffset, 0]}>
                                <Center disableZ>
                                    <Text3D
                                        font="/fonts/helvetiker_regular.typeface.json"
                                        size={fontSize}
                                        height={1}
                                        curveSegments={12}
                                        bevelEnabled
                                        bevelThickness={0.1}
                                        bevelSize={0.05}
                                        bevelOffset={0}
                                        bevelSegments={5}
                                    >
                                        {word}
                                        <meshStandardMaterial color="#ffd700" />
                                    </Text3D>
                                </Center>
                            </group>
                        );
                    })}
                </group>
            </mesh>
        </group>
    );
}

export default function TokenPreview({ unit, onUpdate }) {
    const exportRef = useRef();
    const [isCustom, setIsCustom] = useState(false);

    const handleDownload = () => {
        if (!exportRef.current) return;
        const exporter = new STLExporter();
        const result = exporter.parse(exportRef.current, { binary: true });
        const blob = new Blob([result], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${unit?.name || 'token'}_${unit?.baseSize || 'base'}.stl`;
        link.click();
    };

    const handleSizeChange = (e) => {
        const val = e.target.value;
        if (val === 'Custom') {
            setIsCustom(true);
        } else {
            setIsCustom(false);
            if (onUpdate && unit) {
                onUpdate(unit.id, { baseSize: val });
            }
        }
    };

    const handleCustomSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const w = formData.get('width');
        const d = formData.get('depth');
        const isOval = formData.get('isOval');

        let newSize = `${w}mm`;
        if (isOval || w !== d) {
            newSize = `${w}x${d}mm`;
        }

        if (onUpdate && unit) {
            onUpdate(unit.id, { baseSize: newSize });
        }
    };

    if (!unit) {
        return (
            <div className="panel" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0e1015' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Select a unit to preview</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Controls Panel */}
            <div className="panel" style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Base Size</label>
                    <select
                        className="btn"
                        style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }}
                        value={commonBaseSizes.includes(unit.baseSize) ? unit.baseSize : 'Custom'}
                        onChange={handleSizeChange}
                    >
                        {commonBaseSizes.map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                        <option value="Custom">Custom...</option>
                    </select>
                </div>

                {isCustom && (
                    <form onSubmit={handleCustomSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Width (mm)</label>
                            <input name="width" type="number" defaultValue={32} style={{ padding: '0.4rem', borderRadius: '4px', width: '60px' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Depth (mm)</label>
                            <input name="depth" type="number" defaultValue={32} style={{ padding: '0.4rem', borderRadius: '4px', width: '60px' }} />
                        </div>
                        <button type="submit" className="btn" style={{ fontSize: '0.8rem' }}>Set</button>
                    </form>
                )}

                <div style={{ flex: 1 }}></div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', opacity: 0 }}>.</label>
                    <button className="btn" onClick={handleDownload}>Download STL</button>
                </div>
            </div>

            {/* Preview Canvas */}
            <div className="panel" style={{ position: 'relative', height: '500px', padding: 0, overflow: 'hidden' }}>
                <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 50, 50], fov: 50 }}>
                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                    <pointLight position={[-10, -10, -10]} />

                    <Center>
                        <TokenModel unit={unit} exportRef={exportRef} />
                    </Center>

                    <OrbitControls makeDefault />
                </Canvas>

                <div style={{ position: 'absolute', top: '20px', left: '20px', pointerEvents: 'none' }}>
                    <h3 style={{ margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                        {unit.name}
                        <span style={{ fontSize: '0.8em', marginLeft: '10px', opacity: 0.8 }}>{unit.baseSize}</span>
                    </h3>
                </div>
            </div>
        </div>
    );
}
