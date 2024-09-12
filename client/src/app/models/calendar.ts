export interface Day {
    date: Date;
    isCurrent: boolean;
    events: Event[];
}
export interface ParsedDay extends Day {
    dayDigits: string; // e.g '09'
    dayName: string; // e.g 'Mon;
    monthDigits: string; // e.g '09'
}

export interface Event {
    id?: string
    title: string;
    color?: string;
}