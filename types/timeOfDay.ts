export type TimeOfDay = 'earlyMorning' | 'morning' | 'noon' | 'evening' | 'night';

export interface TimeOfDaySetting {
    label: TimeOfDay;
    displayName: string;
    start: number;
    end: number;
}

export const defaultTimeOfDaySettings: TimeOfDaySetting[] = [
    { label: 'earlyMorning', displayName: "Early", start: 0, end: 7 },
    { label: 'morning', displayName: "Morning",  start: 7, end: 11 },
    { label: 'noon', displayName: "Noon", start: 11, end: 15 },
    { label: 'evening', displayName: "Evening", start: 15, end: 20 },
    { label: 'night', displayName: "Night", start: 20, end: 24 },
];