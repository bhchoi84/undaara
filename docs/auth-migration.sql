-- ══════════════════════════════════════════
-- 소셜 로그인 도입을 위한 마이그레이션
-- Supabase Dashboard → SQL Editor에서 실행
-- ══════════════════════════════════════════

-- 1) premium_purchases 테이블에 user_id 컬럼 추가
ALTER TABLE premium_purchases
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2) phone 컬럼 NULL 허용 (소셜 로그인만으로 결제 가능하게)
ALTER TABLE premium_purchases
  ALTER COLUMN phone DROP NOT NULL;

-- 3) user_id 인덱스 (조회 성능)
CREATE INDEX IF NOT EXISTS idx_premium_user_id
  ON premium_purchases(user_id)
  WHERE user_id IS NOT NULL;

-- 4) RLS 정책: 본인 결제 내역만 조회 가능 (서버 anon key는 별도 우회)
-- 기존 정책이 있다면 충돌 가능, 필요 시 수정
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'premium_purchases' AND policyname = 'Users can view own purchases'
  ) THEN
    CREATE POLICY "Users can view own purchases"
      ON premium_purchases FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- 확인용 쿼리
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'premium_purchases';
