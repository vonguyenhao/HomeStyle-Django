//contact.js
document.addEventListener('DOMContentLoaded', () => {
  // Open popup on button click
  document.querySelectorAll('[data-popup]').forEach(button => {
    button.addEventListener('click', () => {
      const popupId = button.getAttribute('data-popup');
      const popup = document.getElementById(popupId);
      if (popup) {
        popup.style.display = 'flex';
      }
    });
  });

  // Close popup on '×' click
  document.querySelectorAll('.close-popup').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
      const popup = closeBtn.closest('.popup-form');
      popup.style.display = 'none';
    });
  });

  // Optional: close popup on background click
  document.querySelectorAll('.popup-form').forEach(popup => {
    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        popup.style.display = 'none';
      }
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const dropdownButton = document.getElementById('dropdownButton');
  const dropdownList = document.getElementById('dropdownList');
  const subjectInput = document.getElementById('inquiry-subject');

  dropdownButton.addEventListener('click', () => {
    dropdownList.style.display = dropdownList.style.display === 'block' ? 'none' : 'block';
  });

  dropdownList.querySelectorAll('li').forEach(option => {
    option.addEventListener('click', () => {
      dropdownButton.textContent = option.textContent;
      subjectInput.value = option.getAttribute('data-value');
      dropdownList.style.display = 'none';
    });
  });

  document.addEventListener('click', function (event) {
    if (!document.getElementById('dropdown-wrapper').contains(event.target)) {
      dropdownList.style.display = 'none';
    }
  });
});
