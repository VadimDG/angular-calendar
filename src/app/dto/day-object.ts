export class EventClass {
    startDate: Date = new Date();
    endDate: Date = new Date();
    title: string = '';
    color: string = '';
    index: number = -1;
}

export class MyEvent {
    title: string = '';
    color: string = '';
}

export class DayObj {
    label: string = '';
    color: string = '';
    events: MyEvent[] | null = null;
}