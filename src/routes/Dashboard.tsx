import PortalLayout from "../layout/PortalLayout.tsx";
import DashboardMap from "./DashboardMap.tsx";

//PortalLayout nos muestra el header, y por consecuencia el SideBar
//DashboardMap nos muestra el mapa, y todas las funciones relacionadas con el mapa
export default function Dashboard() {
    return (
        <PortalLayout>
            <DashboardMap  />
        </PortalLayout>
    );
}