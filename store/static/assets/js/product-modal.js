document.addEventListener('DOMContentLoaded', function() {
    // Get modal elements
    window.modal = document.getElementById('productModal');
    const closeModal = document.querySelector('.close-modal');
    
    // Make this function globally accessible
    window.openProductModal = function(product) {
      document.getElementById('modalProductImage').src = product.image || '/api/placeholder/400/320';
      document.getElementById('modalProductName').textContent = product.name;
      document.getElementById('modalProductPrice').textContent = `$${product.price.toFixed(2)}`;
      
      // Set default quantity to 1
      document.getElementById('quantity').value = 1;
      
      // Display the modal
      modal.style.display = 'block';
      document.body.style.overflow = 'hidden'; // Prevent scrolling
      
      // Store current product for cart actions
      modal.currentProduct = product;
    };
    
    // Close modal when clicking X
    closeModal.addEventListener('click', function() {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
      if (event.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    });
    
    // Quantity controls
    document.querySelector('.quantity-btn.minus').addEventListener('click', function() {
      const quantityInput = document.getElementById('quantity');
      if (quantityInput.value > 1) {
        quantityInput.value = parseInt(quantityInput.value) - 1;
      }
    });
    
    document.querySelector('.quantity-btn.plus').addEventListener('click', function() {
      const quantityInput = document.getElementById('quantity');
      quantityInput.value = parseInt(quantityInput.value) + 1;
    });
    
    // Buy now from modal
    document.querySelector('.buy-now-btn').addEventListener('click', function() {
      if (!modal.currentProduct) return;
      
      const quantity = parseInt(document.getElementById('quantity').value) || 1;
      const deliveryOption = document.getElementById('modalDeliveryOption').value;
      
      // Add to cart
      if (typeof addToCart === 'function') {
        addToCart(
          modal.currentProduct.price,
          modal.currentProduct.name,
          null,
          deliveryOption,
          modal.currentProduct.image,
          quantity
        );
        
        // Ensure cart panel is loaded before opening
        const checkCartPanel = () => {
          const cartPanel = document.getElementById('cart-panel');
          if (cartPanel && typeof openDrawer === 'function') {
            openDrawer('cart-panel');
          } else {
            // Retry after a short delay
            setTimeout(checkCartPanel, 100);
          }
        };
        checkCartPanel();
      } else {
        console.error('addToCart function not found');
      }
      
      // Close modal
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    });
    
    // Wishlist button in modal
    document.querySelector('.modal-actions .wishlist-btn').addEventListener('click', function() {
      if (!modal.currentProduct) return;
      
      const btn = this;
      const card = document.querySelector('.modal-product-details');
      const title = modal.currentProduct.name;
      const price = `$${modal.currentProduct.price.toFixed(2)}`;
      const img = modal.currentProduct.image || '/api/placeholder/400/320';
      
      const alreadyExists = wishlist.some(item => item.title === title);
      if (!alreadyExists && typeof saveWishlist === 'function') {
        wishlist.push({ title, price, img });
        saveWishlist();
        updateWishlistPanel();
        btn.innerHTML = '<i class="fas fa-heart" style="color: red;"></i> Added to Wishlist';
      } else {
        btn.innerHTML = '<i class="far fa-heart"></i> Add to Wishlist';
      }
    });
    
    // Update quick view buttons in product cards - make this globally accessible
    window.updateQuickViewButtons = function() {
      document.querySelectorAll('.quick-view-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          
          // Get the product ID from the button's data attribute
          const productId = parseInt(btn.getAttribute('data-product-id'));
          if (!productId) {
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('.product-name').textContent;
            
            // Find the product by name (less reliable)
            let foundProduct = null;
            Object.keys(productsData).forEach(category => {
              Object.keys(productsData[category]).forEach(subcategory => {
                productsData[category][subcategory].forEach(product => {
                  if (product.name === productName) {
                    foundProduct = product;
                  }
                });
              });
            });
            
            if (foundProduct) {
              openProductModal(foundProduct);
            }
            return;
          }
          
          // Find the product in the data
          let foundProduct = null;
          
          // Search through all products to find matching ID
          Object.keys(productsData).forEach(category => {
            Object.keys(productsData[category]).forEach(subcategory => {
              productsData[category][subcategory].forEach(product => {
                if (product.id === productId) {
                  foundProduct = product;
                }
              });
            });
          });
          
          if (foundProduct) {
            openProductModal(foundProduct);
          }
        });
      });
    };
    
    // Initialize quick view buttons
    updateQuickViewButtons();
});