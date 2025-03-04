-- 0003_create_indexes.sql
CREATE INDEX IF NOT EXISTS idx_case_info_case_id ON case_info(case_id);
CREATE INDEX IF NOT EXISTS idx_case_images_case_id ON case_images(case_id); 