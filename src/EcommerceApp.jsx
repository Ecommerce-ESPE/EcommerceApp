import { tns } from 'tiny-slider';
import { AppRouter } from "./router/AppRouter"

export const EcommerceApp = () => {  
  window.tns = tns;
  return <AppRouter />;
};