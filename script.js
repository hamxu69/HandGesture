/* ══════════════════════════════════════════════
   LUMIÈRE JEWELLERY — script.js
   ══════════════════════════════════════════════ */

/* ──────────────────────────────────────────────
   CONFIG — change these to customise the shop
   ────────────────────────────────────────────── */
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'lumiere123';
const WHATSAPP_NUMBER = '923001234567'; // format: country code + number, no +
const FREE_SHIPPING_THRESHOLD = 5000;  // PKR
const SHIPPING_COST = 250;             // PKR if below threshold

/* ──────────────────────────────────────────────
   DEFAULT DATA — shown on first load
   ────────────────────────────────────────────── */
const DEFAULT_DATA = {
  categories: [
    { id: 'c1', name: 'Rings',     emoji: '💍' },
    { id: 'c2', name: 'Necklaces', emoji: '📿' },
    { id: 'c3', name: 'Earrings',  emoji: '✨' },
    { id: 'c4', name: 'Bracelets', emoji: '⚜️' },
  ],
  products: [
    {
      id: 'p1', name: 'Celestial Ring',
      catId: 'c1', price: 6500, stock: 8,
      emoji: '💍', image: '',
      material: '18k Gold',
      desc: 'A delicate stacking ring inspired by the night sky. Adorned with a single diamond accent.',
      featured: true
    },
    {
      id: 'p2', name: 'Pearl Drop Necklace',
      catId: 'c2', price: 8200, stock: 5,
      emoji: '📿', image: '',
      material: 'Sterling Silver + Pearl',
      desc: 'Freshwater pearl suspended on a fine 925 sterling silver chain. Elegant simplicity.',
      featured: true
    },
    {
      id: 'p3', name: 'Hoop Earrings',
      catId: 'c3', price: 4200, stock: 15,
      emoji: '✨', image: '',
      material: '18k Gold Plated',
      desc: 'Minimalist gold hoops — the perfect everyday essential.',
      featured: true
    },
    {
      id: 'p4', name: 'Tennis Bracelet',
      catId: 'c4', price: 12000, stock: 3,
      emoji: '⚜️', image: '',
      material: 'White Gold + CZ',
      desc: 'Classic tennis bracelet with cubic zirconia stones set in white gold.',
      featured: false
    },
    {
      id: 'p5', name: 'Solitaire Ring',
      catId: 'c1', price: 9800, stock: 4,
      emoji: '💎', image: '',
      material: 'Platinum + Diamond',
      desc: 'Timeless solitaire setting with a round brilliant cut diamond.',
      featured: false
    },
    {
      id: 'p6', name: 'Layered Chain',
      catId: 'c2', price: 5600, stock: 10,
      emoji: '🔗', image: '',
      material: 'Gold Vermeil',
      desc: 'Two-layer delicate chains sold as a set — effortless layered look.',
      featured: true
    },
  ],
  orders: [],
  cart: []
};

/* ──────────────────────────────────────────────
   DATABASE — localStorage persistence
   ────────────────────────────────────────────── */
let DB = {};

function loadDB() {
  const saved = localStorage.getItem('lumiere_db');
  DB = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(DEFAULT_DATA));
}

function saveDB() {
  localStorage.setItem('lumiere_db', JSON.stringify(DB));
}

loadDB();

/* ──────────────────────────────────────────────
   VIEW MANAGEMENT
   ────────────────────────────────────────────── */
let currentView = 'home';
let prevView    = 'home';

function showView(v) {
  if (v !== 'product') prevView = currentView;

  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  document.getElementById('view-' + v).classList.add('active');
  currentView = v;
  window.scrollTo(0, 0);

  // Render the relevant section
  if (v === 'home')       { renderCategories(); renderFeatured(); }
  if (v === 'shop')       { renderShopProducts(); }
  if (v === 'cart')       { renderCart(); }
  if (v === 'order')      { renderOrderPreview(); }
  if (v === 'admin')      { renderAdmin(); }
  if (v === 'adminlogin') {
    document.getElementById('loginUser').value = '';
    document.getElementById('loginPass').value = '';
    document.getElementById('loginError').style.display = 'none';
  }

  updateCartBadge();
}

function showAdminLogin() {
  const logged = sessionStorage.getItem('lumiere_admin');
  if (logged) showView('admin');
  else showView('adminlogin');
}

function goBackFromProduct() {
  showView(prevView === 'home' ? 'home' : 'shop');
}

