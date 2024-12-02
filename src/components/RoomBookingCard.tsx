import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Booking } from '@/lib/supabase';

const ROOMS = {
  'zoom-room': { name: 'Zoom Room', startHour: 0, endHour: 24 },
  'meeting-room-1': { name: 'Meeting Room 1', startHour: 7, endHour: 19 },
  'meeting-room-2': { name: 'Meeting Room 2', startHour: 7, endHour: 19 },
  'meeting-room-3': { name: 'Meeting Room 3', startHour: 7, endHour: 19 },
} as const;

const generateTimeSlots = (startHour: number, endHour: number) => {
  const slots = [];
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
};

interface Props {
  roomId: keyof typeof ROOMS;
  bookings: Booking[];
  selectedSlots: string[];
  onSlotsChange: (slots: string[]) => void;
}

export function RoomBookingCard({ roomId, bookings, selectedSlots, onSlotsChange }: Props) {
  const room = ROOMS[roomId];
  const timeSlots = generateTimeSlots(room.startHour, room.endHour);

  const isSlotBooked = (time: string) => {
    return bookings.some(booking => 
      time >= booking.start_time && time < booking.end_time
    );
  };

  const handleSlotClick = (time: string) => {
    if (isSlotBooked(time)) return;

    const timeIndex = timeSlots.indexOf(time);
    if (selectedSlots.includes(time)) {
      // Remove this slot and any subsequent contiguous selected slots
      const newSlots = selectedSlots.filter(slot => 
        timeSlots.indexOf(slot) < timeIndex
      );
      onSlotsChange(newSlots);
    } else {
      // Add this slot if it's adjacent to existing selection or first selection
      const lastSelectedIndex = Math.max(...selectedSlots.map(slot => timeSlots.indexOf(slot)), -1);
      if (selectedSlots.length === 0 || timeIndex === lastSelectedIndex + 1) {
        onSlotsChange([...selectedSlots, time]);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-slate-800">{room.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
          {timeSlots.map((time) => {
            const isBooked = isSlotBooked(time);
            const isSelected = selectedSlots.includes(time);
            
            return (
              <Button
                key={time}
                variant={isSelected ? "default" : "outline"}
                className={`p-2 text-sm ${
                  isBooked 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : isSelected
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "hover:bg-blue-50 text-slate-900"
                }`}
                onClick={() => handleSlotClick(time)}
                disabled={isBooked}
              >
                {time}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}