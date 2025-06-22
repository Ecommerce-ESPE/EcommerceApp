import {HeroSlider} from "../../components/hero-slider"
import {ProductCarousel} from "../../components/product-carousel"
import {CartShop} from "../../components/carshop"
import {PromoBar} from "../../components/promo-bar"

export const HomeComponent = () =>{
    return(       
      <>
        <PromoBar />
        <HeroSlider />  
        <ProductCarousel />
        <CartShop />
      </>
    )
}