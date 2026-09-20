-- ============================================================================
-- ApexForge Gym OS — Supabase Production Database Schema
-- Run this in your Supabase SQL Editor to provision all tables and security rules
-- ============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Membership Plans
CREATE TABLE IF NOT EXISTS public.membership_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('day_pass', 'monthly', 'quarterly', 'annual', 'punch_card', 'vip')),
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    duration_days INTEGER NOT NULL DEFAULT 30,
    visit_limit INTEGER,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    popular BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Gym Members
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_code VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE,
    phone VARCHAR(50),
    avatar_url TEXT,
    emergency_contact VARCHAR(150),
    emergency_phone VARCHAR(50),
    gender VARCHAR(20) DEFAULT 'other',
    birth_date DATE,
    join_date DATE DEFAULT CURRENT_DATE,
    tier_id UUID REFERENCES public.membership_plans(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expiring', 'expired', 'frozen')),
    expiry_date DATE NOT NULL,
    last_visit_date TIMESTAMPTZ,
    total_visits INTEGER DEFAULT 0,
    remaining_pt_sessions INTEGER DEFAULT 0,
    waiver_signed BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Check-Ins & Access Control
CREATE TABLE IF NOT EXISTS public.check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    type VARCHAR(20) DEFAULT 'entry' CHECK (type IN ('entry', 'exit')),
    status VARCHAR(20) DEFAULT 'granted' CHECK (status IN ('granted', 'denied', 'flagged')),
    denial_reason TEXT
);

-- 5. Products & Inventory (POS)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    category VARCHAR(30) NOT NULL CHECK (category IN ('membership', 'beverage', 'supplement', 'merchandise', 'pt_package', 'snack')),
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    stock INTEGER NOT NULL DEFAULT 0,
    sku VARCHAR(50) UNIQUE,
    image_url TEXT,
    is_taxable BOOLEAN DEFAULT true,
    plan_id UUID REFERENCES public.membership_plans(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. POS Sales / Transactions
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_no VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    tax NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('cash', 'card', 'qris', 'member_wallet')),
    cash_received NUMERIC(12, 2),
    change_given NUMERIC(12, 2),
    cashier_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'refunded')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Sale Line Items
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name VARCHAR(150) NOT NULL,
    category VARCHAR(30) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    total NUMERIC(12, 2) NOT NULL
);

-- 8. Cash Drawer Shifts
CREATE TABLE IF NOT EXISTS public.cash_shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cashier_name VARCHAR(100) NOT NULL,
    start_time TIMESTAMPTZ DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    opening_float NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    expected_cash NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    actual_cash NUMERIC(12, 2),
    cash_difference NUMERIC(12, 2),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    notes TEXT
);

-- 9. Group Classes
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(120) NOT NULL,
    instructor_name VARCHAR(100) NOT NULL,
    instructor_avatar TEXT,
    category VARCHAR(30) NOT NULL CHECK (category IN ('crossfit', 'hiit', 'yoga', 'spin', 'boxing', 'pilates')),
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_capacity INTEGER NOT NULL DEFAULT 20,
    location_room VARCHAR(80) NOT NULL DEFAULT 'Studio A',
    intensity VARCHAR(20) DEFAULT 'Medium',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Class Bookings
CREATE TABLE IF NOT EXISTS public.class_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'attended', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, member_id, booking_date)
);

-- 11. Personal Trainers
CREATE TABLE IF NOT EXISTS public.trainers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL,
    specialty VARCHAR(120) NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    active_clients_count INTEGER DEFAULT 0,
    hourly_rate NUMERIC(12, 2) NOT NULL DEFAULT 150000.00,
    commission_rate_percent INTEGER DEFAULT 70,
    available_hours VARCHAR(100) DEFAULT '07:00 - 18:00',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. PT Sessions
CREATE TABLE IF NOT EXISTS public.pt_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trainer_id UUID REFERENCES public.trainers(id) ON DELETE CASCADE,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Member Body Composition / Metrics
CREATE TABLE IF NOT EXISTS public.body_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    weight_kg NUMERIC(5, 2) NOT NULL,
    body_fat_percent NUMERIC(4, 2) NOT NULL,
    muscle_mass_kg NUMERIC(5, 2) NOT NULL,
    chest_cm NUMERIC(5, 2),
    waist_cm NUMERIC(5, 2),
    hips_cm NUMERIC(5, 2),
    arm_cm NUMERIC(5, 2),
    notes TEXT
);

-- 14. Personal Records (PRs)
CREATE TABLE IF NOT EXISTS public.personal_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    exercise_name VARCHAR(100) NOT NULL,
    weight_kg NUMERIC(6, 2) NOT NULL,
    reps INTEGER NOT NULL DEFAULT 1,
    achieved_at TIMESTAMPTZ DEFAULT NOW(),
    previous_record_kg NUMERIC(6, 2),
    notes TEXT
);

-- 15. Workout Routines
CREATE TABLE IF NOT EXISTS public.workout_routines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    title VARCHAR(120) NOT NULL,
    split_type VARCHAR(50) NOT NULL,
    exercises JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Facility Equipment
CREATE TABLE IF NOT EXISTS public.equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    serial_number VARCHAR(100),
    location_floor VARCHAR(80) DEFAULT 'Ground Floor',
    purchase_date DATE,
    condition VARCHAR(30) DEFAULT 'operational' CHECK (condition IN ('operational', 'maintenance_due', 'out_of_order')),
    last_service_date DATE,
    next_service_due_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Indexes for High Performance Querying
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_members_code ON public.members(member_code);
CREATE INDEX IF NOT EXISTS idx_members_status ON public.members(status);
CREATE INDEX IF NOT EXISTS idx_checkins_timestamp ON public.check_ins(timestamp);
CREATE INDEX IF NOT EXISTS idx_checkins_member ON public.check_ins(member_id);
CREATE INDEX IF NOT EXISTS idx_sales_invoice ON public.sales(invoice_no);
CREATE INDEX IF NOT EXISTS idx_sales_timestamp ON public.sales(created_at);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_metrics_member ON public.body_metrics(member_id);
CREATE INDEX IF NOT EXISTS idx_prs_member ON public.personal_records(member_id);

-- ============================================================================
-- Row Level Security (RLS) Setup
-- ============================================================================
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pt_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

-- Allow authenticated and anon read/write for operational use (or scope as needed)
CREATE POLICY "Enable all access for authenticated users" ON public.members FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON public.membership_plans FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON public.check_ins FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON public.products FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON public.sales FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON public.sale_items FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON public.cash_shifts FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON public.classes FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON public.class_bookings FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON public.trainers FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON public.pt_sessions FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON public.body_metrics FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON public.personal_records FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON public.workout_routines FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON public.equipment FOR ALL USING (true);
