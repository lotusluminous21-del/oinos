'use server';

import { shopifyGraphql } from '@/lib/shopify/admin';

export async function fetchCustomerProfile(email: string) {
    if (!email) return null;

    const query = `
    query getCustomerData($query: String!) {
      customers(first: 1, query: $query) {
        edges {
          node {
            id
            firstName
            lastName
            email
            phone
            numberOfOrders
            amountSpent {
              amount
              currencyCode
            }
            defaultAddress {
              address1
              address2
              city
              province
              zip
              country
              company
            }
            addresses {
              address1
              address2
              city
              province
              zip
              country
              company
            }
            orders(first: 10, sortKey: CREATED_AT, reverse: true) {
              edges {
                node {
                  id
                  name
                  createdAt
                  displayFinancialStatus
                  displayFulfillmentStatus
                  totalPriceSet {
                    shopMoney {
                      amount
                      currencyCode
                    }
                  }
                  lineItems(first: 10) {
                    edges {
                      node {
                        name
                        quantity
                        image {
                          url
                          altText
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    `;

    try {
        const data = await shopifyGraphql(query, { query: `email:${email}` });
        const customers = data?.customers?.edges;
        if (customers && customers.length > 0) {
            return customers[0].node;
        }
        return null; // Return null if not found
    } catch (error) {
        console.error("Error fetching customer profile:", error);
        return null;
    }
}
