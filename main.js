// ===== GALLERY LIGHTBOX + PREVIEW =====
document.addEventListener('DOMContentLoaded', function () {
  const thumbs = document.querySelectorAll('.gallery-img');
  const lightboxEl = document.getElementById('lightbox');

  // Only run on pages that have a gallery
  if (thumbs.length === 0 || !lightboxEl) return;

  const lightbox = new bootstrap.Modal(lightboxEl);
  const bigImg = document.getElementById('lightboxImg');
  const caption = document.getElementById('lightboxCaption');
  const counter = document.getElementById('counter');
  const preview = document.getElementById('previewImg');
  const previewCaption = document.getElementById('previewCaption');
  let current = 0;

  function showImage(index) {
    // Wrap around at both ends
    if (index < 0) index = thumbs.length - 1;
    if (index >= thumbs.length) index = 0;
    current = index;

    const img = thumbs[current];

    // Update the lightbox
    bigImg.src = img.src;
    bigImg.alt = img.alt;
    caption.textContent = img.dataset.caption;
    counter.textContent = (current + 1) + ' / ' + thumbs.length;

    // Update the on-page preview
    if (preview) {
      preview.src = img.src;
      preview.alt = img.alt;
      previewCaption.textContent = img.dataset.caption;
    }
  }

  // Clicking a thumbnail: update preview and open lightbox
  thumbs.forEach(function (img, i) {
    img.addEventListener('click', function () {
      showImage(i);
      lightbox.show();
    });
  });

  // Lightbox buttons
  document.getElementById('nextBtn').addEventListener('click', function () {
    showImage(current + 1);
  });
  document.getElementById('prevBtn').addEventListener('click', function () {
    showImage(current - 1);
  });

  // On-page preview buttons
  document.getElementById('previewNext').addEventListener('click', function () {
    showImage(current + 1);
  });
  document.getElementById('previewPrev').addEventListener('click', function () {
    showImage(current - 1);
  });

  // Clicking the big preview opens the lightbox
  if (preview) {
    preview.addEventListener('click', function () {
      lightbox.show();
    });
  }

  // Keyboard arrows while the lightbox is open
  document.addEventListener('keydown', function (e) {
    if (!lightboxEl.classList.contains('show')) return;
    if (e.key === 'ArrowRight') showImage(current + 1);
    if (e.key === 'ArrowLeft') showImage(current - 1);
  });

  // Show the first image in the preview when the page loads
  showImage(0);
});

// ===== FORM VALIDATION =====
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('regForm');
  if (!form) return;

  const successBox = document.getElementById('successBox');

  // Set arrival date minimum to today
  const arrival = document.getElementById('arrival');
  arrival.min = new Date().toISOString().split('T')[0];

  function setError(input, message) {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    input.nextElementSibling.classList.contains('invalid-feedback')
      ? input.nextElementSibling.textContent = message
      : input.parentElement.querySelector('.invalid-feedback').textContent = message;
    return false;
  }

  function setOk(input) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    return true;
  }

  // One validator per field: returns true if valid
  const validators = {
    fullName: function (el) {
      const v = el.value.trim();
      if (v === '') return setError(el, 'Full name is required.');
      if (v.length < 3) return setError(el, 'Name must be at least 3 characters.');
      if (!/^[A-Za-z\s'-]+$/.test(v)) return setError(el, 'Name can only contain letters.');
      return setOk(el);
    },
    email: function (el) {
      const v = el.value.trim();
      if (v === '') return setError(el, 'Email is required.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return setError(el, 'Enter a valid email address.');
      return setOk(el);
    },
    phone: function (el) {
      const v = el.value.trim().replace(/\s/g, '');
      if (v === '') return setError(el, 'Phone number is required.');
      if (!/^(\+266)?[256]\d{7}$/.test(v)) return setError(el, 'Use a Lesotho number, e.g. +26658123456 or 58123456.');
      return setOk(el);
    },
    destination: function (el) {
      if (el.value === '') return setError(el, 'Please choose a destination.');
      return setOk(el);
    },
    arrival: function (el) {
      if (el.value === '') return setError(el, 'Select an arrival date.');
      if (el.value < el.min) return setError(el, 'Date cannot be in the past.');
      return setOk(el);
    },
    guests: function (el) {
      const n = Number(el.value);
      if (!Number.isInteger(n) || n < 1 || n > 20) return setError(el, 'Guests must be between 1 and 20.');
      return setOk(el);
    },
    password: function (el) {
      const v = el.value;
      if (v === '') return setError(el, 'Password is required.');
      if (v.length < 8) return setError(el, 'Password must be at least 8 characters.');
      if (!/[A-Z]/.test(v)) return setError(el, 'Include at least one capital letter.');
      if (!/\d/.test(v)) return setError(el, 'Include at least one number.');
      return setOk(el);
    },
    confirm: function (el) {
      if (el.value === '') return setError(el, 'Please confirm your password.');
      if (el.value !== document.getElementById('password').value) return setError(el, 'Passwords do not match.');
      return setOk(el);
    }
  };

  function validateGender() {
    const chosen = form.querySelector('input[name="gender"]:checked');
    document.getElementById('genderError').classList.toggle('d-none', !!chosen);
    return !!chosen;
  }

  // Live validation: check each field as the user leaves it
  Object.keys(validators).forEach(function (id) {
    const el = document.getElementById(id);
    el.addEventListener('blur', function () { validators[id](el); });
    el.addEventListener('input', function () {
      if (el.classList.contains('is-invalid')) validators[id](el);
    });
  });

  // On submit: validate everything
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    let allValid = true;

    Object.keys(validators).forEach(function (id) {
      if (!validators[id](document.getElementById(id))) allValid = false;
    });
    if (!validateGender()) allValid = false;

    if (allValid) {
      const name = document.getElementById('fullName').value.trim();
      successBox.textContent = 'Thank you, ' + name + '! Your registration was submitted successfully.';
      successBox.classList.remove('d-none');
      successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      form.reset();
      form.querySelectorAll('.is-valid, .is-invalid').forEach(function (el) {
        el.classList.remove('is-valid', 'is-invalid');
      });
    } else {
      successBox.classList.add('d-none');
      const firstBad = form.querySelector('.is-invalid');
      if (firstBad) firstBad.focus();
    }
  });

  // Clear button also removes validation styling
  form.addEventListener('reset', function () {
    form.querySelectorAll('.is-valid, .is-invalid').forEach(function (el) {
      el.classList.remove('is-valid', 'is-invalid');
    });
    successBox.classList.add('d-none');
  });
});