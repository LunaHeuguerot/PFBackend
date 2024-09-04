document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.querySelector('form');
    
    uploadForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const fileInput = uploadForm.querySelector('#document');
        const file = fileInput.files[0];  
        
        if (!file) {
            alert('Please select a file to upload.');
            return;
        }
        
        const formData = new FormData();
        formData.append('document', file);  
        
        try {
            const response = await fetch(uploadForm.action, {
                method: 'POST',
                body: formData  
            });

            if (response.ok) {
                alert('File uploaded successfully!');
                window.location.href = '/profile';  
            } else {
                const data = await response.json();
                alert('Error uploading file: ' + data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to upload file.');
        }
    });
});
