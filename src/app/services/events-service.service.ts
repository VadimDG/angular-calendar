import { Injectable } from '@angular/core';
import { EventClass } from '../dto/day-object';

@Injectable({
  providedIn: 'root'
})
export class EventsServiceService {

  constructor() { }

  public getEvents(): EventClass[] {
    return [
      { startDate: new Date(2021, 8, 1), endDate: new Date(2021, 8, 24), title: 'Event1', color: 'orange' },
      { startDate: new Date(2021, 8, 24), endDate: new Date(2021, 9, 8), title: 'Event2', color: 'green' }
    ].map((x: EventClass, i: number) => ({index: i, ...x}));
  }
}
