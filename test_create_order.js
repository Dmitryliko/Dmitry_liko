const axios = require('axios');

const API_LOGIN = "95d5ce46963b47418e5b07543ec77fb4";
const BASE_URL = "https://api-ru.iiko.services";
const ORG_ID = "6fd820ff-65a0-40d6-8309-83d6425aaf2e";
const TERM_GROUP_ID = "16405536-0b9a-30e4-017e-dea16b460064";

// Czech Pie ID from mapping.js
const PRODUCT_ID = "4519eb01-8930-4538-a03d-fd84d9b6a7a3"; 
const SIZE_ID = "b4dd8e9b-832a-4ab9-8ddc-7f3a388d9ac8";
const SCHEMA_ID = "0d0d70f2-ce97-4f83-9ff4-0a49cc31029b";

async function run() {
    try {
        console.log("Authenticating...");
        const tokenRes = await axios.post(`${BASE_URL}/api/1/access_token`, { apiLogin: API_LOGIN });
        const token = tokenRes.data.token;

        const orderPayload = {
            organizationId: ORG_ID,
            terminalGroupId: TERM_GROUP_ID,
            order: {
                externalNumber: `TEST-${Date.now()}`,
                orderServiceType: "DeliveryByClient",
                phone: "+79000000000",
                customer: { name: "Test API Check" },
                items: [
                    {
                        type: "Product",
                        productId: PRODUCT_ID,
                        amount: 1,
                        price: 1610,
                        modifiers: [
                            {
                                productId: SIZE_ID,
                                amount: 1,
                                productGroupId: SCHEMA_ID
                            }
                        ]
                    }
                ]
            }
        };

        console.log("Sending Order Creation Request...");
        console.log(JSON.stringify(orderPayload, null, 2));

        const res = await axios.post(`${BASE_URL}/api/1/deliveries/create`, orderPayload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("\nSUCCESS!");
        console.log(JSON.stringify(res.data, null, 2));

    } catch (error) {
        console.error("\nFAILED!");
        console.error("Status:", error.response?.status);
        console.error("Data:", JSON.stringify(error.response?.data, null, 2));
    }
}

run();
