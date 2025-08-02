-- Create daily revenue tracking table
CREATE TABLE IF NOT EXISTS daily_revenue (
  id SERIAL PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  total_orders INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster date queries
CREATE INDEX IF NOT EXISTS idx_daily_revenue_date ON daily_revenue(date);

-- Function to update daily revenue (called when orders are created/updated)
CREATE OR REPLACE FUNCTION update_daily_revenue()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update daily revenue for the order date
  INSERT INTO daily_revenue (date, total_orders, total_revenue)
  VALUES (
    NEW.collection_date::DATE,
    1,
    NEW.total_amount
  )
  ON CONFLICT (date) 
  DO UPDATE SET
    total_orders = daily_revenue.total_orders + 1,
    total_revenue = daily_revenue.total_revenue + NEW.total_amount,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update daily revenue when orders are inserted
DROP TRIGGER IF EXISTS trigger_update_daily_revenue ON orders;
CREATE TRIGGER trigger_update_daily_revenue
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_revenue();

-- Populate existing data (run once to catch up historical data)
INSERT INTO daily_revenue (date, total_orders, total_revenue)
SELECT 
  collection_date::DATE as date,
  COUNT(*) as total_orders,
  SUM(total_amount) as total_revenue
FROM orders 
WHERE status != 'cancelled'
GROUP BY collection_date::DATE
ON CONFLICT (date) DO NOTHING;
