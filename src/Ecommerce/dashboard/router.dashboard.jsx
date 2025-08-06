// dashboard/routes/router.dashboard.jsx
import { Route } from "react-router-dom";
import ProfilePage from "./pages/profilePage";
// Agrega tus otras páginas aquí si las tienes
// import OrdersPage from "../pages/ordersPage";
// import WishlistPage from "../pages/wishlistPage";
import OrdersPage from "./pages/ordersPage"; 
import OrderItem from "./pages/orderItem"; 
const DashboardRouter = (
  <>
    <Route index element={<ProfilePage />} />
    <Route path="profile" element={<ProfilePage />} />

    <Route path="pedidos" element={<OrdersPage />} />
    <Route path="pedidos/:id" element={<OrderItem />} />
    
    {/* <Route path="pedidos" element={<OrdersPage />} />
    <Route path="favoritos" element={<WishlistPage />} /> */}
  </>
);

export default DashboardRouter;
