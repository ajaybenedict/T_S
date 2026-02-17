import { DateFilterButtons } from "src/app/interface/date-filter-button.interface";

export let customCalendarHeaderButtons: DateFilterButtons[] = [
    {
        displayName: '24 h',
        width: '46px',
        days: 1,
        selected: true,
        id: '1D',
        ariaLabel: 'last 1 day',
    },
    {
        displayName: '48 h',
        width: '46px',
        days: 2,
        selected: false,
        id: '2D',
        ariaLabel: 'last 2 days',
    },
    {
        displayName: '7 D',
        width: '46px',
        days: 7,
        selected: false,
        id: '7D',
        ariaLabel: 'last 7 days',
    },
    {
        displayName: '14 D',
        width: '48px',
        days: 14,
        selected: false,
        id: '14D',
        ariaLabel: 'last 14 days',
    },
    {
        displayName: '30 D',
        width: '50px',
        days: 30,
        selected: false,
        id: '30D',
        ariaLabel: 'last 30 days',
    },
    {
      displayName: 'Custom',
      width: '65px',
      days: 0,
      selected: false,
      id: 'custom',
      ariaLabel: 'custom',
    },
   
];

