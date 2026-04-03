/**
 * 소셜 프루프 API — Supabase 프록시
 * GET: 오늘 이용 통계 + 최근 활동 조회
 * POST: 이벤트 기록 (tarot, palm, fortune 등)
 */
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

async function supabaseRest(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': options.prefer || '',
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase error: ${res.status} ${err}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'POST') {
      const { type } = req.body || {};
      if (!type) return res.status(400).json({ error: 'type required' });
      const allowed = ['tarot', 'palm', 'face', 'star', 'match', 'money', 'today'];
      if (!allowed.includes(type)) return res.status(400).json({ error: 'invalid type' });

      await supabaseRest('/events', {
        method: 'POST',
        body: JSON.stringify({ type }),
        prefer: 'return=minimal',
      });
      return res.status(200).json({ ok: true });
    }

    // GET — 통계 조회
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();

    // 오늘 전체 카운트
    const todayEvents = await supabaseRest(
      `/events?select=type&created_at=gte.${todayStart}`,
      { prefer: 'count=exact' }
    );

    // 최근 5분 이벤트 (토스트용)
    const recentEvents = await supabaseRest(
      `/events?select=type,created_at&created_at=gte.${fiveMinAgo}&order=created_at.desc&limit=5`
    );

    // 타입별 카운트
    const typeCounts = {};
    if (todayEvents) {
      todayEvents.forEach(e => { typeCounts[e.type] = (typeCounts[e.type] || 0) + 1; });
    }

    // 인기 메뉴
    const popular = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];

    return res.status(200).json({
      todayCount: todayEvents ? todayEvents.length : 0,
      typeCounts,
      popular: popular ? popular[0] : 'tarot',
      recent: recentEvents || [],
    });
  } catch (e) {
    console.error('Social proof error:', e);
    return res.status(500).json({ error: e.message });
  }
}
