import { JWTPayload, KEY_GENERATION_CONFIG } from "../../service.definition.ts";
import { Context, JWTManager } from "@juannpz/deno-service-tools";

export async function basicAuthMiddleware(c: Context, next: () => Promise<void | Response>) {
    const token = c.req.header("Authorization");

    if (!token)
        return c.json({ message: "Missing auth token" }, 401);

    if (!token.startsWith("Bearer "))
        return c.json({ message: "Invalid auth token format" }, 401);

    const verificationResult = await JWTManager.verify<JWTPayload>(token, KEY_GENERATION_CONFIG);

    if (!verificationResult.ok) {
        console.error(verificationResult.message);

        return c.json({ message: verificationResult.message }, 401);
    };
    
    c.set("format", c.req.query("format"))

    await next();
}