import React from 'react';

const ProductDetails = ({ product }) => {
  const {
    description = 'Sin descripción disponible.',
    details = [],
    fabric = [],
    care = [],
    images = [],
    rating = 0,
    name = 'Producto sin nombre',
    price = 0,
    originalPrice = null,
    sizes = [],
    colors = [],
    _id = 'sin-id',
  } = product || {};

  return (
    <section className="container my-lg-2 py-2 py-md-4">
      <div className="row">
        <div className="col-lg-7 col-md-8 mb-md-0 mb-4">
          {/* Details Section */}
          <h3 className="h5 mb-3">Detalles</h3>
          <p>{description}</p>
          {Array.isArray(details) && details.length > 0 ? (
            <ul className="pl-3">
              {details.map((detail, index) => (
                <li key={index} className="mb-1">{detail}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No hay detalles adicionales.</p>
          )}

          <hr className="my-4" />

          {/* Fabric Section */}
          <h3 className="h5 mb-3">Material</h3>
          {Array.isArray(fabric) && fabric.length > 0 ? (
            <ul className="pl-3">
              {fabric.map((item, index) => (
                <li key={index} className="mb-1">{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">Sin información de materiales.</p>
          )}

          <hr className="my-4" />

          {/* Care Instructions */}
          <h3 className="h5 mb-3">Cuidado</h3>
          {Array.isArray(care) && care.length > 0 ? (
            <ul className="pl-0">
              {care.map((item, index) => (
                <li key={index} className="media mb-3">
                  <img
                    src={`../../assets/img/ecommerce/shop/single/care/${item.icon || 'default'}.svg`}
                    alt={item.text || 'instrucción'}
                    className="d-block mr-3"
                    width="24"
                  />
                  <div className="media-body pl-1">{item.text}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No hay instrucciones de cuidado disponibles.</p>
          )}
        </div>

        {/* Product Card */}
        <div className="col-md-4 offset-lg-1">
          <div className="card card-product">
            <div className="card-product-img">
              <div className="cs-carousel cs-controls-onhover">
                <a className="cs-carousel-inner">
                  <div>
                    <img
                      className="card-img-top"
                      src={images[0]?.imgUrl || images[0] || 'https://via.placeholder.com/300x300?text=Producto'}
                      alt={name}
                    />
                  </div>
                </a>
              </div>

              {/* Rating */}
              <div className="card-product-widgets-top">
                <div className="ml-auto star-rating">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`sr-star cxi-star-filled ${i < rating ? 'active' : ''}`}
                    ></i>
                  ))}
                </div>
              </div>

              {/* Wishlist */}
              <div className="card-product-widgets-bottom">
                <a className="btn-wishlist ml-auto" href="#" data-toggle="tooltip" data-placement="left" title="Add to wishlist"></a>
              </div>
            </div>

            <div className="card-body pb-2" style={{ backgroundColor: 'white' }}>
              <h3 className="card-product-title text-truncate mb-2">
                <a href="#" className="nav-link">{name}</a>
              </h3>
              <div className="d-flex align-items-center">
                <span className="h5 d-inline-block text-danger mb-0">${price.toFixed(2)}</span>
                {originalPrice && (
                  <del className="d-inline-block ml-2 pl-1 text-muted">${originalPrice.toFixed(2)}</del>
                )}
              </div>

              {/* Size & Color Selectors */}
              <div className="d-flex align-items-center mb-2 pb-1">
                <div className="mt-n2">
                  {sizes.slice(0, 3).map((size, index) => (
                    <div
                      key={index}
                      className="custom-control cs-custom-size-option cs-custom-size-option-sm custom-control-inline"
                    >
                      <input
                        type="radio"
                        className="custom-control-input"
                        name={`size-${_id}`}
                        id={`${size}-${_id}`}
                        defaultChecked={index === 0}
                      />
                      <label
                        htmlFor={`${size}-${_id}`}
                        className="cs-custom-option-label"
                      >
                        {size}
                      </label>
                    </div>
                  ))}
                </div>

                <div className="ml-auto">
                  {colors.slice(0, 3).map((color, index) => (
                    <div
                      key={index}
                      className="custom-control cs-custom-color-option cs-custom-color-option-sm custom-control-inline"
                    >
                      <input
                        type="radio"
                        className="custom-control-input"
                        name={`color-${_id}`}
                        id={`${color.id}-${_id}`}
                        defaultValue={color.name}
                        defaultChecked={index === 0}
                      />
                      <label
                        htmlFor={`${color.id}-${_id}`}
                        className="cs-custom-option-label"
                      >
                        <span
                          className="cs-color-swatch"
                          style={{ backgroundColor: color.hex }}
                        ></span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <button type="button" className="btn btn-primary btn-block">
                <i className="cxi-cart align-middle mt-n1 mr-2"></i>
                Añadir al carrito
              </button>
            </div>

            <div className="card-footer"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;
