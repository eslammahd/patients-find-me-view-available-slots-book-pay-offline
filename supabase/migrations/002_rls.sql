-- Row Level Security policies
SET search_path TO "user_32b62920", public;

-- Enable RLS
ALTER TABLE "user_32b62920".therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_32b62920".availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_32b62920".bookings ENABLE ROW LEVEL SECURITY;

-- Therapists: public read
DROP POLICY IF EXISTS "therapists_public_read" ON "user_32b62920".therapists;
CREATE POLICY "therapists_public_read" ON "user_32b62920".therapists
  FOR SELECT USING (true);

-- Availability slots: public read of open slots
DROP POLICY IF EXISTS "slots_public_read" ON "user_32b62920".availability_slots;
CREATE POLICY "slots_public_read" ON "user_32b62920".availability_slots
  FOR SELECT USING (true);

-- Bookings: insert allowed for anyone (guest booking)
DROP POLICY IF EXISTS "bookings_insert_guest" ON "user_32b62920".bookings;
CREATE POLICY "bookings_insert_guest" ON "user_32b62920".bookings
  FOR INSERT WITH CHECK (true);

-- Bookings: select only via service role (admin) — anon cannot read bookings
DROP POLICY IF EXISTS "bookings_service_read" ON "user_32b62920".bookings;
CREATE POLICY "bookings_service_read" ON "user_32b62920".bookings
  FOR SELECT USING (auth.role() = 'service_role');

-- Bookings: update only via service role (admin confirms)
DROP POLICY IF EXISTS "bookings_service_update" ON "user_32b62920".bookings;
CREATE POLICY "bookings_service_update" ON "user_32b62920".bookings
  FOR UPDATE USING (auth.role() = 'service_role');
