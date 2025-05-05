import { Link, NavLink } from 'react-router-dom';

export const SidebarComponent = () => {
    return(       
    <aside className="cs-offcanvas cs-offcanvas-expand bg-dark" id="componentsNav">
            <div className="cs-offcanvas-cap d-none d-lg-block py-4">
                <Link className="navbar-brand py-2" to="/dashboard">
                        <img src="../src/assets/img/logo.png" alt="Renal" width="100" />
                </Link>
                <span className="badge badge-success">Sistema</span>
            </div>
            <div className="cs-offcanvas-cap d-flex d-lg-none">
              <div className="d-flex align-items-center mt-1">
                <h5 className="text-light mb-0 mr-3">Menu</h5>
                <span className="badge badge-warning">Docs</span>
                         </div>
              <button className="close text-light" type="button" data-dismiss="offcanvas" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
    
            <div className="d-flex d-lg-none align-items-center py-4 px-3 border-bottom border-light">
                <Link className="btn btn-primary btn-block mr-3 px-4" to="/"><i className="cxi-eye mt-n1 mr-2"></i>Preview</Link>
                <Link className="btn btn-success btn-block mt-0 px-4" to="/components/typography"><i className="cxi-layouts mt-n1 mr-2"></i>Components</Link>
            </div>

            <div className="cs-offcanvas-body px-0 pt-4 pb-grid-gutter" data-simplebar data-simplebar-inverse>
                <h6 className="font-size-lg text-light px-4 mt-2 mb-3">Dashboard</h6>
                <hr className="hr-gradient hr-light mb-2 opacity-25" />
                <nav className="nav nav-light">
                    <NavLink className="nav-link px-4" to="dashboard/paciente" activeClassName="active">Pacientes</NavLink>
                    <NavLink className="nav-link px-4" to="dashboard/visita" activeClassName="active">Visitas</NavLink>
                    <NavLink className="nav-link px-4" to="dashboard/estadistica" activeClassName="active">Estadisticas</NavLink>
                    <NavLink className="nav-link px-4" to="/config" activeClassName="active">Configuraciones</NavLink>
                </nav>
                
            </div>
            
    </aside>
    )
}