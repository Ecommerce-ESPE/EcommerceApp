import { tns } from 'tiny-slider';
import { AppRouter } from "./router/AppRouter"
import AnalyticsTracker from './Ecommerce/seo/analyticsTracker';

export const EcommerceApp = () => {  
  window.tns = tns;
  
  return (
    <>
      <AnalyticsTracker />
      <AppRouter />
    </>
  );
};