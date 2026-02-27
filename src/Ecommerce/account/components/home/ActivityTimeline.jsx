import TruncatedText from "../TruncatedText";

const iconMap = {
  order: "cxi-bag",
  credits: "cxi-wallet",
  address: "cxi-map-pin-outline",
  wallet: "cxi-wallet",
  profile: "cxi-profile",
};

const ActivityTimeline = ({ items }) => {
  return (
    <div className="account-widget card account-card">
      <div className="card-body account-card-header border-bottom">
        <h5 className="mb-0">Actividad reciente</h5>
        <a href="/account/orders" className="btn btn-sm btn-outline-secondary">
          Ver historial
        </a>
      </div>
      <div className="card-body account-activity-list">
        {items.map((item, index) => (
          <div className="account-activity-item" key={item.id || `activity-${index}`}>
            <div className="account-activity-icon">
              <i className={iconMap[item.type] || "fas fa-bolt"}></i>
            </div>
            <div className="account-activity-content">
              <div className="account-activity-title">{item.label}</div>
              <div className="account-activity-detail">
                <TruncatedText text={item.detail} />
              </div>
            </div>
            <div className="account-activity-date">{item.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTimeline;
