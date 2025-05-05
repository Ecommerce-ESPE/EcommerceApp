import {HeroSlider} from "../../components/hero-slider"
import {ProductCarousel} from "../../components/product-carousel"
import {CartShop} from "../../components/carshop"

export const HomeComponent = () =>{
    return(       
      <>
        <HeroSlider />
        <ProductCarousel />
        <CartShop />
      </>
    )
}