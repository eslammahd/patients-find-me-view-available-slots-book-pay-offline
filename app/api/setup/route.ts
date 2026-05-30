import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// One-time setup endpoint — protected by ADMIN_SECRET
// GET /api/setup?secret=YOUR_ADMIN_SECRET
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient();

  const migrations = [
    `CREATE TABLE IF NOT EXISTS "user_32b62920".therapists (
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
    )`,
    `CREATE TABLE IF NOT EXISTS "user_32b62920".availability_slots (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      therapist_id UUID NOT NULL REFERENCES "user_32b62920".therapists(id) ON DELETE CASCADE,
      slot_date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      is_booked BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    `DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'availability_slots_therapist_id_slot_date_start_time_key'
      ) THEN
        ALTER TABLE "user_32b62920".availability_slots
          ADD CONSTRAINT availability_slots_therapist_id_slot_date_start_time_key
          UNIQUE(therapist_id, slot_date, start_time);
      END IF;
    END $$`,
    `CREATE TABLE IF NOT EXISTS "user_32b62920".bookings (
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
    )`,
    `CREATE INDEX IF NOT EXISTS idx_slots_date ON "user_32b62920".availability_slots(slot_date)`,
    `CREATE INDEX IF NOT EXISTS idx_slots_therapist ON "user_32b62920".availability_slots(therapist_id)`,
    `CREATE INDEX IF NOT EXISTS idx_bookings_slot ON "user_32b62920".bookings(slot_id)`,
    `CREATE INDEX IF NOT EXISTS idx_bookings_status ON "user_32b62920".bookings(status)`,
    `ALTER TABLE "user_32b62920".therapists ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE "user_32b62920".availability_slots ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE "user_32b62920".bookings ENABLE ROW LEVEL SECURITY`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'therapists_public_read') THEN
        CREATE POLICY "therapists_public_read" ON "user_32b62920".therapists FOR SELECT USING (true);
      END IF;
    END $$`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'slots_public_read') THEN
        CREATE POLICY "slots_public_read" ON "user_32b62920".availability_slots FOR SELECT USING (true);
      END IF;
    END $$`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'bookings_insert_guest') THEN
        CREATE POLICY "bookings_insert_guest" ON "user_32b62920".bookings FOR INSERT WITH CHECK (true);
      END IF;
    END $$`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'bookings_service_read') THEN
        CREATE POLICY "bookings_service_read" ON "user_32b62920".bookings FOR SELECT USING (auth.role() = 'service_role');
      END IF;
    END $$`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'bookings_service_update') THEN
        CREATE POLICY "bookings_service_update" ON "user_32b62920".bookings FOR UPDATE USING (auth.role() = 'service_role');
      END IF;
    END $$`,
    `INSERT INTO "user_32b62920".therapists (id, name, title, bio, video_call_link, instapay_number, vodafone_cash_number, session_duration_minutes, session_price_egp)
      VALUES ('00000000-0000-0000-0000-000000000001', 'Dr. Saad El Mahdy', 'MD Psychiatrist & Psychotherapist',
        'Dr. Saad El Mahdy is a seasoned psychiatrist and psychotherapist with decades of experience helping patients navigate life''s challenges. Sessions are conducted online via video call.',
        'https://meet.google.com/placeholder', '01000000000', '01000000000', 60, 500.00)
      ON CONFLICT (id) DO NOTHING`,
  ];

  const results: { sql: string; ok: boolean; error?: string }[] = [];

  for (const sql of migrations) {
    const { error } = await supabase.rpc('exec_sql', { query: sql }).single();
    // exec_sql may not exist — use raw query via REST
    if (error) {
      results.push({ sql: sql.slice(0, 60), ok: false, error: error.message });
    } else {
      results.push({ sql: sql.slice(0, 60), ok: true });
    }
  }

  return NextResponse.json({ results });
}
