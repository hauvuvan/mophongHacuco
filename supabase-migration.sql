-- ============================================================
-- HACUCO Solar Simulator — Supabase Migration
-- Chạy file này trong Supabase Dashboard > SQL Editor
-- Dùng chung bảng allowed_emails với baogiaHacuco
-- ============================================================

-- BẢNG SIMULATIONS (duy nhất cần tạo mới)
CREATE TABLE IF NOT EXISTS solar_simulations (
  id         TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  name       TEXT NOT NULL DEFAULT 'Chưa đặt tên',
  data       JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS solar_simulations_user_email_idx ON solar_simulations (user_email);
CREATE INDEX IF NOT EXISTS solar_simulations_updated_at_idx ON solar_simulations (updated_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE solar_simulations ENABLE ROW LEVEL SECURITY;

-- Helper: lấy role của user hiện tại từ allowed_emails (dùng chung với baogiaHacuco)
-- Trả về 'admin', 'user', hoặc NULL (nếu bị revoked hoặc không có trong bảng)
CREATE OR REPLACE FUNCTION solar_current_role()
RETURNS TEXT
LANGUAGE SQL SECURITY DEFINER STABLE
AS $$
  SELECT CASE
    WHEN role = 'admin'                          THEN 'admin'
    WHEN role IN ('manager', 'pre_manager', 'staff') THEN 'user'
    ELSE NULL
  END
  FROM allowed_emails
  WHERE lower(email) = lower(auth.email())
  LIMIT 1;
$$;

-- solar_simulations: user thấy simulation của mình, admin thấy tất cả
CREATE POLICY "simulations_select" ON solar_simulations
  FOR SELECT TO authenticated
  USING (
    lower(user_email) = lower(auth.email()) OR solar_current_role() = 'admin'
  );

CREATE POLICY "simulations_insert" ON solar_simulations
  FOR INSERT TO authenticated
  WITH CHECK (
    lower(user_email) = lower(auth.email()) AND solar_current_role() IS NOT NULL
  );

CREATE POLICY "simulations_update" ON solar_simulations
  FOR UPDATE TO authenticated
  USING (
    lower(user_email) = lower(auth.email()) OR solar_current_role() = 'admin'
  );

CREATE POLICY "simulations_delete" ON solar_simulations
  FOR DELETE TO authenticated
  USING (
    lower(user_email) = lower(auth.email()) OR solar_current_role() = 'admin'
  );

-- ============================================================
-- Nếu đã chạy migration cũ (có solar_user_profiles), chạy thêm:
-- DROP TABLE IF EXISTS solar_user_profiles CASCADE;
-- ============================================================
