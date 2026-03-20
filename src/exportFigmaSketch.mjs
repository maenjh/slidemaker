/**
 * exportFigmaSketch.mjs
 *
 * Figma에서 디자인한 슬라이드 레이아웃을 PNG로 추출하여
 * slide_sketches/ 폴더에 저장하는 스크립트.
 *
 * 사용법:
 *   node src/exportFigmaSketch.mjs
 *
 * 환경변수:
 *   FIGMA_ACCESS_TOKEN - Figma Personal Access Token
 *   FIGMA_FILE_KEY    - Figma 파일의 fileKey (URL에서 추출)
 *
 * Figma 파일 설정:
 *   config.mjs의 FIGMA_NODES에 각 슬라이드 프레임의 nodeId를 설정해야 함.
 */
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const SKETCHES_DIR = path.resolve('slide_sketches');

/**
 * Figma REST API를 사용하여 node별 PNG를 export
 */
async function fetchFigmaImages(fileKey, nodeIds, token) {
  const ids = nodeIds.join(',');
  const url = `https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(ids)}&format=png&scale=2`;

  const res = await fetch(url, {
    headers: { 'X-FIGMA-TOKEN': token },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Figma API error (${res.status}): ${body}`);
  }

  const data = await res.json();
  if (data.err) {
    throw new Error(`Figma API returned error: ${data.err}`);
  }

  return data.images; // { nodeId: imageUrl, ... }
}

async function downloadImage(url, outputPath) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download image: ${res.status}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
}

export async function exportFigmaSlides(figmaConfig) {
  const token = process.env.FIGMA_ACCESS_TOKEN;
  const fileKey = process.env.FIGMA_FILE_KEY || figmaConfig?.fileKey;

  if (!token) {
    throw new Error('FIGMA_ACCESS_TOKEN 환경변수가 설정되지 않았습니다. .env 파일에 추가하세요.');
  }
  if (!fileKey) {
    throw new Error('FIGMA_FILE_KEY 환경변수가 설정되지 않았습니다.');
  }

  const nodes = figmaConfig?.nodes;
  if (!nodes || nodes.length === 0) {
    throw new Error('Figma node 설정이 없습니다. config.mjs의 FIGMA_NODES를 확인하세요.');
  }

  fs.mkdirSync(SKETCHES_DIR, { recursive: true });

  console.log(`[Figma] 파일 ${fileKey}에서 ${nodes.length}개 슬라이드 추출 중...`);

  const nodeIds = nodes.map(n => n.nodeId);
  const imageUrls = await fetchFigmaImages(fileKey, nodeIds, token);

  for (const node of nodes) {
    const imageUrl = imageUrls[node.nodeId];
    if (!imageUrl) {
      console.warn(`[Figma] 슬라이드 ${node.slideId} (${node.nodeId}) 이미지 URL 없음, 건너뜀`);
      continue;
    }

    const outputPath = path.join(SKETCHES_DIR, node.outputFile);
    console.log(`[Figma] 슬라이드 ${node.slideId} 다운로드 중...`);
    await downloadImage(imageUrl, outputPath);
    console.log(`[Figma] 저장: ${outputPath}`);
  }

  console.log('[Figma] 모든 슬라이드 추출 완료!');
}

/* ── CLI entry point ── */
const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.url.replace('file://', ''));

if (isMain) {
  // Dynamic import to avoid circular dependency at module level
  const { FIGMA_NODES } = await import('./config.mjs');

  if (!FIGMA_NODES || FIGMA_NODES.length === 0) {
    console.error('config.mjs에 FIGMA_NODES가 설정되지 않았습니다.');
    console.error('다음 형식으로 추가하세요:');
    console.error(`
export const FIGMA_NODES = [
  { slideId: 1, nodeId: '123:456', outputFile: 'slide_1_title_map.png' },
  // ...
];`);
    process.exit(1);
  }

  exportFigmaSlides({ nodes: FIGMA_NODES }).catch(err => {
    console.error('[Figma] 오류:', err.message);
    process.exit(1);
  });
}
