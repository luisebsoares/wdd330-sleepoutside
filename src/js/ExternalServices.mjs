export default class ExternalServices {
    constructor(baseURL = "https://wdd330-backend.onrender.com") {
        this.baseURL = baseURL;
    }

    async checkout(payload) {
        const url = `${this.baseURL}/checkout`;
        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        };
        const res = await fetch(url, options);
        if (!res.ok) {
            const txt = await res.text().catch(() => "");
            throw new Error(`Checkout failed: ${res.status} ${txt}`);
        }
        return res.json();
    }
}