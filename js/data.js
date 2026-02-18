import supabase from './supabaseClient.js';
import { getTodayStr, showToast } from './utils.js';

// ⚠️ 关键修复：一定要加 'export' 关键字
export async function ensureProfile(user) {
    const { data } = await supabase.from('profiles').select('id').eq('id', user.id).single();
    if (!data) {
        // 如果用户不存在，创建一个新的
        await supabase.from('profiles').insert([{
            id: user.id,
            username: user.email.split('@')[0],
            avatar_url: `https://ui-avatars.com/api/?name=${user.email.split('@')[0]}`,
            total_check_ins: 0,
            bio: "I'm testing Sticky!",
            mood: '⚙️'  // 默认mood，表示"Set Your Mood"
        }]);
    }
}

export async function getStreak(userId) {
    const { data } = await supabase.from('profiles').select('total_check_ins').eq('id', userId).single();
    return data ? data.total_check_ins : 0;
}

export async function performCheckIn(userId, photoData) {
    const today = getTodayStr();
    
    // 测试阶段：允许一天多次签到 (注释掉重复检查)
    // const { data: existing } = ...

    // 获取用户当前的mood
    const { data: profile } = await supabase.from('profiles').select('mood').eq('id', userId).single();
    const currentMood = profile?.mood || '⚙️';

    // 1. 写入签到记录（包含mood）
    const { error } = await supabase.from('check_ins').insert([{
        user_id: userId,
        check_in_date: today,
        photo_url: photoData, // 注意这里字段名要和数据库一致，如果是 photo_url
        mood: currentMood  // 记录签到时的mood
    }]);

    if (error) {
        console.error("Check-in error:", error);
        throw error;
    }

    // 2. 更新连续天数
    const streak = await getStreak(userId);
    await supabase.from('profiles').update({ total_check_ins: streak + 1 }).eq('id', userId);
    
    // 3. 检查用户所属的groups，判断是否完成group check-in
    await checkGroupCheckIns(userId, today);
    
    return true;
}

// 检查并记录group check-in
async function checkGroupCheckIns(userId, today) {
    try {
        // 获取用户所属的所有groups
        const { data: memberships } = await supabase
            .from('group_members')
            .select('group_id')
            .eq('user_id', userId);
        
        if (!memberships || memberships.length === 0) return;
        
        // 对每个group检查是否所有成员都完成了今天的check-in
        for (const membership of memberships) {
            const groupId = membership.group_id;
            
            // 获取该group的所有成员
            const { data: allMembers } = await supabase
                .from('group_members')
                .select('user_id')
                .eq('group_id', groupId);
            
            if (!allMembers || allMembers.length === 0) continue;
            
            // 检查今天每个成员是否都check-in了
            const memberIds = allMembers.map(m => m.user_id);
            const { data: todayCheckIns } = await supabase
                .from('check_ins')
                .select('user_id')
                .in('user_id', memberIds)
                .eq('check_in_date', today);
            
            // 如果所有成员都check-in了
            const checkedInIds = new Set(todayCheckIns?.map(c => c.user_id) || []);
            const allCheckedIn = memberIds.every(id => checkedInIds.has(id));
            
            if (allCheckedIn) {
                // 检查是否已经记录过这个group的今日check-in
                const { data: existing } = await supabase
                    .from('group_check_ins')
                    .select('id')
                    .eq('group_id', groupId)
                    .eq('check_in_date', today)
                    .single();
                
                if (!existing) {
                    // 记录group check-in
                    await supabase.from('group_check_ins').insert([{
                        group_id: groupId,
                        check_in_date: today
                    }]);
                    
                    // 更新group的总计数
                    const { data: group } = await supabase
                        .from('groups')
                        .select('total_group_check_ins')
                        .eq('id', groupId)
                        .single();
                    
                    const currentCount = group?.total_group_check_ins || 0;
                    await supabase
                        .from('groups')
                        .update({ total_group_check_ins: currentCount + 1 })
                        .eq('id', groupId);
                }
            }
        }
    } catch (error) {
        console.error('Error checking group check-ins:', error);
    }
}

export { checkGroupCheckIns };