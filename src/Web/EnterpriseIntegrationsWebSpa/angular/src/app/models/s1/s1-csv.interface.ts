export interface CSVColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}