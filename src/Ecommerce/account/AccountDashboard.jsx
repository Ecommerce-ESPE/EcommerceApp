import { Routes, Route, Navigate } from "react-router-dom";
import AccountDashboardLayout from "./AccountDashboardLayout";
import ProfilePage from "./pages/ProfilePage";
import AccountHomePage from "./pages/AccountHomePage";
import AddressesPage from "./pages/AddressesPage";
import WalletPage from "./pages/WalletPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import SettingsPage from "./pages/SettingsPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import WishlistPage from "./pages/WishlistPage";

const AccountDashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<AccountDashboardLayout />}>
        <Route index element={<AccountHomePage />} />
        <Route path="home" element={<AccountHomePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="addresses" element={<AddressesPage />} />
        <Route path="wallet" element={<WalletPage />} />
        <Route path="credits" element={<WalletPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route
          path="security"
          element={
            <PlaceholderPage
              title="Seguridad"
              description="Gestiona contrasenas y acceso en un solo lugar."
            />
          }
        />
        <Route
          path="payment-methods"
          element={
            <PlaceholderPage
              title="Metodos de pago"
              description="Agrega y administra tus tarjetas."
            />
          }
        />
        <Route
          path="billing"
          element={
            <PlaceholderPage
              title="Facturacion"
              description="Descarga facturas y administra tu informacion fiscal."
            />
          }
        />
        <Route
          path="support"
          element={
            <PlaceholderPage
              title="Soporte"
              description="Consulta tus tickets y solicita ayuda."
            />
          }
        />
        <Route
          path="notifications"
          element={
            <PlaceholderPage
              title="Notificaciones"
              description="Ajusta alertas y recordatorios."
            />
          }
        />
        <Route path="wishlist" element={<WishlistPage />} />
      </Route>
    </Routes>
  );
};

export default AccountDashboard;