/* ──────────────────────────────────────────────
   AUTH
   ────────────────────────────────────────────── */
function doLogin() {
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value.trim();
  if (u === ADMIN_USER && p === ADMIN_PASS) {
    sessionStorage.setItem('lumiere_admin', '1');
    showView('admin');
  } else {
    document.getElementById('loginError').style.display = 'block';
  }
}

/* ──────────────────────────────────────────────
   TOAST
   ────────────────────────────────────────────── */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

/* ──────────────────────────────────────────────
   IMAGE HELPERS
   Converts uploaded file → base64 string for storage.
   Returns a rendered <img> or the emoji as fallback.
   ────────────────────────────────────────────── */

// Temp storage for the image being uploaded in the modal
let _pendingImage = '';

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // 5MB limit
  if (file.size > 5 * 1024 * 1024) {
    showToast('Image too large — max 5MB');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    _pendingImage = e.target.result; // base64 data URL
    showImagePreview(_pendingImage);
  };
  reader.readAsDataURL(file);
}

function showImagePreview(src) {
  const area        = document.getElementById('imgUploadArea');
  const placeholder = document.getElementById('imgUploadPlaceholder');
  const preview     = document.getElementById('imgPreview');
  const removeBtn   = document.getElementById('imgRemoveBtn');

  preview.src = src;
  preview.classList.add('visible');
  placeholder.style.display = 'none';
  area.classList.add('has-image');
  removeBtn.style.display = 'block';
}

function clearImagePreview() {
  const area        = document.getElementById('imgUploadArea');
  const placeholder = document.getElementById('imgUploadPlaceholder');
  const preview     = document.getElementById('imgPreview');
  const removeBtn   = document.getElementById('imgRemoveBtn');
  const fileInput   = document.getElementById('imgFileInput');

  preview.src = '';
  preview.classList.remove('visible');
  placeholder.style.display = 'flex';
  area.classList.remove('has-image');
  removeBtn.style.display = 'none';
  fileInput.value = '';
  _pendingImage = '';
}

function removeImage(e) {
  e.stopPropagation(); // prevent upload area click
  clearImagePreview();
}

/**
 * Returns HTML for a product image:
 * - <img> tag if the product has a stored base64 image
 * - emoji text as fallback
 */
function productImageHTML(product, wrapperClass = '') {
  if (product.image) {
    return `<img src="${product.image}" alt="${product.name}" loading="lazy">`;
  }
  return product.emoji || '💎';
}

/* ──────────────────────────────────────────────
   CART
   ────────────────────────────────────────────── */
function updateCartBadge() {
  const total = DB.cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cartBadge').textContent = total;
}

function addToCart(productId) {
  const exists = DB.cart.find(i => i.productId === productId);
  if (exists) exists.qty++;
  else DB.cart.push({ productId, qty: 1 });
  saveDB();
  updateCartBadge();
  showToast('Added to bag ✦');
}

function addToCartFromDetail() {
  const pid = document.getElementById('pdName').dataset.id;
  addToCart(pid);
}

function renderCart() {
  const el = document.getElementById('cartContent');

  if (DB.cart.length === 0) {
    el.innerHTML = `
      <div class="cart-empty">
        <span class="cart-empty-icon">✦</span>
        <p>Your bag is empty.<br>Discover our collection.</p>
        <button class="btn-primary" style="max-width:220px;margin:0 auto" onclick="showView('shop')">Shop Now</button>
      </div>`;
    return;
  }

  let html = '';
  let subtotal = 0;

  DB.cart.forEach(item => {
    const p = DB.products.find(x => x.id === item.productId);
    if (!p) return;
    const line = p.price * item.qty;
    subtotal += line;

    const imgContent = p.image
      ? `<img src="${p.image}" alt="${p.name}">`
      : (p.emoji || '💎');

    html += `
      <div class="cart-item">
        <div class="cart-item-img">${imgContent}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-price">PKR ${p.price.toLocaleString()}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="changeQty('${p.id}', -1)">−</button>
            <span class="qty-display">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty('${p.id}', 1)">+</button>
            <button class="remove-btn" onclick="removeFromCart('${p.id}')">Remove</button>
          </div>
        </div>
      </div>`;
  });

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total    = subtotal + shipping;

  html += `
    <div class="cart-summary">
      <div class="summary-row"><span>Subtotal</span><span>PKR ${subtotal.toLocaleString()}</span></div>
      <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? 'Free' : 'PKR ' + shipping}</span></div>
      <div class="summary-row summary-total"><span>Total</span><span>PKR ${total.toLocaleString()}</span></div>
    </div>
    <div class="cart-actions">
      <button class="btn-primary" onclick="showView('order')">Proceed to Order</button>
      <button class="btn-outline" onclick="showView('shop')">Continue Shopping</button>
    </div>`;

  el.innerHTML = html;
}

