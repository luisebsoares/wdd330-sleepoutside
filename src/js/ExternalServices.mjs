export default class ExternalServices {
    constructor(baseURL = "https://wdd330-backend.onrender.com") {
        this.baseURL = baseURL;
    }

    async convertToJson(res) {
        const jsonResponse = await res.json().catch(() => null);
        if (res.ok) {
            return jsonResponse;
        } else {
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
