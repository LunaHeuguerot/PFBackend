document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.querySelector('#registerForm');

    registerForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const firstName = registerForm.querySelector('#first_name').value;
        const lastName = registerForm.querySelector('#last_name').value;
        const email = registerForm.querySelector('#email').value;
        const age = registerForm.querySelector('#age').value;
        const password = registerForm.querySelector('#password').value;
        const confirmPassword = registerForm.querySelector('#confirm_password').value;

        if(password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }

        if(password.length < 8){
            alert('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        const formData = {
            first_name: firstName,
            last_name: lastName,
            email,
            age, 
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

            if(response.ok){
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
