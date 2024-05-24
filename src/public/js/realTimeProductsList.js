document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    // Escuchar el evento 'products' para renderizar la tabla de productos
    socket.on('products', products => {
        const productsContainer = document.getElementById('products-table');

        if (!productsContainer) {
            console.error("Element with ID 'products-table' not found.");
            return;
        }

        const headerHTML = `
            <tr>
                <th>Id:</th>
                <th>Título:</th>
                <th>Descripción:</th>
                <th>Código:</th>
                <th>Precio:</th>
                <th>Estado:</th>
                <th>Stock:</th>
                <th>Categoría:</th>
                <th>Imágenes:</th>
            </tr>
        `;

        productsContainer.innerHTML = headerHTML;

        products.forEach((product) => {
            const {
                _id,
                title,
                description,
                code,
                price,
                status = 'N/A',  
                stock,
                category = 'N/A', 
                thumbnail
            } = product;

            productsContainer.innerHTML += `
                <tr>
                    <td>${_id}</td>
                    <td>${title}</td>
                    <td>${description}</td>
                    <td>${code}</td>
                    <td>${price}</td>
                    <td>${status}</td>
                    <td>${stock}</td>
                    <td>${category}</td>
                    <td>${thumbnail}</td>
                </tr>
            `;
        });
    });

    // Manejar el envío del formulario para agregar un nuevo producto
    document.getElementById('new-Product').addEventListener('submit', (event) => {
        event.preventDefault();

        socket.emit('new-product', {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            code: document.getElementById('code').value,
            price: document.getElementById('price').value,
            status: document.getElementById('status').value,
            stock: document.getElementById('stock').value,
            category: document.getElementById('category').value,
            thumbnail: document.getElementById('thumbnail').value
        });

        event.target.reset();
    });

    // Manejar el envío del formulario para eliminar un producto
    document.getElementById('delete-product').addEventListener('submit', (event) => {
        event.preventDefault();

        const pId = document.getElementById('id').value;
        console.log(pId);
        socket.emit('delete-product', pId);
        event.target.reset();
    });

    // Escuchar el evento 'response' para mostrar mensajes de respuesta
    socket.on('response', (response) => {
        const responsiveContainer = document.getElementById('responsive-container');
        if (response.status === 'success') {
            responsiveContainer.innerHTML = `<p class="success">${response.message}</p>`;
        } else {
            responsiveContainer.innerHTML = `<p class="error">${response.message}</p>`;
        }
    });
});
