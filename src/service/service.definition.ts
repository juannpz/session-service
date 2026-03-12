import { Header, IGenerateKeyConfig, Payload } from "@juannpz/deno-service-tools";

export interface JWTPayload extends Payload {
    userId: string;
    role: string;
}

export const KEY_GENERATION_CONFIG: IGenerateKeyConfig = {
    algorithm: { name: "HMAC", hash: "SHA-256" },
    extractable: false,
    format: "raw",
    keyUsages: ["sign", "verify"],
};

export const JWT_CONFIG_HEADERS: Header = {
    alg: "HS256",
};

export interface ServiceConfig {
    authConfig: AuthConfig;
    sessionAuthConfig: ServiceAuthConfig;
    servicesEntrypoints: ServicesEntrypoints;
}

export interface AuthConfig {
    JWT_KEY: string;
}

export interface ServiceAuthConfig {
    SERVICE_AUTH_USER_ID: string;
    SERVICE_AUTH_ROLE: string;
    SERVICE_AUTH_AUD: string;
    SERVICE_AUTH_SUB: string;
}

export interface ServicesEntrypoints {
    CRUD_SERVICE: string;
}
