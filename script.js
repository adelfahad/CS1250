function selectTicket(ticketName, price) {
    document.getElementById('ticketDetails').textContent = `التذكرة: ${ticketName}`;
    document.getElementById('ticketPrice').textContent = `السعر: ${price} ريال`;
    document.getElementById('selectedTicket').style.display = 'block';
}
window.onload = () => {
    const ticketId = 1; // افترض أن رقم التذكرة 1، يمكن تغيير هذا بناءً على التذكرة المطلوبة

    fetch('http://localhost:3000/generate-barcode', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ticketId })
    })
    .then(response => response.json())
    .then(data => {
        // تحديث الباركود في الصفحة
        const barcodeElement = document.getElementById('barcode');
        barcodeElement.textContent = `Barcode: ${data.barcode}`;
    })
    .catch(error => console.error('Error:', error));
};
