const PaytmChecksum = require('./PaytmChecksum');
const https = require('https');
require('dotenv').config();

const initiateTransaction = (orderId, amount, customerId) => {
    return new Promise((resolve, reject) => {
        const paytmParams = {
            body: {
                requestType: "Payment",
                mid: process.env.PAYTM_MID,
                websiteName: "WEBSTAGING",
                orderId: orderId,
                callbackUrl: process.env.PAYTM_CALLBACK_URL,
                txnAmount: {
                    value: amount,
                    currency: "INR",
                },
                userInfo: {
                    custId: customerId,
                },
            },
        };

        PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), process.env.PAYTM_KEY).then((checksum) => {
            paytmParams.head = { signature: checksum };

            const post_data = JSON.stringify(paytmParams);

            const options = {
                hostname: 'securegw-stage.paytm.in',
                port: 443,
                path: `/theia/api/v1/initiateTransaction?mid=${process.env.PAYTM_MID}&orderId=${orderId}`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': post_data.length,
                },
            };

            let response = "";
            const req = https.request(options, (res) => {
                res.on('data', (chunk) => { response += chunk; });
                res.on('end', () => { resolve(JSON.parse(response)); });
            });

            req.on('error', reject);
            req.write(post_data);
            req.end();
        }).catch(reject);
    });
};

module.exports = { initiateTransaction };
