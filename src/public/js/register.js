document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.querySelector('#registerForm');

    registerForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const first_name = registerForm.querySelector('#first_name').value;
        const last_name = registerForm.querySelector('#last_name').value;
        const age = registerForm.querySelector('#age').value;
        const email = registerForm.querySelector('#email').value;
        const password = registerForm.querySelector('#password').value;
        const confirm_password = registerForm.querySelector('#confirm_password').value;

        if (password !== confirm_password) {
            alert('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 8) {
            alert('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        const formData = {
            first_name,
            last_name,
            age,
            email,
            password
        };

        try {
            const response = await fetch('/api/sessions/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                window.location.href = '/registered';
            } else {
                const data = await response.json();
                alert(data.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
});
