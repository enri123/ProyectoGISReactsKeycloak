import PortalLayout from '../layout/PortalLayout.tsx';
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from '../auth/useAuth';
import { API_URL } from "../const.tsx";

export default function CrearUsuario() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState<string[]>([]);

  const [errorResponse, setErrorResponse] = useState("");

  const { authenticated, user, token} = useAuth();

  const goTo = useNavigate();

  let rolesUser = user?.realm_access?.roles;
  const noAllowedRoles = ["offline_access", "uma_authorization", "user_creation", "default-roles-reino-infodp"];

  rolesUser = rolesUser?.filter(item => !noAllowedRoles.includes(item));

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,

        },
        body: JSON.stringify({
          username,
          email,
          password,
          roles,
        }),
      });

      if (response.ok) {
        console.log("User created successfully");
        setErrorResponse("");
        goTo("/");
      } else {
        console.log("Something went wrong");
        const json = (await response.json());
        setErrorResponse(json.error);
        return;
      }
    } catch (error) {
      console.error(error);
    }
  }

  if (!authenticated || !user?.realm_access?.roles.includes("user_creation")) {
    return <Navigate to="/" />;
  }

  return (
    <PortalLayout>
      <div className="login">
        <div className="form-container">
          <form className="form" onSubmit={handleSubmit}>
            <h1
              style={{
                textAlign: "center",
                marginBottom: "1rem",
              }}
            >
              Signup
            </h1>

            {!!errorResponse && (
              <div className="errorMessage">{errorResponse}</div>
            )}

            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <label>email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>Roles</label>
            {rolesUser?.map((role: string, index: number) => (
              <div key={index}>
                <input
                  type="checkbox"
                  id={`role-${index}`}
                  value={role}
                  checked={roles.includes(role)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setRoles([...roles, role]);
                    } else {
                      setRoles(roles.filter((r) => r !== role));
                    }
                  }}
                />
                <label htmlFor={`role-${index}`}>{role}</label>
              </div>
            ))}



            <button className="button-login" type="submit">Create User</button>
          </form>
        </div>
      </div>
    </PortalLayout>
  );
}
