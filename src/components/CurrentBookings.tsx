import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User, Trash2 } from 'lucide-react';
import type { Booking } from '@/lib/supabase';
import { Button } from './ui/button';

const ROOMS = {
  'zoom-room': { name: 'Zoom Room' },
  'meeting-room-1': { name: 'Meeting Room 1' },
  'meeting-room-2': { name: 'Meeting Room 2' },
  'meeting-room-3': { name: 'Meeting Room 3' },
} as const;

interface Props {
  bookings: Booking[];
  selectedDate: string;
  onDelete: (bookingId: string) => void;
}

export function CurrentBookings({ bookings, selectedDate, onDelete }: Props) {
  const [showConfirmDelete, setShowConfirmDelete] = React.useState<string | null>(null);

  const groupedBookings = React.useMemo(() => {
    const grouped: Record<string, Booking[]> = {};
    Object.keys(ROOMS).forEach(roomId => {
      grouped[roomId] = [];
    });
    bookings.forEach(booking => {
      if (booking.date === selectedDate) {
        grouped[booking.room_id].push(booking);
      }
    });
    return grouped;
  }, [bookings, selectedDate]);

  const handleDelete = (bookingId: string) => {
    setShowConfirmDelete(bookingId);
  };

  const confirmDelete = (bookingId: string) => {
    onDelete(bookingId);
    setShowConfirmDelete(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-slate-800">Bookings for {selectedDate}</CardTitle>
      </CardHeader>
      <CardContent className="divide-y">
        {Object.entries(groupedBookings).map(([roomId, roomBookings]) => (
          <div key={roomId} className="py-4 first:pt-0">
            <h3 className="font-medium text-slate-800 mb-2">
              {ROOMS[roomId as keyof typeof ROOMS].name}
            </h3>
            {roomBookings.length === 0 ? (
              <p className="text-slate-500 italic">Masih kosong nih</p>
            ) : (
              <div className="space-y-3">
                {roomBookings.map((booking) => (
                  <div key={booking.id} className="pl-4 border-l-2 border-blue-200 relative group">
                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-400 hover:text-red-500"
                        onClick={() => handleDelete(booking.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {showConfirmDelete === booking.id && (
                      <div className="absolute right-0 top-0 bg-white p-2 shadow-lg rounded-lg border z-10">
                        <p className="text-sm text-slate-600 mb-2">Delete this booking?</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => confirmDelete(booking.id)}
                          >
                            Delete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowConfirmDelete(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="pr-12">
                      <div className="font-medium text-slate-700">{booking.title}</div>
                      <div className="mt-1 space-y-1">
                        <div className="flex items-center text-sm text-slate-500">
                          <Clock className="mr-2 h-4 w-4" />
                          {booking.start_time} - {booking.end_time}
                        </div>
                        <div className="flex items-center text-sm text-slate-500">
                          <User className="mr-2 h-4 w-4" />
                          {booking.pic}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}