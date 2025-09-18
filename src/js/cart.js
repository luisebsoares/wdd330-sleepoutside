import { getLocalStorage, loadHeaderFooter } from "./utils.mjs";

loadHeaderFooter();

const CART_KEY = "so-cart";
const $ = (sel, root = document) => root.querySelector(sel);
const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}
function getCart() {
  return getLocalStorage(CART_KEY) || [];
}
function itemId(item) {
  return String(item.Id ?? item.id ?? item.SKU);
}

function pickProductImage(item) {
  const primary =
    item?.Images?.PrimaryLarge ||
    item?.Images?.PrimaryMedium ||
    item?.Images?.PrimarySmall;

  const colorPreview = item?.Colors?.[0]?.ColorPreviewImageSrc;

  const singleField = item?.Image;

  const alternate = item?.image || item?.img || item?.thumbnail;

  let src = primary || colorPreview || singleField || alternate;
  if (!src) return "/images/placeholder.svg";

  if (/^(https?:)?\/\//i.test(src) || /^data:/i.test(src)) return src;

  src = String(src).replace(/^(\.\/|(\.\.\/)+)/g, "");
  if (!src.startsWith("/")) src = `/${src}`;
  return src;
}

function cartItemTemplate(item) {
  const id = itemId(item);
  const qty = Number(item.Quantity ?? 1);
  const price = Number(item.FinalPrice) || 0;
  const lineTotal = price * qty;

  const imgSrc = pickProductImage(item);

  return `
  <li class="cart-card divider" data-id="${id}">
    <a href="#" class="cart-card__image">
      <img src="${imgSrc}" alt="${item.Name}" class="cart-img" />
    </a>
    <a href="#"><h2 class="card__name">${item.Name}</h2></a>
    <p class="cart-card__color">${item.Colors?.[0]?.ColorName ?? ""}</p>

    <div class="cart-qty">
      <button class="qty-btn dec" aria-label="Decrease quantity">−</button>
      <input class="qty-input" type="number" min="1" step="1" value="${qty}" inputmode="numeric" />
      <button class="qty-btn inc" aria-label="Increase quantity">+</button>
      <button class="remove-btn" aria-label="Remove item">Remove</button>
    </div>

    <p class="cart-card__price">${fmt(price)}</p>
    <p class="cart-card__line-total"><strong>${fmt(lineTotal)}</strong></p>
  </li>`;
}

function renderCartContents() {
  const cartItems = getCart();
  const list = $(".product-list");
  if (!list) return;

  list.innerHTML = cartItems.map(cartItemTemplate).join("");

  list.querySelectorAll("img.cart-img").forEach((img) => {
    img.addEventListener("error", () => {
      if (!img.dataset.fallback) {
        img.dataset.fallback = "1";
        img.src = "/images/placeholder.svg";
      }
    });
  });

  updateCartTotal(cartItems);
  toggleFooter(cartItems.length > 0);
}

function toggleFooter(show) {
  const footer = $(".list-footer");
  if (!footer) return;
  footer.classList.toggle("hide", !show);
}

function updateCartTotal(cartItems = getCart()) {
  const totalEl = $(".list-total");
  if (!totalEl) return;

  const total = cartItems.reduce((sum, item) => {
    const price = Number(item?.FinalPrice) || 0;
    const qty = Number(item?.Quantity ?? 1) || 1;
    return sum + price * qty;
  }, 0);

  totalEl.textContent = fmt(total);
}

function setItemQuantity(id, newQty) {
  let cart = getCart();
  const idx = cart.findIndex((it) => itemId(it) === String(id));
  if (idx === -1) return;

  const qty = Math.max(0, Number(newQty) || 0);
  if (qty === 0) {
    cart.splice(idx, 1);
  } else {
    cart[idx].Quantity = qty;
  }

  saveCart(cart);
  renderCartContents();
}

function removeFromCart(id) {
  const cart = getCart().filter((it) => itemId(it) !== String(id));
  saveCart(cart);
  renderCartContents();
}

function onListClick(e) {
  const li = e.target.closest("li.cart-card");
  if (!li) return;
  const id = li.dataset.id;

  if (e.target.matches(".qty-btn.inc")) {
    const input = li.querySelector(".qty-input");
    setItemQuantity(id, Number(input.value || 1) + 1);
  }

  if (e.target.matches(".qty-btn.dec")) {
    const input = li.querySelector(".qty-input");
    setItemQuantity(id, Number(input.value || 1) - 1);
  }

  if (e.target.matches(".remove-btn")) {
    removeFromCart(id);
  }
}

function onListInput(e) {
  if (!e.target.matches(".qty-input")) return;
  const li = e.target.closest("li.cart-card");
  if (!li) return;
  const id = li.dataset.id;

  const raw = e.target.value;
  const val = raw === "" ? "" : Number(raw);
  if (raw === "" || Number.isNaN(val)) return;

  if (val <= 0) removeFromCart(id);
  else setItemQuantity(id, val);
}

function onListBlur(e) {
  if (!e.target.matches(".qty-input")) return;
  const li = e.target.closest("li.cart-card");
  if (!li) return;
  const id = li.dataset.id;

  let val = Number(e.target.value);
  if (!val || val < 1) val = 1;
  setItemQuantity(id, val);
}

function initCartPage() {
  const list = $(".product-list");
  if (!list) return;

  list.addEventListener("click", onListClick);
  list.addEventListener("input", onListInput);
  list.addEventListener("blur", onListBlur, true);

  renderCartContents();
}

initCartPage();
