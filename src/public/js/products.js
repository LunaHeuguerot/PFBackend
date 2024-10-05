let cartId = sessionStorage.getItem('cartId')?.trim();
console.log(cartId)

async function createCart() {
    try {
        const response = await fetch('/carts', { method: 'POST' });
        const data = await response.json();

        if (data.status === 'success') {
            sessionStorage.setItem('cartId', data.payload._id.trim());;
            return data.payload._id;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error al crear el carrito:', error);
    }
}

async function getCartId() {
    if (!cartId) {
        cartId = await createCart();  
    }
    return cartId;
}

async function addProductToCart(productId, quantity = 1) {
    try {
        const cartId = await getCartId();  

        const response = await fetch(`/carts/${cartId}/product/${productId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quantity }),  
        });

        if (!response.ok) {
            console.error('Error en la respuesta del servidor:', response.status);
            throw new Error('Error en la petición al servidor.');
        }

        const result = await response.json();

        if (result.status === 'Ok') {
            alert(`Producto con ID: ${productId} agregado/actualizado correctamente.`);
            window.location.reload();  
        } else {
            console.error('Error al procesar la respuesta del servidor:', result);
            throw new Error('No se pudo agregar o actualizar el producto en el carrito.');
        }
    } catch (error) {
        console.error('Error en addProductToCart:', error);
        alert('Error: No se pudo agregar o actualizar el producto en el carrito.');
    }
}

async function updateProductQuantity(productCode) { 
    try {
        const cartId = sessionStorage.getItem('cartId'); 
        console.log(`Obteniendo carrito ID: ${cartId}`);
        if (!cartId) {
            alert('No se encontró el carrito en la sesión.');
            return;
        }

        const quantityElement = document.getElementById(`quantity-${productCode}`); 
        if (!quantityElement) {
            alert('Elemento de cantidad no encontrado.');
            return;
        }

        const quantity = parseInt(quantityElement.value, 10); 
        console.log(`Actualizando producto con código ${productCode} en el carrito ${cartId} con cantidad ${quantity}`);

        if (quantity <= 0 || isNaN(quantity)) {
            alert('La cantidad debe ser mayor a 0 y válida.');
            return;
        }

        const response = await fetch(`/carts/${cartId}/product/${productCode}`, { 
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quantity }),
            credentials: 'include'
        });

        console.log('Respuesta del servidor al actualizar la cantidad:', response);

        if (!response.ok) {
            const errorText = await response.text(); 
            console.error('Error en la respuesta del servidor:', response.status, errorText);
            throw new Error(`Error al actualizar la cantidad: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Datos de la respuesta al actualizar cantidad:', data);

        if (data.status === 'Ok') {
            alert('Cantidad actualizada correctamente');
            quantityElement.value = quantity; 
            console.log('Cantidad actualizada en el DOM para el producto:', productCode);
        } else {
            alert(data.error || 'Error al actualizar la cantidad');
            console.error('Error al actualizar cantidad:', data.error);
        }
    } catch (error) {
        console.error('Error en updateProductQuantity:', error);
        alert(error.message || 'Error al actualizar la cantidad');
    }
}


async function removeProduct(productCode) {  
    try {
        const currentCartId = sessionStorage.getItem('cartId');
        if (!currentCartId) {
            alert('No se encontró el carrito en la sesión.');
            return;
        }

        const response = await fetch(`/carts/${currentCartId}/product/${productCode}`, { method: 'DELETE' });
        console.log('Respuesta del servidor al eliminar producto:', response);

        const data = await response.json();

        if (data.status === 'Ok') {
            alert('Producto eliminado correctamente');
            console.log('Producto eliminado del carrito:', productCode);
            window.location.reload();  
        } else {
            alert(data.message || 'Error al eliminar el producto');
            console.error('Error al eliminar producto:', data.message);
        }
    } catch (error) {
        console.error('Error en removeProduct:', error);
        alert(error.message || 'Error al eliminar el producto');
    }
}

async function confirmPurchase() {
    try {
        const currentCartId = sessionStorage.getItem('cartId');

        if (!currentCartId) {
            console.error('No se encontró el carrito en la sesión.'); // Log de error si no se encuentra el carrito
            alert('No se encontró el carrito en la sesión.');
            return;
        }

        const response = await fetch(`/carts/${currentCartId}/purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });


        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.message || 'Error al confirmar la compra');
            return;
        }

        const data = await response.json();
        console.log('Datos recibidos al confirmar compra:', data); 

        if (data.status === 'Ok') {
            const total = document.getElementById('cart-total'); 
            alert(`Se confirmó la compra por $${total}`); 
            window.location.href = '/products';
        } else {
            alert(data.message || 'Error al confirmar la compra');
        }
    } catch (error) {
        console.error('Error en confirmPurchase:', error); 
        alert(error.message || 'Error al confirmar la compra');
    }
}

async function viewCart() {
    try {
        if (!cartId) {
            cartId = await createCart();
        }
        window.location.href = `/carts/${cartId}`;
    } catch (error) {
        console.error('Error en viewCart:', error);
        alert(error.message || 'Error al mostrar carrito');
    }
}
