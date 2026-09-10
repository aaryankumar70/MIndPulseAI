export interface CalendarTask {
  title: string;
  description: string;
  target: number;
  unit: string | null;
  suggested_time: string | null;
}

function formatICSDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

function escapeICS(text: string) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function addTaskToCalendar(task: CalendarTask) {
  const now = new Date();
  let start = new Date(now);

  if (task.suggested_time) {
    const [hours, minutes] = task.suggested_time
      .split(':')
      .map(Number);

    if (Number.isFinite(hours) && Number.isFinite(minutes)) {
      start.setHours(hours, minutes, 0, 0);

      if (start.getTime() < now.getTime()) {
        start.setDate(start.getDate() + 1);
      }
    }
  } else {
    start.setHours(start.getHours() + 1);
  }

  const durationMinutes = Math.max(
    1,
    Number(task.target) || 1
  );

  const end = new Date(
    start.getTime() + durationMinutes * 60 * 1000
  );

  const uid = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}@mindpulse`;

  const calendar = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MindPulse//Well-being Plan//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(now)}`,
    `DTSTART:${formatICSDate(start)}`,
    `DTEND:${formatICSDate(end)}`,
    `SUMMARY:${escapeICS(`MindPulse: ${task.title}`)}`,
    `DESCRIPTION:${escapeICS(
      `${task.description}\n\nTarget: ${task.target}${
        task.unit ? ` ${task.unit}` : ''
      }`
    )}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT10M',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeICS(
      `MindPulse reminder: ${task.title}`
    )}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob(
    [calendar],
    { type: 'text/calendar;charset=utf-8' }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'mindpulse-activity.ics';

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

export function addAllTasksToCalendar(
  tasks: CalendarTask[]
) {
  if (tasks.length === 0) {
    return;
  }

  const now = new Date();

  const events = tasks.map((task, index) => {
    const start = new Date(now);

    if (task.suggested_time) {
      const [hours, minutes] = task.suggested_time
        .split(':')
        .map(Number);

      if (Number.isFinite(hours) && Number.isFinite(minutes)) {
        start.setHours(hours, minutes, 0, 0);

        if (start.getTime() < now.getTime()) {
          start.setDate(start.getDate() + 1);
        }
      }
    } else {
      start.setHours(
        start.getHours() + 1 + index
      );
    }

    const durationMinutes = Math.max(
      1,
      Number(task.target) || 1
    );

    const end = new Date(
      start.getTime() + durationMinutes * 60 * 1000
    );

    const uid = `${Date.now()}-${index}-${Math.random()
      .toString(36)
      .slice(2)}@mindpulse`;

    return [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${formatICSDate(now)}`,
      `DTSTART:${formatICSDate(start)}`,
      `DTEND:${formatICSDate(end)}`,
      `SUMMARY:${escapeICS(`MindPulse: ${task.title}`)}`,
      `DESCRIPTION:${escapeICS(
        `${task.description}\n\nTarget: ${task.target}${
          task.unit ? ` ${task.unit}` : ''
        }`
      )}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT10M',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeICS(
        `MindPulse reminder: ${task.title}`
      )}`,
      'END:VALARM',
      'END:VEVENT',
    ].join('\r\n');
  });

  const calendar = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MindPulse//Well-being Plan//EN',
    'CALSCALE:GREGORIAN',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob(
    [calendar],
    { type: 'text/calendar;charset=utf-8' }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'mindpulse-plan.ics';

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}