import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import multer from 'multer';
import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';

// dynamic import so Anthropic client picks up env vars loaded above
const { extractContent } = await import('./src/extractContentClaude.mjs');

const app = express();
const PORT = process.env.PORT || 3001;
const PRESENTON_URL = process.env.PRESENTON_URL || 'http://localhost:8000';

app.use(express.json());

// Multer setup
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.docx', '.txt', '.md'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('.docx, .txt 또는 .md 파일만 업로드 가능합니다.'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Static files
app.use(express.static('public'));

// Convert extracted content to slides_markdown for Presenton
function contentToSlidesMarkdown(extractedContent) {
  const converters = {
    slide_1: (c) => `# ${c.title}\n${c.subtitle}\n\n핵심 키워드: ${c.centerLabel}`,
    slide_2: (c) => `## 현황 비교: ${c.statusBadge}\n\n- ${c.areaA?.label}: ${c.areaA?.value} (${c.areaA?.growth})\n- ${c.areaB?.label}: ${c.areaB?.value} (${c.areaB?.growth})\n\n${c.bottomLabel}`,
    slide_3: (c) => `## ${c.title}\n\n${(c.cards || []).map(card => `- **${card.label}**: ${card.detail}`).join('\n')}`,
    slide_4: (c) => `## ${c.timelineTitle || c.progressLabel}\n\n진행 단계:\n${(c.steps || []).map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n도전과제: ${c.challenge}\n${(c.challengeDetails || []).map(d => `- ${d}`).join('\n')}`,
    slide_5: (c) => `## ${c.title}\n\n문제: ${c.problemA}\n해결: ${c.solutionB}`,
    slide_6: (c) => `## 흐름/경로\n\n${c.start} → ${c.transfer} → ${c.newRoute}`,
    slide_7: (c) => `## ${c.slideTitle}\n\n필요:\n${(c.needs || []).map(n => `- ${n}`).join('\n')}\n\n인프라:\n${(c.infrastructure || []).map(n => `- ${n}`).join('\n')}\n\n갭:\n${(c.gaps || []).map(n => `- ${n}`).join('\n')}`,
    slide_8: (c) => `## ${c.summaryTitle}\n\n목표: ${c.goal}\n\n핵심 과제:\n${(c.issues || []).map(n => `- ${n}`).join('\n')}`,
  };

  const slides = [];
  for (let i = 1; i <= 8; i++) {
    const key = `slide_${i}`;
    const content = extractedContent[key];
    if (content && converters[key]) {
      slides.push(converters[key](content));
    }
  }
  return slides;
}

// Main endpoint: script → Claude extract → Presenton PPTX
app.post('/api/generate-pptx', upload.single('script'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '파일이 업로드되지 않았습니다.' });
  }

  const filePath = req.file.path;

  try {
    // Extract text from file
    const ext = path.extname(req.file.originalname).toLowerCase();
    let scriptText;

    if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      scriptText = result.value;
    } else {
      scriptText = fs.readFileSync(filePath, 'utf-8');
    }

    if (!scriptText.trim()) {
      return res.status(400).json({ error: '파일 내용이 비어있습니다.' });
    }

    // Stage 1: Extract structured content via Claude
    console.log('\n=== Stage 1: 내용 추출 (Claude) ===');
    const extractedContent = await extractContent(scriptText);

    // Stage 2: Convert to slides_markdown
    console.log('\n=== Stage 2: Presenton용 마크다운 변환 ===');
    const slidesMarkdown = contentToSlidesMarkdown(extractedContent);
    console.log(`${slidesMarkdown.length}개 슬라이드 마크다운 생성`);

    // Stage 3: Call Presenton API
    console.log('\n=== Stage 3: Presenton PPTX 생성 ===');
    const presentonRes = await fetch(`${PRESENTON_URL}/api/v1/ppt/presentation/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: scriptText.slice(0, 500),
        slides_markdown: slidesMarkdown,
        n_slides: slidesMarkdown.length,
        language: 'Korean',
        tone: 'professional',
        verbosity: 'concise',
        template: 'general',
        export_as: 'pptx',
      }),
    });

    if (!presentonRes.ok) {
      const errBody = await presentonRes.text();
      throw new Error(`Presenton API 오류 (${presentonRes.status}): ${errBody}`);
    }

    const presentonData = await presentonRes.json();
    console.log('PPTX 생성 완료:', presentonData);

    res.json({
      success: true,
      presentationId: presentonData.presentation_id,
      path: presentonData.path,
      editUrl: `http://localhost:3000${presentonData.edit_path}`,
    });
  } catch (err) {
    console.error('PPTX 생성 오류:', err);
    res.status(500).json({ error: `PPTX 생성 중 오류: ${err.message}` });
  } finally {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
});

// Error handling for multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

app.listen(PORT, () => {
  console.log(`Slidemaker running at http://localhost:${PORT}`);
  console.log(`Presenton backend: ${PRESENTON_URL}`);
});
