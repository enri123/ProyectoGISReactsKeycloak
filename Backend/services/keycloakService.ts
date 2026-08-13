// services/keycloakService.ts

interface CreateKeycloakUserData {
  username: string;
  email: string;
  password: string;
  roles: string[];
}

interface KeycloakTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface KeycloakRole {
  id: string;
  name: string;
  description?: string;
  composite?: boolean;
  clientRole?: boolean;
  containerId?: string;
}

export async function getKeycloakAdminToken(): Promise<string> {
  const keycloakUrl = process.env.KEYCLOAK_URL;
  const realm = process.env.KEYCLOAK_REALM;
  const clientId = process.env.KEYCLOAK_ADMIN_CLIENT_ID;
  const clientSecret = process.env.KEYCLOAK_ADMIN_CLIENT_SECRET;
  
console.log({
  KEYCLOAK_URL: process.env.KEYCLOAK_URL,
  KEYCLOAK_REALM: process.env.KEYCLOAK_REALM,
  KEYCLOAK_ADMIN_CLIENT_ID: process.env.KEYCLOAK_ADMIN_CLIENT_ID,
  HAS_SECRET: !!process.env.KEYCLOAK_ADMIN_CLIENT_SECRET,
});

  if (!keycloakUrl || !realm || !clientId || !clientSecret) {
    throw new Error('Keycloak admin configuration is missing');
  }

  const response = await fetch(
    `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Could not obtain Keycloak admin token: ${errorText}`
    );
  }

  const data = (await response.json()) as KeycloakTokenResponse;

  return data.access_token;
}


export async function createKeycloakUser(
  userData: CreateKeycloakUserData
) {
  const keycloakUrl = process.env.KEYCLOAK_URL;
  const realm = process.env.KEYCLOAK_REALM;

  console.log('CREATE USER CONFIG:', {
    KEYCLOAK_URL: keycloakUrl,
    KEYCLOAK_REALM: realm,
  });

  if (!keycloakUrl || !realm) {
    throw new Error('Keycloak configuration is missing');
  }

  const adminToken = await getKeycloakAdminToken();

  /*
   * 1. Crear usuario
   */

  const createUserResponse = await fetch(
    `${keycloakUrl}/admin/realms/${realm}/users`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        username: userData.username,
        email: userData.email,
        enabled: true,
        emailVerified: false,
        credentials: [
          {
            type: 'password',
            value: userData.password,
            temporary: false,
          },
        ],
      }),
    }
  );

  if (!createUserResponse.ok) {
    const errorText = await createUserResponse.text();

    throw new Error(
      `Could not create Keycloak user: ${errorText}`
    );
  }

  /*
   * Keycloak devuelve 201 Created.
   * El ID del usuario viene en la cabecera Location.
   */

  const location = createUserResponse.headers.get('location');

  if (!location) {
    throw new Error(
      'User was created but Keycloak did not return the user location'
    );
  }

  const userId = location.split('/').pop();

  if (!userId) {
    throw new Error(
      'Could not obtain the Keycloak user ID'
    );
  }

  /*
   * 2. Asignar roles
   */

  for (const roleName of userData.roles) {

    const roleResponse = await fetch(
      `${keycloakUrl}/admin/realms/${realm}/roles/${encodeURIComponent(roleName)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    if (!roleResponse.ok) {
      throw new Error(
        `Role "${roleName}" does not exist in Keycloak`
      );
    }

    const role = (await roleResponse.json()) as KeycloakRole;

    /*
     * Asignar el role al usuario
     */

    const assignRoleResponse = await fetch(
      `${keycloakUrl}/admin/realms/${realm}/users/${userId}/role-mappings/realm`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify([
          {
            id: role.id,
            name: role.name,
          },
        ]),
      }
    );

    if (!assignRoleResponse.ok) {
      const errorText = await assignRoleResponse.text();

      throw new Error(
        `Could not assign role "${roleName}": ${errorText}`
      );
    }
  }

  return {
    id: userId,
    username: userData.username,
    email: userData.email,
    roles: userData.roles,
  };
}