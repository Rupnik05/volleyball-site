document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registrationForm');
    const formMessage = document.getElementById('formMessage');
    const phoneInput = document.getElementById('captain_phone');

    phoneInput.addEventListener('input', () => {
        let value = phoneInput.value.replace(/\D/g, '');
        if (value.length > 3) {
            value = value.substring(0, 3) + ' ' + value.substring(3);
        }
        if (value.length > 7) {
            value = value.substring(0, 7) + ' ' + value.substring(7);
        }
        phoneInput.value = value.substring(0, 11);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Validation
        if (!data.team_name || !data.captain_name || !data.captain_email || !data.players_count || !data.rules) {
            showMessage('Prosimo, izpolnite vsa polja in se strinjate s pravili.', 'error');
            return;
        }

        if (!validateEmail(data.captain_email)) {
            showMessage('Prosimo, vnesite veljaven e-poštni naslov.', 'error');
            return;
        }

        if (data.captain_phone && !validatePhone(data.captain_phone)) {
            showMessage('Prosimo, vnesite veljavno telefonsko številko v formatu XXX XXX XXX.', 'error');
            return;
        }

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                window.location.href = `success.html?ref=${result.paymentReference}`;
            } else {
                showMessage(result.error, 'error');
            }
        } catch (error) {
            showMessage('Prišlo je do napake. Poskusite znova.', 'error');
        }
    });

    function showMessage(message, type) {
        formMessage.textContent = message;
        formMessage.className = `form-message ${type}`;
    }

    function validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    function validatePhone(phone) {
        const re = /^\d{3} \d{3} \d{3}$/;
        return re.test(phone);
    }
});
