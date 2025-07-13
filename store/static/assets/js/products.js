// Current state
let currentCategory = 'living-room';
let currentSubcategory = 'sofas';
let isSearching = false;
let minPrice = 0;
let maxPrice = 2000;

// Cached DOM elements
const DOM = {
    productsContainer: document.getElementById('products-container'),
    pageTitle: document.querySelector('.page-title'),
    categoryHeaders: document.querySelectorAll('.category-header'),
    subcategories: document.querySelectorAll('.subcategory'),
    sliderMin: document.getElementById('slider-min'),
    sliderMax: document.getElementById('slider-max'),
    minPriceInput: document.getElementById('min-price'),
    maxPriceInput: document.getElementById('max-price'),
    applyPriceFilterBtn: document.getElementById('apply-price-filter'),
    sliderTrack: document.querySelector('.slider-track'),
    filterTitle: document.querySelector('.filter-title'),
    mobileMenuToggle: document.querySelector('.mobile-menu-toggle'),
    sidebar: document.querySelector('.sidebar'),
    sidebarOverlay: document.querySelector('.sidebar-overlay'),
    mobileCloseBtn: document.querySelector('.mobile-close-btn'),
    searchToggle: document.getElementById('search-toggle'),
    mobileSearchToggle: document.getElementById('mobile-search-toggle'),
    searchContainer: document.getElementById('search-container'),
    searchInput: document.getElementById('search-input'),
    closeSearch: document.getElementById('close-search')
};

// Get URL parameters
const getUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search')?.trim().toLowerCase() || null;

    const category = params.get('category') || 'living-room';
    const defaultSubcategories = {
        'living-room': 'sofas',
        'bedroom': 'beds',
        'dining': 'tables',
        'bathroom': 'vanities'
    };
    let subcategory = params.get('subcategory') || defaultSubcategories[category] || 'sofas';
    if (productsData[category] && !productsData[category][subcategory]) {
        subcategory = Object.keys(productsData[category])[0] || 'sofas';
    }

    return { category, subcategory, search };
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    if (DOM.productsContainer) initProductsPage();
    else setupSearchEventListeners();
});

const initProductsPage = () => {
    const { category, subcategory, search } = getUrlParams();
    [currentCategory, currentSubcategory] = [category, subcategory];

    DOM.pageTitle && updatePageTitle();
    updateSidebarSelection(category, subcategory);

    DOM.mobileMenuToggle && setupMobileMenu();
    DOM.categoryHeaders.length && setupCategoryEventListeners();
    setupSearchEventListeners();
    DOM.sliderMin && setupPriceFilterEventListeners();

    if (search) {
        searchProducts(search);
    } else {
        DOM.productsContainer && loadProducts(category, subcategory, DOM.productsContainer);
    }
};

const setupMobileMenu = () => {
    DOM.mobileMenuToggle.addEventListener('click', () => {
        DOM.sidebar.classList.add('active');
        DOM.sidebarOverlay.classList.add('active');
    });

    const closeSidebar = () => {
        DOM.sidebar.classList.remove('active');
        DOM.sidebarOverlay.classList.remove('active');
    };

    DOM.mobileCloseBtn.addEventListener('click', closeSidebar);
    DOM.sidebarOverlay.addEventListener('click', closeSidebar);

    // Setup mobile menu links
    document.querySelectorAll('.mobile-menu a').forEach(link => {
        if (!link.href.includes('products.html')) return;
        link.addEventListener('click', e => {
            const url = new URL(link.href);
            const category = url.searchParams.get('category');
            if (!category) return;

            e.preventDefault();
            const isMobile = window.innerWidth <= 768;
            const subcategory = isMobile ? null : (url.searchParams.get('subcategory') || (productsData[category] ? Object.keys(productsData[category])[0] : 'sofas'));
            [currentCategory, currentSubcategory] = [category, subcategory || Object.keys(productsData[category])[0]];

            // Update URL and UI
            const newUrl = isMobile ? `products.html?category=${category}` : `products.html?category=${category}&subcategory=${currentSubcategory}`;
            window.history.pushState({}, '', newUrl);
            DOM.pageTitle && updatePageTitle();
            updateSidebarSelection(category, subcategory || currentSubcategory);
            DOM.productsContainer && loadProducts(category, subcategory, DOM.productsContainer);

            // Close menu
            document.querySelector('.mobile-menu').classList.remove('active');
            closeSidebar();
        });
    });
};

