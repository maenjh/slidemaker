/**
 * generateExcalidrawSketch.mjs
 *
 * 콘텐츠 데이터 기반으로 상세한 Excalidraw JSON을 프로그래밍 방식으로 생성.
 * 슬라이드당 30-50개 요소로 스케치 품질 대폭 향상.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const COLORS = {
  navy: '#1B2A4A',
  teal: '#0D9488',
  coral: '#F87171',
  white: '#FFFFFF',
  lightTeal: '#CCFBF1',
  lightCoral: '#FEE2E2',
  lightNavy: '#E0E7FF',
  gray: '#9CA3AF',
};

// Slide grid: 2 columns x 4 rows, each 480x300
const SLIDE_W = 480;
const SLIDE_H = 300;
const GAP_X = 50;
const GAP_Y = 60;

function slideOrigin(slideId) {
  const col = (slideId - 1) % 2;
  const row = Math.floor((slideId - 1) / 2);
  return {
    x: col * (SLIDE_W + GAP_X),
    y: 80 + row * (SLIDE_H + GAP_Y),
  };
}

let _idCounter = 0;
function uid() {
  _idCounter++;
  return crypto.randomBytes(8).toString('hex') + _idCounter;
}

/* ── Element factory helpers ── */

function rect(x, y, w, h, opts = {}) {
  return {
    id: uid(),
    type: 'rectangle',
    x, y,
    width: w,
    height: h,
    angle: 0,
    strokeColor: opts.strokeColor || COLORS.navy,
    backgroundColor: opts.bg || 'transparent',
    fillStyle: opts.bg ? 'solid' : 'hachure',
    strokeWidth: opts.strokeWidth ?? 1,
    strokeStyle: opts.strokeStyle || 'solid',
    roughness: 0,
    opacity: opts.opacity ?? 100,
    roundness: opts.roundness ? { type: 3, value: opts.roundness } : null,
    isDeleted: false,
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked: false,
    groupIds: opts.groupIds || [],
    frameId: null,
    seed: Math.floor(Math.random() * 2e9),
    version: 1,
    versionNonce: Math.floor(Math.random() * 2e9),
  };
}

function ellipse(x, y, w, h, opts = {}) {
  return {
    ...rect(x, y, w, h, opts),
    type: 'ellipse',
  };
}

function diamond(x, y, w, h, opts = {}) {
  return {
    ...rect(x, y, w, h, opts),
    type: 'diamond',
  };
}

function text(x, y, str, opts = {}) {
  const fontSize = opts.fontSize || 14;
  return {
    id: uid(),
    type: 'text',
    x, y,
    width: opts.width || str.length * fontSize * 0.6,
    height: opts.height || fontSize * 1.4,
    angle: 0,
    strokeColor: opts.color || COLORS.navy,
    backgroundColor: 'transparent',
    fillStyle: 'hachure',
    strokeWidth: 1,
    strokeStyle: 'solid',
    roughness: 0,
    opacity: 100,
    text: str,
    fontSize,
    fontFamily: 1,
    textAlign: opts.textAlign || 'center',
    verticalAlign: 'middle',
    containerId: null,
    originalText: str,
    autoResize: true,
    lineHeight: 1.25,
    isDeleted: false,
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked: false,
    groupIds: opts.groupIds || [],
    frameId: null,
    seed: Math.floor(Math.random() * 2e9),
    version: 1,
    versionNonce: Math.floor(Math.random() * 2e9),
  };
}

function arrow(x1, y1, x2, y2, opts = {}) {
  return {
    id: uid(),
    type: 'arrow',
    x: x1,
    y: y1,
    width: x2 - x1,
    height: y2 - y1,
    angle: 0,
    strokeColor: opts.color || COLORS.navy,
    backgroundColor: 'transparent',
    fillStyle: 'hachure',
    strokeWidth: opts.strokeWidth ?? 1,
    strokeStyle: opts.strokeStyle || 'solid',
    roughness: 0,
    opacity: 100,
    points: [[0, 0], [x2 - x1, y2 - y1]],
    lastCommittedPoint: null,
    startBinding: null,
    endBinding: null,
    startArrowhead: null,
    endArrowhead: 'arrow',
    isDeleted: false,
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked: false,
    groupIds: opts.groupIds || [],
    frameId: null,
    seed: Math.floor(Math.random() * 2e9),
    version: 1,
    versionNonce: Math.floor(Math.random() * 2e9),
  };
}

/* ── Slide-specific template generators ── */

