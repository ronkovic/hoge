export type ApiResponse<T = any> =
  | {
      success: true;
      data?: T;
    }
  | {
      success: false;
      error: string;
    };

export const ApiResponse = {} as ApiResponse;
