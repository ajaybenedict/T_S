import { Provider } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

export const TEST_PROVIDERS: Provider[] = [
  {
    provide: ActivatedRoute,
    useValue: {
      snapshot: {
        paramMap: convertToParamMap({}),
        queryParamMap: convertToParamMap({}),
        queryParams: {},
        data: {}
      },
      params: of({}),
      queryParams: of({}),
      data: of({})
    }
  },

  {
    provide: MatDialogRef,
    useValue: {
      close: () => {},
      afterClosed: () => of(null)
    }
  },

  {
    provide: MAT_DIALOG_DATA,
    useValue: {}
  },

  {
    provide: MatDialog,
    useValue: {
      open: () => ({
        afterClosed: () => of(null)
      })
    }
  }
];