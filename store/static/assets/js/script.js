let total = 0;
let cartCount = 0;
let currentSlide = 0;

// Load cart from localStorage or start with an empty array
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// -------------------------------
// Mobile Menu Toggle
// -------------------------------
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) {
    menu.classList.toggle('show');
  }
}

// -------------------------------
// Hero Slider Logic
// -------------------------------
function showSlide(index) {
  const slides = document.querySelectorAll(".slide");
  slides.forEach((slide, i) => {
    slide.classList.remove("active");
    slide.style.left = i === index ? "0" : "100%";
  });
  slides[index].classList.add("active");
}

function nextSlide() {
  const slides = document.querySelectorAll(".slide");
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}

function prevSlide() {
  const slides = document.querySelectorAll(".slide");
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  showSlide(currentSlide);
}

// -------------------------------
// wishlist icon
// -------------------------------
document.querySelectorAll('.wishlist-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const icon = btn.querySelector('i');
    icon.classList.toggle('far');
    icon.classList.toggle('fas');
  });
});

// ================================
// WISHLIST WITH LOCAL STORAGE
// ================================

// Load wishlist from localStorage or start with an empty array
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

/**
 * Save current wishlist to localStorage
 */
function saveWishlist() {
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function updateWishlistPanel() {
  const list = document.getElementById('wishlist-items');
  if (!list) return;

  list.innerHTML = '';

  wishlist.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 12px;">
        <div style="display: flex; gap: 10px; align-items: center;">
          <img src="${item.img}" alt="${item.title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px;">
          <div>
            <p style="margin: 0; font-weight: bold;">${item.title}</p>
            <p style="margin: 0; font-size: 14px; color: #555;">${item.price}</p>
          </div>
        </div>
        <button class="remove-wishlist" data-index="${index}" title="Remove" style="border: none; background: none; font-size: 18px; color: #888; cursor: pointer;">✕</button>
      </div>
    `;
    list.appendChild(li);
  });

  // Attach remove button events
  list.querySelectorAll('.remove-wishlist').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = parseInt(btn.dataset.index);
      wishlist.splice(i, 1);                      // Remove from array
      saveWishlist();                             // Save back to localStorage
      updateWishlistPanel();                      // Re-render UI
    });
  });
}

/**
 * Toggle the wishlist icon (outline ⇄ solid heart)
 */
function toggleWishlistIcon(btn, added) {
  const icon = btn.querySelector('i');
  if (!icon) return;
  icon.classList.remove('far', 'fas');
  icon.classList.add(added ? 'fas' : 'far');
}

/**
 * Attach click events to all wishlist buttons within a given scope
 * @param {HTMLElement} scope - container to search for buttons (default: document)
 */
function setupWishlistButtons(scope = document) {
  scope.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();

      const card = btn.closest('.product-card') || document.querySelector('.modal-product-details');
      const title = card?.querySelector('h2, .product-name')?.textContent?.trim();
      const price = card?.querySelector('.price, .product-price')?.textContent?.trim();
      const img = card?.querySelector('img')?.src;

      if (!title || !price || !img) return;

      const alreadyExists = wishlist.some(item => item.title === title);
      if (!alreadyExists) {
        wishlist.push({ title, price, img });
        saveWishlist();
        updateWishlistPanel();
        toggleWishlistIcon(btn, true);
      }
    });
  });
}

// ================================
// CART WITH LOCAL STORAGE
// ================================

/**
 * Save current cart to localStorage
 */
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

/**
 * Update the cart drawer UI
 */
function updateCartPanel() {
  const list = document.getElementById('cart-items');
  const totalElement = document.getElementById('cart-total');
  if (!list || !totalElement) return;

  list.innerHTML = '';

  if (cart.length === 0) {
    list.innerHTML = '<li>Your cart is empty</li>';
    totalElement.textContent = '0.00';
    return;
  }

  total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  cart.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 12px;">
        <div style="display: flex; gap: 10px; align-items: center;">
          <img src="${item.img}" alt="${item.title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px;">
          <div>
            <p style="margin: 0; font-weight: bold;">${item.title}</p>
            <p style="margin: 0; font-size: 14px; color: #555;">$${item.price.toFixed(2)} x ${item.quantity}</p>
            <p style="margin: 0; font-size: 14px; color: #555;">Delivery: ${item.deliveryOption}</p>
          </div>
        </div>
        <button class="remove-cart" data-index="${index}" title="Remove" style="border: none; background: none; font-size: 18px; color: #888; cursor: pointer;">✕</button>
      </div>
    `;
    list.appendChild(li);
  });

  // Update total and cart count
  totalElement.textContent = total.toFixed(2);
  document.querySelectorAll(".cart-count").forEach(el => {
    el.textContent = cartCount;
  });

  // Attach remove button events
  list.querySelectorAll('.remove-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = parseInt(btn.dataset.index);
      cart.splice(i, 1);                      // Remove from array
      saveCart();                             // Save back to localStorage
      updateCartPanel();                      // Re-render UI
    });
  });
}

