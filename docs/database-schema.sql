-- TradeTracker AI - Working Database Schema for Supabase
-- Execute these commands in your Supabase SQL Editor

-- Step 1: Create custom types
CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE business_type AS ENUM (
  'retail_shop', 'market_trader', 'street_vendor', 'farmer',
  'service_provider', 'food_beverage', 'transport', 'other'
);

-- Step 2: Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
                                            id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    business_type business_type,
    business_name TEXT,
    location TEXT,
    currency TEXT DEFAULT 'KES',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );

-- Step 3: Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
                                                 id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type transaction_type NOT NULL,
    color TEXT DEFAULT '#6B7280',
    icon TEXT DEFAULT '📦',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );

-- Step 4: Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
                                                   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    type transaction_type NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    notes TEXT,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- AI and Voice Input Fields
    voice_input TEXT,
    receipt_url TEXT,
    ai_confidence DECIMAL(3,2),
    ai_processed BOOLEAN DEFAULT false,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );

-- Step 5: Create insights table
CREATE TABLE IF NOT EXISTS public.insights (
                                               id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    total_expenses DECIMAL(15,2) DEFAULT 0,
    net_profit DECIMAL(15,2) DEFAULT 0,
    profit_margin DECIMAL(5,2) DEFAULT 0,

    -- AI Insights
    insights_text TEXT,
    recommendations TEXT[],
    trends JSONB,

    generated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );

-- Step 6: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_user_id ON public.insights(user_id);

-- Step 7: Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies for users table
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 9: Create RLS policies for categories table
DROP POLICY IF EXISTS "Users can view own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can create own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;

CREATE POLICY "Users can view own categories" ON public.categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

-- Step 10: Create RLS policies for transactions table
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;

CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Step 11: Create RLS policies for insights table
DROP POLICY IF EXISTS "Users can view own insights" ON public.insights;
DROP POLICY IF EXISTS "Users can create own insights" ON public.insights;

CREATE POLICY "Users can view own insights" ON public.insights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own insights" ON public.insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Step 12: Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $
BEGIN
INSERT INTO public.users (id, email, full_name)
VALUES (
           NEW.id,
           NEW.email,
           COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
       );

-- Create default income categories
INSERT INTO public.categories (user_id, name, type, color, icon, is_default) VALUES
                                                                                 (NEW.id, 'Sales', 'income', '#22C55E', '💰', true),
                                                                                 (NEW.id, 'Services', 'income', '#10B981', '🛠️', true),
                                                                                 (NEW.id, 'Other Income', 'income', '#06B6D4', '📈', true);

-- Create default expense categories
INSERT INTO public.categories (user_id, name, type, color, icon, is_default) VALUES
                                                                                 (NEW.id, 'Inventory', 'expense', '#EF4444', '📦', true),
                                                                                 (NEW.id, 'Transport', 'expense', '#F59E0B', '🚗', true),
                                                                                 (NEW.id, 'Food & Meals', 'expense', '#8B5CF6', '🍽️', true),
                                                                                 (NEW.id, 'Utilities', 'expense', '#3B82F6', '💡', true),
                                                                                 (NEW.id, 'Marketing', 'expense', '#EC4899', '📱', true),
                                                                                 (NEW.id, 'Other Expenses', 'expense', '#6B7280', '📝', true);

RETURN NEW;
END;
$;

-- Step 13: Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Step 14: Create function for profit calculations
CREATE OR REPLACE FUNCTION calculate_profit_for_period(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE(
  total_revenue DECIMAL(15,2),
  total_expenses DECIMAL(15,2),
  net_profit DECIMAL(15,2),
  profit_margin DECIMAL(5,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $
BEGIN
RETURN QUERY
    WITH profit_calc AS (
    SELECT
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as revenue,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expenses
    FROM public.transactions
    WHERE user_id = p_user_id
      AND transaction_date BETWEEN p_start_date AND p_end_date
  )
SELECT
    pc.revenue,
    pc.expenses,
    (pc.revenue - pc.expenses) as net_profit,
    CASE
        WHEN pc.revenue > 0 THEN ROUND(((pc.revenue - pc.expenses) / pc.revenue * 100), 2)
        ELSE 0
        END as profit_margin
FROM profit_calc pc;
END;
$;

-- Step 15: Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;