// gsm.js - stand-in for the Arduino + GSM shield (requires Node 18+)
// Sends readings to the server over HTTP, exactly like the real Arduino will.

const SERVER_URL = 'http://localhost:3000/api/readings';

console.log("📡 [GSM SHIELD] Booting up... Connecting to network...");
console.log("✅ [GSM SHIELD] Connected. Starting data transmission...\n");

async function sendSensorData() {
    // Simulated sensor readings (replace with real Arduino data later)
    const temp = parseFloat((20 + Math.random() * 5).toFixed(1));
    const water = Math.floor(60 + Math.random() * 30);

    const data = { temperature: temp, waterLevel: water, source: 'gsm_sim' };

    try {
        const res = await fetch(SERVER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const time = new Date().toLocaleTimeString();
        if (res.ok) {
            console.log(`[${time}] 🚀 Sent via GSM -> Temp: ${temp}°C | Water: ${water}%`);
        } else {
            console.log(`[${time}] ⚠️ Server rejected data (status ${res.status})`);
        }
    } catch (err) {
        console.log(`❌ Could not reach server. Is server.js running? (${err.message})`);
    }
}

// Send every 5 seconds
setInterval(sendSensorData, 5000);
sendSensorData();