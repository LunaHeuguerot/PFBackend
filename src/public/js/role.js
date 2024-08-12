document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('roleForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const userId = document.getElementById('userId').value;
        console.log(`User ID: ${userId}`); 
        const response = await fetch(`/api/user/premium/${userId}`, {
            method: 'PUT',
        });

        const messageElement = document.getElementById('message');
        if (response.ok) {
            const updatedUser = await response.json();
            messageElement.textContent = `User role updated to: ${updatedUser.role}`;
        } else {
            const error = await response.json();
            messageElement.textContent = `Error: ${error.error}`;
        }
    });
});
