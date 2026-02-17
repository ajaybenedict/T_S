import { S1CustomHeaderButtons } from "src/app/models/s1/s1-date-range-picker.interface";

export let customCalendarHeaderButtons: S1CustomHeaderButtons[] = [
    {
      displayName: '7 D',
      width: '40px',
      days: 7,
      selected: true,  // Modify this value if default filter days changes
      id: '7D',
      ariaLabel: 'last 7 days',
    },
    {
      displayName: '30 D',
      width: '48px',
      days: 30,
      selected: false,
      id: '30D',
      ariaLabel: 'last 30 days',
    },
    {
      displayName: '60 D',
      width: '48px',
      days: 60,
      selected: false,
      id: '60D',
      ariaLabel: 'last 60 days',
    },
    {
      displayName: '3 M',
      width: '42px',
      days: 90,
      selected: false,
      id: '3M',
      ariaLabel: 'last 3 months',
    },    
    {
      displayName: 'Custom',
      width: '70px',
      days: 0,
      selected: false,
      id: 'custom',
      ariaLabel: 'custom',
    },
  ];

  