function slide1_titleMap(ox, oy, content = {}) {
  const els = [];
  const gid = uid();

  // Background
  els.push(rect(ox, oy, SLIDE_W, SLIDE_H, { bg: COLORS.white, strokeColor: COLORS.navy, groupIds: [gid] }));

  // Region silhouette (irregular polygon approximated with overlapping shapes)
  const mapCx = ox + 160, mapCy = oy + 150;
  // Outer region shape (rough silhouette using ellipses)
  els.push(ellipse(mapCx - 90, mapCy - 80, 180, 160, { strokeColor: COLORS.navy, strokeWidth: 2, groupIds: [gid] }));
  els.push(ellipse(mapCx - 70, mapCy - 60, 120, 100, { strokeColor: COLORS.navy, bg: COLORS.lightNavy, groupIds: [gid] }));
  // Inner concentric circles
  els.push(ellipse(mapCx - 50, mapCy - 40, 100, 80, { strokeColor: COLORS.teal, strokeWidth: 1, groupIds: [gid] }));
  els.push(ellipse(mapCx - 35, mapCy - 28, 70, 56, { strokeColor: COLORS.teal, strokeWidth: 1, groupIds: [gid] }));
  els.push(ellipse(mapCx - 22, mapCy - 18, 44, 36, { strokeColor: COLORS.teal, bg: COLORS.lightTeal, groupIds: [gid] }));
  // Center label
  els.push(text(mapCx - 20, mapCy - 8, content.centerLabel || '중심', { fontSize: 11, color: COLORS.teal, groupIds: [gid] }));

  // Small mountain/building silhouettes inside map
  els.push(rect(mapCx - 40, mapCy + 15, 12, 18, { bg: COLORS.lightNavy, strokeColor: COLORS.navy, groupIds: [gid] }));
  els.push(rect(mapCx - 20, mapCy + 10, 8, 23, { bg: COLORS.lightNavy, strokeColor: COLORS.navy, groupIds: [gid] }));
  els.push(rect(mapCx + 10, mapCy + 12, 14, 21, { bg: COLORS.lightNavy, strokeColor: COLORS.navy, groupIds: [gid] }));

  // Title box (right side)
  const tbx = ox + 300, tby = oy + 40;
  els.push(rect(tbx, tby, 160, 50, { bg: COLORS.navy, roundness: 4, groupIds: [gid] }));
  els.push(text(tbx + 10, tby + 10, content.title || '제목', { fontSize: 13, color: COLORS.white, groupIds: [gid] }));
  // Subtitle
  els.push(text(tbx + 10, tby + 60, content.subtitle || '부제목', { fontSize: 10, color: COLORS.gray, groupIds: [gid] }));
  // Connecting line
  els.push(arrow(mapCx + 50, mapCy - 20, tbx, tby + 25, { color: COLORS.navy, groupIds: [gid] }));

  // Slide label
  els.push(text(ox + 5, oy + 5, 'Slide 1: Title + Map', { fontSize: 9, color: COLORS.gray, textAlign: 'left', groupIds: [gid] }));

  return els;
}

function slide2_donutCompare(ox, oy, content = {}) {
  const els = [];
  const gid = uid();
  els.push(rect(ox, oy, SLIDE_W, SLIDE_H, { bg: COLORS.white, strokeColor: COLORS.navy, groupIds: [gid] }));

  // Status badge top center
  els.push(rect(ox + 170, oy + 10, 140, 25, { bg: COLORS.teal, roundness: 12, groupIds: [gid] }));
  els.push(text(ox + 190, oy + 14, content.statusBadge || '현황 분석', { fontSize: 11, color: COLORS.white, groupIds: [gid] }));

  // Left donut
  const ldx = ox + 100, ldy = oy + 140;
  els.push(ellipse(ldx - 60, ldy - 60, 120, 120, { strokeColor: COLORS.navy, strokeWidth: 3, groupIds: [gid] }));
  els.push(ellipse(ldx - 30, ldy - 30, 60, 60, { strokeColor: COLORS.navy, bg: COLORS.white, groupIds: [gid] }));
  // Person icon in center (head + body)
  els.push(ellipse(ldx - 8, ldy - 15, 16, 16, { strokeColor: COLORS.navy, bg: COLORS.lightNavy, groupIds: [gid] }));
  els.push(rect(ldx - 10, ldy + 3, 20, 14, { strokeColor: COLORS.navy, bg: COLORS.lightNavy, roundness: 4, groupIds: [gid] }));
  // Donut segment indicator (arc approximation with colored rect overlay)
  els.push(rect(ldx - 60, ldy - 60, 40, 8, { bg: COLORS.teal, strokeColor: COLORS.teal, groupIds: [gid] }));
  els.push(text(ldx - 40, ldy + 70, content.areaA?.label || 'Area A', { fontSize: 10, color: COLORS.navy, groupIds: [gid] }));
  els.push(text(ldx - 20, ldy + 85, content.areaA?.value || '수치', { fontSize: 9, color: COLORS.gray, groupIds: [gid] }));

  // Right donut
  const rdx = ox + 380, rdy = oy + 140;
  els.push(ellipse(rdx - 60, rdy - 60, 120, 120, { strokeColor: COLORS.teal, strokeWidth: 3, groupIds: [gid] }));
  els.push(ellipse(rdx - 30, rdy - 30, 60, 60, { strokeColor: COLORS.teal, bg: COLORS.white, groupIds: [gid] }));
  // Person icon
  els.push(ellipse(rdx - 8, rdy - 15, 16, 16, { strokeColor: COLORS.teal, bg: COLORS.lightTeal, groupIds: [gid] }));
  els.push(rect(rdx - 10, rdy + 3, 20, 14, { strokeColor: COLORS.teal, bg: COLORS.lightTeal, roundness: 4, groupIds: [gid] }));
  els.push(text(rdx - 40, rdy + 70, content.areaB?.label || 'Area B', { fontSize: 10, color: COLORS.navy, groupIds: [gid] }));
  els.push(text(rdx - 20, rdy + 85, content.areaB?.value || '수치', { fontSize: 9, color: COLORS.gray, groupIds: [gid] }));

  // Growth arrow
  els.push(arrow(rdx + 65, rdy - 30, rdx + 65, rdy - 65, { color: COLORS.teal, strokeWidth: 2, groupIds: [gid] }));
  els.push(text(rdx + 55, rdy - 78, content.areaB?.growth || '↑', { fontSize: 12, color: COLORS.teal, groupIds: [gid] }));

  // Risk badge (shield shape = diamond + rect)
  els.push(diamond(ox + 410, oy + 15, 30, 35, { bg: COLORS.coral, strokeColor: COLORS.coral, groupIds: [gid] }));
  els.push(text(ox + 410, oy + 55, content.riskBadge || '등급', { fontSize: 8, color: COLORS.coral, groupIds: [gid] }));

  // Bottom label
  els.push(text(ox + 160, oy + 275, content.bottomLabel || '비교', { fontSize: 10, color: COLORS.gray, groupIds: [gid] }));

  els.push(text(ox + 5, oy + 5, 'Slide 2: Donut Compare', { fontSize: 9, color: COLORS.gray, textAlign: 'left', groupIds: [gid] }));
  return els;
}

