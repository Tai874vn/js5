import { render } from "../model/render.js";
import {
  themGH,
  renderCart,
  xoaGH,
  capNhatSoLuong,
  emptyCart,
} from "../model/cart.js";
import { fetchProducts } from "../model/fetch.js";

window.addToCart = async function (id) {
  const products = await fetchProducts();
  const selectedProduct = products.find((sp) => sp.id === id);
  if (selectedProduct) {
    themGH(selectedProduct);
  }
};

window.removeFromCart = function (id) {
  xoaGH(id);
};

window.updateQuantity = function (id, value) {
  const quantity = parseInt(value);
  if (quantity > 0) {
    capNhatSoLuong(id, quantity);
  }
};

window.emptyCart = function () {
  emptyCart();
};

document.addEventListener("DOMContentLoaded", () => {
  render();
  renderCart();

  document.getElementById("selectList").addEventListener("change", (e) => {
    const selectedBrand = e.target.value;
    render(selectedBrand);
  });

  const toggleCartBtns = document.querySelectorAll(".js-toggle-cart");
  const cart = document.querySelector(".cart");
  toggleCartBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      cart.classList.toggle("is-hidden");
    });
  });
});
