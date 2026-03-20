import Anthropic from '@anthropic-ai/sdk';
import { buildExtractionPrompt } from './prompts.mjs';

const anthropic = new Anthropic();

export async function extractContent(scriptText) {
  const prompt = buildExtractionPrompt(scriptText);

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      console.log(`[Stage 1] 내용 추출 중... (시도 ${attempt + 1}/2)`);

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt + '\n\n반드시 유효한 JSON만 반환하세요. 다른 텍스트 없이 JSON만 출력하세요.',
          },
        ],
      });

      const raw = response.content[0].text;
      const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, raw];
      const parsed = JSON.parse(jsonMatch[1].trim());

      const result = fillDefaults(parsed);
      console.log('[Stage 1] 내용 추출 완료!');
      return result;
    } catch (err) {
      console.error(`[Stage 1] 오류 (시도 ${attempt + 1}):`, err.message);
      if (attempt === 1) throw err;
      console.log('[Stage 1] 재시도 중...');
    }
  }
}

function fillDefaults(data) {
  const defaults = {
    slide_1: { title: '제목 없음', subtitle: '', centerLabel: '', mapShape: '' },
    slide_2: {
      statusBadge: '현황',
      areaA: { label: 'A', value: '-', growth: '' },
      areaB: { label: 'B', value: '-', growth: '' },
      bottomLabel: '',
      riskBadge: '',
    },
    slide_3: { title: '주요 항목', cards: [
      { label: '항목 1', detail: '', highlighted: false, iconDesc: '' },
      { label: '항목 2', detail: '', highlighted: false, iconDesc: '' },
      { label: '항목 3', detail: '', highlighted: false, iconDesc: '' },
      { label: '항목 4', detail: '', highlighted: true, iconDesc: '' },
    ]},
    slide_4: {
      timelineTitle: '',
      progressLabel: '진행 현황',
      steps: ['단계 1', '단계 2', '단계 3'],
      challenge: '과제',
      challengeDetails: [],
    },
    slide_5: { title: '문제 vs 해결', problemA: '문제', solutionB: '해결', problemScene: '', solutionScene: '' },
    slide_6: { start: '시작', transfer: '전환', newRoute: '새 방향', startIcon: '', endIcon: '' },
    slide_7: {
      slideTitle: '',
      needs: ['필요 1', '필요 2'],
      needIcons: ['', ''],
      infrastructure: ['인프라 1', '인프라 2', '인프라 3'],
      infraIcons: ['', '', ''],
      gaps: ['갭 1', '갭 2'],
    },
    slide_8: {
      summaryTitle: '',
      goal: '목표',
      goalIcon: '',
      issues: ['이슈 1', '이슈 2', '이슈 3', '이슈 4'],
      issueIcons: ['', '', '', ''],
    },
  };

  const result = {};
  for (let i = 1; i <= 8; i++) {
    const key = `slide_${i}`;
    result[key] = deepMerge(defaults[key], data[key] || {});
  }
  return result;
}

function deepMerge(defaults, source) {
  const result = { ...defaults };
  for (const [key, val] of Object.entries(source)) {
    if (val !== null && val !== undefined && val !== '') {
      if (Array.isArray(defaults[key]) && Array.isArray(val)) {
        result[key] = val;
      } else if (typeof defaults[key] === 'object' && !Array.isArray(defaults[key]) && typeof val === 'object') {
        result[key] = deepMerge(defaults[key], val);
      } else {
        result[key] = val;
      }
    }
  }
  return result;
}