/**
 * Add item to cart
 * @param {number} price - Product price
 * @param {string} name - Product name
 * @param {HTMLElement} button - Button element (optional)
 * @param {string} deliveryOptionOverride - Delivery option (optional)
 * @param {string} img - Product image URL (optional)
 * @param {number} quantity - Quantity to add (default: 1)
 */
function addToCart(price, name, button = null, deliveryOptionOverride = null, img = null, quantity = 1) {
  let deliveryOption = deliveryOptionOverride;

  if (!deliveryOption && button) {
    const productCard = button.closest(".product-card");
    deliveryOption = productCard?.querySelector("select")?.value || "None selected";
  }

  // Check if item already exists in cart
  const existingItem = cart.find(item => item.title === name && item.deliveryOption === deliveryOption);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      title: name,
      price: price,
      img: img || '/api/placeholder/60/60',
      deliveryOption: deliveryOption || "None selected",
      quantity: quantity
    });
  }

  saveCart();
  updateCartPanel();

  alert(`🛒 ${name} added to cart!\nPrice: $${price.toFixed(2)}\nQuantity: ${quantity}\nDelivery: ${deliveryOption}\n\nTotal: $${total.toFixed(2)}`);
}

// -------------------------------
// Hover Image Swap
// -------------------------------
function handleHover(event, container) {
  const mainImg = container.querySelector("img");
  const altSrc = mainImg.dataset.alt;
  if (!altSrc) return;

  let altImg = container.querySelector(".hover-alt");
  if (!altImg) {
    altImg = document.createElement("img");
    altImg.src = altSrc;
    altImg.className = "hover-image hover-alt";
    altImg.alt = "alternate product view";
    altImg.style.position = "absolute";
    altImg.style.top = "0";
    altImg.style.left = "0";
    altImg.style.width = "100%";
    altImg.style.height = "100%";
    altImg.style.objectFit = "cover";
    altImg.style.opacity = "0";
    altImg.style.transition = "opacity 0.3s ease-in-out";
    container.appendChild(altImg);
  }

  const x = event.offsetX;
  const width = container.offsetWidth;
  altImg.style.opacity = x < width / 2 ? 0 : 1;
}

function resetImage(container) {
  const altImg = container.querySelector(".hover-alt");
  if (altImg) altImg.style.opacity = 0;
}

// -------------------------------
// Image Zoom
// -------------------------------
function zoomImage(container) {
  const img = container.querySelector("img");
  img.classList.toggle("zoomed");
}

// -------------------------------
// Bundle Carousel on Hover
// -------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Initialize cart panel and wishlist
  updateCartPanel();
  setupWishlistButtons();

  // Wait until drawer panels are loaded
  const waitForDrawers = setInterval(() => {
    const cartList = document.getElementById('cart-items');
    const wishlistList = document.getElementById('wishlist-items');
    if (cartList && wishlistList) {
      updateCartPanel();
      updateWishlistPanel();
      clearInterval(waitForDrawers);
    }
  }, 100);

  const bundles = document.querySelectorAll(".bundle-container");
  bundles.forEach(container => {
    const img = container.querySelector("img");
    const images = container.dataset.images?.split(',').map(src => src.trim()) || [];
    let index = 0;
    let interval;

    if (!images.length) return;

    container.addEventListener("mouseenter", () => {
      interval = setInterval(() => {
        index = (index + 1) % images.length;
        img.src = images[index];
      }, 1000);
    });

    container.addEventListener("mouseleave", () => {
      clearInterval(interval);
      img.src = images[0];
      index = 0;
    });
  });

  // Start hero slider autoplay
  showSlide(currentSlide);
  setInterval(nextSlide, 7000);
});


