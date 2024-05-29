// Id del carrito hardcodeado, falta agregar sessions

async function addProductToCart(productId) {
    try {
        const response = await fetch(`/api/carts/66578fc1d0ea1f237953fc21/products/${productId}`, { method: 'POST' });
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
        window.location.href = `/carts/665798b7da3ee74baeccfd58`;
    } catch {
        alert(error.message || 'Error al mostrar carrito');
    }
};