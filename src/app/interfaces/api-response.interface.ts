export interface ApiErrorResponse {
  code: string;
  message: string;
  meta?: unknown;
}

export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  error: ApiErrorResponse | null;
}