const setupCategoryEventListeners = () => {
    DOM.categoryHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const category = header.dataset.category;
            const subcategoriesContainer = header.nextElementSibling;
            const toggleBtn = header.querySelector('.toggle-btn');

            if (subcategoriesContainer) {
                subcategoriesContainer.classList.toggle('active');
                toggleBtn.textContent = subcategoriesContainer.classList.contains('active') ? '-' : '+';
            }

            if (category === currentCategory && window.innerWidth > 768) return;
            DOM.categoryHeaders.forEach(h => h.classList.remove('active'));
            header.classList.add('active');
            currentCategory = category;

            const isMobile = window.innerWidth <= 768;
            DOM.subcategories.forEach(sub => sub.classList.remove('active'));
            let firstSub;
            if (!isMobile) {
                firstSub = subcategoriesContainer?.querySelector('.subcategory');
                if (firstSub) {
                    firstSub.classList.add('active');
                    currentSubcategory = firstSub.dataset.subcategory;
                }
            } else {
                currentSubcategory = null;
            }

            updatePageTitle();
            !isSearching && loadProducts(currentCategory, isMobile ? null : currentSubcategory, DOM.productsContainer);
            updateUrl();
        });
    });

    DOM.subcategories.forEach(sub => {
        sub.addEventListener('click', () => {
            const subcategory = sub.dataset.subcategory;
            const parentElement = sub.closest('.subcategories');
            const parentCategoryHeader = parentElement.previousElementSibling;
            const category = parentCategoryHeader.dataset.category;

            if (category !== currentCategory) {
                DOM.categoryHeaders.forEach(h => h.classList.remove('active'));
                parentCategoryHeader.classList.add('active');
                currentCategory = category;
                updatePageTitle();
            }

            DOM.subcategories.forEach(s => s.classList.remove('active'));
            sub.classList.add('active');
            currentSubcategory = subcategory;

            !isSearching && loadProducts(currentCategory, subcategory, DOM.productsContainer);
            updateUrl();
        });
    });
};

const setupSearchEventListeners = () => {
    if (!DOM.searchToggle || !DOM.searchContainer) return;

    const toggleSearch = e => {
        e.preventDefault();
        DOM.searchContainer.classList.toggle('visible');
        DOM.searchContainer.classList.contains('visible') ? DOM.searchInput?.focus() : resetSearch();
    };

    DOM.searchToggle.addEventListener('click', toggleSearch);
    DOM.mobileSearchToggle?.addEventListener('click', toggleSearch);

    DOM.closeSearch?.addEventListener('click', () => {
        DOM.searchContainer.classList.remove('visible');
        resetSearch();
    });

    DOM.searchInput?.addEventListener('input', e => {
        const searchTerm = e.target.value.trim().toLowerCase();
        isSearching = searchTerm.length > 0;
        isSearching ? searchProducts(searchTerm) : resetSearch();
    });

    document.addEventListener('click', e => {
        if (!DOM.searchContainer.contains(e.target) && 
            e.target !== DOM.searchToggle && 
            e.target !== DOM.mobileSearchToggle &&
            !e.target.closest('#search-toggle') && 
            !e.target.closest('#mobile-search-toggle')) {
            DOM.searchContainer.classList.remove('visible');
            resetSearch();
        }
    });
};

const setupPriceFilterEventListeners = () => {
    DOM.filterTitle.addEventListener('click', () => {
        const icon = DOM.filterTitle.querySelector('i');
        const container = document.querySelector('.price-slider-container');
        if (!icon || !container) return;
        icon.classList.toggle('fa-chevron-up', container.style.display !== 'none');
        icon.classList.toggle('fa-chevron-down', container.style.display === 'none');
        container.style.display = container.style.display === 'none' ? 'block' : 'none';
    });

    DOM.sliderMin.addEventListener('input', () => {
        minPrice = Math.min(parseInt(DOM.sliderMin.value), maxPrice);
        DOM.minPriceInput.value = minPrice;
        DOM.sliderMin.value = minPrice;
        updateSliderTrack();
    });

    DOM.sliderMax.addEventListener('input', () => {
        maxPrice = Math.max(parseInt(DOM.sliderMax.value), minPrice);
        DOM.maxPriceInput.value = maxPrice;
        DOM.sliderMax.value = maxPrice;
        updateSliderTrack();
    });

    DOM.minPriceInput.addEventListener('change', () => {
        minPrice = Math.min(Math.max(parseInt(DOM.minPriceInput.value) || 0, 0), parseInt(DOM.sliderMax.value));
        DOM.minPriceInput.value = minPrice;
        DOM.sliderMin.value = minPrice;
        updateSliderTrack();
    });

    DOM.maxPriceInput.addEventListener('change', () => {
        maxPrice = Math.max(Math.min(parseInt(DOM.maxPriceInput.value) || 0, parseInt(DOM.sliderMax.max)), minPrice);
        DOM.maxPriceInput.value = maxPrice;
        DOM.sliderMax.value = maxPrice;
        updateSliderTrack();
    });

    DOM.applyPriceFilterBtn.addEventListener('click', () => {
        if (isSearching || !DOM.productsContainer) return;
        const products = currentSubcategory ? 
            productsData[currentCategory]?.[currentSubcategory]?.filter(p => p.price >= minPrice && p.price <= maxPrice) :
            Object.values(productsData[currentCategory] || {}).flat().filter(p => p.price >= minPrice && p.price <= maxPrice);
        renderProducts(products || [], DOM.productsContainer);
    });
};

const updateSliderTrack = () => {
    if (!DOM.sliderMin || !DOM.sliderMax || !DOM.sliderTrack) return;
    const [minPercent, maxPercent] = [minPrice, maxPrice].map(v => (v / parseInt(DOM.sliderMin.max)) * 100);
    DOM.sliderTrack.style.background = `linear-gradient(to right, #e5e5e5 ${minPercent}%, #ffa726 ${minPercent}%, #ffa726 ${maxPercent}%, #e5e5e5 ${maxPercent}%)`;
};

