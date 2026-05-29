export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown> | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string | null;
  data?: T | null;
  error?: ApiError | null;
}

export type QueryParamValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryParamValue>;
