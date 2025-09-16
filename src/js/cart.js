import { getLocalStorage, loadHeaderFooter } from "./utils.mjs";

loadHeaderFooter();

function renderCartContents() {
  const stored = getLocalStorage("so-cart");
  const cartItems = Array.isArray(stored) ? stored : [];

  const parent = document.querySelector(".product-list");
  if (!parent) {
    console.warn("cart.js: .product-list container not found.");
    return;
  }

  if (cartItems.length === 0) {
    parent.innerHTML = "";
    const emptyMsg = document.querySelector(".cart-empty");
    if (emptyMsg) emptyMsg.style.display = "block";
    const total = document.querySelector(".cart-total");
    if (total) total.textContent = "$0.00";
    return;
  }

  const htmlItems = cartItems.map((item) => cartItemTemplate(item));
  parent.innerHTML = htmlItems.join("");

  const totalEl = document.querySelector(".cart-total");
  if (totalEl) {
    const total = cartItems.reduce((sum, p) => {
      const raw = p?.FinalPrice ?? p?.price ?? 0;
      const n = Number.isFinite(Number(raw)) ? Number(raw) : 0;
      return sum + n;
    }, 0);
    totalEl.textContent = `$${total.toFixed(2)}`;
  }

  const emptyMsg = document.querySelector(".cart-empty");
  if (emptyMsg) emptyMsg.style.display = "none";
}

function cartItemTemplate(item) {
  const img = item?.Image ?? item?.image ?? "";
  const name = item?.Name ?? item?.name ?? "Item";
  const color = item?.Colors?.[0]?.ColorName ?? item?.ColorName ?? item?.color ?? "";
  const rawPrice = item?.FinalPrice ?? item?.price ?? 0;
  const price = Number.isFinite(Number(rawPrice)) ? Number(rawPrice).toFixed(2) : "0.00";

  return `
<li class="cart-card divider">
  <a href="#" class="cart-card__image">
    <img src="${img}" alt="${name}" />
  </a>
  <a href="#"><h2 class="card__name">${name}</h2></a>
  <p class="cart-card__color">${color}</p>
  <p class="cart-card__quantity">qty: 1</p>
  <p class="cart-card__price">$${price}</p>
</li>`;
}

renderCartContents();
