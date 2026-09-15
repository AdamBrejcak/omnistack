import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { ApiResponse } from "@omnistack/core/api";

export const ok = <T>(c: Context, data: T, status: ContentfulStatusCode = 200) =>
    c.json({ success: true as const, data, error: null } satisfies ApiResponse<T>, status);

export const fail = (
    c: Context,
    code: string,
    message: string,
    status: ContentfulStatusCode = 400
) =>
    c.json(
        { success: false as const, data: null, error: { code, message } } satisfies ApiResponse<never>,
        status
    );
