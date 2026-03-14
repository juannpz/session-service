import {
    buildRequestResponse,
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

import { verify } from "@felix/bcrypt";
import { buildAuthHeaders } from "../../request.util.ts";
import { ServiceTokenProvider } from "../../../manager/serviceAuth/ServiceTokenProvider.ts";
import { SERVICE_CONFIG } from "../../../service.config.ts";

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
        const { email, password } = context.body;

        const verifyCredentialsResult = await verifyCredentials(
            email,
            password,
            SERVICE_CONFIG.servicesEntrypoints.CRUD_SERVICE,
        );

        if (!verifyCredentialsResult.ok) {
            const response = buildRequestResponse(verifyCredentialsResult);
            response.code = 401;

            return context.c.json(response, response.code);
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
            const response = buildRequestResponse(generateJwtResult);
            response.code = 401;

            return context.c.json(response, response.code);
        }

        return context.c.json({ jwt: generateJwtResult.value, message: "OK" }, 200);
    });

function validateBody(body: Body): ValidationResult {
    if (!body.email) {
        return { valid: false, message: 'Missing "email" prop in body' };
    }

    if (!body.password) {
        return { valid: false, message: 'Missing "password" prop in body' };
    }

    return { valid: true };
}

async function verifyCredentials(email: string, password: string, crudServiceEntrypoint: string) {
    const getTokenResult = await ServiceTokenProvider.getValidToken();

    if (!getTokenResult.ok) {
        return getTokenResult;
    }

    const getUserCredentialsResult = await safeFetch<{ data: UserCredentials[] }>(
        fetch(`${crudServiceEntrypoint}/v1/crud/user-credentials?format=object&email=${email}`, {
            headers: buildAuthHeaders(getTokenResult.value),
        }),
    );

    if (!getUserCredentialsResult.ok) {
        return getUserCredentialsResult;
    }

    const userCredentials = getUserCredentialsResult.value.data.at(0);

    if (!userCredentials) {
        return ResUtil.Fail("User credentials not found");
    }

    const valid = await verify(password, userCredentials.password);

    if (!valid) return ResUtil.Fail("Invalid password");

    return ResUtil.Succeed(userCredentials);
}
