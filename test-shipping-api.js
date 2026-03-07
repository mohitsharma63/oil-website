// Test script for IThink Logistics shipping API
const fetch = require('node-fetch');

async function testShippingAPI() {
    const testCases = [
        { pincode: '302021', weight: 0.5, cod: false, productMrp: 325 },
        { pincode: '302021', weight: 1.5, cod: true, productMrp: 600 },
        { pincode: '110001', weight: 0.3, cod: false, productMrp: 400 },
        { pincode: '999999', weight: 2.5, cod: true, productMrp: 200 }
    ];

    for (const testCase of testCases) {
        try {
            const url = `http://localhost:8080/api/shipping/ithink/serviceability?deliveryPincode=${testCase.pincode}&weight=${testCase.weight}&cod=${testCase.cod}&productMrp=${testCase.productMrp}`;
            console.log(`\nTesting: ${JSON.stringify(testCase)}`);
            console.log(`URL: ${url}`);
            
            const response = await fetch(url);
            const data = await response.json();
            
            console.log('Response:', JSON.stringify(data, null, 2));
        } catch (error) {
            console.error(`Error for pincode ${testCase.pincode}:`, error.message);
        }
    }
}

// Test the validate-pincode endpoint as well
async function testValidatePincode() {
    try {
        const response = await fetch('http://localhost:8080/api/shipping/validate-pincode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pincode: '302021',
                city: 'Jaipur',
                state: 'Rajasthan'
            })
        });
        
        const data = await response.json();
        console.log('\nValidate Pincode Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error testing validate-pincode:', error.message);
    }
}

console.log('Testing IThink Logistics Shipping API...');
testShippingAPI().then(() => {
    console.log('\nTesting validate-pincode endpoint...');
    return testValidatePincode();
}).then(() => {
    console.log('\nAPI testing completed!');
}).catch(error => {
    console.error('Test failed:', error);
});
