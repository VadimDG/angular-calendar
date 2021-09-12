import { Component, OnInit } from '@angular/core';
import { EventClass, DayObj, MyEvent } from 'src/app/dto/day-object';
import { EventsServiceService } from '../../services/events-service.service';

@Component({
  selector: 'app-calendar-view',
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.scss']
})
export class CalendarViewComponent implements OnInit {

  public weeksArray: number[] = [];
  public date = new Date();
  public events: EventClass[] = [];
  public readonly currentDate = new Date();

  private monthYear = '';
  private daysPresentationArray: DayObj[] = [];

  constructor(eventsService: EventsServiceService) {
    const currentYear = this.date.getFullYear();
    const currentMonth = (this.date.getMonth() + 1).toString();
    this.monthYear = `${currentMonth.length < 2 ? '0' + currentMonth : currentMonth}${currentYear}`;
    this.events = eventsService.getEvents();
  }

  ngOnInit(): void {
    this.daysPresentationArray = this.convertDaysArrayToDaysObjectView();
    this.weeksArray = this.getWeeksNumberByDate(this.monthYear);
  }

  public getMonthLength(monthNumber: number, yearNumber: number): number {

    if (monthNumber == 2) {
      return this.isLeapYear(yearNumber) ? 29 : 28;
    }
    if (monthNumber < 8) {
      return monthNumber % 2 == 0 ? 30 : 31;
    } else {
      return monthNumber % 2 == 0 ? 31 : 30;
    }
  }

  public getFirstDayOfWeekByDate(date: string): number {
    const [month, year] = this.extractMonthYearFromStringDate(date);
    const dayOfWeek = new Date(year, month - 1, 1).getDay();
    return dayOfWeek == 0 ? 7 : dayOfWeek;
  }

  public getFirstTwoEventList(input: MyEvent[]): MyEvent[] {
    const numberOfVisibleEvents = 2;
    if (input.length < numberOfVisibleEvents) {
      return input;
    }
    return input.slice(0, numberOfVisibleEvents);
  }

  public getWeekArray(weekNumber: number): DayObj[] {
    let outArr: DayObj[] = this.daysPresentationArray.slice(weekNumber * 7, weekNumber * 7 + 7);

    return outArr;  
  }

  public changeMonth(count: number): void {
    let [month, year] = this.extractMonthYearFromStringDate(this.monthYear);
    const newMonth = month + count;
    if (newMonth > 12) {
      this.monthYear = `01${year + 1}`;
    }

    else if (newMonth < 1) {
      this.monthYear = `12${year - 1}`;
    }
    else {
      this.monthYear = `${newMonth.toString().length < 2 ? '0' + newMonth : newMonth}${year}`;
    }
    [month, year] = this.extractMonthYearFromStringDate(this.monthYear);
    this.date = new Date(year, month - 1);
    this.daysPresentationArray = this.convertDaysArrayToDaysObjectView();
    this.weeksArray = this.getWeeksNumberByDate(this.monthYear);
  }

  public onDatetimePickerChange($event: Date) {
    this.date = $event;
    const dtDate = new Date(this.date);
    const newMonth = dtDate.getMonth() + 1;
    this.monthYear = `${newMonth.toString().length < 2 ? '0' + newMonth : newMonth}${dtDate.getFullYear()}`;
    this.weeksArray = this.getWeeksNumberByDate(this.monthYear);
  }

  private makeDaysArray(date: string): string[] {
    const [month, year] = this.extractMonthYearFromStringDate(date);
    const outArr = [];
    for (let i = 1; i < this.getMonthLength(month, year) + 1; i++) {
      outArr[i - 1] = i.toString();
    }
    return outArr;
  }

