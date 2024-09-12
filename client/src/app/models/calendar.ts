export interface Day {
    date: Date;
    isCurrent: boolean;
    events: Event[];
}
export interface ParsedDay extends Day {
    dayDigits: string;
    dayName: string;
    monthDigits: string;
}

export interface Event {
    id?: string
    title: string;
    color?: string;
}