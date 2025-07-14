function openDrawer(id) {
  const panel = document.getElementById(id);
  if (panel) panel.classList.add('show');
}

function closeDrawer(id) {
  const panel = document.getElementById(id);
  if (panel) panel.classList.remove('show');
}

function loadDrawerComponents() {
  fetch('/static/assets/components/components.html')
    .then(res => res.text())
    .then(html => {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      document.body.appendChild(wrapper);

      const login = document.getElementById('login-form')?.content.cloneNode(true);
      const signup = document.getElementById('signup-form')?.content.cloneNode(true);
      const wishlist = document.getElementById('wishlist-form')?.content.cloneNode(true);
      const cart = document.getElementById('cart-form')?.content.cloneNode(true);
      const profile = document.getElementById('profile-form')?.content.cloneNode(true);
      const checkout = document.getElementById('checkout-form')?.content.cloneNode(true);
      const confirmation = document.getElementById('confirmation-form')?.content.cloneNode(true);

      if (login) document.body.appendChild(login);
      if (signup) document.body.appendChild(signup);
      if (profile) document.body.appendChild(profile);
      if (wishlist) document.body.appendChild(wishlist);
      if (cart) document.body.appendChild(cart);
      if (checkout) document.body.appendChild(checkout);
      if (confirmation) document.body.appendChild(confirmation);

      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (currentUser) {
        const profileName = document.getElementById('profile-name');
        const profileEmail = document.getElementById('profile-email');
        if (profileName) profileName.textContent = currentUser.name;
        if (profileEmail) profileEmail.textContent = currentUser.email;

        const userIcon = document.querySelector('a[onclick*="login-panel"]');
        if (userIcon) {
          userIcon.setAttribute('onclick', 'openUserPanel()');
        }
      }
    })
    .catch(error => console.error('Failed to load drawer components:', error));
}

document.addEventListener('DOMContentLoaded', loadDrawerComponents);

function openUserPanel() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const lastOrder = JSON.parse(localStorage.getItem('lastOrder'));
  const profileName = document.getElementById('profile-name');
  const profileEmail = document.getElementById('profile-email');
  const orderContainer = document.getElementById('last-order-container');

  if (currentUser) {
    if (profileName) profileName.textContent = currentUser.name;
    if (profileEmail) profileEmail.textContent = currentUser.email;

    // Populate last order summary
    if (lastOrder && orderContainer) {
      orderContainer.innerHTML = `
        <h3 style="margin-bottom: 0.5rem;">Last Order</h3>
        <p><strong>Date:</strong> ${lastOrder.timestamp}</p>
        <ul style="padding-left: 1rem; font-size: 14px;">
          ${lastOrder.items.map(item => `
            <li>${item.title} — $${item.price.toFixed(2)} × ${item.quantity}</li>
          `).join('')}
        </ul>
        <p><strong>Total:</strong> $${lastOrder.total}</p>
      `;
    } else if (orderContainer) {
      orderContainer.innerHTML = `<p style="font-size: 14px;">No recent orders found.</p>`;
    }

    openDrawer('profile-panel');
  } else {
    openDrawer('login-panel');
  }
}