function slide3_gridCards(ox, oy, content = {}) {
  const els = [];
  const gid = uid();
  els.push(rect(ox, oy, SLIDE_W, SLIDE_H, { bg: COLORS.white, strokeColor: COLORS.navy, groupIds: [gid] }));

  // Title
  els.push(text(ox + 140, oy + 10, content.title || '핵심 항목', { fontSize: 14, color: COLORS.navy, groupIds: [gid] }));

  const cards = content.cards || [{}, {}, {}, {}];
  const positions = [
    [ox + 15, oy + 35],
    [ox + 250, oy + 35],
    [ox + 15, oy + 170],
    [ox + 250, oy + 170],
  ];

  for (let i = 0; i < 4; i++) {
    const [cx, cy] = positions[i];
    const card = cards[i] || {};
    const highlighted = card.highlighted;
    const cardBg = highlighted ? COLORS.lightTeal : COLORS.white;
    const borderColor = highlighted ? COLORS.teal : COLORS.navy;

    // Card rectangle
    els.push(rect(cx, cy, 215, 125, { bg: cardBg, strokeColor: borderColor, roundness: 8, groupIds: [gid] }));

    // Illustration area (top 2/3) - placeholder shapes representing content
    const iconY = cy + 10;
    if (i === 0) {
      // Building illustration
      els.push(rect(cx + 60, iconY, 30, 50, { bg: COLORS.lightNavy, strokeColor: COLORS.navy, groupIds: [gid] }));
      els.push(rect(cx + 95, iconY + 10, 25, 40, { bg: COLORS.lightNavy, strokeColor: COLORS.navy, groupIds: [gid] }));
      els.push(rect(cx + 125, iconY + 20, 20, 30, { bg: COLORS.lightNavy, strokeColor: COLORS.navy, groupIds: [gid] }));
    } else if (i === 1) {
      // School/education
      els.push(rect(cx + 70, iconY + 10, 60, 35, { bg: COLORS.lightNavy, strokeColor: COLORS.navy, groupIds: [gid] }));
      els.push(diamond(cx + 85, iconY - 5, 30, 20, { strokeColor: COLORS.navy, groupIds: [gid] }));
      els.push(ellipse(cx + 105, iconY - 8, 20, 12, { bg: COLORS.teal, strokeColor: COLORS.teal, groupIds: [gid] }));
    } else if (i === 2) {
      // Park/greenery
      els.push(ellipse(cx + 60, iconY, 40, 35, { bg: COLORS.lightTeal, strokeColor: COLORS.teal, groupIds: [gid] }));
      els.push(rect(cx + 75, iconY + 30, 8, 20, { bg: COLORS.navy, strokeColor: COLORS.navy, groupIds: [gid] }));
      els.push(ellipse(cx + 110, iconY + 5, 30, 28, { bg: COLORS.lightTeal, strokeColor: COLORS.teal, groupIds: [gid] }));
      els.push(rect(cx + 121, iconY + 28, 6, 18, { bg: COLORS.navy, strokeColor: COLORS.navy, groupIds: [gid] }));
    } else {
      // Commercial/store
      els.push(rect(cx + 65, iconY + 5, 70, 40, { bg: COLORS.lightNavy, strokeColor: COLORS.navy, groupIds: [gid] }));
      els.push(rect(cx + 75, iconY + 25, 15, 20, { bg: COLORS.white, strokeColor: COLORS.navy, groupIds: [gid] }));
      els.push(rect(cx + 100, iconY + 25, 15, 20, { bg: COLORS.white, strokeColor: COLORS.navy, groupIds: [gid] }));
      els.push(rect(cx + 75, iconY - 2, 50, 10, { bg: COLORS.coral, strokeColor: COLORS.coral, groupIds: [gid] }));
    }

    // Label and detail
    els.push(text(cx + 10, cy + 80, card.label || `항목 ${i + 1}`, { fontSize: 12, color: COLORS.navy, textAlign: 'left', groupIds: [gid] }));
    els.push(text(cx + 10, cy + 100, card.detail || '설명', { fontSize: 9, color: COLORS.gray, textAlign: 'left', groupIds: [gid] }));
  }

  els.push(text(ox + 5, oy + 5, 'Slide 3: 2x2 Grid', { fontSize: 9, color: COLORS.gray, textAlign: 'left', groupIds: [gid] }));
  return els;
}

