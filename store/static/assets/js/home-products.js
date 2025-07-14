function renderHomeProducts(products) {
  const container = document.querySelector(".product-grid");
  if (!container) return;

  let html = "";
  products.forEach(product => {
    const isBundle = Array.isArray(product.images);

    const figureHTML = isBundle
      ? `
        <figure class="image-container bundle-container" 
                data-images="${product.images.join(',')}" 
                onclick="zoomImage(this)">
          <img src="${product.images[0]}" alt="${product.name}" class="bundle-image" loading="lazy" />
          <button class="wishlist-btn" aria-label="Add to Wishlist">
            <i class="far fa-heart"></i>
          </button>
        </figure>
      `
      : `
        <figure class="image-container" 
                onmousemove="handleHover(event, this)" 
                onmouseleave="resetImage(this)" 
                onclick="zoomImage(this)">
          <img src="${product.image}" alt="${product.name}" class="hover-image" data-alt="${product.alt || product.image}" loading="lazy" />
          <button class="wishlist-btn" aria-label="Add to Wishlist">
            <i class="far fa-heart"></i>
          </button>
        </figure>
      `;

    html += `
      <article class="product-card" tabindex="0" aria-label="${product.name}, $${product.price}">
        ${figureHTML}
        <section class="product-info">
          <h2>${product.name}</h2>
          <p class="category">${product.category || "Furniture"}</p>
          <div class="price-cart-row">
            <p class="price">$${product.price} ${product.savings ? `<span style="color: green;">${product.savings}</span>` : ''}</p>
            <button class="add-to-cart-btn" 
                    data-product-id="${product.id}" 
                    data-product-name="${product.name}" 
                    data-product-price="${product.price}" 
                    data-product-image="${isBundle ? product.images[0] : product.image}"
                    aria-label="Add to Cart">
              <i class="fas fa-shopping-cart"></i>
            </button>
          </div>
          <p class="details">${product.details || ""}</p>
        </section>
        <section class="more-info">
          <p>${product.description || ""}</p>
        </section>
      </article>
    `;
  });

  container.innerHTML = html;

  // BIND ADD TO CART EVENT LISTENERS
  container.querySelectorAll(".add-to-cart-btn").forEach(button => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      
      const productId = button.getAttribute("data-product-id");
      const name = button.getAttribute("data-product-name");
      const price = parseFloat(button.getAttribute("data-product-price"));
      const image = button.getAttribute("data-product-image");
      
      // Default delivery option for homepage products
      const deliveryOption = "standard";

      console.log('Adding to cart:', { name, price, image, deliveryOption });

      if (typeof addToCart === "function") {
        // Ensure cart panel is loaded before calling addToCart
        const cartPanel = document.getElementById('cart-panel');
        if (!cartPanel) {
          // Wait for components to load
          const checkInterval = setInterval(() => {
            const cartPanelCheck = document.getElementById('cart-panel');
            if (cartPanelCheck) {
              clearInterval(checkInterval);
              addToCart(price, name, button, deliveryOption, image, 1);
              setupWishlistButtons(document); // Rebind wishlist buttons after loading drawers
            }
          }, 100);
        } else {
          addToCart(price, name, button, deliveryOption, image, 1);
          setupWishlistButtons(document); // Rebind wishlist buttons
        }
      } else {
        console.error("addToCart function not found");
      }
    });
  });

  // BIND WISHLIST EVENT LISTENERS
  setupWishlistButtons(container);

  // BIND HOVER CAROUSEL EFFECT after render
  const bundles = container.querySelectorAll(".bundle-container");
  bundles.forEach(containerEl => {
    const img = containerEl.querySelector("img");
    const images = containerEl.dataset.images?.split(',').map(src => src.trim()) || [];
    let index = 0;
    let interval;

    if (!images.length) return;

    containerEl.addEventListener("mouseenter", () => {
      interval = setInterval(() => {
        index = (index + 1) % images.length;
        img.src = images[index];
      }, 1000);
    });

    containerEl.addEventListener("mouseleave", () => {
      clearInterval(interval);
      img.src = images[0];
      index = 0;
    });
  });
}

// Define the best sellers data with proper image paths
const bestSellersData = [
  {
    id: 1001,
    name: "3-Seater Sofa Set",
    price: 550,
    category: "Bundle Deal",
    details: "Fabric | 210cm x 85cm x 90cm",
    description: "Modern 3-seater sofa with high-resilience foam and easy-clean fabric. Perfect for any contemporary living room.",
    image: "assets/images/products/living_room/sofa.jpg",
    alt: "assets/images/products/living_room/sofa_alt.jpg",
    savings: "(Save 30%)"
  },
  {
    id: 1002,
    name: "Bedside Table Set",
    price: 195,
    category: "Bundle Deal",
    details: "Wood | 60cm x 65cm x 85cm",
    description: "Classic wood bedside table with ergonomic design, perfect for bedroom corners or reading books.",
    image: "assets/images/products/bedroom/bedside_table.jpg",
    alt: "assets/images/products/bedroom/bedside_table_alt.jpg",
    savings: "(Save 45%)"
  },
  {
    id: 1003,
    name: "Living Room Set",
    price: 1190,
    category: "Bundle Deal",
    details: "Sofa + Coffee Table + TV Unit",
    description: "This discounted set includes all matching living room essentials: 3-Seater Sofa, Coffee Table, and TV Unit. Perfectly styled for modern homes in Darwin. Save more, shop smarter!",
    images: [
      "assets/images/products/living_room/sofa_alt.jpg",
      "assets/images/products/living_room/sofa.jpg",
      "assets/images/products/bathroom/bathroom_1_alt.jpg",
      "assets/images/products/dining_room/dining_table_alt.jpg"
    ],
    savings: "(Save 15%)"
  },
  {
    id: 1004,
    name: "Bedroom + Living Room",
    price: 1790,
    category: "Bundle Deal",
    details: "Sofa + Bed Frame + Bedside Tables",
    description: "This combo bundle gives you a full start in your new home! Get a quality sofa, a sturdy queen-sized bed frame, two bedside tables, and a modern TV unit — all in one coordinated set with savings included.",
    images: [
      "assets/images/products/dining_room/dining_table.jpg",
      "assets/images/products/living_room/sofa.jpg",
      "assets/images/products/bedroom/bedside_table.jpg",
      "assets/images/products/bathroom/bathroom_1.jpg"
    ],
    savings: "(Save 20%)"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  // Wait for components to load first
  setTimeout(() => {
    const bestSellersContainer = document.querySelector(".best-sellers .product-grid");
    if (bestSellersContainer) {
      renderHomeProducts(bestSellersData);
    }
  }, 500);
});