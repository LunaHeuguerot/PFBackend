document.addEventListener('DOMContentLoaded', function() {
    const logoutForm = document.querySelector('#logoutForm');

    logoutForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        try {
            const response = await fetch('/api/sessions/logout', {
                method: 'POST'
            });

            if (response.ok) {
                window.location.href = '/'; 
            } else {
                alert('Error al cerrar sesión');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
});
