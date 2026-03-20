import Anthropic from '@anthropic-ai/sdk';
import { buildSlidePromptGenerationPrompt } from './prompts.mjs';

const anthropic = new Anthropic();

export async function generateSlidePrompts(extractedContent) {
  const prompt = buildSlidePromptGenerationPrompt(extractedContent);

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      console.log(`[Stage 2] 슬라이드 프롬프트 생성 중... (시도 ${attempt + 1}/2)`);

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const raw = response.content[0].text;
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, raw];
      const parsed = JSON.parse(jsonMatch[1].trim());

      console.log('[Stage 2] 슬라이드 프롬프트 생성 완료!');
      return parsed;
    } catch (err) {
      console.error(`[Stage 2] 오류 (시도 ${attempt + 1}):`, err.message);
      if (attempt === 1) throw err;
      console.log('[Stage 2] 재시도 중...');
    }
  }
}
