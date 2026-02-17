// response.interface.ts
export interface DisplayEntity {
  configuration: Configuration
  displayComponent?: any
}

interface Column {
  id: string;
  name?: string;
  type?: string;
  format?: string;
  markdown?: string;
  isClickable?: boolean;
  isHidden?: boolean;
}

// Define the Configuration structure that includes an array of Column
export interface Configuration {
  columns: Column[];
}
