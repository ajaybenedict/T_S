// response.interface.ts
export interface ApiDataResponse {
  data?: any; // Specify the type more precisely if known, e.g., User[]
  error?: string;
  isError?: boolean;
  summary?: string;
  pagination?: Pagination
}

export interface Pagination {
  nextPageToken: string;
  
}
