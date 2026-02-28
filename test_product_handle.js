const { shopifyClient } = require('./src/lib/shopify/client');

async function test(handle) {
    const query = `
    query getProductByHandle($handle: String!) {
      product(handle: $handle) {
        title
        handle
      }
    }
  `;
    try {
        console.log(`Fetching from Storefront API with handle: "${handle}"`);
        const data = await shopifyClient.request(query, { variables: { handle } });
        console.log("Result:", JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error:", err);
    }
}

async function run() {
    await test("hb-body-%CE%B5%CF%80%CE%BF%CE%BE%CE%B5%CE%B9%CE%B4%CE%B9%CE%BA%CE%BF-%CE%B1%CF%83%CF%84%CE%B1%CF%81%CE%B9-%CF%83%CF%80%CF%81%CE%B5%CE%B9-%CE%B3%CE%BA%CF%81%CE%B9-p981");
    await test("hb-body-εποξειδικο-ασταρι-σπρει-γκρι-p981");
    await test("hb-body-εποξειδικό-αστάρι-σπρέι-γκρι-p981");
}
run();
