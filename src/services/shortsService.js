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
      console.error('Environment variables:', process.env);
      throw new Error('Gemini API Key is missing (REACT_APP_GEMINI_API_KEY). Please ensure it is set in your .env file and you have restarted the development server.');
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 1. Gemini를 활용하여 컨텐츠 생성
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      You are a professional YouTube Shorts creator. 
      Based on the topic: "${topic}", please generate:
      1. A viral script (under 60 seconds, engaging hook, in Korean).
      2. A detailed video generation prompt (in English) for AI video tools like Runway or Pika.
      3. 5-7 trending hashtags to maximize exposure.
      
      Return the response in the following JSON format:
      {
        "script": "...",
        "video_prompt": "...",
        "hashtags": "..."
      }
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // JSON 추출 (Markdown backticks 제거용)
      const jsonStr = text.replace(/```json|```/g, '').trim();
      const generatedData = JSON.parse(jsonStr);

      // 2. DB에 저장
      const { data, error } = await supabase
        .from('shorts_contents')
        .insert([
          {
            user_id: user.id,
            topic,
            script: generatedData.script,
            video_prompt: generatedData.video_prompt,
            hashtags: generatedData.hashtags,
            status: 'pending'
          }
        ])
        .select();

      if (error) throw error;
      return data[0];
    } catch (apiError) {
      console.error('Gemini API Error:', apiError);
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
