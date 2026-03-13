import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Video, MapPin, Plus, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const meetings = [
  { id: 1, title: 'Sprint Planning', time: '09:00 – 10:00 AM', type: 'Video Call', day: 13, color: 'blue', link: '#', attendees: 8 },
  { id: 2, title: 'Design Review', time: '11:30 AM – 12:00 PM', type: 'In-Person', day: 13, color: 'purple', attendees: 4 },
  { id: 3, title: '1-on-1 with Manager', time: '02:00 – 02:30 PM', type: 'Video Call', day: 13, color: 'green', link: '#', attendees: 2 },
  { id: 4, title: 'Quarterly Business Review', time: '10:00 AM – 12:00 PM', type: 'Video Call', day: 15, color: 'orange', link: '#', attendees: 20 },
  { id: 5, title: 'UX Workshop', time: '02:00 – 04:00 PM', type: 'In-Person', day: 18, color: 'pink', attendees: 12 },
];

const colorMap = {
  blue:   'border-blue-500 bg-blue-500/10 text-blue-400',
  purple: 'border-purple-500 bg-purple-500/10 text-purple-400',
  green:  'border-green-500 bg-green-500/10 text-green-400',
  orange: 'border-amber-500 bg-amber-500/10 text-amber-400',
  pink:   'border-pink-500 bg-pink-500/10 text-pink-400',
};

const CalendarPage = () => {
  const today = new Date(2026, 2, 13); // March 13, 2026
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDay, setSelectedDay] = useState(13);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  const dayMeetings = meetings.filter(m => m.day === selectedDay);

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Meeting Calendar</h1>
          <p className="text-gray-400 mt-1">Your schedule and upcoming meetings.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold w-fit transition-all shadow-lg shadow-blue-500/20 active:scale-95">
          <Plus size={18} /> Schedule Meeting
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Mini Calendar */}
        <div className="lg:col-span-2 bg-[#0f0f0f] border border-[#222] rounded-3xl p-6 self-start sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">{MONTHS[month]} {year}</h2>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                className="p-2 rounded-lg hover:bg-[#1a1a1a] text-gray-400 hover:text-white transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                className="p-2 rounded-lg hover:bg-[#1a1a1a] text-gray-400 hover:text-white transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-[11px] font-bold text-gray-500 py-1">{d}</div>
            ))}
          </div>

          <div className="space-y-1">
            {rows.map((row, ri) => (
              <div key={ri} className="grid grid-cols-7 text-center gap-y-1">
                {row.map((day, di) => {
                  const hasMeeting = meetings.some(m => m.day === day);
                  const isToday = day === today.getDate() && month === today.getMonth();
                  const isSelected = day === selectedDay;
                  return (
                    <button
                      key={di}
                      onClick={() => day && setSelectedDay(day)}
                      className={cn(
                        "w-9 h-9 mx-auto rounded-xl text-sm font-medium transition-all relative",
                        !day && 'invisible',
                        isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' :
                        isToday ? 'bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/50' :
                        'text-gray-300 hover:bg-[#1a1a1a]'
                      )}
                    >
                      {day}
                      {hasMeeting && !isSelected && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-[#222] flex items-center justify-between text-sm text-gray-400">
            <span>{meetings.length} meetings this month</span>
            <span className="text-blue-500 font-semibold cursor-pointer hover:text-blue-400">Sync →</span>
          </div>
        </div>

        {/* Day Detail */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#0f0f0f] border border-[#222] rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-1">
              {MONTHS[month]} {selectedDay}, {year}
            </h3>
            <p className="text-sm text-gray-500 mb-6">{dayMeetings.length} meeting{dayMeetings.length !== 1 ? 's' : ''} scheduled</p>

            {dayMeetings.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <Clock size={36} className="mx-auto mb-3 text-gray-700" />
                <p className="font-medium">No meetings on this day.</p>
                <p className="text-xs mt-1 text-gray-700">Enjoy the free time!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dayMeetings.map(m => (
                  <div key={m.id} className={cn("border-l-2 p-5 rounded-r-2xl rounded-tl-2xl group transition-all hover:scale-[1.01]", colorMap[m.color])}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-white mb-1">{m.title}</h4>
                        <div className="flex items-center gap-1 text-xs mb-3">
                          <Clock size={12} />
                          <span>{m.time}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                          {m.type === 'Video Call'
                            ? <span className="flex items-center gap-1"><Video size={12} /> Video Call</span>
                            : <span className="flex items-center gap-1"><MapPin size={12} /> In-Person</span>
                          }
                          <span>· {m.attendees} attendees</span>
                        </div>
                      </div>
                      {m.link && (
                        <a
                          href={m.link}
                          className="flex-shrink-0 mt-1 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all"
                        >
                          <Video size={14} /> Join
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
