import {
    getNumericDate,
    JWTManager,
    ResUtil,
    Router,
    safeFetch,
    ValidationResult,
} from "@juannpz/deno-service-tools";
import { ExtendedContextVariables } from "../../request.definition.ts";
import {
    JWT_CONFIG_HEADERS,
    JWTPayload,
    KEY_GENERATION_CONFIG,
} from "../../../service.definition.ts";
import { getConfig } from "../../../service.config.ts";

import { hash, verify } from "@felix/bcrypt";
import { buildAuthHeaders } from "../../request.util.ts";
import { ServiceTokenProvider } from "../../../manager/serviceAuth/ServiceTokenProvider.ts";

interface Body extends Record<string, unknown> {
    email: string;
    password: string;
}

interface UserCredentials {
    identity_id: number;
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    phone: Record<string, unknown>;
    metadata: Record<string, unknown>;
    created_at: Date;
    updated_at: Date;
}

export const createSessionRequest = Router.post<ExtendedContextVariables>("/create")
    .describe("Create session request")
    .body<Body>()
    .validateBody(validateBody)
    .withVariables<ExtendedContextVariables>()
    .handler(async (context) => {
        const { email } = context.body;

        const verifyCredentialsResult = await verifyCredentials(
            email,
            getConfig().servicesEntrypoints.CRUD_SERVICE,
        );

        if (!verifyCredentialsResult.ok) {
            return context.c.json({
                message: verifyCredentialsResult.message,
                error: verifyCredentialsResult.error,
            }, 401);
        }
        const jwtPayload: JWTPayload = {
            userId: verifyCredentialsResult.value.user_id,
            role: "USER",
            aud: "*",
            exp: getNumericDate(60 * 60),
            iss: "session-service",
            sub: verifyCredentialsResult.value.user_id,
        };

        const generateJwtResult = await JWTManager.generate<JWTPayload>(
            JWT_CONFIG_HEADERS,
            jwtPayload,
            KEY_GENERATION_CONFIG,
        );

        if (!generateJwtResult.ok) {
            return context.c.json({
                message: generateJwtResult.message,
                error: generateJwtResult.error,
            }, 400);
        }

        return context.c.json({ jwt: generateJwtResult.value, message: "OK" }, 200);
    });

function validateBody(body: Body): ValidationResult {
    if (!body.userId) {
        return { valid: false, message: 'Missing "userId" prop in body' };
    }

    return { valid: true };
}

async function verifyCredentials(email: string, crudServiceEntrypoint: string) {
    const getTokenResult = await ServiceTokenProvider.getValidToken();

    if (!getTokenResult.ok) {
        return getTokenResult;
    }

    const userCredentialsResult = await safeFetch<UserCredentials>(
        fetch(`${crudServiceEntrypoint}/v1/crud/user-credentials?email=${email}`, {
            headers: buildAuthHeaders(getTokenResult.value),
        }),
    );

    if (!userCredentialsResult.ok) {
        return userCredentialsResult;
    }

    const pgHash = await hash(userCredentialsResult.value.password);

    const valid = await verify(userCredentialsResult.value.password, pgHash);

    if (!valid) return ResUtil.Fail("Password hash verification failed");

    return ResUtil.Succeed(userCredentialsResult.value);
}