const resetSearch = () => {
    if (!isSearching) return;
    isSearching = false;
    DOM.searchInput.value = '';
    DOM.productsContainer && loadProducts(currentCategory, currentSubcategory, DOM.productsContainer);
    updatePageTitle();
};

const updatePageTitle = () => {
    if (!DOM.pageTitle) return;
    const categoryNames = {
        'living-room': 'Living Room',
        'bedroom': 'Bedroom',
        'dining': 'Dining Room',
        'bathroom': 'Bathroom'
    };
    DOM.pageTitle.textContent = isSearching ? 'Search Results' : `${categoryNames[currentCategory] || 'All'} Furniture`;
};

const loadProducts = (category, subcategory, container) => {
    if (!container) return;
    container.innerHTML = '<div class="loading">Loading products...</div>';

    setTimeout(() => {
        try {
            let products;
            if (subcategory) {
                products = productsData[category]?.[subcategory];
                if (!products && productsData[category]) {
                    const firstSubcategory = Object.keys(productsData[category])[0];
                    if (firstSubcategory) {
                        currentSubcategory = firstSubcategory;
                        products = productsData[category][firstSubcategory];
                        updateUrl();
                        updateSidebarSelection(category, firstSubcategory);
                    }
                }
            } else {
                products = Object.values(productsData[category] || {}).flat();
                currentSubcategory = null;
                updateSidebarSelection(category, null);
            }
            renderProducts(products || [], container);
        } catch (e) {
            console.error(`Error loading products for ${category}/${subcategory || 'all'}:`, e);
            container.innerHTML = '<div class="loading">No products found in this category.</div>';
        }
    }, 300);
};

const renderProducts = (products, container) => {
    if (!container) return;
    if (!products?.length) {
        container.innerHTML = '<div class="loading">No products found in this category.</div>';
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image">
                <img src="${product.image || '/api/placeholder/400/320'}" alt="${product.name}" loading="lazy">
                <button class="wishlist-btn" aria-label="Add to Wishlist">
                <i class="far fa-heart"></i>
                </button>
            </div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="add-to-cart-btn" data-product-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i>
                </button>
            </div>
        </div>
    `).join('');

    // Rest of the function remains unchanged
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            btn.innerHTML = btn.innerHTML.includes('far') ?
                '<i class="fas fa-heart" style="color: red;"></i>' :
                '<i class="far fa-heart"></i>';
        });
    });

    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const productId = parseInt(btn.getAttribute('data-product-id'));
            let foundProduct;
            Object.values(productsData).forEach(category =>
                Object.values(category).forEach(subcategory =>
                    subcategory.forEach(product => {
                        if (product.id === productId) foundProduct = product;
                    })
                )
            );
            if (foundProduct && typeof addToCart === 'function') {
                addToCart(foundProduct.price, foundProduct.name, null, 'standard', foundProduct.image);
            }
        });
    });

    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', e => {
            if (e.target.closest('.wishlist-btn') || e.target.closest('.add-to-cart-btn')) return;
            const productId = parseInt(card.getAttribute('data-product-id'));
            let foundProduct;
            Object.values(productsData).forEach(category =>
                Object.values(category).forEach(subcategory =>
                    subcategory.forEach(product => {
                        if (product.id === productId) foundProduct = product;
                    })
                )
            );
            foundProduct && typeof openProductModal === 'function' && openProductModal(foundProduct);
        });
    });
    setupWishlistButtons(document);
};

const searchProducts = (searchTerm) => {
    if (!DOM.productsContainer) return;
    const allProducts = Object.values(productsData).flatMap(category =>
        Object.values(category).flat()
    );
    const filteredProducts = allProducts.filter(p => p.name.toLowerCase().includes(searchTerm));
    renderProducts(filteredProducts.length ? filteredProducts : [], DOM.productsContainer);
    updatePageTitle();
};

const updateSidebarSelection = (category, subcategory) => {
    DOM.categoryHeaders.forEach(h => h.classList.remove('active'));
    DOM.subcategories.forEach(s => s.classList.remove('active'));

    const header = document.querySelector(`.category-header[data-category="${category}"]`);
    if (!header) return;

    header.classList.add('active');
    const subcategoriesContainer = header.nextElementSibling;
    if (subcategoriesContainer && subcategory) {
        subcategoriesContainer.classList.add('active');
        const toggleBtn = header.querySelector('.toggle-btn');
        toggleBtn.textContent = '-';
        const subcategoryElement = subcategoriesContainer.querySelector(`.subcategory[data-subcategory="${subcategory}"]`);
        subcategoryElement?.classList.add('active');
    }
};

const updateUrl = () => {
    const url = new URL(window.location);
    url.searchParams.set('category', currentCategory);
    if (currentSubcategory) {
        url.searchParams.set('subcategory', currentSubcategory);
    } else {
        url.searchParams.delete('subcategory');
    }
    window.history.pushState({}, '', url);
};