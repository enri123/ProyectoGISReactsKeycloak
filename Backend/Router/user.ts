import type { FastifyInstance } from 'fastify';
import { createKeycloakUser } from '../services/keycloakService.ts';

interface CreateUserBody {
  username: string;
  email: string;
  password: string;
  roles: string[];
}

export async function userRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      onRequest: [app.authenticate],
    },
    async () => {
      return {
        message: 'Users',
      };
    }
  );

  app.post<{ Body: CreateUserBody }>(
    '/',
    {
      onRequest: [app.authenticate],
    },
    async (request, reply) => {
      /*
       * 1. Comprobar que el usuario tiene permiso
       *    para crear usuarios.
       */
      console.log('User roles:', request.user);
      if (!request.user.realm_access?.roles.includes('user_creation')) {
        return reply.code(403).send({
          error: 'You do not have permission to create users',
        });
      }

      /*
       * 2. Obtener los datos enviados por el frontend.
       */
      const { username, email, password, roles } = request.body;

      /*
       * 3. Validación básica.
       */
      if (!username || !email || !password || !Array.isArray(roles)) {
        return reply.code(400).send({
          error: 'Invalid user data',
        });
      }

      /*
       * 4. Roles que puede asignar un usuario
       *    que tenga "user_creation".
       *
       *    IMPORTANTE:
       *    Estos roles se comprueban en el BACKEND.
       *    No confiamos en los roles enviados por React.
       */
      const noAllowedRoles = [
        'offline_access',
        'uma_authorization',
        'user_creation',
        'default-roles-reino-infodp',
      ];

      /*
       * 5. Buscar roles no permitidos.
       */
      const invalidRoles = roles.filter((role) => noAllowedRoles.includes(role));

      /*
       * 6. Si hay algún rol no permitido,
       *    rechazamos toda la petición.
       */
      if (invalidRoles.length > 0) {
        return reply.code(400).send({
          error: 'You cannot assign one or more requested roles',
          invalidRoles,
          noAllowedRoles,
        });
      }

      try {
        /*
         * 7. Crear el usuario en Keycloak.
         */
        const createdUser = await createKeycloakUser({
          username,
          email,
          password,
          roles,
        });

        /*
         * 8. Respuesta.
         */
        return reply.code(201).send({
          message: 'User created successfully',
          user: createdUser,
        });
      } catch (error) {
        console.error('Error creating Keycloak user:', error);

        return reply.code(500).send({
          error: 'Could not create user',
        });
      }
    }
  );
}