function slide4_chevronTimeline(ox, oy, content = {}) {
  const els = [];
  const gid = uid();
  els.push(rect(ox, oy, SLIDE_W, SLIDE_H, { bg: COLORS.white, strokeColor: COLORS.navy, groupIds: [gid] }));

  // Title
  els.push(text(ox + 120, oy + 10, content.progressLabel || '추진 경과', { fontSize: 14, color: COLORS.navy, groupIds: [gid] }));

  // 3 chevron arrows
  const steps = content.steps || ['단계 1', '단계 2', '단계 3'];
  const chevW = 140, chevH = 70;
  for (let i = 0; i < 3; i++) {
    const cx = ox + 20 + i * (chevW + 10);
    const cy = oy + 45;

    // Chevron body (rect + diamond tip)
    els.push(rect(cx, cy, chevW - 20, chevH, { bg: COLORS.navy, strokeColor: COLORS.navy, roundness: 4, groupIds: [gid] }));
    els.push(diamond(cx + chevW - 35, cy + 5, 30, chevH - 10, { bg: COLORS.navy, strokeColor: COLORS.navy, groupIds: [gid] }));
    // Step text
    els.push(text(cx + 15, cy + 25, steps[i], { fontSize: 11, color: COLORS.white, groupIds: [gid] }));
    // Connecting arrow between chevrons
    if (i < 2) {
      els.push(arrow(cx + chevW - 5, cy + chevH / 2, cx + chevW + 10, cy + chevH / 2, { color: COLORS.navy, groupIds: [gid] }));
    }
  }

  // Challenge section below
  const chalY = oy + 140;
  // Gear icons (3)
  for (let i = 0; i < 3; i++) {
    const gx = ox + 30 + i * 50;
    els.push(ellipse(gx, chalY, 25, 25, { strokeColor: COLORS.coral, bg: COLORS.lightCoral, groupIds: [gid] }));
    els.push(ellipse(gx + 5, chalY + 5, 15, 15, { strokeColor: COLORS.coral, groupIds: [gid] }));
    // Small teeth around gear (4 tiny rects)
    els.push(rect(gx + 10, chalY - 3, 5, 5, { bg: COLORS.coral, strokeColor: COLORS.coral, groupIds: [gid] }));
    els.push(rect(gx + 10, chalY + 23, 5, 5, { bg: COLORS.coral, strokeColor: COLORS.coral, groupIds: [gid] }));
  }

  // Challenge text box
  els.push(rect(ox + 200, chalY, 260, 30, { strokeColor: COLORS.coral, strokeStyle: 'dashed', roundness: 4, groupIds: [gid] }));
  els.push(text(ox + 210, chalY + 7, content.challenge || '도전과제', { fontSize: 11, color: COLORS.coral, textAlign: 'left', groupIds: [gid] }));

  // Challenge details
  const details = content.challengeDetails || [];
  for (let i = 0; i < details.length && i < 4; i++) {
    els.push(text(ox + 200, chalY + 40 + i * 18, `• ${details[i]}`, { fontSize: 9, color: COLORS.coral, textAlign: 'left', groupIds: [gid] }));
  }

  els.push(text(ox + 5, oy + 5, 'Slide 4: Chevron Timeline', { fontSize: 9, color: COLORS.gray, textAlign: 'left', groupIds: [gid] }));
  return els;
}