function changeQty(pid, delta) {
  const item = DB.cart.find(i => i.productId === pid);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) DB.cart = DB.cart.filter(i => i.productId !== pid);
  saveDB();
  updateCartBadge();
  renderCart();
}

function removeFromCart(pid) {
  DB.cart = DB.cart.filter(i => i.productId !== pid);
  saveDB();
  updateCartBadge();
  renderCart();
}

/* ──────────────────────────────────────────────
   HOME — Categories & Featured
   ────────────────────────────────────────────── */
function renderCategories() {
  const el = document.getElementById('categoriesGrid');
  el.innerHTML = DB.categories.map(c => {
    const count = DB.products.filter(p => p.catId === c.id).length;
    return `
      <div class="cat-card" onclick="filterShopByCat('${c.id}')">
        <span class="cat-icon">${c.emoji}</span>
        <span class="cat-name">${c.name}</span>
        <span class="cat-count">${count} piece${count !== 1 ? 's' : ''}</span>
      </div>`;
  }).join('');
}

function renderFeatured() {
  const el = document.getElementById('featuredGrid');
  const featured = DB.products.filter(p => p.featured).slice(0, 4);
  el.innerHTML = featured.map(p => productCardHTML(p)).join('');
}

function filterShopByCat(catId) {
  window._shopFilter = catId;
  showView('shop');
}

/* ──────────────────────────────────────────────
   SHOP — Filters & Grid
   ────────────────────────────────────────────── */
function renderShopFilters() {
  const el = document.getElementById('shopFilters');
  const active = window._shopFilter || 'all';
  let html = `<button class="filter-btn ${active === 'all' ? 'active' : ''}" onclick="setFilter('all')">All</button>`;
  DB.categories.forEach(c => {
    html += `<button class="filter-btn ${active === c.id ? 'active' : ''}" onclick="setFilter('${c.id}')">${c.name}</button>`;
  });
  el.innerHTML = html;
}

function setFilter(id) {
  window._shopFilter = id;
  renderShopProducts();
}

function renderShopProducts() {
  renderShopFilters();
  const filter = window._shopFilter || 'all';
  const query  = (document.getElementById('searchInput') || {}).value?.toLowerCase() || '';

  let products = DB.products;
  if (filter !== 'all') products = products.filter(p => p.catId === filter);
  if (query) products = products.filter(p =>
    p.name.toLowerCase().includes(query) ||
    (p.material || '').toLowerCase().includes(query)
  );

  const el = document.getElementById('shopGrid');
  const nr = document.getElementById('noResults');

  if (products.length === 0) {
    el.innerHTML = '';
    nr.style.display = 'block';
  } else {
    nr.style.display = 'none';
    el.innerHTML = products.map(p => productCardHTML(p)).join('');
  }
}

/* ──────────────────────────────────────────────
   PRODUCT CARD HTML
   ────────────────────────────────────────────── */
function productCardHTML(p) {
  const cat = DB.categories.find(c => c.id === p.catId);

  // Image or emoji in the card thumbnail
  const imgInner = p.image
    ? `<img src="${p.image}" alt="${p.name}" loading="lazy">`
    : (p.emoji || '💎');

  return `
    <div class="product-card" onclick="showProduct('${p.id}')">
      <div class="product-img">${imgInner}</div>
      ${p.featured ? '<div class="product-badge">New</div>' : ''}
      <div class="product-info">
        <div class="product-category">${cat ? cat.name : ''}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-price">PKR ${p.price.toLocaleString()}</div>
      </div>
    </div>`;
}

/* ──────────────────────────────────────────────
   PRODUCT DETAIL PAGE
   ────────────────────────────────────────────── */
