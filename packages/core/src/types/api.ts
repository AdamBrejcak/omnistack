export type ApiSuccess<T> = { success: true; data: T; error: null };

export type ApiError = {
    success: false;
    data: null;
    error: { code: string; message: string };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/** Mirrors what a Drizzle row actually looks like once it round-trips through JSON (Hono RPC serializes `Date` fields to ISO strings). */
export type Serialized<T> = {
    [K in keyof T]: T[K] extends Date | null
        ? string | null
        : T[K] extends Date
            ? string
            : T[K];
};
