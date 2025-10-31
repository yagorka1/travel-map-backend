export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  errorCode?: string;
  timestamp: string;
  path: string;
}
