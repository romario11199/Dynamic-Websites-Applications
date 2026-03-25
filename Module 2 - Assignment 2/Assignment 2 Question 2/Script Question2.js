document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('paymentForm');
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    const creditCardSection = document.getElementById('creditCardSection');
    const creditCardInputs = creditCardSection.querySelectorAll('input');
    const sameAsBillingCheckbox = document.getElementById('sameAsBilling');
    const shippingSection = document.getElementById('shippingSection');

    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            if (this.value === 'paypal') {
                creditCardInputs.forEach(input => {
                    input.disabled = true;
                    input.required = false;
                });
                creditCardSection.style.opacity = '0.6';
            } else {
                creditCardInputs.forEach(input => {
                    input.disabled = false;
                    input.required = true;
                });
                creditCardSection.style.opacity = '1';
            }
        });
    });

    sameAsBillingCheckbox.addEventListener('change', function() {
        if (this.checked) {
            shippingSection.style.display = 'none';
        } else {
            shippingSection.style.display = 'block';
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;

        const emailInput = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(emailInput.value)) {
            emailInput.setCustomValidity('Please enter a valid email address (e.g., name@domain.com)');
            emailInput.reportValidity();
            isValid = false;
        } else {
            emailInput.setCustomValidity('');
        }

        const requiredInputs = form.querySelectorAll('input[required]');
        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                input.setCustomValidity('This field is required');
                input.reportValidity();
                isValid = false;
            } else {
                input.setCustomValidity('');
            }
        });

        const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked').value;
        
        if (selectedPayment === 'credit') {
            const cardNumber = document.getElementById('cardNumber');
            const cardNumberRegex = /^\d{16}$/;
            if (!cardNumberRegex.test(cardNumber.value.replace(/\s/g, ''))) {
                cardNumber.setCustomValidity('Please enter a valid 16-digit card number');
                cardNumber.reportValidity();
                isValid = false;
            }

            const expiry = document.getElementById('expiry');
            const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
            if (!expiryRegex.test(expiry.value)) {
                expiry.setCustomValidity('Please enter a valid expiry date (MM/YY)');
                expiry.reportValidity();
                isValid = false;
            }

            const cvv = document.getElementById('cvv');
            const cvvRegex = /^\d{3}$/;
            if (!cvvRegex.test(cvv.value)) {
                cvv.setCustomValidity('Please enter a valid 3-digit CVV');
                cvv.reportValidity();
                isValid = false;
            }
        }

        if (isValid) {
            alert('Form submitted successfully!');
            form.reset();
            creditCardInputs.forEach(input => {
                input.disabled = false;
                input.required = true;
            });
            creditCardSection.style.opacity = '1';
            shippingSection.style.display = 'none';
            sameAsBillingCheckbox.checked = true;
        }
    });

    document.getElementById('email').addEventListener('input', function() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.value) && this.value.length > 0) {
            this.setCustomValidity('Please enter a valid email address');
        } else {
            this.setCustomValidity('');
        }
    });

    document.getElementById('cardNumber').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s/g, '');
        if (value.length > 0) {
            value = value.match(new RegExp('.{1,4}', 'g')).join(' ');
            e.target.value = value;
        }
    });

    document.getElementById('expiry').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
            e.target.value = value;
        }
    });

    document.getElementById('cvv').addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
    });
});
