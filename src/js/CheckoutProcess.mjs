import {
    setLocalStorage,
    getLocalStorage,
    alertMessage,
    removeAllAlerts,
} from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";


const services = new ExternalServices();

function formDataToJSON(formElement) {
    const formData = new FormData(formElement);
    const out = {};
    formData.forEach((value, key) => (out[key] = String(value).trim()));
    return out;
}

function safeId(item) {
    return String(item.Id ?? item.id ?? item.SKU ?? "");
}

function packageItems(items) {
    return (items || []).map((item) => ({
        id: safeId(item),
        price: Number(item.FinalPrice) || 0,
        name: item.Name ?? item.NameWithoutBrand ?? "Item",
        quantity: Number(item.Quantity ?? 1) || 1,
    }));
}

export default class CheckoutProcess {
    constructor(key = "so-cart", outputSelector = ".order-summary") {
        this.key = key;
        this.outputSelector = outputSelector;
        this.list = [];
        this.itemTotal = 0;
        this.shipping = 0;
        this.tax = 0;
        this.orderTotal = 0;
    }

    init() {
        this.list = getLocalStorage(this.key) || [];
        this.calculateItemSummary();
    }

    /* ========== calculations ========== */
    totalQuantity() {
        return this.list.reduce((n, item) => n + (Number(item?.Quantity ?? 1) || 1), 0);
    }

    calculateItemSummary() {
        const summaryEl = document.querySelector(`${this.outputSelector} #cartTotal`);
        const itemsEl = document.querySelector(`${this.outputSelector} #num-items`);

        this.itemTotal = this.list.reduce((sum, item) => {
            const price = Number(item?.FinalPrice) || 0;
            const qty = Number(item?.Quantity ?? 1) || 1;
            return sum + price * qty;
        }, 0);

        const itemCount = this.totalQuantity();

        if (itemsEl) itemsEl.innerText = String(itemCount);
        if (summaryEl) summaryEl.innerText = `$${this.itemTotal.toFixed(2)}`;
    }

    calculateOrderTotal() {
        //   Tax = 6% of subtotal
        //   Shipping = $10 for first item + $2 for each additional item
        const qty = this.totalQuantity();
        this.tax = this.itemTotal * 0.06;
        this.shipping = qty > 0 ? 10 + Math.max(0, qty - 1) * 2 : 0;

        this.orderTotal = this.itemTotal + this.tax + this.shipping;

        this.displayOrderTotals();
    }

    displayOrderTotals() {
        const taxEl = document.querySelector(`${this.outputSelector} #tax`);
        const shipEl = document.querySelector(`${this.outputSelector} #shipping`);
        const totalEl = document.querySelector(`${this.outputSelector} #orderTotal`);

        if (taxEl) taxEl.innerText = `$${this.tax.toFixed(2)}`;
        if (shipEl) shipEl.innerText = `$${this.shipping.toFixed(2)}`;
        if (totalEl) totalEl.innerText = `$${this.orderTotal.toFixed(2)}`;
    }

    async checkout(formElement = document.forms["checkout"]) {
        if (!formElement) throw new Error("Checkout form not found.");

        if (!this.orderTotal) this.calculateOrderTotal();

        const order = formDataToJSON(formElement);
        order.orderDate = new Date().toISOString();
        order.orderTotal = Number(this.orderTotal.toFixed(2));
        order.tax = Number(this.tax.toFixed(2));
        order.shipping = Number(this.shipping.toFixed(2));
        order.items = packageItems(this.list);

        try {
            const response = await services.checkout(order);
            return response;
        } catch (err) {
            throw err;
        }
    }
}