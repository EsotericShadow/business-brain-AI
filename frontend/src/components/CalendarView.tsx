import React, { useState } from 'react';
import type { CalendarEvent } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon } from './icons';
import { EmptyState } from './EmptyState';

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

export const CalendarView: React.FC<{ events: CalendarEvent[] }> = ({ events }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const eventsByDay: Record<string, CalendarEvent[]> = events.reduce((acc, event) => {
    const dateKey = new Date(event.startTime).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const selectedDayEvents = eventsByDay[selectedDate.toDateString()]?.sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    ) || [];

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(newDate.getMonth() + offset);
        return newDate;
    });
  };

  const handleSetToday = () => {
      const today = new Date();
      setCurrentDate(today);
      setSelectedDate(today);
  }

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="w-full md:w-2/3 p-4 flex flex-col">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {MONTH_NAMES[currentMonth]} <span className="text-gray-500 dark:text-gray-400">{currentYear}</span>
          </h2>
          <div className="flex items-center space-x-2">
            <button onClick={handleSetToday} className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">Today</button>
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><ChevronLeftIcon className="w-5 h-5"/></button>
            <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><ChevronRightIcon className="w-5 h-5"/></button>
          </div>
        </div>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px flex-1 bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {DAY_NAMES.map(day => (
            <div key={day} className="text-center py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">{day}</div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="bg-gray-50 dark:bg-gray-800"></div>)}
          {Array.from({ length: daysInMonth }).map((_, day) => {
            const dayNumber = day + 1;
            const date = new Date(currentYear, currentMonth, dayNumber);
            const dateStr = date.toDateString();
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = date.toDateString() === selectedDate.toDateString();
            
            const dayClasses = `relative p-2 text-center cursor-pointer transition-colors ${isSelected ? 'bg-brand-50 dark:bg-brand-900/50' : 'bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'}`;
            const numberClasses = `inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium transition-colors ${
              isToday 
                ? 'bg-brand-600 text-white' 
                : isSelected 
                  ? 'bg-brand-200 text-brand-800 dark:bg-brand-700 dark:text-brand-100' 
                  : 'text-gray-700 dark:text-gray-300'
            }`;
            
            return (
              <div key={day} onClick={() => setSelectedDate(date)} className={dayClasses}>
                <span className={numberClasses}>
                  {dayNumber}
                </span>
                <div className="absolute bottom-1 left-0 right-0 flex justify-center space-x-1">
                    {(eventsByDay[dateStr] || []).slice(0,3).map(event => (
                        <div key={event.id} className="w-1.5 h-1.5 bg-brand-500 rounded-full"></div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="w-full md:w-1/3 p-4 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white pb-2 mb-3">
          {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric'})}
        </h3>
        <div className="space-y-4">
            {selectedDayEvents.length > 0 ? selectedDayEvents.map((event) => (
                <div key={event.id} className="flex space-x-3">
                    <div className="w-1.5 h-full bg-brand-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-100">{event.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatTime(event.startTime)} - {formatTime(event.endTime)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{event.description}</p>
                    </div>
                </div>
            )) : (
              <EmptyState 
                icon={<CalendarDaysIcon className="w-12 h-12 text-gray-300 dark:text-gray-600"/>}
                title="No events scheduled"
                description="This day is clear. Enjoy your free time!"
              />
            )}
        </div>
      </div>
    </div>
  );
};