function slide5_seesawBalance(ox, oy, content = {}) {
  const els = [];
  const gid = uid();
  els.push(rect(ox, oy, SLIDE_W, SLIDE_H, { bg: COLORS.white, strokeColor: COLORS.navy, groupIds: [gid] }));

  // Title
  els.push(text(ox + 140, oy + 10, content.title || '문제 vs 해결', { fontSize: 14, color: COLORS.navy, groupIds: [gid] }));

  // Fulcrum triangle
  const fx = ox + 240, fy = oy + 230;
  els.push(diamond(fx - 20, fy - 10, 40, 40, { bg: COLORS.gray, strokeColor: COLORS.navy, groupIds: [gid] }));

  // Horizontal beam
  els.push(rect(ox + 40, oy + 195, 400, 8, { bg: COLORS.navy, strokeColor: COLORS.navy, groupIds: [gid] }));

  // Left problem platform
  els.push(rect(ox + 30, oy + 70, 180, 120, { bg: COLORS.lightCoral, strokeColor: COLORS.coral, roundness: 8, groupIds: [gid] }));
  els.push(text(ox + 50, oy + 80, content.problemA || '문제', { fontSize: 12, color: COLORS.coral, textAlign: 'left', groupIds: [gid] }));
  // Problem scene icons (cars in traffic)
  els.push(rect(ox + 50, oy + 110, 30, 18, { bg: COLORS.coral, strokeColor: COLORS.coral, roundness: 3, groupIds: [gid] }));
  els.push(rect(ox + 90, oy + 115, 30, 18, { bg: COLORS.coral, strokeColor: COLORS.coral, roundness: 3, groupIds: [gid] }));
  els.push(rect(ox + 130, oy + 108, 30, 18, { bg: COLORS.coral, strokeColor: COLORS.coral, roundness: 3, groupIds: [gid] }));
  // Smoke clouds
  els.push(ellipse(ox + 60, oy + 100, 20, 12, { strokeColor: COLORS.gray, bg: COLORS.lightCoral, groupIds: [gid] }));
  els.push(ellipse(ox + 100, oy + 98, 15, 10, { strokeColor: COLORS.gray, bg: COLORS.lightCoral, groupIds: [gid] }));

  // Right solution platform
  els.push(rect(ox + 270, oy + 70, 180, 120, { bg: COLORS.lightTeal, strokeColor: COLORS.teal, roundness: 8, groupIds: [gid] }));
  els.push(text(ox + 290, oy + 80, content.solutionB || '해결', { fontSize: 12, color: COLORS.teal, textAlign: 'left', groupIds: [gid] }));
  // Solution scene icons (trees, walker, bike)
  els.push(ellipse(ox + 290, oy + 105, 25, 22, { bg: COLORS.lightTeal, strokeColor: COLORS.teal, groupIds: [gid] }));
  els.push(rect(ox + 298, oy + 122, 6, 15, { bg: COLORS.teal, strokeColor: COLORS.teal, groupIds: [gid] }));
  els.push(ellipse(ox + 330, oy + 120, 12, 12, { strokeColor: COLORS.teal, groupIds: [gid] }));
  els.push(ellipse(ox + 350, oy + 120, 12, 12, { strokeColor: COLORS.teal, groupIds: [gid] }));
  els.push(rect(ox + 335, oy + 112, 22, 8, { strokeColor: COLORS.teal, groupIds: [gid] }));
  // Person walking
  els.push(ellipse(ox + 390, oy + 108, 10, 10, { strokeColor: COLORS.teal, bg: COLORS.lightTeal, groupIds: [gid] }));
  els.push(rect(ox + 392, oy + 118, 6, 16, { strokeColor: COLORS.teal, groupIds: [gid] }));

  // Dashed arch
  els.push(arrow(ox + 120, oy + 50, ox + 360, oy + 50, { color: COLORS.navy, strokeStyle: 'dashed', strokeWidth: 1, groupIds: [gid] }));

  els.push(text(ox + 5, oy + 5, 'Slide 5: Seesaw', { fontSize: 9, color: COLORS.gray, textAlign: 'left', groupIds: [gid] }));
  return els;
}

