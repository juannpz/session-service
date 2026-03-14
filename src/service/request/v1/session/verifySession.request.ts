import { JWTPayload, KEY_GENERATION_CONFIG } from "../../../service.definition.ts";
import {
    buildRequestResponse,
    JWTManager,
    Router,
    ValidationResult,
} from "@juannpz/deno-service-tools";
import { ExtendedContextVariables } from "../../request.definition.ts";

interface Body extends Record<string, unknown> {
    jwt: string;
}

export const verifySessionRequest = Router.post<ExtendedContextVariables>("/verify")
    .describe("Verify session request")
    .body<Body>()
    .validateBody(validateBody)
    .withVariables<ExtendedContextVariables>()
    .handler(async (context) => {
        const { jwt } = context.body;

        const verifyJwtResult = await JWTManager.verify<JWTPayload>(jwt, KEY_GENERATION_CONFIG);

        const response = buildRequestResponse(verifyJwtResult);

        if (!response.success) {
            return context.c.json({ ...response, code: 401 }, 401);
        }

        return context.c.json(response, 200);
    });

function validateBody(body: Body): ValidationResult {
    if (!body.jwt) {
        return { valid: false, message: 'Missing "jwt" prop in body' };
    }

    return { valid: true };
}
