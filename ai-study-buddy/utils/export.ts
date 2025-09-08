import type { StudyPlan } from '../types';

const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
};

export const downloadAsJson = (data: object, fileNamePrefix: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    downloadFile(jsonString, `${fileNamePrefix}.json`, 'application/json');
};

export const downloadAsTxt = (text: string, fileNamePrefix: string) => {
    downloadFile(text, `${fileNamePrefix}.txt`, 'text/plain');
};

export const downloadAsIcs = (plan: StudyPlan, topic: string) => {
    const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//AIStudyBuddy//NONSGML v1.0//EN',
        `X-WR-CALNAME:Study Plan for ${topic}`,
    ];

    plan.forEach((day, index) => {
        const eventDate = new Date();
        eventDate.setDate(eventDate.getDate() + index);
        const startDate = new Date(eventDate.setHours(9, 0, 0, 0)); // 9 AM
        const endDate = new Date(eventDate.setHours(10, 0, 0, 0)); // 10 AM

        icsContent.push('BEGIN:VEVENT');
        icsContent.push(`UID:${Date.now()}${index}@aistudybuddy.com`);
        icsContent.push(`DTSTAMP:${formatDate(new Date())}`);
        icsContent.push(`DTSTART;VALUE=DATE:${startDate.toISOString().split('T')[0]}`);
        icsContent.push(`SUMMARY:Study: ${day.topic}`);
        icsContent.push(`DESCRIPTION:Task: ${day.task}`);
        icsContent.push('END:VEVENT');
    });

    icsContent.push('END:VCALENDAR');

    downloadFile(icsContent.join('\r\n'), `study-plan-${topic.replace(/\s+/g, '_')}.ics`, 'text/calendar');
};
