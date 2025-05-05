// IMPORTS
import { AppRouter } from "./router/AppRouter"
import { tns } from 'tiny-slider';

export const EcommerceApp = () => 
  {  
    window.tns = tns;
    return (
      <>
        <AppRouter/>
      </>
    );
  };
  