export let cart = loadCartFromStorage();

export class CartItem {
  constructor(id, name, price, img, quality = 1) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.img = img;
    this.quality = quality;
  }
}

export function themGH(product) {
  const index = timViTri(product.id);
  if (index !== -1) {
    cart[index].quality++;
  } else {
    const cartItem = new CartItem(
      product.id,
      product.name,
      product.price,
      product.img
    );
    cart.push(cartItem);
  }
  saveCartToStorage();
  renderCart();
}

export function timViTri(id) {
  return cart.findIndex((item) => item.id === id);
}

export function xoaGH(id) {
  cart = cart.filter((item) => item.id !== id);
  saveCartToStorage();
  renderCart();
}

export function capNhatSoLuong(id, sl) {
  const index = timViTri(id);
  if (index !== -1) {
    cart[index].quality = sl;
    saveCartToStorage();
    renderCart();
  }
}

export function emptyCart() {
  cart = [];
  saveCartToStorage();
  renderCart();
}

export function tinhTongTien() {
  return cart.reduce((sum, item) => sum + item.price * item.quality, 0);
}

export function renderCart() {
  const cartList = document.getElementById("cartList");
  const subTotal = document.getElementById("subTotal");
  const tax = document.getElementById("tax");
  const shipping = document.getElementById("shipping");
  const priceTotal = document.getElementById("priceTotal");
  const cartCount = document.getElementById("cartCount");

  if (!cartList) return;

  cartList.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-item d-flex justify-content-between align-items-center mb-3">
      <img src="${item.img}" alt="${item.name}" width="60" height="60" />
      <div class="flex-grow-1 ms-3">
        <h6>${item.name}</h6>
        <p>$${item.price} x ${item.quality}</p>
        <input type="number" value="${item.quality}" min="1" class="form-control form-control-sm w-50"
          onchange="updateQuantity('${item.id}', this.value)">
      </div>
      <button class="btn btn-danger btn-sm" onclick="removeFromCart('${item.id}')">
        <i class="fas fa-trash"></i>
      </button>
    </div>`
    )
    .join("");

  const subtotalValue = tinhTongTien();
  const taxValue = subtotalValue * 0.1;
  const shippingValue = subtotalValue > 0 ? 15 : 0;
  const totalValue = subtotalValue + taxValue + shippingValue;

  subTotal.innerText = `$${subtotalValue.toFixed(2)}`;
  tax.innerText = `$${taxValue.toFixed(2)}`;
  shipping.innerText = `$${shippingValue.toFixed(2)}`;
  priceTotal.innerText = `$${totalValue.toFixed(2)}`;
  cartCount.innerText = cart.length;
}

function saveCartToStorage() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function loadCartFromStorage() {
  const storedCart = localStorage.getItem("cart");
  return storedCart ? JSON.parse(storedCart) : [];
}
