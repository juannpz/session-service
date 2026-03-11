import { Header, IGenerateKeyConfig, Payload } from "@juannpz/deno-service-tools";

export interface JWTPayload extends Payload {
    user_id: string;
}

export const KEY_GENERATION_CONFIG: IGenerateKeyConfig = {
    algorithm: { name: "HMAC", hash: "SHA-256" },
    extractable: false,
    format: "raw",
    keyUsages: ["sign", "verify"]
};

export const JWT_CONFIG_HEADERS: Header = {
    alg: "HS256"
}

export interface ServiceConfig {
    authConfig: AuthConfig;
}

export interface AuthConfig {
    JWT_KEY: string;
}