function slide6_routeFlow(ox, oy, content = {}) {
  const els = [];
  const gid = uid();
  els.push(rect(ox, oy, SLIDE_W, SLIDE_H, { bg: COLORS.white, strokeColor: COLORS.navy, groupIds: [gid] }));

  // Start point (coral circle with bus icon)
  const sx = ox + 60, sy = oy + 140;
  els.push(ellipse(sx - 40, sy - 40, 80, 80, { strokeColor: COLORS.coral, bg: COLORS.lightCoral, strokeWidth: 2, groupIds: [gid] }));
  // Bus icon (rect body + windows)
  els.push(rect(sx - 20, sy - 15, 40, 25, { bg: COLORS.coral, strokeColor: COLORS.coral, roundness: 4, groupIds: [gid] }));
  els.push(rect(sx - 15, sy - 10, 10, 8, { bg: COLORS.white, strokeColor: COLORS.white, groupIds: [gid] }));
  els.push(rect(sx + 5, sy - 10, 10, 8, { bg: COLORS.white, strokeColor: COLORS.white, groupIds: [gid] }));
  els.push(ellipse(sx - 12, sy + 10, 8, 8, { bg: COLORS.navy, strokeColor: COLORS.navy, groupIds: [gid] }));
  els.push(ellipse(sx + 8, sy + 10, 8, 8, { bg: COLORS.navy, strokeColor: COLORS.navy, groupIds: [gid] }));
  els.push(text(sx - 30, sy + 50, content.start || '출발', { fontSize: 10, color: COLORS.coral, groupIds: [gid] }));

  // Solid connecting line
  els.push(arrow(sx + 40, sy, ox + 190, sy, { color: COLORS.navy, strokeWidth: 2, groupIds: [gid] }));

  // Transfer diamond
  const tx = ox + 240, ty = sy;
  els.push(diamond(tx - 40, ty - 40, 80, 80, { strokeColor: COLORS.navy, bg: COLORS.lightNavy, groupIds: [gid] }));
  els.push(text(tx - 25, ty - 8, content.transfer || '환승', { fontSize: 10, color: COLORS.navy, groupIds: [gid] }));

  // Dashed curved path (approximated with dashed arrow)
  els.push(arrow(tx + 40, ty, ox + 420, ty - 30, { color: COLORS.teal, strokeStyle: 'dashed', strokeWidth: 2, groupIds: [gid] }));

  // End point (airplane icon)
  const ex = ox + 420, ey = sy - 30;
  els.push(ellipse(ex - 20, ey - 25, 50, 50, { strokeColor: COLORS.teal, bg: COLORS.lightTeal, groupIds: [gid] }));
  // Airplane silhouette (simplified)
  els.push(diamond(ex - 5, ey - 15, 20, 30, { bg: COLORS.teal, strokeColor: COLORS.teal, groupIds: [gid] }));
  els.push(rect(ex - 15, ey - 5, 40, 6, { bg: COLORS.teal, strokeColor: COLORS.teal, groupIds: [gid] }));
  els.push(text(ex - 20, ey + 30, content.newRoute || '새 노선', { fontSize: 10, color: COLORS.teal, groupIds: [gid] }));

  // Small movement icons along path
  els.push(ellipse(ox + 310, sy - 5, 10, 10, { strokeColor: COLORS.teal, groupIds: [gid] }));
  els.push(ellipse(ox + 350, sy - 15, 8, 8, { strokeColor: COLORS.teal, groupIds: [gid] }));
  els.push(ellipse(ox + 380, sy - 25, 8, 8, { strokeColor: COLORS.teal, groupIds: [gid] }));

  els.push(text(ox + 5, oy + 5, 'Slide 6: Route Flow', { fontSize: 9, color: COLORS.gray, textAlign: 'left', groupIds: [gid] }));
  return els;
}

