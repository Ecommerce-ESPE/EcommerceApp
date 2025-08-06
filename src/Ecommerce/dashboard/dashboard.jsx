// dashboard/routes/dashboard.jsx
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import DashboardRouter from "./router.dashboard";

const Dashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        {DashboardRouter}
      </Route>
    </Routes>
  );
};

export default Dashboard;
