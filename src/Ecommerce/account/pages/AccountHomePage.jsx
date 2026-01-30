import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Skeleton from "../components/Skeleton";
import AccountAnnouncementSlider from "../components/home/AccountAnnouncementSlider";
import AccountHomeHero from "../components/home/AccountHomeHero";
import ActivityTimeline from "../components/home/ActivityTimeline";
import ActiveOrderTracker from "../components/home/ActiveOrderTracker";
import MonthlyInsightCard from "../components/home/MonthlyInsightCard";
import RecommendedProductsWidget from "../components/home/RecommendedProductsWidget";
import QuickActionTiles from "../components/home/QuickActionTiles";
import { getWalletSummary, getDashboardActivity } from "../../services/account";

const mapActivityType = (item) => {
  const type = item?.type || "";
  if (type === "purchase") return "order";
  if (type === "wallet_credit") return "credits";
  if (type === "wallet_debit") return "wallet";
  if (type === "address_update") return "address";
  if (type === "profile_update") return "profile";
  return "order";
};

const AccountHomePage = () => {
  const { profile } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const mockPromise = new Promise((resolve) => {
      setTimeout(() => {
        // TODO: Reemplazar mock por datos reales del backend (home insights)
        resolve({
          announcements: [
            {
              id: "ann-1",
              description: "Nuevo: ahora puedes canjear códigos promocionales en tu billetera.",
              cta: { label: "Ir a créditos", href: "/account/credits" },
              icon: "cxi-bell",
            },
            {
              id: "ann-2",
              description: "Lanzamos seguimiento mejorado para pedidos en camino.",
              cta: { label: "Ver más", href: "/account/orders" },
              icon: "cxi-car",
            },
            {
              id: "ann-3",
              description: "Nueva promoción disponible para tus categorías favoritas.",
              cta: { label: "Ver más", href: "/promociones" },
              icon: "cxi-star",
            },
          ],
          activeOrder: {
            id: "ORD-24A81F",
            status: "En camino",
            eta: "Entrega estimada: 2-3 días",
            stepIndex: 2,
          },
          monthlyInsight: {
            spent: 240.5,
            saved: 32.75,
            progress: 0.62,
            trend: "subio",
          },
          recommended: [
            { id: "p-1", name: "Sneakers Urbanos", price: 59.9, image: "https://via.placeholder.com/64" },
            { id: "p-2", name: "Chaqueta ligera", price: 89.5, image: "https://via.placeholder.com/64" },
            { id: "p-3", name: "Backpack premium", price: 42.0, image: "https://via.placeholder.com/64" },
            { id: "p-4", name: "Jeans slim fit", price: 39.9, image: "https://via.placeholder.com/64" },
          ],
        });
      }, 600);
    });

    Promise.all([mockPromise, getWalletSummary(), getDashboardActivity()])
      .then(([mockData, walletSummary, activityData]) => {
        if (!isMounted) return;
        const activityRows = Array.isArray(activityData?.data)
          ? activityData.data
          : Array.isArray(activityData)
          ? activityData
          : [];
        const mappedActivity = activityRows.map((item, index) => ({
          id: `${item?.orderNumber || item?.when || index}`,
          type: mapActivityType(item),
          label: item?.title || "Actividad",
          detail: item?.subtitle ||
            (item?.amount != null
              ? `${item.amount < 0 ? "-" : "+"}$${Math.abs(item.amount).toFixed(2)}`
              : ""),
          date: item?.label || "",
        }));

        const netValue = Number(walletSummary?.netThisMonth ?? 0);
        const spentValue = Number(walletSummary?.spentMonth ?? 0);
        const progressBase = Math.abs(netValue) + Math.abs(spentValue);
        const progress = progressBase > 0 ? Math.min(1, Math.abs(netValue) / progressBase) : 0;
        const trend = Number(walletSummary?.netChangePercent ?? 0) >= 0 ? "subio" : "bajo";

        setData({
          ...mockData,
          walletSummary,
          activity: mappedActivity,
          monthlyInsight: {
            spent: spentValue,
            saved: netValue,
            progress,
            trend,
          },
        });
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setData(null);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const heroData = useMemo(() => {
    return {
      name: profile?.name || "Usuario",
      credits: data?.walletSummary?.balance ?? 0,
      lastOrder: data?.activeOrder ?? null,
    };
  }, [profile, data]);

  if (loading) {
    return (
      <div className="account-home-grid">
        <Skeleton height={72} />
        <Skeleton height={160} />
        <Skeleton height={220} />
        <Skeleton height={220} />
        <Skeleton height={200} />
        <Skeleton height={200} />
        <Skeleton height={160} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="account-empty text-center">
        <p className="text-muted">No hay datos disponibles.</p>
        <a href="/catalogo" className="btn btn-primary">
          Explorar productos
        </a>
      </div>
    );
  }

  return (
    <div className="account-home-grid">
      <AccountAnnouncementSlider items={data.announcements} />
      <AccountHomeHero
        name={heroData.name}
        credits={heroData.credits}
        lastOrder={heroData.lastOrder}
        heroImage="/assets/img/ecommerce/subscribe-illustration.png"
        heroImageAlt="Ilustración de la tienda"
      />
      <ActivityTimeline items={data.activity} />
      <ActiveOrderTracker order={data.activeOrder} />
      <MonthlyInsightCard insight={data.monthlyInsight} />
      <RecommendedProductsWidget products={data.recommended} />
      <QuickActionTiles />
    </div>
  );
};

export default AccountHomePage;
