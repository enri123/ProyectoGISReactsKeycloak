import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import jwksClient from "jwks-rsa";

const KEYCLOAK_ISSUER =
  "http://localhost:8080/realms/reino-infodp";

const client = jwksClient({
  jwksUri:
    "http://localhost:8080/realms/reino-infodp/protocol/openid-connect/certs",
});

export default fp(async (fastify) => {
  await fastify.register(jwt, {
    decode: {
      complete: true,
    },

    secret: async (_request, token) => {
      if (!token) {
        throw new Error("Token not provided");
      }

      const { header, payload } = token;

      if (!header?.kid || !header?.alg || !payload?.iss) {
        throw new Error("Invalid token");
      }

      if (payload.iss !== KEYCLOAK_ISSUER) {
        throw new Error("Invalid token issuer");
      }

      if (header.alg !== "RS256") {
        throw new Error("Unsupported JWT algorithm");
      }

      const key = await client.getSigningKey(header.kid);

      return key.getPublicKey();
    },

    verify: {
      algorithms: ["RS256"],
      allowedIss: [KEYCLOAK_ISSUER],
    },
  });

  fastify.decorate("authenticate", async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (error) {
      request.log.error(error, "JWT verification failed");

      return reply.code(401).send({
        message: "Unauthorized",
      });
    }
  });
});