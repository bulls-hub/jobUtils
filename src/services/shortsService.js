import { supabase } from '../lib/supabaseClient';
import { GoogleGenerativeAI } from "@google/generative-ai";

export const shortsService = {
  async getShorts() {
    const { data, error } = await supabase
      .from('shorts_contents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createShorts(topic) {
    const geminiApiKey = process.env.REACT_APP_GEMINI_API_KEY;

    if (!geminiApiKey) {
      throw new Error('Gemini API Key가 누락되었습니다. .env 파일의 REACT_APP_GEMINI_API_KEY를 확인해주세요.');
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('사용자 인증이 필요합니다.');

    // 1. Gemini를 활용하여 컨텐츠 생성
    // JSON 모드를 활성화하여 항상 유효한 JSON이 반환되도록 설정합니다.
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are a professional YouTube Shorts creator. 
      Based on the topic: "${topic}", please generate a structured short-form video plan divided into 5 to 7 logical scenes.
      
      For each scene, provide:
      1. "visual_prompt": A highly detailed, cinematic visual description (in English) optimized for Google Veo (video generation model). Focus on style, lighting, camera movement, and specific subject actions.
      2. "script": The specific narration text or dialogue for this scene (in Korean, engaging and rhythmic).
      
      Also provide 5-7 trending hashtags.
      
      Return the response in the following JSON format:
      {
        "topic": "${topic}",
        "hashtags": "#tag1 #tag2 ...",
        "scenes": [
          {
            "visual_prompt": "...",
            "script": "..."
          },
          ...
        ]
      }
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // JSON 추출
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('AI Response Text:', text);
        throw new Error('AI가 유효한 JSON 형식을 생성하지 못했습니다.');
      }

      const jsonStr = jsonMatch[0];

      try {
        const generatedData = JSON.parse(jsonStr);

        // 하위 호환성을 위한 통합 데이터 생성
        const fullScript = generatedData.scenes.map(s => s.script).join('\n\n');
        const fullPrompt = generatedData.scenes.map((s, idx) => `Scene ${idx + 1}: ${s.visual_prompt}`).join('\n\n');

        // 2. DB에 저장
        const { data, error } = await supabase
          .from('shorts_contents')
          .insert([
            {
              user_id: user.id,
              topic,
              script: fullScript,
              video_prompt: fullPrompt,
              hashtags: generatedData.hashtags,
              scenes: generatedData.scenes,
              status: 'pending'
            }
          ])
          .select();

        if (error) throw error;
        return data[0];
      } catch (parseError) {
        console.error('JSON Parse Error. Raw Text:', jsonStr);
        throw new Error('AI 응답을 분석하는 중 오류가 발생했습니다(JSON). 잠시 후 다시 시도해 주세요.');
      }
    } catch (apiError) {
      console.error('Gemini API Error:', apiError);

      if (apiError.status === 404) {
        throw new Error('Gemini API 모델을 찾을 수 없습니다(404). 현재 최신 버전인 gemini-2.5-flash로 설정을 변경했습니다. 문제가 지속되면 API 키의 모델 가용 권한을 확인해 주세요.');
      }

      throw new Error('Gemini AI 응답 생성 중 오류가 발생했습니다: ' + apiError.message);
    }
  },

  async updateShortsStatus(id, status, videoUrl = null) {
    const updateData = { status };
    if (videoUrl) updateData.video_url = videoUrl;

    const { data, error } = await supabase
      .from('shorts_contents')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  },

  async deleteShorts(id) {
    const { error } = await supabase
      .from('shorts_contents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
