import { supabase } from './supabase'
import type { Booking } from './supabase'

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

export const bookingApi = {
  getBookings: async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Booking[]
  },

  getRecentBookings: async (limit = 5) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data as Booking[]
  },

  createBooking: async (bookingData: {
    room_id: string
    date: string
    start_time: string
    duration: number
    title: string
    pic: string
  }) => {
    const startMinutes = timeToMinutes(bookingData.start_time)
    const endMinutes = startMinutes + (bookingData.duration * 30)
    const end_time = minutesToTime(endMinutes)

    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        ...bookingData,
        end_time
      }])
      .select()
      .single()
    
    if (error) {
      if (error.message.includes('check_booking_conflict')) {
        throw new Error('Time slot conflict detected')
      }
      throw error
    }
    
    return data as Booking
  },

  getRoomBookings: async (room_id: string, date: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('room_id', room_id)
      .eq('date', date)
    
    if (error) throw error
    return data as Booking[]
  },

  deleteBooking: async (id: string) => {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}