function showProduct(id) {
  const p   = DB.products.find(x => x.id === id);
  if (!p) return;
  const cat = DB.categories.find(c => c.id === p.catId);

  // Detail image — real photo or big emoji
  const pdImgEl = document.getElementById('pdImage');
  if (p.image) {
    pdImgEl.innerHTML = `<img src="${p.image}" alt="${p.name}">`;
  } else {
    pdImgEl.textContent = p.emoji || '💎';
  }

  const nameEl = document.getElementById('pdName');
  nameEl.textContent = p.name;
  nameEl.dataset.id  = p.id;

  document.getElementById('pdCat').textContent   = cat ? cat.name : '';
  document.getElementById('pdPrice').textContent = 'PKR ' + p.price.toLocaleString();
  document.getElementById('pdDesc').textContent  = p.desc || 'A beautifully crafted piece from our collection.';

  document.getElementById('pdMeta').innerHTML = `
    <div class="meta-row">
      <span class="meta-label">Material</span>
      <span class="meta-value">${p.material || 'N/A'}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Availability</span>
      <span class="meta-value" style="color:${p.stock > 0 ? 'green' : 'red'}">
        ${p.stock > 0 ? 'In Stock (' + p.stock + ' left)' : 'Out of Stock'}
      </span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Category</span>
      <span class="meta-value">${cat ? cat.name : ''}</span>
    </div>`;

  showView('product');
}

/* ──────────────────────────────────────────────
   ORDER
   ────────────────────────────────────────────── */
function renderOrderPreview() {
  const el = document.getElementById('orderItemsPreview');
  let html  = '';
  let total = 0;

  DB.cart.forEach(item => {
    const p = DB.products.find(x => x.id === item.productId);
    if (!p) return;
    const line = p.price * item.qty;
    total += line;
    html += `
      <div class="order-item-row">
        <span>${p.emoji || '💎'} ${p.name} × ${item.qty}</span>
        <span style="font-weight:500">PKR ${line.toLocaleString()}</span>
      </div>`;
  });

  const shipping = total >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  html += `
    <div class="order-item-row" style="margin-top:6px">
      <span style="font-weight:500">Total (incl. shipping)</span>
      <span style="font-weight:500;color:var(--gold)">PKR ${(total + shipping).toLocaleString()}</span>
    </div>`;

  el.innerHTML = html;
}

function placeOrder() {
  const name    = document.getElementById('fname').value.trim();
  const phone   = document.getElementById('fphone').value.trim();
  const address = document.getElementById('faddress').value.trim();
  const city    = document.getElementById('fcity').value.trim();

  if (!name || !phone || !address || !city) {
    showToast('Please fill all required fields');
    return;
  }

  const ref   = 'LM-' + Date.now().toString().slice(-6);
  const total = DB.cart.reduce((s, i) => {
    const p = DB.products.find(x => x.id === i.productId);
    return s + (p ? p.price * i.qty : 0);
  }, 0);

  const order = {
    id:      ref,
    name,
    phone,
    email:   document.getElementById('femail').value.trim(),
    address: `${address}, ${document.getElementById('farea').value.trim()}, ${city}`,
    notes:   document.getElementById('fnotes').value.trim(),
    items:   DB.cart.map(i => {
      const p = DB.products.find(x => x.id === i.productId);
      return { name: p ? p.name : '', price: p ? p.price : 0, qty: i.qty };
    }),
    total,
    status: 'pending',
    date:   new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
  };

  DB.orders.unshift(order);
  DB.cart = [];
  saveDB();

  document.getElementById('successRef').textContent = 'Order #' + ref;
  showView('success');
  updateCartBadge();
}

/* ──────────────────────────────────────────────
   ADMIN — Dashboard
   ────────────────────────────────────────────── */
function renderAdmin() {
  renderAdminDashboard();
}

function renderAdminDashboard() {
  const totalOrders = DB.orders.length;
  const pending     = DB.orders.filter(o => o.status === 'pending').length;
  const revenue     = DB.orders.reduce((s, o) => s + o.total, 0);

  document.getElementById('statsGrid').innerHTML = `
    <div class="admin-stat">
      <span class="admin-stat-num">${DB.products.length}</span>
      <span class="admin-stat-label">Products</span>
    </div>
    <div class="admin-stat">
      <span class="admin-stat-num">${totalOrders}</span>
      <span class="admin-stat-label">Orders</span>
    </div>
    <div class="admin-stat">
      <span class="admin-stat-num">${pending}</span>
      <span class="admin-stat-label">Pending</span>
    </div>
    <div class="admin-stat">
      <span class="admin-stat-num" style="font-size:20px">PKR ${revenue.toLocaleString()}</span>
      <span class="admin-stat-label">Revenue</span>
    </div>`;

  const recent = DB.orders.slice(0, 3);
  document.getElementById('recentOrdersAdmin').innerHTML = recent.length
    ? recent.map(o => orderAdminCardHTML(o)).join('')
    : `<div class="admin-card" style="text-align:center;color:var(--gray);font-size:14px;padding:32px">No orders yet.</div>`;
}

