/*
  # Update tags to food types

  1. Changes
    - Clear existing tags
    - Insert new food type tags
    - Maintain existing RLS policies
*/

-- Clear existing tags
TRUNCATE tags CASCADE;

-- Insert food type tags
INSERT INTO tags (name) VALUES
  ('Phở'),
  ('Bún'),
  ('Cơm'),
  ('Mì'),
  ('Bánh mì'),
  ('Đồ nướng'),
  ('Lẩu'),
  ('Hải sản'),
  ('Đồ chay'),
  ('Đồ Hàn'),
  ('Đồ Nhật'),
  ('Pizza'),
  ('Burger'),
  ('Gà'),
  ('Vịt'),
  ('Bò'),
  ('Heo'),
  ('Đồ ngọt'),
  ('Trà sữa'),
  ('Sinh tố');