
const productFragment = `
  id
  title
  handle
  description
  descriptionHtml
  productType
  vendor
  featuredImage {
    url
    altText
    width
    width
    height
  }
  images(first: 20) {
    edges {
      node {
        url
        altText
        width
        height
      }
    }
  }
  priceRange {
    minVariantPrice {
      amount
      currencyCode
    }
    maxVariantPrice {
      amount
      currencyCode
    }
  }
  seo {
    title
    description
  }
  tags
  updatedAt
  options {
    id
    name
    values
  }
  variants(first: 250) {
    edges {
      node {
        id
        title
        availableForSale
        selectedOptions {
          name
          value
        }
        price {
          amount
          currencyCode
        }
        image {
          url
          altText
          width
          height
        }
      }
    }
  }
  metafields(identifiers: [
    {namespace: "pavlicevits", key: "finish"},
    {namespace: "pavlicevits", key: "coverage"},
    {namespace: "pavlicevits", key: "drying_time"},
    {namespace: "pavlicevits", key: "environment"},
    {namespace: "pavlicevits", key: "surfaces"},
    {namespace: "pavlicevits", key: "application_method"},
    {namespace: "pavlicevits", key: "features"},
    {namespace: "pavlicevits", key: "chemical_base"},
    {namespace: "pavlicevits", key: "category"},
    {namespace: "pavlicevits", key: "sequence_step"}
  ]) {
    id
    key
    namespace
    value
    type
  }
`;

export const cartFragment = `
  fragment cartFragment on Cart {
    id
    checkoutUrl
    totalQuantity
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
          attributes {
            key
            value
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              image {
                url
                altText
                width
                height
              }
              product {
                title
                handle
              }
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
      totalTaxAmount {
        amount
        currencyCode
      }
    }
    deliveryGroups(first: 1) {
      edges {
        node {
          id
          deliveryOptions {
            handle
            title
            description
            estimatedCost {
              amount
              currencyCode
            }
          }
          selectedDeliveryOption {
            handle
            title
            estimatedCost {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;


export const getCartQuery = `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      ...cartFragment
    }
  }
  ${cartFragment}
`;


export const getProductsQuery = `
  query getProducts($first: Int!, $sortKey: ProductSortKeys, $reverse: Boolean, $query: String) {
    products(first: $first, sortKey: $sortKey, reverse: $reverse, query: $query) {
      edges {
        node {
          ${productFragment}
        }
      }
    }
  }
`;

export const getProductByHandleQuery = `
  query getProductByHandle($handle: String!) {
    product(handle: $handle) {
      ${productFragment}
    }
  }
`;

export const getCollectionQuery = `
  query getCollection($handle: String!) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      seo {
        title
        description
      }
      updatedAt
      products(first: 100) {
        edges {
          node {
           ${productFragment}
          }
        }
      }
    }
  }
`;

export const getCollectionsQuery = `
  query getCollections {
    collections(first: 100) {
      edges {
        node {
          id
          title
          handle
          updatedAt
        }
      }
    }
  }
`;

export const getProductTypesQuery = `
  query getProductTypes {
    products(first: 250) {
      edges {
        node {
          productType
        }
      }
    }
  }
`;
