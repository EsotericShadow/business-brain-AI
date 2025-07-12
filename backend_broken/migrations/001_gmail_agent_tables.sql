-- Gmail Agent specific tables for Business Brain dashboard

CREATE TABLE IF NOT EXISTS gmail_accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_address VARCHAR(255) NOT NULL,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMP,
  scopes TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, email_address)
);

CREATE TABLE IF NOT EXISTS gmail_messages (
  id VARCHAR(255) PRIMARY KEY, -- Gmail message ID
  account_id INTEGER NOT NULL REFERENCES gmail_accounts(id) ON DELETE CASCADE,
  thread_id VARCHAR(255),
  subject TEXT,
  sender_email VARCHAR(255),
  sender_name VARCHAR(255),
  recipient_emails TEXT[],
  message_date TIMESTAMP,
  snippet TEXT,
  body_text TEXT,
  body_html TEXT,
  labels TEXT[],
  is_read BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  has_attachments BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gmail_ai_conversations (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES gmail_accounts(id) ON DELETE CASCADE,
  conversation_id VARCHAR(255) NOT NULL,
  message_ids TEXT[], -- Array of Gmail message IDs involved
  ai_request TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  function_calls JSONB,
  execution_results JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gmail_ai_summaries (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES gmail_accounts(id) ON DELETE CASCADE,
  message_ids TEXT[] NOT NULL,
  summary_type VARCHAR(50) NOT NULL, -- 'brief', 'detailed', 'action_items'
  summary_content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_gmail_messages_account_date ON gmail_messages(account_id, message_date DESC);
CREATE INDEX idx_gmail_messages_labels ON gmail_messages USING GIN(labels);
CREATE INDEX idx_gmail_messages_sender ON gmail_messages(sender_email);
CREATE INDEX idx_gmail_ai_conversations_account ON gmail_ai_conversations(account_id, created_at DESC);

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_gmail_accounts_updated_at BEFORE UPDATE ON gmail_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gmail_messages_updated_at BEFORE UPDATE ON gmail_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
