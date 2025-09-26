export default class ExternalServices {
    constructor(baseURL = "https://wdd330-backend.onrender.com") {
        this.baseURL = baseURL;
    }

    async convertToJson(res) {
        // Parse the body first so we can surface detailed error info if any
        const jsonResponse = await res.json().catch(() => null);
        if (res.ok) {
            return jsonResponse;
        } else {
            // Throw a custom object (per the assignment) with details in message
            throw {
                name: "servicesError",
                message: jsonResponse ?? { status: res.status, statusText: res.statusText },
            };
        }
    }

    async checkout(payload) {
        const url = `${this.baseURL}/checkout`;
        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        };
        const res = await fetch(url, options);
        return this.convertToJson(res);
    }
}
