import { getLocalStorage } from "./utils.mjs";

function renderCartContents() {
  const stored = getLocalStorage("so-cart");
  const cartItems = Array.isArray(stored) ? stored : [];

  const parent = document.querySelector(".product-list");
  if (!parent) {
    console.warn("cart.js: .product-list container not found.");
    return;
  }

  if (cartItems.length === 0) {
    parent.innerHTML = ""; // or show an empty-cart message if you want
    return;
  }

  const htmlItems = cartItems.map((item) => cartItemTemplate(item));
  document.querySelector(".product-list").innerHTML = htmlItems.join("");
}

function cartItemTemplate(item) {
  // Soft guards in case some fields are missing
  const img = item.Image ?? item.image ?? "";
  const name = item.Name ?? item.name ?? "Item";
  const color = item.Colors?.[0]?.ColorName ?? "";
  const price = item.FinalPrice ?? item.price ?? 0;

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