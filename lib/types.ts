export interface Therapist {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  photo_url: string | null;
  video_call_link: string;
  instapay_number: string | null;
  vodafone_cash_number: string | null;
  session_duration_minutes: number;
  session_price_egp: number;
  created_at: string;
}

export interface AvailabilitySlot {
  id: string;
  therapist_id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  created_at: string;
}

export type PaymentMethod = 'instapay' | 'vodafone_cash';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Booking {
  id: string;
  slot_id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string | null;
  notes: string | null;
  payment_method: PaymentMethod;
  payment_reference: string | null;
  status: BookingStatus;
  video_call_link: string | null;
  admin_secret: string;
  created_at: string;
  availability_slots?: AvailabilitySlot;
}
