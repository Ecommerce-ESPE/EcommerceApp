import { Link } from "react-router-dom";
import { useCheckout } from "./useCheckout";
import CheckoutSteps from "./CheckoutSteps";
import StepReview from "./StepReview";
import StepAddress from "./StepAddress";
import StepShipping from "./StepShipping";
import StepPayment from "./StepPayment";
import OrderSummary from "./OrderSummary";
import OrderResult from "./OrderResult";

export const Checkout = () => {
  const checkout = useCheckout();
  const {
    orderStatus,
    step,
    isAuthenticated,
    cart,
    selectedShipping,
    setSelectedShipping,
    locations,
    selectedProvince,
    setSelectedProvince,
    selectedCanton,
    setSelectedCanton,
    selectedParish,
    setSelectedParish,
    envio,
    //
    selectedAddressIndex,
    setSelectedAddressIndex,
    // TRANSACTION INFO
    transactionInfo,
    paymentError,
    paymentSuggestion,
    setOrderStatus,
    setPaymentError,
    setCheckoutStep
    
  } = checkout;

  // Si hay estado de orden, mostrar resultado
  if (orderStatus) {
    return (
      <OrderResult 
        orderStatus={orderStatus}
        transactionInfo={transactionInfo}
        paymentError={paymentError}
        paymentSuggestion={paymentSuggestion}
        setOrderStatus={setOrderStatus}
        setPaymentError={setPaymentError}
        setStep={setCheckoutStep}
      />
    );
  }


  // Si el carrito está vacío, mostrar mensaje
  if (cart.length === 0) {
    return (
      <section className="container py-5">
        <div className="card border-0 shadow">
          <div className="card-body text-center py-5">
            <i className="cxi-cart display-3 text-muted mb-3"></i>
            <h3 className="h4">Tu carrito está vacío</h3>
            <p className="text-muted mb-4">
              Parece que aún no has añadido productos a tu carrito
            </p>
            <Link to="/shop" className="btn btn-primary">
              <i className="cxi-arrow-left mr-2"></i>
              Volver a la tienda
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container pt-3 pt-md-4 pb-3 pb-sm-4 pb-lg-5 mb-4">
      <div className="row">
        <div className="col-lg-8 pr-lg-6">
          <h1 className="mb-4">Checkout</h1>
          {/* Alerta para usuarios no autenticados */}
          {!isAuthenticated && (
            <div className="alert alert-warning mb-4" role="alert">
              Estás comprando como invitado.{" "}
              <Link to="/login">Iniciar sesión</Link> para una experiencia más
              rápida.
            </div>
          )}

          {/* Contenido del paso actual */}
          {step === 1 && <StepReview {...checkout} />}
          {step === 2 && (
            <StepAddress
              {...checkout}
              locations={locations}
              selectedProvince={selectedProvince}
              setSelectedProvince={setSelectedProvince}
              selectedCanton={selectedCanton}
              setSelectedCanton={setSelectedCanton}
              selectedParish={selectedParish}
              setSelectedParish={setSelectedParish}
              selectedAddressIndex={selectedAddressIndex}
              setSelectedAddressIndex={setSelectedAddressIndex}
            />
          )}
          {step === 3 && (
            <StepShipping
              shippingOptions={envio}
              selectedShipping={selectedShipping}
              setSelectedShipping={setSelectedShipping}
            />
          )}
          {step === 4 && <StepPayment {...checkout} />}
          {/* Mostrar pasos del checkout */}
          <CheckoutSteps {...checkout} />
        </div>

        <aside className="col-lg-4">
          <div className="sidebar-sticky">
            <OrderSummary {...checkout} />
          </div>
        </aside>
      </div>
    </section>
  );
};
