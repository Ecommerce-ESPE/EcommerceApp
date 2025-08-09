import { Helmet } from "@dr.pogodin/react-helmet";

export default function SEOProduct({ product }) {
  if (!product || !product.slug || !product.name) {
    return null; // Evita renderizar si faltan datos importantes
  }

  const urlPublic = "https://ecommerce-app-two-tau.vercel.app";
  const url = `${urlPublic}/producto/${product.slug}`;
  const image = product.images;

  const description = (product.description || "Compra este producto en nuestra tienda online.")
    .replace(/<[^>]+>/g, "")
    .slice(0, 160);

  //console.log("SEOProduct renderizado con:", { product, url, image, description });
  return (
    <Helmet>
      {/* Título y descripción */}
      <title>{`${product.name} | Createx Shop`}</title>
      <meta name="description" content={description} />

      {/* Canonical */}
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={product.name} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="product" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={product.name} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Datos estructurados JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "Product",
          name: product.name,
          image: image,
          description: description,
          sku: product.sku || "N/A",
          brand: {
            "@type": "Brand",
            name: product.brand || "Genérica"
          },
          offers: {
            "@type": "Offer",
            url: url,
            priceCurrency: product.currency || "USD",
            price: product.price || "0.00",
            availability:
              product.stock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock"
          }
        })}
      </script>
    </Helmet>
  );
}
