document.addEventListener('DOMContentLoaded', () => {
    const socketClient = io('ws://localhost:5050');
    const productsList = document.getElementById('productsList');

    document.getElementById('agregar-producto-btn').addEventListener('click', async (event) => {
        event.preventDefault();

        const title = document.getElementById('nombre-producto').value;
        const description = document.getElementById('descripcion-producto').value;
        const price = document.getElementById('precio-producto').value;
        const code = document.getElementById('codigo-producto').value;
        const stock = document.getElementById('stock-producto').value;
        const status = document.getElementById('status').checked;
        const category = document.getElementById('category').value;
        const thumbnailInput = document.getElementById('thumbnails-producto');;
        const thumbnailFile = thumbnailInput ? thumbnailInput.files[0] : null;

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('code', code);
        formData.append('stock', stock);
        formData.append('status', status);
        formData.append('category', category);
        if (thumbnailFile) {
            formData.append('thumbnail', thumbnailFile);
        }

        try {
            const response = await fetch('/api/products/', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Producto agregado:', data);
                document.getElementById('formulario-producto').reset();
                socketClient.emit('new-product', data.product);
            } else {
                console.error('Error al agregar el producto:', response.statusText);
            }
        } catch (error) {
            console.error('Error al agregar el producto:', error.message);
        }
    });

    // Código para manejar eventos de WebSocket
    socketClient.on('new-product', data => {
        if (data && data.product) {
            const nuevoProducto = data.product;
            const nuevoItem = document.createElement('li');
            nuevoItem.textContent = `${nuevoProducto.title} ($${nuevoProducto.price})`;
            nuevoItem.classList.add('list-group-item');

            const deleteIcon = document.createElement('span');
            deleteIcon.classList.add('delete-product');
            deleteIcon.setAttribute('data-product-id', nuevoProducto.id);

            const deleteIconInnerHtml = '<i class="bi bi-trash-fill"></i>';
            deleteIcon.innerHTML = deleteIconInnerHtml;

            nuevoItem.appendChild(deleteIcon);
            productsList.appendChild(nuevoItem);

            deleteIcon.addEventListener('click', async (event) => {
                event.preventDefault();
                const productId = event.currentTarget.getAttribute('data-product-id');
                const listItemToDelete = event.currentTarget.parentElement;

                try {
                    const response = await fetch(`/api/products/${productId}`, {
                        method: 'DELETE',
                    });

                    if (response.ok) {
                        listItemToDelete.remove();
                        socketClient.emit('delete-product', productId);
                    } else {
                        console.error('Error al eliminar el producto:', response.statusText);
                    }
                } catch (error) {
                    console.error('Error al eliminar el producto:', error.message);
                }
            });
        } else {
            console.error('Datos recibidos no válidos:', data);
        }
    });

    socketClient.on('delete-product', data => {
        if (data && data.id) {
            const listItemToDelete = document.querySelector(`[data-product-id="${data.id}"]`);
            if (listItemToDelete) {
                listItemToDelete.parentElement.removeChild(listItemToDelete);
            }
        }
    });
});
