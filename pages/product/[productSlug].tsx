import type { ProductComponentType } from "src/types/shared";

const probe = require("probe-image-size");

import SEO from "@Components/common/SEO";
import ProductsGrid from "@Components/products/ProductsGrid";
import ShareButton from "@Components/common/ShareButton";
import ProductGallery from "@Components/products/ProductGallery";
import ProductCartForm from "@Components/products/ProductCartForm";
import ProductDetails from "@Components/products/ProductDetails";

import prisma from "@Lib/prisma";
import { NextPage } from "next";
import { getProductRatings } from "@Lib/helpers";
import RatingStars from "@Components/common/RatingStars";
import { currencyFormatter } from "@Lib/intl";

const ProductPage: NextPage<ProductPageType> = ({
  product,
  relatedProducts,
  imageDimensions,
}) => {
  const {
    id,
    title,
    gender,
    price,
    discount,
    sku,
    year,
    color,
    salesCount,
    stockQty,
    type,
    ratings,
  } = product;

  const cartPrice = (price - discount) * 1;
  const percentageOff = discount
    ? `${Math.floor((discount / price) * 100)}% off`
    : "";

  if (!product) {
    return <div></div>;
  }

  return (
    <>
      <SEO title={product.title} />

      <div className="product-view">
        <ProductGallery
          productId={id}
          images={product.mediaURLs}
          dimensions={imageDimensions}
        />

        <div className="product-view__cart">
          <h1 className="product-view__name">{title}</h1>
          <p className="product-view__gender">{gender}</p>
          <RatingStars count={ratings} />

          <div className="product-view__details">
            <p className="product-view__details-info">
              <strong>Model No.:</strong> {sku.toUpperCase()}
            </p>
            <p className="product-view__details-info">
              <strong>Release Year:</strong> {year}
            </p>
            <p className="product-view__details-info">
              <strong>Upper:</strong> {type.toLocaleLowerCase()} Cut
            </p>
            <p className="product-view__details-info">
              <strong>Colorway:</strong> {color}
            </p>
          </div>

          <p className="product-view__price">
            {currencyFormatter.format(cartPrice)} <span>{percentageOff}</span>
          </p>

          <p className="product-view__sold">
            {salesCount ?? 0} Sold &mdash; {stockQty} available in stock
          </p>

          <ProductCartForm product={product} />

          <ShareButton
            title={product.title}
            description={product.details}
            image={product.mediaURLs[0]}
            hashtags="#jonesstore"
          />
        </div>

        <ProductDetails product={product} />
      </div>

      <div className="related-products">
        {relatedProducts.length ? (
          <>
            <h2 className="related-products__heading">Related Products</h2>
            <ProductsGrid products={relatedProducts} />
          </>
        ) : null}
      </div>
    </>
  );
};

export const getServerSideProps = async function ({
  params,
}: {
  params: { productSlug: string };
}) {
  const { productSlug } = params;

  const sku = productSlug.substring(productSlug.length - 10).replace("-", " ");

  const product = await prisma.product.findFirst({
    where: { sku: { equals: sku, mode: "insensitive" } },
  });

  if (product) {
    const imageDimensions =
      (await Promise.all(
        product.mediaURLs.map(async (url) => await probe(url))
      ).catch(console.log)) ?? [];

    const productFinal = {
      ...product,
      dateAdded: product.dateAdded.toJSON(),
      ratings: await getProductRatings(prisma, product.id),
    };

    const relatedProducts = await Promise.all(
      (
        await prisma.product.findMany({
          where: {
            id: { not: product.id },
            gender: product.gender,
            type: product.type,
          },
          take: 4,
        })
      ).map(async (product) => ({
        ...product,
        ratings: await getProductRatings(prisma, product.id),
        dateAdded: product.dateAdded.toJSON(),
      }))
    );

    return {
      props: {
        product: productFinal,
        relatedProducts,
        imageDimensions,
      },
    };
  }

  return {
    notFound: true,
  };
};

export default ProductPage;

interface ProductPageType {
  product: ProductComponentType;
  relatedProducts: ProductComponentType[];
  imageDimensions: { width: number; height: number }[];
}