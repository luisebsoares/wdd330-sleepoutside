import { getLocalStorage, setLocalStorage } from "./utils.mjs";
import ProductData from "./ProductData.mjs";

const dataSource = new ProductData("tents");

function addProductToCart(product) {
  const raw = getLocalStorage("so-cart");
  const cartItems = Array.isArray(raw) ? raw : [];   // normalize
  if (!Array.isArray(raw)) {
    // clean up any old bad shape
    setLocalStorage("so-cart", cartItems);
  }
  cartItems.push(product);
  setLocalStorage("so-cart", cartItems);
}
// add to cart button event handler
async function addToCartHandler(e) {
  const id = e.target?.dataset?.id;
  if (!id) return; // no id on the button
  const product = await dataSource.findProductById(id);
  if (!product) {
    console.error("Product not found for id:", id);
    return;
  }
  addProductToCart(product);
}

// ensure the button exists before adding listener
const btn = document.getElementById("addToCart");
if (btn) {
  btn.addEventListener("click", addToCartHandler);
} else {
  console.warn("#addToCart button not found in DOM");
}

// add listener to Add to Cart button
document
  .getElementById("addToCart")
  .addEventListener("click", addToCartHandler);
