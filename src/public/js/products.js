let cartId = sessionStorage.getItem('cartId');

async function createCart() {
    try {
        const response = await fetch('/carts', { method: 'POST' });
        const data = await response.json();

        if (data.status === 'success') {
            sessionStorage.setItem('cartId', data.payload._id);
            return data.payload._id;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error al crear el carrito:', error);
    }
}

async function addProductToCart(productId, cartId) {
    try {
        console.log('Intentando agregar el producto...');
        const response = await fetch(`/carts/${cartId}/product/${productId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
  
        console.log('Respuesta recibida, procesando...');
      
        if (!response.ok) {
            console.error('Respuesta del servidor no fue ok:', response.status);
            throw new Error('Error en la petición al servidor.');
        }
  
        const result = await response.json();
        console.log('Resultado del servidor:', result);
  
        if (result.success) {
            console.log('Producto agregado al carrito.');
        } else {
            console.error('El servidor respondió con éxito falso:', result);
            throw new Error('No se pudo agregar el producto al carrito.');
        }
    } catch (error) {
        console.error('Error capturado:', error.message);
        alert('Error: No se pudo agregar el producto al carrito.');
    }
}
  



async function viewCart() {
    try {
        if (!cartId) {
            cartId = await createCart();
        }

        window.location.href = `/carts/${cartId}`;
    } catch (error) {
        alert(error.message || 'Error al mostrar carrito');
    }
}


async function updateProductQuantity(productId) {
    try {
        const quantity = document.getElementById(`quantity-${productId}`).value; // Corrección aquí
        if (quantity <= 0) {
            alert('La cantidad debe ser mayor a 0.');
            return;
        }

        const response = await fetch(`/carts/${cartId}/product/${productId}`, { // Corrección aquí
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quantity })
        });

        const data = await response.json();
        if (data.status === 'Ok') {
            alert('Cantidad actualizada correctamente');
            window.location.reload();
        } else {
            alert(data.error || 'Error al actualizar la cantidad');
        }
    } catch (error) {
        alert(error.message || 'Error al actualizar la cantidad');
    }
}

async function removeProduct(productId) {
    try {
        const response = await fetch(`/carts/${cartId}/product/${productId}`, { method: 'DELETE' }); // Corrección aquí
        const data = await response.json();

        if (data.status === 'Ok') {
            alert('Producto eliminado correctamente');
            window.location.reload();
        } else {
            alert(data.error || 'Error al eliminar el producto');
        }
    } catch (error) {
        alert(error.message || 'Error al eliminar el producto');
    }
}

async function confirmPurchase() {
    try {
        const response = await fetch(`/carts/${cartId}/purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        if (data.status === 'Ok') {
            alert('Compra realizada con éxito');
            window.location.reload();
        } else {
            alert(data.error || 'Error al confirmar la compra');
        }
    } catch (error) {
        alert(error.message || 'Error al confirmar la compra');
    }
}
