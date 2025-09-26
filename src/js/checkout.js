import { loadHeaderFooter } from "./utils.mjs";
import CheckoutProcess from "./CheckoutProcess.mjs";

loadHeaderFooter();

const cp = new CheckoutProcess("so-cart", ".order-summary");
cp.init();
cp.calculateOrderTotal();

const zip = document.querySelector("#zip");
zip?.addEventListener("input", () => cp.calculateOrderTotal());
zip?.addEventListener("blur", () => cp.calculateOrderTotal());

const submitBtn = document.querySelector("#checkoutSubmit");
if (submitBtn) submitBtn.disabled = (cp.list?.length ?? 0) === 0;

// Use a click handler, prevent default submit, validate, then attempt checkout
document.querySelector("#checkoutSubmit")?.addEventListener("click", async (e) => {
    e.preventDefault();
    const form = document.forms[0];
    if (!form) {
        console.error("Checkout form not found");
        return;
    }

    // Built-in HTML validation
    const ok = form.checkValidity();
    form.reportValidity();
    if (!ok) return;

    try {
        const result = await cp.checkout(form);
        // Success: clear cart and go to success page
        localStorage.removeItem("so-cart");
        window.location.href = "/checkout/success.html";
    } catch (err) {
        console.error("Checkout error:", err);
        // Prefer server-provided message if available
        const msg =
            typeof err?.message === "string"
                ? err.message
                : err?.message?.message || "Unable to place order. Please verify your info and try again.";
        alert(msg);
    }
});
