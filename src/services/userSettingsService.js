
import { supabase } from '../lib/supabaseClient';

export const userSettingsService = {
    /**
     * 사용자의 위젯 설정(주식, 코인 목록) 가져오기
     */
    async getSettings() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
                .from('user_widget_settings')
                .select('stocks, coins')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Failed to get user settings:', error);
            return null;
        }
    },

    /**
     * 사용자의 위젯 설정 저장 (UPSERT)
     */
    async updateSettings({ stocks, coins }) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const updateData = { user_id: user.id };
            if (stocks !== undefined) updateData.stocks = stocks;
            if (coins !== undefined) updateData.coins = coins;

            const { data, error } = await supabase
                .from('user_widget_settings')
                .upsert(updateData)
                .select();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Failed to update user settings:', error);
            throw error;
        }
    }
};
