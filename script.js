function createTicket(ticketClass, hours) {
    const ticketData = { class: ticketClass, hours };

    fetch('http://localhost:3000/generate-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData),
    })
        .then(response => response.json())
        .then(data => {
            if (data.barcode) {
                alert(`Ticket created successfully!\nStart: ${data.startTime}\nEnd: ${data.endTime}`);
                window.location.href = `barcode.html?barcode=${data.barcode}`;
            } else {
                alert('Failed to create ticket.');
            }
        })
        .catch(error => console.error('Error:', error));
}
