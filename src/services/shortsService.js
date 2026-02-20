import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from "@google/generative-ai";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const geminiApiKey = process.env.REACT_APP_GEMINI_API_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
const genAI = new GoogleGenerativeAI(geminiApiKey);

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 1. Gemini를 활용하여 컨텐츠 생성
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      You are a professional YouTube Shorts creator. 
      Based on the topic: "${topic}", please generate:
      1. A viral script (under 60 seconds, engaging hook).
      2. A detailed video generation prompt (in English) for AI video tools like Runway or Pika.
      3. 5-7 trending hashtags to maximize exposure.
      
      Return the response in the following JSON format:
      {
        "script": "...",
        "video_prompt": "...",
        "hashtags": "..."
      }
    `;

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
