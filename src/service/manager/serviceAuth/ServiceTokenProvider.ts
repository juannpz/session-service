import {
    JWT_CONFIG_HEADERS,
    JWTPayload,
    KEY_GENERATION_CONFIG,
    ServiceAuthConfig,
} from "../../service.definition.ts";
import { getNumericDate, JWTManager, Result, ResUtil } from "@juannpz/deno-service-tools";

/**
 * Provider class for managing and caching inter-service authentication tokens.
 * It uses Deno KV in memory mode to temporarily store tokens and automatically
 * handles cache invalidation and token refresh based on the JWT 'exp' claim.
 */
export class ServiceTokenProvider {
    private static kv: Deno.Kv;
    private static serviceAuthConfig: ServiceAuthConfig;

    /**
     * Initializes the Deno KV store in strictly in-memory mode and sets the session service URL.
     * MUST be called once at application startup.
     *
     * @param {ServiceAuthConfig} authConfig - The base URL of the session service.
     * @returns {Promise<Result<void>>} A successful result if initialized, or a failure result on error.
     */
    public static async init(authConfig: ServiceAuthConfig): Promise<Result<void>> {
        try {
            if (!this.kv) {
                this.kv = await Deno.openKv(":memory:");
            }

            this.serviceAuthConfig = authConfig;

            return ResUtil.Succeed(undefined);
        } catch (error) {
            return ResUtil.Fail("Failed to initialize Deno KV in ServiceTokenProvider", error);
        }
    }

    /**
     * Retrieves an active service token from memory. If it does not exist or has expired,
     * it transparently requests a new one from the session service.
     *
     * @returns {Promise<Result<string>>} A Result containing the valid JWT string, or a failure message.
     */
    public static async getValidToken(): Promise<Result<string>> {
        if (!this.kv) {
            return ResUtil.Fail(
                "ServiceTokenProvider is not initialized. Call init(entrypoint) at startup.",
            );
        }

        const tokenKey = [
            "auth",
            "service_token",
            this.serviceAuthConfig.SERVICE_AUTH_USER_ID,
            this.serviceAuthConfig.SERVICE_AUTH_ROLE,
        ];

        try {
            const cachedToken = await this.kv.get<string>(tokenKey);

            if (cachedToken.value) {
                return ResUtil.Succeed(cachedToken.value);
            }
        } catch (error) {
            console.error("Failed to read token from Deno KV cache", error);
        }

        const newTokenResult = await this.requestNewToken(this.serviceAuthConfig);

        if (!newTokenResult.ok) {
            return newTokenResult;
        }

        const newToken = newTokenResult.value;

        try {
            const payloadBase64Url = newToken.split(".")[1];

            if (payloadBase64Url) {
                const base64 = payloadBase64Url.replace(/-/g, "+").replace(/_/g, "/");
                const payloadString = atob(base64);
                const payload = JSON.parse(payloadString);

                if (payload.exp) {
                    const timeToLiveMs = (payload.exp * 1000) - Date.now() - 5000;

                    if (timeToLiveMs > 0) {
                        await this.kv.set(tokenKey, newToken, { expireIn: timeToLiveMs });
                    }
                } else {
                    await this.kv.set(tokenKey, newToken);
                }
            }
        } catch (parseOrCacheError) {
            console.error("Failed to parse JWT payload or save to Deno KV", parseOrCacheError);
        }

        return ResUtil.Succeed(newToken);
    }

    private static async requestNewToken(authConfig: ServiceAuthConfig): Promise<Result<string>> {
        try {
            const jwtPayload: JWTPayload = {
                userId: authConfig.SERVICE_AUTH_USER_ID,
                role: authConfig.SERVICE_AUTH_ROLE,
                aud: authConfig.SERVICE_AUTH_AUD,
                iss: "session-service",
                sub: authConfig.SERVICE_AUTH_SUB,
                exp: getNumericDate(60 * 60),
            };

            const generateJwtResult = await JWTManager.generate<JWTPayload>(
                JWT_CONFIG_HEADERS,
                jwtPayload,
                KEY_GENERATION_CONFIG,
            );

            if (!generateJwtResult.ok) {
                console.error(generateJwtResult.message);
                return generateJwtResult;
            }

            return ResUtil.Succeed(generateJwtResult.value);
        } catch (error) {
            return ResUtil.Fail(
                "Network or unexpected error occurred while fetching new service token",
                error,
            );
        }
    }
}
