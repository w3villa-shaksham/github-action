/**
 * app.js — frontend
 *
 * A small amount of vanilla JavaScript that talks to the JSON API.
 * No framework, no build step: just fetch() and a bit of DOM code.
 */

const API = '/api';

const els = {
  productList: document.getElementById('product-list'),
  productCount: document.getElementById('product-count'),
  categoryFilter: document.getElementById('category-filter'),
  cartItems: document.getElementById('cart-items'),
  cartCount: document.getElementById('cart-count'),
  cartTotal: document.getElementById('cart-total'),
  message: document.getElementById('message'),
};

let products = [];

/* Helpers ------------------------------------------------------------- */

function formatPrice(value) {
  return `$${value.toFixed(2)}`;
}

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body?.error?.message || `Request failed (${response.status})`);
  }

  return body;
}

function showMessage(text, type = 'success') {
  els.message.textContent = text;
  els.message.className = `message ${type}`;
  els.message.hidden = false;

  clearTimeout(showMessage.timer);
  showMessage.timer = setTimeout(() => {
    els.message.hidden = true;
  }, 3000);
}

/* Rendering ----------------------------------------------------------- */

function renderProducts() {
  const selected = els.categoryFilter.value;
  const visible =
    selected === 'all' ? products : products.filter((product) => product.category === selected);

  els.productCount.textContent = `${visible.length} product(s)`;

  if (visible.length === 0) {
    els.productList.innerHTML = '<p class="muted">No products in this category.</p>';
    return;
  }

  els.productList.innerHTML = visible
    .map(
      (product) => `
      <article class="product-card" data-product-id="${product.id}">
        <div class="product-image" aria-hidden="true">${product.image}</div>
        <span class="product-category">${product.category}</span>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-footer">
          <span class="product-price">${formatPrice(product.price)}</span>
          <button class="button add-to-cart" type="button" data-product-id="${product.id}">
            Add to cart
          </button>
        </div>
      </article>
    `,
    )
    .join('');
}

function renderCart(cart) {
  els.cartCount.textContent = cart.totalItems;
  els.cartTotal.textContent = formatPrice(cart.totalPrice);

  if (cart.items.length === 0) {
    els.cartItems.innerHTML = '<p class="muted">Your cart is empty.</p>';
    return;
  }

  els.cartItems.innerHTML = cart.items
    .map(
      (item) => `
      <div class="cart-row" data-product-id="${item.productId}">
        <span class="cart-row-emoji" aria-hidden="true">${item.image}</span>
        <div class="cart-row-info">
          <strong>${item.name}</strong>
          <small>${formatPrice(item.price)} each</small>
        </div>
        <span class="cart-quantity">x${item.quantity}</span>
        <strong>${formatPrice(item.lineTotal)}</strong>
        <button class="button-link remove-from-cart" type="button" data-product-id="${item.productId}">
          Remove
        </button>
      </div>
    `,
    )
    .join('');
}

/* Actions ------------------------------------------------------------- */

async function addToCart(productId) {
  try {
    const cart = await request('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity: 1 }),
    });

    renderCart(cart);
    showMessage(`Added product #${productId} to your cart.`);
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

async function removeFromCart(productId) {
  try {
    const cart = await request(`/cart/${productId}`, { method: 'DELETE' });
    renderCart(cart);
    showMessage(`Removed product #${productId} from your cart.`);
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

async function clearCart() {
  try {
    const cart = await request('/cart', { method: 'DELETE' });
    renderCart(cart);
    showMessage('Cart emptied.');
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

/* Events -------------------------------------------------------------- */

// One delegated listener for both "add" and "remove" buttons.
document.addEventListener('click', (event) => {
  const addButton = event.target.closest('.add-to-cart');
  if (addButton) {
    addToCart(Number(addButton.dataset.productId));
    return;
  }

  const removeButton = event.target.closest('.remove-from-cart');
  if (removeButton) {
    removeFromCart(Number(removeButton.dataset.productId));
    return;
  }

  if (event.target.id === 'clear-cart') {
    clearCart();
    return;
  }

  if (event.target.id === 'cart-button') {
    document.getElementById('cart').scrollIntoView({ behavior: 'smooth' });
  }
});

els.categoryFilter.addEventListener('change', renderProducts);

/* Start --------------------------------------------------------------- */

async function init() {
  try {
    const data = await request('/products');

    products = data.products;
    els.categoryFilter.innerHTML = [
      '<option value="all">All</option>',
      ...data.categories.map(
        (category) => `<option value="${category}">${category}</option>`,
      ),
    ].join('');

    renderProducts();
    renderCart(await request('/cart'));
  } catch (err) {
    els.productList.innerHTML = `<p class="message error">${err.message}</p>`;
  }
}

init();