function slide7_blockLayout(ox, oy, content = {}) {
  const els = [];
  const gid = uid();
  els.push(rect(ox, oy, SLIDE_W, SLIDE_H, { bg: COLORS.white, strokeColor: COLORS.navy, groupIds: [gid] }));

  // Title
  els.push(text(ox + 100, oy + 8, content.slideTitle || '필요 vs 인프라', { fontSize: 13, color: COLORS.navy, groupIds: [gid] }));

  const needs = content.needs || ['필요 1', '필요 2'];
  const infra = content.infrastructure || ['인프라 1', '인프라 2', '인프라 3'];
  const gaps = content.gaps || ['갭 1', '갭 2'];

  // Top row: 2 coral boxes (needs)
  for (let i = 0; i < 2; i++) {
    const bx = ox + 20 + i * 220;
    els.push(rect(bx, oy + 35, 200, 55, { bg: COLORS.coral, strokeColor: COLORS.coral, roundness: 8, groupIds: [gid] }));
    // White icon placeholder (ellipse as icon)
    els.push(ellipse(bx + 15, oy + 45, 30, 30, { bg: COLORS.white, strokeColor: COLORS.white, groupIds: [gid] }));
    els.push(text(bx + 55, oy + 52, needs[i], { fontSize: 11, color: COLORS.white, textAlign: 'left', groupIds: [gid] }));
  }
  // + symbol
  els.push(text(ox + 225, oy + 50, '+', { fontSize: 18, color: COLORS.navy, groupIds: [gid] }));

  // Gap indicators (dashed coral)
  for (let i = 0; i < 2; i++) {
    const gx = ox + 20 + i * 220;
    els.push(rect(gx, oy + 105, 200, 35, { strokeColor: COLORS.coral, strokeStyle: 'dashed', groupIds: [gid] }));
    els.push(text(gx + 10, oy + 112, gaps[i] || `갭 ${i + 1}`, { fontSize: 9, color: COLORS.coral, textAlign: 'left', groupIds: [gid] }));
    // Dotted pattern inside gap
    for (let d = 0; d < 5; d++) {
      els.push(ellipse(gx + 150 + d * 10, oy + 117, 4, 4, { strokeColor: COLORS.coral, bg: COLORS.lightCoral, groupIds: [gid] }));
    }
  }

  // Bottom row: 3 navy boxes (infrastructure)
  for (let i = 0; i < 3; i++) {
    const bx = ox + 10 + i * 155;
    els.push(rect(bx, oy + 160, 145, 65, { bg: COLORS.navy, strokeColor: COLORS.navy, roundness: 4, groupIds: [gid] }));
    // White icon
    els.push(ellipse(bx + 10, oy + 170, 25, 25, { bg: COLORS.white, strokeColor: COLORS.white, groupIds: [gid] }));
    els.push(text(bx + 45, oy + 178, infra[i], { fontSize: 10, color: COLORS.white, textAlign: 'left', groupIds: [gid] }));
  }

  // Down arrows between need and gap rows
  els.push(arrow(ox + 120, oy + 90, ox + 120, oy + 105, { color: COLORS.coral, groupIds: [gid] }));
  els.push(arrow(ox + 340, oy + 90, ox + 340, oy + 105, { color: COLORS.coral, groupIds: [gid] }));

  els.push(text(ox + 5, oy + 5, 'Slide 7: Block Layout', { fontSize: 9, color: COLORS.gray, textAlign: 'left', groupIds: [gid] }));
  return els;
}

function slide8_hubSummary(ox, oy, content = {}) {
  const els = [];
  const gid = uid();
  els.push(rect(ox, oy, SLIDE_W, SLIDE_H, { bg: COLORS.white, strokeColor: COLORS.navy, groupIds: [gid] }));

  // Title
  els.push(text(ox + 130, oy + 8, content.summaryTitle || '핵심 과제', { fontSize: 13, color: COLORS.navy, groupIds: [gid] }));

  // Center hub
  const cx = ox + 240, cy = oy + 155;
  els.push(ellipse(cx - 50, cy - 50, 100, 100, { bg: COLORS.teal, strokeColor: COLORS.teal, strokeWidth: 2, groupIds: [gid] }));
  // Heart icon inside
  els.push(ellipse(cx - 15, cy - 15, 15, 12, { bg: COLORS.white, strokeColor: COLORS.white, groupIds: [gid] }));
  els.push(ellipse(cx + 2, cy - 15, 15, 12, { bg: COLORS.white, strokeColor: COLORS.white, groupIds: [gid] }));
  els.push(diamond(cx - 12, cy - 5, 25, 22, { bg: COLORS.white, strokeColor: COLORS.white, groupIds: [gid] }));
  els.push(text(cx - 30, cy + 10, content.goal || '목표', { fontSize: 10, color: COLORS.white, groupIds: [gid] }));

  // 4 corner boxes with icons
  const issues = content.issues || ['이슈 1', '이슈 2', '이슈 3', '이슈 4'];
  const corners = [
    { x: ox + 20, y: oy + 35, ax1: ox + 85, ay1: oy + 85, ax2: cx - 45, ay2: cy - 40 },   // top-left
    { x: ox + 370, y: oy + 35, ax1: ox + 405, ay1: oy + 85, ax2: cx + 45, ay2: cy - 40 },  // top-right
    { x: ox + 20, y: oy + 215, ax1: ox + 85, ay1: oy + 225, ax2: cx - 45, ay2: cy + 40 },  // bottom-left
    { x: ox + 370, y: oy + 215, ax1: ox + 405, ay1: oy + 225, ax2: cx + 45, ay2: cy + 40 }, // bottom-right
  ];

  // Icon shapes for each corner (building, scales, bus, puzzle)
  const iconDrawers = [
    // Building
    (bx, by, g) => {
      els.push(rect(bx + 25, by + 5, 20, 30, { bg: COLORS.lightNavy, strokeColor: COLORS.navy, groupIds: [g] }));
      els.push(rect(bx + 48, by + 12, 15, 23, { bg: COLORS.lightNavy, strokeColor: COLORS.navy, groupIds: [g] }));
    },
    // Scales
    (bx, by, g) => {
      els.push(rect(bx + 38, by + 5, 4, 30, { bg: COLORS.navy, strokeColor: COLORS.navy, groupIds: [g] }));
      els.push(rect(bx + 20, by + 5, 40, 4, { bg: COLORS.navy, strokeColor: COLORS.navy, groupIds: [g] }));
      els.push(ellipse(bx + 18, by + 10, 16, 8, { strokeColor: COLORS.navy, groupIds: [g] }));
      els.push(ellipse(bx + 48, by + 10, 16, 8, { strokeColor: COLORS.navy, groupIds: [g] }));
    },
    // Bus
    (bx, by, g) => {
      els.push(rect(bx + 25, by + 8, 35, 22, { bg: COLORS.teal, strokeColor: COLORS.teal, roundness: 3, groupIds: [g] }));
      els.push(rect(bx + 28, by + 12, 10, 7, { bg: COLORS.white, strokeColor: COLORS.white, groupIds: [g] }));
      els.push(rect(bx + 42, by + 12, 10, 7, { bg: COLORS.white, strokeColor: COLORS.white, groupIds: [g] }));
    },
    // Puzzle
    (bx, by, g) => {
      els.push(rect(bx + 25, by + 8, 18, 14, { bg: COLORS.lightTeal, strokeColor: COLORS.teal, groupIds: [g] }));
      els.push(rect(bx + 43, by + 8, 18, 14, { bg: COLORS.lightNavy, strokeColor: COLORS.navy, groupIds: [g] }));
      els.push(rect(bx + 25, by + 22, 18, 14, { bg: COLORS.lightNavy, strokeColor: COLORS.navy, groupIds: [g] }));
      els.push(rect(bx + 43, by + 22, 18, 14, { bg: COLORS.lightTeal, strokeColor: COLORS.teal, groupIds: [g] }));
    },
  ];

  for (let i = 0; i < 4; i++) {
    const c = corners[i];
    // Dashed circle border
    els.push(ellipse(c.x, c.y, 90, 55, { strokeColor: COLORS.navy, strokeStyle: 'dashed', groupIds: [gid] }));
    // Icon
    iconDrawers[i](c.x, c.y, gid);
    // Label
    els.push(text(c.x + 10, c.y + 40, issues[i], { fontSize: 9, color: COLORS.navy, groupIds: [gid] }));
    // Arrow to center
    els.push(arrow(c.ax1, c.ay1, c.ax2, c.ay2, { color: COLORS.teal, strokeWidth: 1, groupIds: [gid] }));
  }

  els.push(text(ox + 5, oy + 5, 'Slide 8: Hub Summary', { fontSize: 9, color: COLORS.gray, textAlign: 'left', groupIds: [gid] }));
  return els;
}