function handleSearch(e) {
  e.preventDefault();

  const input = document.getElementById('search-input');
  const query = input.value.trim();

  if (query) {
    window.location.href = `products.html?search=${encodeURIComponent(query)}`;
  }

  return false;
}

// Authentication Functions (Signup, Login, Logout)
// Switch from login panel to signup panel
function switchToSignup() {
  closeDrawer('login-panel');
  openDrawer('signup-panel');
}

// Switch from signup panel to login panel
function switchToLogin() {
  closeDrawer('signup-panel');
  openDrawer('login-panel');
}

// Handle user account creation and store in localStorage
function handleSignup() {
  // Retrieve values from signup form fields
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;

  // Validate required fields
  if (!name || !email || !password) {
    alert("Please fill out all fields.");
    return;
  }

  // Load existing users from localStorage
  const existingUsers = JSON.parse(localStorage.getItem('users')) || [];

  // Prevent duplicate account using the same email
  const alreadyExists = existingUsers.some(user => user.email === email);
  if (alreadyExists) {
    alert("This email is already registered.");
    return;
  }

  // Add new user to the local user list and persist to localStorage
  existingUsers.push({ name, email, password });
  localStorage.setItem('users', JSON.stringify(existingUsers));

  // Show success message and switch back to login panel
  alert("Account created! You can now log in.");
  closeDrawer('signup-panel');
  openDrawer('login-panel');
}

// Handle user login by checking credentials against localStorage
function handleLogin() {
  const emailInput = document.querySelector('#login-panel input[type="email"]').value.trim();
  const passwordInput = document.querySelector('#login-panel input[type="password"]').value;

  // Load all registered users
  const users = JSON.parse(localStorage.getItem('users')) || [];

  // Find matching user credentials
  const user = users.find(u => u.email === emailInput && u.password === passwordInput);

  if (user) {
    // Save current logged-in user to localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));

    // Close login drawer and open user profile drawer
    closeDrawer('login-panel');
    document.getElementById('profile-name').textContent = user.name;
    document.getElementById('profile-email').textContent = user.email;
    openDrawer('profile-panel');
  } else {
    alert("Invalid email or password.");
  }
}

// Handle logout by removing currentUser from localStorage
function logoutUser() {
  localStorage.removeItem('currentUser');
  closeDrawer('profile-panel');
}

document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (user) {
    const nameEl = document.getElementById('profile-name');
    const emailEl = document.getElementById('profile-email');
    if (nameEl && emailEl) {
      nameEl.textContent = user.name;
      emailEl.textContent = user.email;
    }
  }
});

function proceedToCheckout() {
  closeDrawer('cart-panel');
  openDrawer('checkout-panel');
}

function confirmCheckout() {
  closeDrawer('checkout-panel');
  openDrawer('confirmation-panel');

  const summaryList = document.getElementById('order-summary-list');
  const summaryTotal = document.getElementById('order-summary-total');

  if (!summaryList || !summaryTotal) return;

  summaryList.innerHTML = '';
  let grandTotal = 0;

  const orderItems = [];

  cart.forEach(item => {
    const subtotal = item.price * item.quantity;
    grandTotal += subtotal;

    orderItems.push({
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      delivery: item.deliveryOption
    });

    const li = document.createElement('li');
    li.innerHTML = `
      <div style="margin-bottom: 10px;">
        <strong>${item.title}</strong><br>
        $${item.price.toFixed(2)} × ${item.quantity} = $${subtotal.toFixed(2)}<br>
        Delivery: ${item.deliveryOption}
      </div>
    `;
    summaryList.appendChild(li);
  });

  summaryTotal.textContent = grandTotal.toFixed(2);

  // Save the last order to localStorage for profile drawer use
  const lastOrder = {
    timestamp: new Date().toLocaleString(),
    items: orderItems,
    total: grandTotal.toFixed(2)
  };

  localStorage.setItem('lastOrder', JSON.stringify(lastOrder));

  // Optionally clear cart after checkout
  cart = [];
  saveCart();
  updateCartPanel();
}






