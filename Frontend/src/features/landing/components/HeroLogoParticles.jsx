import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../theme/theme.context';

/* -------------------------------------------------------------------------- */
/* Pure geometry SDF helpers matching StackMatch's /favicon.svg logo shape    */
/* -------------------------------------------------------------------------- */

function roundedBoxSDF(u, v, halfW, halfH, radius) {
    const qx = Math.abs(u) - (halfW - radius);
    const qy = Math.abs(v) - (halfH - radius);
    return (
        Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) +
        Math.min(Math.max(qx, qy), 0) -
        radius
    );
}

function capsuleSDF(u, v, ax, ay, bx, by, radius) {
    const pax = u - ax;
    const pay = v - ay;
    const bax = bx - ax;
    const bay = by - ay;
    const lenSq = bax * bax + bay * bay;
    const h = lenSq > 0 ? Math.max(0, Math.min(1, (pax * bax + pay * bay) / lenSq)) : 0;
    return Math.hypot(pax - bax * h, pay - bay * h) - radius;
}

function isInsideLogoSolid(u, v) {
    if (roundedBoxSDF(u, v, 0.86, 0.86, 0.34) > 0) return false;
    if (capsuleSDF(u, v, -0.45, -0.34, 0.45, -0.34, 0.1) <= 0) return false;
    if (capsuleSDF(u, v, -0.45, 0.0, 0.16, 0.0, 0.1) <= 0) return false;
    if (capsuleSDF(u, v, -0.45, 0.34, -0.06, 0.34, 0.1) <= 0) return false;
    if (Math.hypot(u - 0.36, v - 0.34) <= 0.13) return false;
    return true;
}

function isNearEdge(u, v) {
    const outerDist = Math.abs(roundedBoxSDF(u, v, 0.86, 0.86, 0.34));
    if (outerDist < 0.095) return true;
    if (Math.abs(capsuleSDF(u, v, -0.45, -0.34, 0.45, -0.34, 0.1)) < 0.075) return true;
    if (Math.abs(capsuleSDF(u, v, -0.45, 0.0, 0.16, 0.0, 0.1)) < 0.075) return true;
    if (Math.abs(capsuleSDF(u, v, -0.45, 0.34, -0.06, 0.34, 0.1)) < 0.075) return true;
    if (Math.abs(Math.hypot(u - 0.36, v - 0.34) - 0.13) < 0.075) return true;
    return false;
}

function buildLogoParticles() {
    const particles = [];
    const gridSteps = 29;
    const min = -0.88;
    const max = 0.88;
    const step = (max - min) / (gridSteps - 1);

    // 5 evenly spaced Z-layers packed within the exact same 0.28 thickness
    const zLayers = [-0.14, -0.07, 0, 0.07, 0.14];

    for (let gy = 0; gy < gridSteps; gy += 1) {
        for (let gx = 0; gx < gridSteps; gx += 1) {
            const u = min + gx * step;
            const v = min + gy * step;

            if (!isInsideLogoSolid(u, v)) continue;

            const edge = isNearEdge(u, v);

            for (let li = 0; li < zLayers.length; li += 1) {
                const z = zLayers[li];
                particles.push({
                    kind: 'dot',
                    bx: u,
                    by: v,
                    bz: z,
                    ox: 0,
                    oy: 0,
                    vx: 0,
                    vy: 0,
                    size: edge ? 2.65 : 2.3,
                    phase: (gx * 0.37 + gy * 0.53 + li * 1.1) % (Math.PI * 2),
                });
            }
        }
    }

    // Subtle orbiting mini-logo & dust accents contained inside the box
    const ambientCount = 26;
    for (let i = 0; i < ambientCount; i += 1) {
        const angle = (i / ambientCount) * Math.PI * 2 + (i % 3) * 0.25;
        const radius = 1.02 + (i % 5) * 0.085;
        const isMiniLogo = i % 3 === 0;
        particles.push({
            kind: isMiniLogo ? 'mini-logo' : 'dust',
            bx: Math.cos(angle) * radius,
            by: Math.sin(angle) * radius * 0.88,
            bz: ((i % 7) - 3) * 0.09,
            ox: 0,
            oy: 0,
            vx: 0,
            vy: 0,
            size: isMiniLogo ? 9.5 : 2.2,
            phase: i * 0.71,
        });
    }

    return particles;
}

function drawRoundedRect(ctx, x, y, w, h, r) {
    const cr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + cr, y);
    ctx.lineTo(x + w - cr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + cr);
    ctx.lineTo(x + w, y + h - cr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - cr, y + h);
    ctx.lineTo(x + cr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - cr);
    ctx.lineTo(x, y + cr);
    ctx.quadraticCurveTo(x, y, x + cr, y);
    ctx.closePath();
    ctx.fill();
}

