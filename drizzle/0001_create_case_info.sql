CREATE TABLE IF NOT EXISTS case_info (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  category TEXT NOT NULL,
  data TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT '',
  confidence TEXT NOT NULL DEFAULT 'medium',
  verification_status TEXT NOT NULL DEFAULT 'unverified',
  timestamp TEXT NOT NULL,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
); 