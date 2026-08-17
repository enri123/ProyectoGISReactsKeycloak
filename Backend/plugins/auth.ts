import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import jwksClient from 'jwks-rsa';

const keycloak_issuer = process.env.KEYCLOAK_ISSUER;
let jwks_url: string;

if (process.env.DESPLIEGUE === 'docker') {
  jwks_url = process.env.JWKS_URI_DOCKER!;
} else {
  jwks_url = process.env.JWKS_URI_LOCAL!;
}

if (!jwks_url || !keycloak_issuer) {
  throw new Error('Keycloak admin configuration is missing');
}

const client = jwksClient({
  jwksUri: jwks_url,
});

export default fp(async (fastify) => {
  await fastify.register(jwt, {
    decode: {
      complete: true,
    },

    secret: async (request, token) => {
      if (!token) {
        throw new Error('Token not provided');
      }

      const { header, payload } = token;

      if (!header?.kid || !header?.alg || !payload?.iss) {
        throw new Error('Invalid token');
      }

      if (payload.iss !== keycloak_issuer) {
        throw new Error('Invalid token issuer');
      }

      if (header.alg !== 'RS256') {
        throw new Error('Unsupported JWT algorithm');
      }

      const key = await client.getSigningKey(header.kid);

      return key.getPublicKey();
    },

    verify: {
      algorithms: ['RS256'],
      allowedIss: [keycloak_issuer],
    },
  });

  fastify.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (error) {
      request.log.error(error, 'JWT verification failed');

      return reply.code(401).send({
        message: 'Unauthorized',
      });
    }
  });
});
