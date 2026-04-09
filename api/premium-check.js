/**
 * 프리미엄 상태 조회 API
 *
 * GET  ?phone=01012345678  — 전화번호로 활성 프리미엄 조회
 * POST { phone }           — 동일
 *
 * 환경변수: SUPABASE_URL, SUPABASE_ANON_KEY
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

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  try {
    // user_id 우선, 없으면 전화번호로 조회
    let phone = '', userId = '';
    if (req.method === 'GET') {
      phone = req.query?.phone || '';
      userId = req.query?.user_id || '';
    } else if (req.method === 'POST') {
      phone = req.body?.phone || '';
      userId = req.body?.user_id || '';
    }

    phone = (phone || '').replace(/[^0-9]/g, '');
    userId = (userId || '').toString().trim();

    if (!userId && (!phone || phone.length < 10)) {
      return res.status(400).json({ error: 'user_id or valid phone required' });
    }

    // UUID 형식 간단 검증
    if (userId && !/^[0-9a-f-]{8,64}$/i.test(userId)) {
      return res.status(400).json({ error: 'Invalid user_id format' });
    }

    // 활성 프리미엄 조회 (user_id 우선, 만료 안 된 것 중 가장 최근)
    const now = new Date().toISOString();
    const filter = userId
      ? `user_id=eq.${userId}`
      : `phone=eq.${phone}`;
    const rows = await supabaseRest(
      `/premium_purchases?${filter}&is_active=eq.true&expires_at=gte.${now}&order=expires_at.desc&limit=1`
    );

    if (rows && rows.length > 0) {
      const p = rows[0];
      return res.status(200).json({
        premium: true,
        expires_at: p.expires_at,
        plan: p.plan,
        purchased_at: p.purchased_at,
      });
    }

    return res.status(200).json({ premium: false });
  } catch (e) {
    console.error('Premium check error:', e);
    return res.status(500).json({ error: e.message });
  }
}
