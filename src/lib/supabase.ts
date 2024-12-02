import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Booking = {
  id: string
  room_id: string
  date: string
  start_time: string
  end_time: string
  duration: number
  title: string
  pic: string
  created_at: string
}