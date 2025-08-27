import React from 'react';

export default function StudentUtility() {
  // Example events
  const events = [
    { title: 'PLP Hackathon', date: 'Sep 10, 2025', type: 'Hackathon' },
    { title: 'React Masterclass', date: 'Sep 15, 2025', type: 'Masterclass' },
    { title: 'AI Bootcamp', date: 'Sep 22, 2025', type: 'Bootcamp' },
    { title: 'Career Fair', date: 'Sep 30, 2025', type: 'Career' },
  ];
  return (
    <div className="hidden md:flex flex-col items-center justify-start h-full w-40 mx-2 p-4 shadow-lg animate-fade-in
      bg-gray-100 dark:bg-[#111111] border border-gray-200 dark:border-gray-900 rounded-none
      dark:text-gray-200 text-gray-900
      ">
  <h4 className="text-base font-bold mb-3 pt-32 text-[#0bb6bc] dark:text-[#0bb6bc]">Upcoming Events</h4>
      <ul className="space-y-3 w-full">
        {events.map((event, idx) => (
          <li key={idx} className="bg-gradient-to-r from-[#0bb6bc] to-[#c42152] text-white px-2 py-2 rounded-lg shadow-sm text-xs font-semibold flex flex-col items-start w-full dark:bg-[#222] dark:text-gray-200 dark:from-none dark:to-none">
            <span className="mb-1">{event.title}</span>
            <span className="opacity-80">{event.date} • {event.type}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 text-xs opacity-80 text-center">Don't miss out on these opportunities!</div>
    </div>
  );
}
