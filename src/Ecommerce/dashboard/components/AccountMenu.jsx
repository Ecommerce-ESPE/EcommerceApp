import React from "react";
import { NavLink } from "react-router-dom";

const AccountMenu = ({ userData }) => {
  return (
    <aside className="col-xl-3 col-lg-4 pb-3 mb-4 mb-lg-0">
      <div
        className="sidebar-sticky"
        data-sidebar-sticky-options='{"topSpacing": 120, "minWidth": 991}'
      >
        <div className="sidebar-sticky-inner">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-1">{userData.name}</h5>
              <p className="card-text text-muted mb-lg-0">{userData.email}</p>
              <button
                className="btn btn-primary btn-block d-lg-none"
                data-toggle="collapse"
                data-target="#account-menu"
              >
                Account Menu
              </button>
            </div>

            <div id="account-menu" className="collapse d-lg-block">
              <div className="list-group list-group-flush border-top">
                <NavLink
                  to="/dashboard/profile"
                  className={({ isActive }) =>
                    `list-group-item list-group-item-action d-flex align-items-center ${
                      isActive ? "active" : ""
                    }`
                  }
                >
                  <i className="cxi-profile font-size-lg mr-2"></i>
                  <span>Mi perfil</span>
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

                <NavLink
                  to="/dashboard/favoritos"
                  className={({ isActive }) =>
                    `list-group-item list-group-item-action d-flex align-items-center ${
                      isActive ? "active" : ""
                    }`
                  }
                >
                  <i className="cxi-heart font-size-lg mr-2"></i>
                  <span>Favoritos</span>
                  <span className="badge badge-warning ml-auto">2</span>
                </NavLink>

                <NavLink
                  to="/dashboard/vistos"
                  className={({ isActive }) =>
                    `list-group-item list-group-item-action d-flex align-items-center ${
                      isActive ? "active" : ""
                    }`
                  }
                >
                  <i className="cxi-eye font-size-lg mr-2"></i>
                  <span>Recientemente vistos</span>
                </NavLink>

                <NavLink
                  to="/dashboard/resenas"
                  className={({ isActive }) =>
                    `list-group-item list-group-item-action d-flex align-items-center ${
                      isActive ? "active" : ""
                    }`
                  }
                >
                  <i className="cxi-star font-size-lg mr-2"></i>
                  <span>Mis reseñas</span>
                </NavLink>

                <NavLink
                  to="/logout"
                  className="list-group-item list-group-item-action d-flex align-items-center"
                >
                  <i className="cxi-logout font-size-lg mr-2"></i>
                  <span>Cerrar sesión</span>
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
