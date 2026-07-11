// --- LIGHTWEIGHT TOAST LIBRARY ---
function showToast(title, message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // Icon based on type
  const iconSvg = type === 'success' 
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="toast-icon"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="toast-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

  toast.innerHTML = `
    ${iconSvg}
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${message}</div>
    </div>
    <button class="toast-close-btn">&times;</button>
  `;

  container.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  // Close handler
  const closeBtn = toast.querySelector('.toast-close-btn');
  closeBtn.addEventListener('click', () => {
    dismissToast(toast);
  });

  // Auto-remove
  setTimeout(() => {
    dismissToast(toast);
  }, 4000);
}

function dismissToast(toast) {
  toast.classList.remove('show');
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
}

// --- MOBILE DRAWERS NAVIGATION ---
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
      const icon = menuToggle.querySelector('svg');
      if (icon) {
        if (mobileNav.classList.contains('open')) {
          icon.innerHTML = `<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>`;
        } else {
          icon.innerHTML = `<line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line>`;
        }
      }
    });
  }

  // --- CLIENT CONTACT FORM SUBMISSION ---
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      
      const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
      };

      // Client verification
      if (!formData.fullName.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
        showToast('Error', 'Please fill in all inquiry fields.', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<div class="spinner"></div> Sending message...`;

      try {
        const response = await fetch('/api/inquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
          showToast('Success', result.message || 'Inquiry message sent successfully!');
          contactForm.reset();
        } else {
          showToast('Error', result.message || 'Failed to send message.', 'error');
        }
      } catch (err) {
        console.error('Contact Submission Error:', err);
        showToast('Error', 'Could not establish connection to the server.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  // --- CLIENT CONSULTATION BOOKING SUBMISSION ---
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = bookingForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      const formData = {
        fullName: document.getElementById('fullName').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        email: document.getElementById('email').value,
        sculptureType: document.getElementById('sculptureType').value,
        preferredSize: document.getElementById('preferredSize').value,
        budget: document.getElementById('budget').value,
        meetingDate: document.getElementById('meetingDate').value,
        message: document.getElementById('message').value
      };

      // Client verification
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!formData.email.trim() || !emailRegex.test(formData.email)) {
        showToast('Validation Error', 'Please supply a valid email address.', 'error');
        return;
      }

      const selectedDate = new Date(formData.meetingDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        showToast('Validation Error', 'Meeting date cannot be set in the past.', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<div class="spinner"></div> Registering Request...`;

      try {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
          showToast('Success', 'Consultation booked successfully!');
          
          // Switch form view to success card state
          const formWrapper = document.getElementById('booking-form-wrapper');
          if (formWrapper) {
            formWrapper.innerHTML = `
              <div class="success-card">
                <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <div>
                  <h2>Booking Received!</h2>
                  <p class="badge-gold" style="margin-top: 0.5rem;">Jeetendra Prajapati Clay Studio</p>
                </div>
                <div class="divider"></div>
                <p>Thank you, <strong>${formData.fullName}</strong>. A detailed summary has been simulated/sent to <strong>${formData.email}</strong>. We will review your sculpture requirements and call you at <strong>${formData.phoneNumber}</strong> to align on pricing and lock in the meeting date.</p>
                <a href="/book" class="btn btn-chocolate">Book Another Sculpture</a>
              </div>
            `;
          }
        } else {
          showToast('Error', result.message || 'Failed to submit booking.', 'error');
        }
      } catch (err) {
        console.error('Booking Submission Error:', err);
        showToast('Error', 'Connection to server failed. Try again.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  // --- ADMIN LOGIN SUBMISSION ---
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    // Password toggler
    const togglePassBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    if (togglePassBtn && passwordInput) {
      togglePassBtn.addEventListener('click', () => {
        const isPass = passwordInput.type === 'password';
        passwordInput.type = isPass ? 'text' : 'password';
        togglePassBtn.innerHTML = isPass 
          ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
          : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
      });
    }

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      
      const username = document.getElementById('username').value;
      const password = passwordInput.value;

      if (!username.trim() || !password.trim()) {
        showToast('Validation Error', 'Username and password cannot be empty.', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<div class="spinner"></div> Authenticating...`;

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (result.success) {
          showToast('Success', 'Welcome back, Admin!');
          setTimeout(() => {
            window.location.href = '/admin/dashboard';
          }, 600);
        } else {
          showToast('Failed Auth', result.message || 'Invalid administrator credentials.', 'error');
        }
      } catch (err) {
        console.error('Login submit error:', err);
        showToast('Connection Error', 'Could not authenticate. Check network.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  // --- LOCAL UPLOAD PREVIEW HANDLER ---
  setupImagePreviewListener('imageFile', 'imagePreview');
  setupImagePreviewListener('newImageFile', 'newImagePreview');
});

function setupImagePreviewListener(inputId, previewBoxId) {
  const input = document.getElementById(inputId);
  const previewBox = document.getElementById(previewBoxId);
  if (input && previewBox) {
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        let previewImg = previewBox.querySelector('img');
        if (!previewImg) {
          previewBox.innerHTML = `
            <img src="" alt="Preview" />
            <button type="button" class="remove-preview-btn" id="${inputId}-remove-btn">&times;</button>
          `;
          previewImg = previewBox.querySelector('img');
          const removeBtn = previewBox.querySelector(`.remove-preview-btn`);
          removeBtn.addEventListener('click', () => {
            input.value = '';
            previewBox.innerHTML = '';
            previewBox.style.display = 'none';
          });
        }
        previewImg.src = URL.createObjectURL(file);
        previewBox.style.display = 'block';
      }
    });
  }
}
