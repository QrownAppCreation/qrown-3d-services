-- 1. Custom Types & Enums
CREATE TYPE user_role AS ENUM ('client', 'architect', 'engineer', 'admin', 'operator');
CREATE TYPE order_status AS ENUM ('draft', 'quoted', 'paid', 'slicing', 'printing', 'post_processing', 'shipped', 'completed');
CREATE TYPE print_category AS ENUM ('wedding', 'graduation', 'birthday', 'engineering', 'architecture', 'custom');

-- 2. Print Jobs Table
CREATE TABLE IF NOT EXISTS print_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category print_category NOT NULL DEFAULT 'custom',
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_format TEXT NOT NULL DEFAULT 'stl',
  volume_cm3 NUMERIC(10, 2) NOT NULL,
  bounding_box JSONB NOT NULL, -- { "x": 0, "y": 0, "z": 0 }
  material_type TEXT NOT NULL DEFAULT 'PLA',
  infill_percentage INT DEFAULT 20,
  layer_height_mm NUMERIC(3, 2) DEFAULT 0.20,
  calculated_price NUMERIC(10, 2) NOT NULL,
  estimated_print_time_min INT,
  status order_status DEFAULT 'quoted',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Row Level Security Policies
ALTER TABLE print_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own print jobs" 
  ON print_jobs FOR INSERT 
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can view their own print jobs" 
  ON print_jobs FOR SELECT 
  USING (auth.uid() = client_id);