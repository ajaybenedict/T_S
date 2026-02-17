import { DisplayEntity } from '../models/display-entity';
import { DisplayTableComponent } from '../DisplayComponent/display-table.component';
import { DisplayCustomIonDataComponent } from '../DisplayComponent/display-custom-ion-data.component';


export const DisplayIonData: DisplayEntity = {
  displayComponent: DisplayCustomIonDataComponent,
  configuration: {
    columns: [           
      
    ]
  }
}
