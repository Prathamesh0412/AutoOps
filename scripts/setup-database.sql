-- AutoOps AI Database Schema

-- Data Sources Table
CREATE TABLE IF NOT EXISTS data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'email', 'invoice', 'review', 'sales_log'
  status TEXT NOT NULL DEFAULT 'idle', -- 'idle', 'processing', 'completed', 'error'
  records_processed INTEGER DEFAULT 0,
  total_records INTEGER DEFAULT 0,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Predictions Table
CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'churn', 'inventory', 'lead', 'payment', 'pricing', 'satisfaction'
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL, -- 'critical', 'high', 'medium', 'low'
  confidence NUMERIC(5,2) DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'resolved', 'dismissed'
  metric_value TEXT,
  metric_label TEXT,
  potential_impact TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Actions Table
CREATE TABLE IF NOT EXISTS actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id UUID REFERENCES predictions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'retention', 'purchase_order', 'lead_priority', 'payment_reminder', 'pricing_update'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'executed', 'rejected'
  priority TEXT NOT NULL DEFAULT 'medium', -- 'critical', 'high', 'medium', 'low'
  expected_impact TEXT,
  actual_impact TEXT,
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflows Table
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'churn_prevention', 'inventory_optimization', 'lead_scoring', etc.
  is_active BOOLEAN DEFAULT true,
  trigger_condition TEXT,
  action_taken TEXT,
  last_run TIMESTAMPTZ,
  success_count INTEGER DEFAULT 0,
  total_runs INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow Executions Table
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'success', -- 'success', 'failed', 'pending'
  details TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Metrics Table
CREATE TABLE IF NOT EXISTS metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL, -- 'time_saved', 'revenue_saved', 'actions_executed'
  value NUMERIC(10,2) DEFAULT 0.00,
  period TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample data
INSERT INTO data_sources (name, type, status, records_processed, total_records, last_sync) VALUES
  ('Customer Emails', 'email', 'completed', 1247, 1247, NOW() - INTERVAL '2 hours'),
  ('Sales Invoices', 'invoice', 'processing', 834, 956, NOW() - INTERVAL '30 minutes'),
  ('Product Reviews', 'review', 'completed', 2103, 2103, NOW() - INTERVAL '5 hours'),
  ('Sales Activity Log', 'sales_log', 'idle', 0, 0, NULL)
ON CONFLICT DO NOTHING;

INSERT INTO predictions (type, title, description, severity, confidence, metric_value, metric_label, potential_impact) VALUES
  ('churn', 'High Customer Churn Risk Detected', '23 customers showing early signs of disengagement based on reduced activity and support tickets', 'critical', 87.00, '23', 'At-Risk Customers', '₹67,500 annual revenue at risk'),
  ('inventory', 'Stock Shortage Warning', '8 products predicted to run out of stock within 7 days based on current sales velocity', 'high', 82.00, '8', 'Products Low', '₹45,000 in potential lost sales'),
  ('lead', 'High-Value Leads Identified', '12 new leads with strong buying signals and high potential value detected', 'medium', 76.00, '12', 'Qualified Leads', '₹180,000 potential pipeline value'),
  ('payment', 'Payment Delays Predicted', '15 invoices at risk of late payment based on historical customer behavior', 'high', 79.00, '15', 'At-Risk Invoices', '₹89,000 in delayed payments'),
  ('pricing', 'Pricing Optimization Opportunity', '5 products could benefit from dynamic pricing adjustments', 'medium', 73.00, '5', 'Products', '18% potential revenue increase'),
  ('satisfaction', 'Customer Satisfaction Drop', 'NPS score declining in enterprise segment based on recent survey data', 'high', 84.00, '-12pts', 'NPS Change', 'Risk of losing 8 enterprise accounts')
ON CONFLICT DO NOTHING;

INSERT INTO actions (prediction_id, title, description, type, status, priority, expected_impact) VALUES
  ((SELECT id FROM predictions WHERE type = 'churn' LIMIT 1), 'Send Personalized Retention Offers', 'Draft customized retention offers for 23 at-risk customers with targeted discounts', 'retention', 'pending', 'critical', 'Retain 60% of at-risk customers'),
  ((SELECT id FROM predictions WHERE type = 'inventory' LIMIT 1), 'Generate Purchase Orders', 'Auto-generate purchase orders for 8 low-stock products', 'purchase_order', 'pending', 'high', 'Prevent ₹45K in lost sales'),
  ((SELECT id FROM predictions WHERE type = 'lead' LIMIT 1), 'Prioritize Sales Pipeline', 'Update CRM with lead scores and prioritize 12 high-value opportunities', 'lead_priority', 'pending', 'medium', 'Increase conversion by 25%'),
  ((SELECT id FROM predictions WHERE type = 'payment' LIMIT 1), 'Send Payment Reminders', 'Schedule automated payment reminders for 15 at-risk invoices', 'payment_reminder', 'approved', 'high', 'Reduce DSO by 12 days'),
  ((SELECT id FROM predictions WHERE type = 'pricing' LIMIT 1), 'Update Product Pricing', 'Implement dynamic pricing for 5 products based on demand analysis', 'pricing_update', 'pending', 'medium', '18% revenue increase')
ON CONFLICT DO NOTHING;

INSERT INTO workflows (name, description, type, is_active, trigger_condition, action_taken, last_run, success_count, total_runs) VALUES
  ('Customer Churn Prevention', 'Automatically identifies at-risk customers and initiates retention campaigns', 'churn_prevention', true, 'Customer activity drops below 30% of baseline', 'Send personalized retention offer', NOW() - INTERVAL '4 hours', 89, 94),
  ('Inventory Optimization', 'Monitors stock levels and auto-generates purchase orders when thresholds are met', 'inventory_optimization', true, 'Stock level drops below 7-day supply', 'Generate purchase order', NOW() - INTERVAL '1 day', 156, 162),
  ('Lead Scoring & Prioritization', 'Analyzes lead behavior and updates CRM with priority scores', 'lead_scoring', true, 'New lead activity detected', 'Update CRM priority score', NOW() - INTERVAL '2 hours', 234, 241),
  ('Payment Collection', 'Detects overdue invoices and sends automated reminders', 'payment_collection', true, 'Invoice overdue by 3+ days', 'Send payment reminder', NOW() - INTERVAL '6 hours', 112, 118),
  ('Dynamic Pricing', 'Adjusts product pricing based on demand and competition', 'dynamic_pricing', false, 'Market conditions change', 'Update product pricing', NOW() - INTERVAL '3 days', 45, 52),
  ('Customer Feedback Analysis', 'Processes reviews and flags urgent issues', 'feedback_analysis', true, 'Negative review detected', 'Flag for immediate response', NOW() - INTERVAL '1 hour', 187, 193)
ON CONFLICT DO NOTHING;

INSERT INTO metrics (metric_type, value, period, date) VALUES
  ('time_saved', 156.00, 'weekly', CURRENT_DATE),
  ('revenue_saved', 245000.00, 'weekly', CURRENT_DATE),
  ('actions_executed', 324.00, 'weekly', CURRENT_DATE)
ON CONFLICT DO NOTHING;
