export type ApiResponse<T = unknown> =
  | {
      success: true;
      data?: T;
    }
  | {
      success: false;
      error: string;
    };

export const ApiResponse = {} as ApiResponse;
