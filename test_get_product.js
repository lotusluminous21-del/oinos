const { getProduct } = require('./src/lib/shopify/client');

async function run() {
    try {
        const handle = "hb-body-εποξειδικό-αστάρι-σπρέι-γκρι-p981";
        console.log(`Testing getProduct with handle: "${handle}"`);
        const p = await getProduct(handle);
        if (p) {
            console.log("FOUND PRODUCT:", p.title);
        } else {
            console.log("PRODUCT NOT FOUND (returned undefined or null)");
        }
    } catch (e) {
        console.error("ERROR in getProduct:", e);
    }
}
run();
