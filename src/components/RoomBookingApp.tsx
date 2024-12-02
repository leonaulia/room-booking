import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { RoomBookingCard } from './RoomBookingCard';
import { BookingForm } from './BookingForm';
import { CurrentBookings } from './CurrentBookings';
import { bookingApi } from '@/lib/bookingApi';
import type { Booking } from '@/lib/supabase';

const ROOMS = {
  'zoom-room': { name: 'Zoom Room', startHour: 0, endHour: 24 },
  'meeting-room-1': { name: 'Meeting Room 1', startHour: 7, endHour: 19 },
  'meeting-room-2': { name: 'Meeting Room 2', startHour: 7, endHour: 19 },
  'meeting-room-3': { name: 'Meeting Room 3', startHour: 7, endHour: 19 },
} as const;

export function RoomBookingApp() {
  const [selectedRoom, setSelectedRoom] = useState<keyof typeof ROOMS>('zoom-room');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBookings();
    loadRecentBookings();
    setSelectedSlots([]);
  }, [selectedRoom, selectedDate]);

  const loadBookings = async () => {
    try {
      const roomBookings = await bookingApi.getRoomBookings(selectedRoom, selectedDate);
      setBookings(roomBookings);
      setError('');
    } catch (err) {
      setError('Failed to load bookings');
    }
  };

  const loadRecentBookings = async () => {
    try {
      const recent = await bookingApi.getRecentBookings(5);
      setRecentBookings(recent);
    } catch (err) {
      console.error('Failed to load recent bookings:', err);
    }
  };

  const handleBookingSubmit = async (formData: { title: string; pic: string }) => {
    if (selectedSlots.length === 0) return;

    try {
      await bookingApi.createBooking({
        room_id: selectedRoom,
        date: selectedDate,
        start_time: selectedSlots[0],
        duration: selectedSlots.length,
        ...formData
      });
      
      setSelectedSlots([]);
      await Promise.all([loadBookings(), loadRecentBookings()]);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Image 
            src="/logo.png" 
            alt="Company Logo" 
            width={50} 
            height={50}
            className="object-contain"
          />
          <h1 className="text-3xl font-bold text-slate-800">Meeting Room Booking</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div>
            <BookingForm
              selectedSlots={selectedSlots}
              onSubmit={handleBookingSubmit}
              selectedRoom={selectedRoom}
              onRoomChange={setSelectedRoom}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              rooms={ROOMS}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <RoomBookingCard
              roomId={selectedRoom}
              bookings={bookings}
              selectedSlots={selectedSlots}
              onSlotsChange={setSelectedSlots}
            />

            {error && (
              <div className="p-4 text-sm text-red-700 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            <CurrentBookings 
              bookings={recentBookings} 
              selectedDate={selectedDate}
              onDelete={async (id) => {
                try {
                  await bookingApi.deleteBooking(id);
                  await Promise.all([loadBookings(), loadRecentBookings()]);
                  setError('');
                } catch (err) {
                  setError('Failed to delete booking');
                }
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}