function drawMiniLogoGlyph(ctx, cx, cy, size, fill, cutoutColor) {
    const half = size / 2;
    ctx.fillStyle = fill;
    drawRoundedRect(ctx, cx - half, cy - half, size, size, size * 0.26);

    ctx.fillStyle = cutoutColor;
    const barH = Math.max(1.1, size * 0.11);
    const left = cx - half + size * 0.22;
    drawRoundedRect(ctx, left, cy - size * 0.24, size * 0.56, barH, barH / 2);
    drawRoundedRect(ctx, left, cy - barH / 2, size * 0.4, barH, barH / 2);
    drawRoundedRect(ctx, left, cy + size * 0.16, size * 0.26, barH, barH / 2);

    ctx.beginPath();
    ctx.arc(cx + size * 0.21, cy + size * 0.21, Math.max(0.9, size * 0.08), 0, Math.PI * 2);
    ctx.fill();
}

export function HeroLogoParticles() {
    const { theme } = useTheme();
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const themeRef = useRef(theme);

    useEffect(() => {
        themeRef.current = theme;
    }, [theme]);

    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return undefined;

        const ctx = canvas.getContext('2d');
        if (!ctx) return undefined;

        const particles = buildLogoParticles();
        const state = {
            width: 0,
            height: 0,
            angleY: -0.35,
            angleX: 0.12,
            spinVel: 0,
            pointerX: -9999,
            pointerY: -9999,
            pointerActive: false,
            dragging: false,
            didDrag: false,
            lastDragX: 0,
            lastDragY: 0,
        };

        function resize() {
            const rect = container.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            state.width = Math.max(1, rect.width);
            state.height = Math.max(1, rect.height);
            canvas.width = Math.round(state.width * dpr);
            canvas.height = Math.round(state.height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        resize();
        const observer = new ResizeObserver(resize);
        observer.observe(container);

        function handlePointerMove(event) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            if (state.dragging) {
                const dx = x - state.lastDragX;
                const dy = y - state.lastDragY;
                if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
                    state.didDrag = true;
                }
                state.angleY += dx * 0.011;
                state.angleX = Math.max(-0.55, Math.min(0.55, state.angleX + dy * 0.008));
                state.spinVel = dx * 0.0022;
                state.lastDragX = x;
                state.lastDragY = y;
            }

            state.pointerX = x;
            state.pointerY = y;
            state.pointerActive = true;
        }

        function handlePointerDown(event) {
            const rect = canvas.getBoundingClientRect();
            state.dragging = true;
            state.didDrag = false;
            state.lastDragX = event.clientX - rect.left;
            state.lastDragY = event.clientY - rect.top;
        }

        function handlePointerUp() {
            if (state.dragging && !state.didDrag) {
                for (let i = 0; i < particles.length; i += 1) {
                    const p = particles[i];
                    const dirAngle = Math.atan2(p.by, p.bx) + (Math.random() - 0.5) * 0.5;
                    const force = 7 + Math.random() * 11;
                    p.vx += Math.cos(dirAngle) * force;
                    p.vy += Math.sin(dirAngle) * force;
                }
                state.spinVel += 0.032;
            }
            state.dragging = false;
        }

        function handlePointerLeave() {
            state.pointerActive = false;
            state.dragging = false;
        }

        canvas.addEventListener('pointermove', handlePointerMove);
        canvas.addEventListener('pointerdown', handlePointerDown);
        window.addEventListener('pointerup', handlePointerUp);
        canvas.addEventListener('pointerleave', handlePointerLeave);

        let rafId = 0;
        let lastTime = performance.now();

        function render(now) {
            const dt = Math.min((now - lastTime) / 16.667, 2.2);
            lastTime = now;

            const w = state.width;
            const h = state.height;
            const cx = w / 2;
            const cy = h / 2;
            const scaleBase = Math.min(w, h) * 0.36;
            const isDark = themeRef.current === 'dark';

            if (!state.dragging) {
                state.angleY += (0.0062 + state.spinVel) * dt;
                state.spinVel *= Math.pow(0.94, dt);

                const targetX = state.pointerActive
                    ? ((state.pointerY - cy) / h) * 0.36
                    : Math.sin(now * 0.0007) * 0.14;
                state.angleX += (targetX - state.angleX) * 0.06 * dt;
            }

            const cosY = Math.cos(state.angleY);
            const sinY = Math.sin(state.angleY);
            const cosX = Math.cos(state.angleX);
            const sinX = Math.sin(state.angleX);
            const fov = 4.2;

            ctx.clearRect(0, 0, w, h);

            const projected = [];
            const repelRadius = Math.min(w, h) * 0.22;

            for (let i = 0; i < particles.length; i += 1) {
                const p = particles[i];

                const drift =
                    p.kind === 'dot' ? 0 : Math.sin(now * 0.0014 + p.phase) * 0.055;
                const x0 = p.bx + drift;
                const y0 =
                    p.by +
                    (p.kind === 'dot' ? 0 : Math.cos(now * 0.0012 + p.phase) * 0.055);
                const z0 = p.bz;

                const x1 = x0 * cosY - z0 * sinY;
                const z1 = x0 * sinY + z0 * cosY;
                const y2 = y0 * cosX - z1 * sinX;
                const z2 = y0 * sinX + z1 * cosX;

                const perspective = fov / (fov - z2);
                const baseSx = cx + x1 * scaleBase * perspective;
                const baseSy = cy + y2 * scaleBase * perspective;

                const curSx = baseSx + p.ox;
                const curSy = baseSy + p.oy;
                let proximity = 0;

                if (state.pointerActive && !state.dragging) {
                    const dx = curSx - state.pointerX;
                    const dy = curSy - state.pointerY;
                    const dist = Math.hypot(dx, dy);
                    if (dist < repelRadius && dist > 0.001) {
                        const strength = (1 - dist / repelRadius) * 2.2 * dt;
                        p.vx += (dx / dist) * strength;
                        p.vy += (dy / dist) * strength;
                        proximity = 1 - dist / repelRadius;
                    }
                }

                p.vx += -p.ox * 0.085 * dt;
                p.vy += -p.oy * 0.085 * dt;
                const damp = Math.pow(0.84, dt);
                p.vx *= damp;
                p.vy *= damp;
                p.ox += p.vx * dt;
                p.oy += p.vy * dt;

                // Keep all particles strictly bounded inside the invisible stage area
                const pad = 10;
                const sx = Math.max(pad, Math.min(w - pad, baseSx + p.ox));
                const sy = Math.max(pad, Math.min(h - pad, baseSy + p.oy));

                projected.push({
                    p,
                    sx,
                    sy,
                    z: z2,
                    perspective,
                    proximity,
                });
            }

            projected.sort((a, b) => a.z - b.z);

            for (let i = 0; i < projected.length; i += 1) {
                const { p, sx, sy, z, perspective, proximity } = projected[i];
                const depthNorm = Math.max(0, Math.min(1, (z + 1.1) / 2.2));

                let fill;
                if (isDark) {
                    const alpha =
                        p.kind === 'dot'
                            ? 0.42 + depthNorm * 0.58
                            : 0.3 + depthNorm * 0.55;
                    const r = Math.round(74 + depthNorm * 85 + proximity * 45);
                    const g = Math.round(145 + depthNorm * 87 + proximity * 23);
                    const b = Math.round(42 + depthNorm * 70 + proximity * 55);
                    fill = `rgba(${Math.min(255, r)}, ${Math.min(255, g)}, ${Math.min(255, b)}, ${alpha.toFixed(3)})`;
                } else {
                    // Rich Forest Green density in Light mode, shifting to bright lime under cursor
                    const alpha =
                        p.kind === 'dot'
                            ? 0.58 + depthNorm * 0.42
                            : 0.45 + depthNorm * 0.45;
                    const r = Math.round(18 + (1 - depthNorm) * 26 + proximity * 120);
                    const g = Math.round(46 + (1 - depthNorm) * 48 + proximity * 165);
                    const b = Math.round(0 + (1 - depthNorm) * 10 + proximity * 96);
                    fill = `rgba(${Math.min(255, r)}, ${Math.min(255, g)}, ${Math.min(255, b)}, ${alpha.toFixed(3)})`;
                }

                if (p.kind === 'mini-logo') {
                    const glyphSize = p.size * perspective;
                    const cutoutColor = isDark ? '#0F1210' : '#F6F8F5';
                    drawMiniLogoGlyph(ctx, sx, sy, glyphSize, fill, cutoutColor);
                } else {
                    const dotSize = p.size * perspective * (1 + proximity * 0.3);
                    ctx.fillStyle = fill;
                    ctx.fillRect(
                        sx - dotSize / 2,
                        sy - dotSize / 2,
                        dotSize,
                        dotSize
                    );
                }
            }

            rafId = window.requestAnimationFrame(render);
        }

        rafId = window.requestAnimationFrame(render);

        return () => {
            window.cancelAnimationFrame(rafId);
            observer.disconnect();
            canvas.removeEventListener('pointermove', handlePointerMove);
            canvas.removeEventListener('pointerdown', handlePointerDown);
            window.removeEventListener('pointerup', handlePointerUp);
            canvas.removeEventListener('pointerleave', handlePointerLeave);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative h-[360px] w-full overflow-hidden sm:h-[420px] lg:h-[460px]"
        >
            <canvas
                ref={canvasRef}
                aria-label="Interactive 3D particle sculpture of the StackMatch logo"
                className="block h-full w-full cursor-grab touch-none active:cursor-grabbing"
            />
        </div>
    );
}

export default HeroLogoParticles;