import Keycloak from 'keycloak-js';
import { KEYCLOAK_URL, KEYCLOAK_REALM } from '../const';
const keycloak = new Keycloak({
  url: KEYCLOAK_URL,
  realm: KEYCLOAK_REALM,
  clientId: 'react-app-client',
});

export default keycloak;
