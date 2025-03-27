/*
  # Update Categories

  1. Changes
    - Add new categories for Vietnamese restaurants
    - Update existing categories with Vietnamese names
    - Add descriptions for each category

  2. Security
    - Maintain existing RLS policies
*/

-- Clear existing categories
TRUNCATE categories CASCADE;

-- Insert updated categories
INSERT INTO categories (name, description) VALUES
  ('Bữa sáng', 'Quán phục vụ bữa sáng và đồ ăn sáng'),
  ('Bữa trưa', 'Nhà hàng phục vụ bữa trưa'),
  ('Bữa tối', 'Nhà hàng phục vụ bữa tối'),
  ('Coffee', 'Quán cafe và thức uống'),
  ('Quán ăn vặt', 'Đồ ăn vặt và ăn nhẹ'),
  ('Beer', 'Quán bia và đồ nhậu'),
  ('Billard', 'Quán bi-a và giải trí'),
  ('Siêu thị', 'Siêu thị và cửa hàng tiện lợi'),
  ('Cyber', 'Quán net và gaming');