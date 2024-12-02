import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Props {
  selectedSlots: string[];
  selectedRoom: string;
  selectedDate: string;
  rooms: Record<string, { name: string }>;
  onSubmit: (data: { title: string; pic: string }) => void;
  onRoomChange: (room: string) => void;
  onDateChange: (date: string) => void;
}

export function BookingForm({ 
  selectedSlots, 
  selectedRoom,
  selectedDate,
  rooms,
  onSubmit,
  onRoomChange,
  onDateChange
}: Props) {
  const [title, setTitle] = React.useState('');
  const [pic, setPic] = React.useState('');
  const [touched, setTouched] = React.useState({ title: false, pic: false });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !pic) {
      setTouched({ title: true, pic: true });
      return;
    }
    onSubmit({ title, pic });
    setTitle('');
    setPic('');
    setTouched({ title: false, pic: false });
  };

  const getValidationError = () => {
    const errors = [];
    if (touched.title && !title) errors.push('Meeting title is required');
    if (touched.pic && !pic) errors.push('Person in charge is required');
    if (selectedSlots.length === 0) errors.push('Please select time slots');
    return errors;
  };

  const validationErrors = getValidationError();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-slate-800">Book Meeting Room</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">Select Room</label>
            <Select value={selectedRoom} onValueChange={onRoomChange}>
              <SelectTrigger className="bg-white text-slate-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(rooms).map(([id, room]) => (
                  <SelectItem key={id} value={id} className="text-slate-900">
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full p-2 border rounded-md text-slate-900 bg-white"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">Meeting Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, title: true }))}
              placeholder="Enter meeting title"
              className={touched.title && !title ? "border-red-500" : ""}
            />
            {touched.title && !title && (
              <p className="text-red-500 text-sm mt-1">Meeting title is required</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">Person in Charge</label>
            <Input
              value={pic}
              onChange={(e) => setPic(e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, pic: true }))}
              placeholder="Enter PIC name"
              className={touched.pic && !pic ? "border-red-500" : ""}
            />
            {touched.pic && !pic && (
              <p className="text-red-500 text-sm mt-1">Person in charge is required</p>
            )}
          </div>

          {selectedSlots.length > 0 && (
            <div className="text-sm text-slate-600">
              Selected time: {selectedSlots[0]} - {selectedSlots[selectedSlots.length - 1]}
            </div>
          )}

          {validationErrors.length > 0 && (
            <div className="bg-red-50 text-red-500 p-3 rounded text-sm">
              {validationErrors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            disabled={validationErrors.length > 0}
          >
            Book Room
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}