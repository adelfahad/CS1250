function selectTicket(ticketName, price) {
    document.getElementById('ticketDetails').textContent = `التذكرة: ${ticketName}`;
    document.getElementById('ticketPrice').textContent = `السعر: ${price} ريال`;
    document.getElementById('selectedTicket').style.display = 'block';
}