  private convertDaysArrayToDaysObjectView(): DayObj[] {
    console.log('called');
    const firstDayNumber = this.getFirstDayOfWeekByDate(this.monthYear);

    const [month, year] = this.extractMonthYearFromStringDate(this.monthYear);
    const priorMonthDaysCount = this.getMonthLength(month - 1, year);
    const prefixArr = [] as DayObj[];

    for (let i = 0; i < firstDayNumber - 1; i++) {
      prefixArr[i] = { label: (priorMonthDaysCount - firstDayNumber + 2 + i).toString(), color: 'grey' } as DayObj;
    }

    const currentDaysArray = this.makeDaysArray(this.monthYear).map(x => ({ label: x, color: 'black' } as DayObj));

    const [currentDay, currentMonth, currentYear] = this.extractDayMonthYearFromDate(this.currentDate);
    if (currentYear == year && currentMonth == month) {
      currentDaysArray[currentDay - 1].color = 'red';
    }

    const mergedArr: DayObj[] = prefixArr.concat(currentDaysArray);

    const actualMonthLastDay = parseInt(mergedArr[mergedArr.length - 1].label);

    const daysArrLenth = mergedArr.length;
    let numberOfDaysFill = 0
    if (daysArrLenth > 28 && !this.isLeapYear(year)) {

      numberOfDaysFill = (Math.floor(daysArrLenth / 7) * 7) + 7 - daysArrLenth;

      for (let i = 1; i < numberOfDaysFill + 1; i++) {
        mergedArr.push({ label: i.toString(), color: 'grey' } as DayObj);
      }
    }


    this.events.forEach(event => {
      const currentCalendatStartDay = prefixArr.length > 0 ? parseInt(prefixArr[0].label) : 1;
      const currentCalendatStartMonth = prefixArr.length > 0 ? month - 2 : month - 1;

      const currentCalendarFirstDate = new Date(year, currentCalendatStartMonth, currentCalendatStartDay)
      if (event.endDate >= currentCalendarFirstDate && event.startDate <= new Date(year, month - 1, 30)) {

        let start = prefixArr.length;

        if (event.startDate <= currentCalendarFirstDate) {
          start = 0;
        } else {
          if (event.startDate.getMonth() !== month - 1) {
            start = event.startDate.getDate() - currentCalendatStartDay;
          } else {
            start += event.startDate.getDate() - 1;
          }
        }

        let end: number;
        if (event.endDate <= new Date(year, month - 1, actualMonthLastDay)) {
          end = prefixArr.length + event.endDate.getDate() - 1;
        } else {
          if (event.endDate.getMonth() === month && event.endDate.getDate() < numberOfDaysFill) {
            end = (mergedArr.length - (numberOfDaysFill - event.endDate.getDate()) - 1);
          } else {
            end = mergedArr.length - 1;
          }
        }
        
        for (let i = start; i <= end; i++) {          
          if (!mergedArr[i].events) {
            mergedArr[i].events = [];
            for (let j = 0; j < event.index; j ++) {
              mergedArr[i].events.push({ title: '', color: 'transparent' });
            }
            
          }
          mergedArr[i].events.push({ title: i == start || i % 7 == 0 ? event.title : '', color: event.color });
        }
      }
    });
    return mergedArr;
  }

  private getWeeksNumberByDate(date: string): number[] {
    const [month, year] = this.extractMonthYearFromStringDate(date);
    const monthLegth = this.getMonthLength(month, year);
    const firstDayInWeekNumber = this.getFirstDayOfWeekByDate(date);
    const outArr = [];

    let len = Math.ceil(monthLegth / 7);

    len = (35 - monthLegth) + 1 < firstDayInWeekNumber ? len + 1 : len;

    for (let i = 0; i < len; i++) {
      outArr[i] = i;
    }

    return outArr;
  }

  private isLeapYear = (yearNumber: number) => {
    const baseLeapYear = 2020;
    return Math.abs(yearNumber - baseLeapYear) % 4 == 0;
  }

  private extractDayMonthYearFromDate(date: Date): [number, number, number] {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return [day, month, year];
  }

  private extractMonthYearFromStringDate(date: string): [number, number] {
    return [parseInt(date.slice(0, 2)), parseInt(date.slice(2, 6))];
  }

}


// https://team-lab.github.io/cell-cursor/example.html
// https://d3lm.github.io/ngx-drag-to-select/
// https://dhtmlx.com/docs/products/dhtmlxScheduler/