/* ── Main export ── */

const TEMPLATE_FNS = {
  1: slide1_titleMap,
  2: slide2_donutCompare,
  3: slide3_gridCards,
  4: slide4_chevronTimeline,
  5: slide5_seesawBalance,
  6: slide6_routeFlow,
  7: slide7_blockLayout,
  8: slide8_hubSummary,
};

/**
 * Generate a detailed Excalidraw file from extracted content.
 * @param {object} extractedContent - The content JSON from Stage 1
 * @param {string} [outputPath] - Where to save the .excalidraw file
 * @returns {string} Path to the generated file
 */
export function generateExcalidrawSketch(extractedContent, outputPath) {
  const outFile = outputPath || path.resolve('slide_layout_guide_detailed.excalidraw');

  const allElements = [];

  // Title text
  allElements.push(text(0, 20, 'PPT Slide Layout Guide (Detailed)', { fontSize: 20, color: COLORS.navy }));
  allElements.push(text(0, 50, `${Object.keys(TEMPLATE_FNS).length} Slides – Auto-generated`, { fontSize: 12, color: COLORS.gray }));

  for (let id = 1; id <= 8; id++) {
    const { x, y } = slideOrigin(id);
    const key = `slide_${id}`;
    const content = extractedContent?.[key] || {};
    const fn = TEMPLATE_FNS[id];
    const slideEls = fn(x, y, content);
    allElements.push(...slideEls);
  }

  const scene = {
    type: 'excalidraw',
    version: 2,
    source: 'script2ppt-generator',
    elements: allElements,
    appState: {
      gridSize: null,
      viewBackgroundColor: '#ffffff',
    },
    files: {},
  };

  fs.writeFileSync(outFile, JSON.stringify(scene, null, 2), 'utf-8');
  console.log(`[Excalidraw] 상세 스케치 생성 완료: ${outFile} (${allElements.length}개 요소)`);
  return outFile;
}

/* ── CLI entry point ── */
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.url.replace('file://', ''))) {
  const contentPath = process.argv[2] || path.resolve('output/extracted_content.json');
  if (!fs.existsSync(contentPath)) {
    console.error(`콘텐츠 파일을 찾을 수 없습니다: ${contentPath}`);
    console.error('Usage: node src/generateExcalidrawSketch.mjs [extracted_content.json]');
    process.exit(1);
  }
  const content = JSON.parse(fs.readFileSync(contentPath, 'utf-8'));
  generateExcalidrawSketch(content);
}
