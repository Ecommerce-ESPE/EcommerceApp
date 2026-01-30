import { NavLink, useLocation } from "react-router-dom";

const AccountMenu = ({ userData }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get("tab") || "profile";
  const isProfilePath =
    location.pathname === "/dashboard" ||
    location.pathname === "/dashboard/profile";

  const isTabActive = (tab) => isProfilePath && currentTab === tab;

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  };

  const initials = getInitials(userData?.name);

  return (
    <aside className="col-xl-3 col-lg-4 pb-3 mb-4 mb-lg-0 dashboard-sidebar">
      <div
        className="sidebar-sticky"
        data-sidebar-sticky-options='{"topSpacing": 120, "minWidth": 991}'
      >
        <div className="sidebar-sticky-inner">
          <div className="card">
            <div className="card-body dashboard-user">
              <div className="d-flex align-items-center">
                <div className="dashboard-avatar mr-3">{initials}</div>
                <div>
                  <h6 className="mb-1">{userData.name}</h6>
                  <p className="card-text text-muted mb-0">{userData.email}</p>
                </div>
              </div>
              <div className="mt-3">
                <span className="badge badge-light text-uppercase">
                  {userData.role === "USER" ? "Usuario" : "Admin"}
                </span>
              </div>
              <button
                className="btn btn-primary btn-block d-lg-none"
                data-toggle="collapse"
                data-target="#account-menu"
              >
                Account Menu
              </button>
            </div>

            <div id="account-menu" className="collapse d-lg-block">
              <div className="list-group list-group-flush border-top dashboard-nav">
                <div className="dashboard-section-title px-3">Cuenta</div>
                <NavLink
                  to="/dashboard/profile"
                  className={() =>
                    `list-group-item list-group-item-action d-flex align-items-center ${
                      isTabActive("profile") ? "active" : ""
                    }`
                  }
                >
                  <i className="cxi-profile font-size-lg mr-2"></i>
                  <span>Mi perfil</span>
                </NavLink>

                <NavLink
                  to="/dashboard/profile?tab=addresses"
                  className={() =>
                    `list-group-item list-group-item-action d-flex align-items-center ${
                      isTabActive("addresses") ? "active" : ""
                    }`
                  }
                >
                  <i className="cxi-map-pin font-size-lg mr-2"></i>
                  <span>Direcciones</span>
                </NavLink>

                <NavLink
                  to="/dashboard/profile?tab=settings"
                  className={() =>
                    `list-group-item list-group-item-action d-flex align-items-center ${
                      isTabActive("settings") ? "active" : ""
                    }`
                  }
                >
                  <i className="cxi-settings font-size-lg mr-2"></i>
                  <span>Configuracion</span>
                </NavLink>

                <NavLink
                  to="/dashboard/profile?tab=credits"
                  className={() =>
                    `list-group-item list-group-item-action d-flex align-items-center ${
                      isTabActive("credits") ? "active" : ""
                    }`
                  }
                >
                  <i className="cxi-wallet font-size-lg mr-2"></i>
                  <span>Creditos</span>
                </NavLink>

                <NavLink
                  to="/dashboard/pedidos"
                  className={({ isActive }) =>
                    `list-group-item list-group-item-action d-flex align-items-center ${
                      isActive ? "active" : ""
                    }`
                  }
                >
                  <i className="cxi-bag font-size-lg mr-2"></i>
                  <span>Mis pedidos</span>
                </NavLink>

                <div className="dashboard-section-title px-3">Otros</div>
                <NavLink
                  to="/logout"
                  className="list-group-item list-group-item-action d-flex align-items-center"
                >
                  <i className="cxi-logout font-size-lg mr-2"></i>
                  <span>Cerrar sesion</span>
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AccountMenu;