function switchAdminTab(tab, btn) {
  document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.getElementById('admin-' + tab).classList.add('active');

  if (tab === 'products')   renderAdminProducts();
  if (tab === 'categories') renderAdminCategories();
  if (tab === 'orders')     renderAdminOrders();
  if (tab === 'dashboard')  renderAdminDashboard();
}

/* ──────────────────────────────────────────────
   ADMIN — Products List
   ────────────────────────────────────────────── */
function renderAdminProducts() {
  const el = document.getElementById('productsList');

  if (DB.products.length === 0) {
    el.innerHTML = `<div class="admin-card" style="text-align:center;color:var(--gray);font-size:14px;padding:32px">No products yet. Add your first product!</div>`;
    return;
  }

  el.innerHTML = DB.products.map(p => {
    const cat       = DB.categories.find(c => c.id === p.catId);
    const imgThumb  = p.image
      ? `<img src="${p.image}" alt="${p.name}">`
      : (p.emoji || '💎');

    return `
      <div class="admin-card">
        <div class="admin-product-row">
          <div class="admin-product-img">${imgThumb}</div>
          <div class="admin-product-info">
            <div class="admin-product-name">${p.name}</div>
            <div class="admin-product-meta">PKR ${p.price.toLocaleString()} · ${cat ? cat.name : '—'} · Stock: ${p.stock}</div>
          </div>
          <div class="admin-actions">
            <button class="admin-btn-sm" onclick="editProduct('${p.id}')">Edit</button>
            <button class="admin-btn-sm danger" onclick="deleteProduct('${p.id}')">Del</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

/* ──────────────────────────────────────────────
   ADMIN — Categories List
   ────────────────────────────────────────────── */
function renderAdminCategories() {
  const el = document.getElementById('categoriesList');
  el.innerHTML = DB.categories.map(c => {
    const count = DB.products.filter(p => p.catId === c.id).length;
    return `
      <div class="admin-card">
        <div class="admin-product-row">
          <div class="admin-product-img" style="font-size:28px">${c.emoji}</div>
          <div class="admin-product-info">
            <div class="admin-product-name">${c.name}</div>
            <div class="admin-product-meta">${count} product${count !== 1 ? 's' : ''}</div>
          </div>
          <div class="admin-actions">
            <button class="admin-btn-sm danger" onclick="deleteCategory('${c.id}')">Delete</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

/* ──────────────────────────────────────────────
   ADMIN — Orders List
   ────────────────────────────────────────────── */
function renderAdminOrders() {
  const el  = document.getElementById('ordersList');
  const cnt = document.getElementById('ordersCount');
  cnt.textContent = DB.orders.length + ' order' + (DB.orders.length !== 1 ? 's' : '');

  if (DB.orders.length === 0) {
    el.innerHTML = `<div class="admin-card" style="text-align:center;color:var(--gray);font-size:14px;padding:32px">No orders yet.</div>`;
    return;
  }

  el.innerHTML = DB.orders.map(o => orderAdminCardHTML(o)).join('');
}

function orderAdminCardHTML(o) {
  return `
    <div class="order-admin-card">
      <div class="order-admin-header">
        <div>
          <div class="order-admin-id">#${o.id}</div>
          <div class="order-admin-customer">${o.name}</div>
        </div>
        <select class="order-status-select" onchange="updateOrderStatus('${o.id}', this.value)">
          <option value="pending"   ${o.status === 'pending'   ? 'selected' : ''}>Pending</option>
          <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
          <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
        </select>
      </div>
      <div class="order-admin-details">
        📞 ${o.phone} · 📍 ${o.address}<br>
        ${o.items.map(i => `${i.name} ×${i.qty}`).join(', ')}<br>
        <strong>PKR ${o.total.toLocaleString()}</strong> · ${o.date}
      </div>
    </div>`;
}

function updateOrderStatus(id, status) {
  const o = DB.orders.find(x => x.id === id);
  if (o) { o.status = status; saveDB(); showToast('Order updated ✦'); }
}

/* ──────────────────────────────────────────────
   PRODUCT MODAL — Add / Edit
   ────────────────────────────────────────────── */
function openProductModal(editId) {
  // Populate category dropdown
  const catSel = document.getElementById('pCat');
  catSel.innerHTML = DB.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

  // Reset image uploader
  clearImagePreview();

  if (editId) {
    const p = DB.products.find(x => x.id === editId);
    document.getElementById('modalTitle').textContent     = 'Edit Product';
    document.getElementById('modalSub').textContent       = 'Update the product details';
    document.getElementById('editProductId').value        = editId;
    document.getElementById('pName').value                = p.name;
    document.getElementById('pCat').value                 = p.catId;
    document.getElementById('pPrice').value               = p.price;
    document.getElementById('pStock').value               = p.stock;
    document.getElementById('pEmoji').value               = p.emoji || '';
    document.getElementById('pMaterial').value            = p.material || '';
    document.getElementById('pDesc').value                = p.desc || '';
    document.getElementById('pFeatured').checked          = p.featured || false;

    // Load existing image into preview if available
    if (p.image) {
      _pendingImage = p.image;
      showImagePreview(p.image);
    }
  } else {
    document.getElementById('modalTitle').textContent = 'Add Product';
    document.getElementById('modalSub').textContent   = 'Fill in the product details below';
    document.getElementById('editProductId').value    = '';
    ['pName', 'pPrice', 'pStock', 'pEmoji', 'pMaterial', 'pDesc'].forEach(id => {
      document.getElementById(id).value = '';
    });
    document.getElementById('pFeatured').checked = false;
  }

  document.getElementById('productModal').classList.add('open');
}

function saveProduct() {
  const name  = document.getElementById('pName').value.trim();
  const price = parseInt(document.getElementById('pPrice').value) || 0;
  const stock = parseInt(document.getElementById('pStock').value) || 0;
  const emoji = document.getElementById('pEmoji').value.trim() || '💎';

  if (!name || !price) { showToast('Name and price are required'); return; }

  const productData = {
    name,
    catId:    document.getElementById('pCat').value,
    price,
    stock,
    emoji,
    image:    _pendingImage,   // base64 or ''
    material: document.getElementById('pMaterial').value.trim(),
    desc:     document.getElementById('pDesc').value.trim(),
    featured: document.getElementById('pFeatured').checked
  };

  const editId = document.getElementById('editProductId').value;
  if (editId) {
    const p = DB.products.find(x => x.id === editId);
    Object.assign(p, productData);
  } else {
    DB.products.push({ id: 'p' + Date.now(), ...productData });
  }

  saveDB();
  closeModal('productModal');
  renderAdminProducts();
  showToast('Product saved ✦');
}

function editProduct(id) {
  openProductModal(id);
}

function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  DB.products = DB.products.filter(p => p.id !== id);
  saveDB();
  renderAdminProducts();
  showToast('Product deleted');
}

/* ──────────────────────────────────────────────
   CATEGORY MODAL
   ────────────────────────────────────────────── */
function openCategoryModal() {
  document.getElementById('cName').value  = '';
  document.getElementById('cEmoji').value = '';
  document.getElementById('categoryModal').classList.add('open');
}

function saveCategory() {
  const name  = document.getElementById('cName').value.trim();
  const emoji = document.getElementById('cEmoji').value.trim() || '✦';
  if (!name) { showToast('Category name required'); return; }
  DB.categories.push({ id: 'c' + Date.now(), name, emoji });
  saveDB();
  closeModal('categoryModal');
  renderAdminCategories();
  showToast('Category added ✦');
}

function deleteCategory(id) {
  if (DB.products.some(p => p.catId === id)) {
    showToast('Remove products from this category first');
    return;
  }
  if (!confirm('Delete category?')) return;
  DB.categories = DB.categories.filter(c => c.id !== id);
  saveDB();
  renderAdminCategories();
  showToast('Category deleted');
}

/* ──────────────────────────────────────────────
   MODAL HELPERS
   ────────────────────────────────────────────── */
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// Close modal when clicking backdrop
document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', function (e) {
    if (e.target === this) this.classList.remove('open');
  });
});

/* ──────────────────────────────────────────────
   INIT
   ────────────────────────────────────────────── */
renderCategories();
renderFeatured();
updateCartBadge();