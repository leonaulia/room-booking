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

// Helper function to parse time string to minutes
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper function to convert minutes to time string
const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

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
    const timeInMinutes = timeToMinutes(time);
    return bookings.some(booking => {
      const bookingStart = timeToMinutes(booking.start_time);
      const bookingEnd = timeToMinutes(booking.end_time);
      return timeInMinutes >= bookingStart && timeInMinutes < bookingEnd;
    });
  };

  const getEndTime = (startTime: string): string => {
    const startMinutes = timeToMinutes(startTime);
    return minutesToTime(startMinutes + 30);
  };

  const handleSlotClick = (time: string) => {
    if (selectedSlots.includes(time)) {
      onSlotsChange([]);
    } else {
      const endTime = getEndTime(time);
      // Check if any slot in the range is booked
      const timeInMinutes = timeToMinutes(time);
      const endTimeInMinutes = timeToMinutes(endTime);
      const hasConflict = bookings.some(booking => {
        const bookingStart = timeToMinutes(booking.start_time);
        const bookingEnd = timeToMinutes(booking.end_time);
        return (timeInMinutes < bookingEnd && endTimeInMinutes > bookingStart);
      });

      if (!hasConflict) {
        onSlotsChange([time]);
      }
    }
  };

  const isSlotSelected = (time: string): boolean => {
    if (selectedSlots.length === 0) return false;
    const startTime = selectedSlots[0];
    const endTime = getEndTime(startTime);
    const timeInMinutes = timeToMinutes(time);
    return timeInMinutes >= timeToMinutes(startTime) && timeInMinutes < timeToMinutes(endTime);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{room.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
          {timeSlots.map((time) => {
            const isBooked = isSlotBooked(time);
            const isSelected = isSlotSelected(time);
            
            return (
              <Button
                key={time}
                variant={isSelected ? "default" : "outline"}
                className={`p-2 text-sm ${
                  isBooked 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : isSelected
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "hover:bg-blue-50"
                }`}
                onClick={() => !isBooked && handleSlotClick(time)}
                disabled={isBooked}
              >
                {time}
              </Button>
            );
          })}
        </div>
        {selectedSlots.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm font-medium text-blue-800">
              Selected Time: {selectedSlots[0]} - {getEndTime(selectedSlots[0])}
            </p>
            <p className="text-sm text-blue-600">
              Duration: 30 minutes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}