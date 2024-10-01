let cartId = sessionStorage.getItem('cartId');

async function createCart() {
    try {
        const response = await fetch('/carts', { method: 'POST' });
        const data = await response.json();

        if(data.status === 'Ok') {
            cartId = data.payload._id;
            sessionStorage.setItem('cartId', cartId);
            return cartId;
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        alert(error.message || 'Error al crear el carrito');
    }
};

async function addProductToCart(productId) {
    try {
        if(!cartId) {
            cartId = await createCart();
        }
        
        const response = await fetch(`/carts/${cartId}/products/${productId}`, { method: 'POST' });
        const data = await response.json();
        if(data.status === 'success') {
            alert(`Producto con id ${productId} agregado al carrito exitosamente`);
        } 
    } catch (error) {
        alert(error.message || `Error al agregar el producto con id ${productId} al carrito`);
    }
};

async function viewCart() {
    try {
        if(!cartId) {
            cartId = await createCart();
        }

        window.location.href = `/carts/${cartId}`;
    } catch (error) {
        alert(error.message || 'Error al mostrar carrito');
    }
};

async function updateProductQuantity(productId) {
    try {
        const quantity = document.getElementById(`quantity-${productId}`).value;
        if (quantity <= 0) {
            alert('La cantidad debe ser mayor a 0.');
            return;
        }

        const response = await fetch(`/carts/${cartId}/product/${productId}`, {
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
        const response = await fetch(`/carts/${cartId}/product/${productId}`, { method: 'DELETE' });
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

