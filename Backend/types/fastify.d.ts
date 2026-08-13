import "fastify";
import type { FastifyReply, FastifyRequest } from "fastify";

declare module "@fastify/jwt" {
    interface FastifyJWT {
        user: {
            realm_access?: {
                roles: string[];
            };
        };
    }
}

declare module "fastify" {
    interface FastifyInstance {
        authenticate: (
            request: FastifyRequest,
            reply: FastifyReply
        ) => Promise<void>;
    }
}