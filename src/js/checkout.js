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

const form = document.forms.checkout;
form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    try {
        const result = await cp.checkout(form);
        localStorage.removeItem("so-cart");
        alert("Order placed! Confirmation ID: " + (result?.id ?? "OK"));
        window.location.href = "/";
    } catch (err) {
        console.error(err);
        alert("Unable to place order. Please verify your info and try again.");
    }
});
