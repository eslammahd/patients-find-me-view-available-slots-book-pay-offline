-- Run this in your Supabase SQL editor if the auto-migration fails
SET search_path TO "user_32b62920", public;

CREATE TABLE IF NOT EXISTS "user_32b62920".therapists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT,
  bio TEXT,
  photo_url TEXT,
  video_call_link TEXT NOT NULL DEFAULT '',
  instapay_number TEXT,
  vodafone_cash_number TEXT,
  session_duration_minutes INTEGER NOT NULL DEFAULT 60,
  session_price_egp NUMERIC(10,2) NOT NULL DEFAULT 500,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "user_32b62920".availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES "user_32b62920".therapists(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_booked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(therapist_id, slot_date, start_time)
);

CREATE TABLE IF NOT EXISTS "user_32b62920".bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL REFERENCES "user_32b62920".availability_slots(id) ON DELETE RESTRICT,
  patient_name TEXT NOT NULL,
  patient_email TEXT NOT NULL,
  patient_phone TEXT,
  notes TEXT,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('instapay', 'vodafone_cash')),
  payment_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  video_call_link TEXT,
  admin_secret TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_slots_date ON "user_32b62920".availability_slots(slot_date);
CREATE INDEX IF NOT EXISTS idx_slots_therapist ON "user_32b62920".availability_slots(therapist_id);
CREATE INDEX IF NOT EXISTS idx_bookings_slot ON "user_32b62920".bookings(slot_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON "user_32b62920".bookings(status);

-- Seed Dr. Saad's profile
INSERT INTO "user_32b62920".therapists (
  id, name, title, bio, video_call_link, instapay_number, vodafone_cash_number, session_duration_minutes, session_price_egp
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Dr. Saad El Mahdy',
  'MD Psychiatrist & Psychotherapist',
  'Dr. Saad El Mahdy is a seasoned psychiatrist and psychotherapist with decades of experience helping patients navigate life''s challenges. Sessions are conducted online via video call.',
  'https://meet.google.com/placeholder',
  '01000000000',
  '01000000000',
  60,
  500.00
) ON CONFLICT (id) DO NOTHING;
