'use client'

import { useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'
import { Button } from '@/components/ui/button'

export function Calendar({ 
  doctorId, 
  selectedDate, 
  onDateChange 
}: { 
  doctorId: string
  selectedDate: Date
  onDateChange: (date: Date) => void
}) {
  const startOfDay = new Date(selectedDate)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(selectedDate)
  endOfDay.setHours(23, 59, 59, 999)

  const slots =   [{ id: "1", startTime: "2023-05-20T09:00:00", endTime: "2023-05-20T09:30:00", isBooked: true }]


  const handlePrevDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 1)
    onDateChange(newDate)
  }

  const handleNextDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 1)
    onDateChange(newDate)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button onClick={handlePrevDay}>&lt; Previous Day</Button>
        <h3 className="text-xl font-semibold">{selectedDate.toDateString()}</h3>
        <Button onClick={handleNextDay}>Next Day &gt;</Button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {slots === undefined ? (
          <div>Loading slots...</div>
        ) : slots.length === 0 ? (
          <div>No available slots for this day</div>
        ) : (
          slots.map((slot) => (
            <div
              key={slot.id}
              className={`p-2 text-center rounded ${
                slot.isBooked ? 'bg-gray-200' : 'bg-green-200'
              }`}
            >
              {new Date(slot.startTime).toLocaleTimeString()} - 
              {new Date(slot.endTime).toLocaleTimeString()}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

