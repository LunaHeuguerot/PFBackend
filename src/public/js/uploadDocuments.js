document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.querySelector('form');

    uploadForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const fileInput = uploadForm.querySelector('input[type="file"]');
        const files = fileInput.files;

        if (files.length === 0) {
            alert('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        Array.from(files).forEach(file => formData.append('documents', file)); 

        try {
            const response = await fetch(uploadForm.action, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert('Files uploaded successfully!');
                // window.location.href = '/profile';  
                window.location.reload();
            } else {
                const data = await response.json();
                alert('Error uploading files: ' + data.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to upload files.');
        }
    });
});
