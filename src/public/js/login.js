document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('#loginForm');

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const email = loginForm.querySelector('#email').value;
        const password = loginForm.querySelector('#password').value;

        const formData = { email, password };

        try {
            const response = await fetch('/api/sessions/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                window.location.href = '/products';
            } else {
                const data = await response.json();
                const messageElement = document.getElementById('message');
                messageElement.textContent = data.message;
            }
        } catch (error) {
            console.error('Error:', error);
            const messageElement = document.getElementById('message');
            messageElement.textContent = 'Failed to login';
        }
    });
});
