/**
 * 토스페이먼츠 결제 승인 + Supabase 저장 API
 *
 * 환경변수:
 *   TOSS_SECRET_KEY — 토스 시크릿 키
 *   SUPABASE_URL — Supabase REST API URL
 *   SUPABASE_ANON_KEY — Supabase anon key
 *
 * 흐름:
 *   브라우저 결제 완료 → successUrl 리다이렉트 → 이 API로 승인 요청
 *   → 토스 서버 검증 → Supabase에 결제 내역 저장
 */
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

async function supabaseInsert(table, data) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('Supabase insert error:', err);
    return null;
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) return res.status(500).json({ error: 'Payment not configured' });

  const { paymentKey, orderId, amount, phone, userName, birthdate } = req.body;
  if (!paymentKey || !orderId || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // 금액 검증 (1900원 1일 / 9900원 30일만 허용)
  if (![1900, 9900].includes(Number(amount))) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    // 토스 결제 승인
    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(secretKey + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Payment confirmation failed' });
    }

    // 만료일 계산
    const days = Number(amount) === 1900 ? 1 : 30;
    const plan = days === 1 ? 'daily' : 'monthly';
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    // Supabase에 결제 내역 저장
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    if (cleanPhone && cleanPhone.length >= 10) {
      await supabaseInsert('premium_purchases', {
        phone: cleanPhone,
        name: userName || null,
        birthdate: birthdate || null,
        payment_key: data.paymentKey,
        order_id: data.orderId,
        amount: Number(amount),
        plan,
        approved_at: data.approvedAt,
        expires_at: expiresAt.toISOString(),
        is_active: true,
      });
    }

    return res.status(200).json({
      success: true,
      paymentKey: data.paymentKey,
      orderId: data.orderId,
      approvedAt: data.approvedAt,
      method: data.method,
      expires_at: expiresAt.toISOString(),
      plan,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
