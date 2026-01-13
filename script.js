// DOM Elements
const form = document.getElementById('booking-form');
const steps = document.querySelectorAll('.form-step');
const adultQtyInput = document.getElementById('adult-qty');
const childQtyInput = document.getElementById('child-qty');

// Vehicle Inputs
const motorQtyInput = document.getElementById('motor-qty');
const carPaxQtyInput = document.getElementById('car-pax-qty');
const carPickupQtyInput = document.getElementById('car-pickup-qty');
const truckSmallQtyInput = document.getElementById('truck-small-qty');
const truckLargeQtyInput = document.getElementById('truck-large-qty');

const step2Total = document.getElementById('step2-total');
const finalTotal = document.getElementById('final-total');
const summaryList = document.getElementById('order-summary-list');
const successModal = document.getElementById('success-modal');
const faqQuestions = document.querySelectorAll('.faq-question');

// State
let currentStep = 1;

// Step Navigation
function nextStep(step) {
    // Validation
    if (step === 1) {
        const date = document.getElementById('departure-date').value;
        const time = document.getElementById('departure-time').value;
        if (!date || !time) {
            alert('Silakan pilih tanggal dan jam keberangkatan.');
            return;
        }
    }

    if (step === 2) {
        const calc = calculateTotal();
        const totalItems = calc.adult.qty + calc.child.qty + calc.motor.qty +
            calc.carPax.qty + calc.carPickup.qty +
            calc.truckSmall.qty + calc.truckLarge.qty;

        if (totalItems === 0) {
            alert('Silakan pilih minimal satu tiket.');
            return;
        }
        updateSummary();
    }

    if (step === 3) {
        const name = document.getElementById('fullname').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        if (!name || !email || !phone) {
            alert('Silakan lengkapi data pemesan.');
            return;
        }
    }

    // Move to next step
    document.querySelector(`.form-step[data-step="${step}"]`).classList.remove('active');
    document.querySelector(`.form-step[data-step="${step + 1}"]`).classList.add('active');
    currentStep = step + 1;
}

function prevStep(step) {
    document.querySelector(`.form-step[data-step="${step}"]`).classList.remove('active');
    document.querySelector(`.form-step[data-step="${step - 1}"]`).classList.add('active');
    currentStep = step - 1;
}

// Price Calculation
function calculateTotal() {
    const prices = {
        adult: 20000,
        child: 10000,
        motor: 40000,
        carPax: 563000,
        carPickup: 553000,
        truckSmall: 1307000,
        truckLarge: 2000000
    };

    const qtys = {
        adult: parseInt(adultQtyInput.value) || 0,
        child: parseInt(childQtyInput.value) || 0,
        motor: parseInt(motorQtyInput.value) || 0,
        carPax: parseInt(carPaxQtyInput.value) || 0,
        carPickup: parseInt(carPickupQtyInput.value) || 0,
        truckSmall: parseInt(truckSmallQtyInput.value) || 0,
        truckLarge: parseInt(truckLargeQtyInput.value) || 0,
    };

    let total = 0;
    const result = { total: 0, formatted: '' };

    for (const [key, qty] of Object.entries(qtys)) {
        const subtotal = qty * prices[key];
        total += subtotal;
        result[key] = { qty, price: prices[key], subtotal };
    }

    result.total = total;
    result.formatted = 'Rp ' + total.toLocaleString('id-ID');

    step2Total.textContent = result.formatted;
    finalTotal.textContent = result.formatted;

    return result;
}

// Update Summary for Step 4
function updateSummary() {
    const calc = calculateTotal();
    const date = document.getElementById('departure-date').value;
    const time = document.getElementById('departure-time').value;

    // Clear list
    summaryList.innerHTML = '';

    // Add Route item
    const route = document.getElementById('route');
    const routeText = route ? route.options[route.selectedIndex].text : "Kayangan -> Pototano";
    const routeItem = document.createElement('li');
    routeItem.innerHTML = `<span>Rute</span> <span>${routeText}</span>`;
    summaryList.appendChild(routeItem);


    // Add Date items
    const dateItem = document.createElement('li');
    dateItem.innerHTML = `<span>Jadwal</span> <span>${date}, ${time}</span>`;
    summaryList.appendChild(dateItem);

    // Add Ticket items
    const labels = {
        adult: 'Dewasa',
        child: 'Anak',
        motor: 'Motor',
        carPax: 'Mobil Penumpang',
        carPickup: 'Pick Up',
        truckSmall: 'Truk Kecil',
        truckLarge: 'Truk Besar'
    };

    for (const key in labels) {
        if (calc[key].qty > 0) {
            summaryList.innerHTML += `<li><span>${labels[key]} (${calc[key].qty}x)</span> <span>Rp ${calc[key].subtotal.toLocaleString('id-ID')}</span></li>`;
        }
    }
}

// Event Listeners for Calculation
[adultQtyInput, childQtyInput, motorQtyInput, carPaxQtyInput, carPickupQtyInput, truckSmallQtyInput, truckLargeQtyInput].forEach(input => {
    input.addEventListener('input', calculateTotal);
});

// Form Submission
form.addEventListener('submit', function (e) {
    e.preventDefault();
    // Simulate API call
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Memproses...';
    submitBtn.disabled = true;

    setTimeout(() => {
        // Save Booking First
        saveBooking();

        // Reveal Success Section (Below History)
        const successSection = document.getElementById('success-notification');
        successSection.style.display = 'block';

        // Reset Booking Form to Step 1 immediately
        // Hide Step 4
        document.querySelector('.form-step[data-step="4"]').classList.remove('active');
        // Show Step 1
        document.querySelector('.form-step[data-step="1"]').classList.add('active');
        currentStep = 1;
        form.reset();
        calculateTotal();

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

        // Scroll to History + Success Message
        successSection.scrollIntoView({ behavior: 'smooth' });
    }, 1500);
});

// History Logic
function saveBooking() {
    const calc = calculateTotal();
    const routeSelect = document.getElementById('route');
    const routeValue = routeSelect ? routeSelect.value : "Kayangan -> Pototano";
    const date = document.getElementById('departure-date').value;
    const time = document.getElementById('departure-time').value;
    const name = document.getElementById('fullname').value;

    // Get Payment Method Name
    let payment = 'Unknown';
    const checkedPayment = document.querySelector('input[name="payment"]:checked');
    if (checkedPayment) {
        // Get the text from the label immediately following the radio input
        payment = checkedPayment.nextElementSibling.innerText;
    }

    // Generate Booking ID
    const bookingId = 'T-' + Date.now().toString().slice(-6);

    const bookingData = {
        id: bookingId,
        route: routeValue,
        date: date,
        time: time,
        name: name,
        payment: payment,
        total: calc.formatted,
        items: calc, // Store the calculation object
        timestamp: new Date().toISOString()
    };

    let history = JSON.parse(localStorage.getItem('ferryHistory') || '[]');
    history.unshift(bookingData); // Add new to top
    localStorage.setItem('ferryHistory', JSON.stringify(history));

    renderHistory();
}

function renderHistory() {
    const historyContainer = document.getElementById('history-container');
    const history = JSON.parse(localStorage.getItem('ferryHistory') || '[]');

    if (history.length === 0) {
        historyContainer.innerHTML = '<p class="empty-state">Belum ada riwayat pemesanan.</p>';
        return;
    }

    historyContainer.innerHTML = '';

    history.forEach((ticket, index) => {
        // Summarize items string
        let itemString = [];
        if (ticket.items.adult && ticket.items.adult.qty > 0) itemString.push(`${ticket.items.adult.qty} Dewasa`);
        if (ticket.items.child && ticket.items.child.qty > 0) itemString.push(`${ticket.items.child.qty} Anak`);
        if (ticket.items.motor && ticket.items.motor.qty > 0) itemString.push(`${ticket.items.motor.qty} Motor`);
        if (ticket.items.carPax && ticket.items.carPax.qty > 0) itemString.push(`${ticket.items.carPax.qty} Mbl Penumpang`);
        if (ticket.items.carPickup && ticket.items.carPickup.qty > 0) itemString.push(`${ticket.items.carPickup.qty} Pick Up`);
        if (ticket.items.truckSmall && ticket.items.truckSmall.qty > 0) itemString.push(`${ticket.items.truckSmall.qty} Truk Kcl`);
        if (ticket.items.truckLarge && ticket.items.truckLarge.qty > 0) itemString.push(`${ticket.items.truckLarge.qty} Truk Bsr`);

        let from = 'Kayangan';
        let to = 'Pototano';
        if (ticket.route) {
            if (ticket.route.includes('->')) {
                const parts = ticket.route.split(' -> ');
                from = parts[0];
                to = parts[1];
            } else {
                // Backward compatibility or direct string
                from = 'Kayangan'; to = ticket.route;
            }
        }

        const card = document.createElement('div');
        card.className = 'ticket-card';
        card.innerHTML = `
            <div class="ticket-header">
                <span class="ticket-id">#${ticket.id}</span>
                <span class="ticket-status">LUNAS</span>
            </div>
            <div class="ticket-body">
                <div class="ticket-route">
                    <span>${from}</span>
                    <i class="fas fa-arrow-right route-arrow"></i>
                    <span>${to}</span>
                </div>
                <div class="ticket-details">
                    <div class="ticket-detail-row">
                        <span>Tanggal Berangkat</span>
                        <span>${ticket.date}</span>
                    </div>
                    <div class="ticket-detail-row">
                        <span>Jam</span>
                        <span>${ticket.time} WITA</span>
                    </div>
                    <div class="ticket-detail-row">
                        <span>Tiket & Qty</span>
                        <span style="text-align:right; max-width: 60%; font-size: 0.85rem;">${itemString.join(', ')}</span>
                    </div>
                    <div class="ticket-detail-row">
                        <span>Pemesan</span>
                        <span>${ticket.name}</span>
                    </div>
                    <div class="ticket-detail-row">
                        <span>Metode Bayar</span>
                        <span>${ticket.payment}</span>
                    </div>
                </div>
                <div class="ticket-total">
                    <span>Total</span>
                    <span>${ticket.total}</span>
                </div>
            </div>
            <div class="ticket-footer">
                <div style="display: flex; gap: 10px; justify-content: center; margin-bottom: 10px;">
                    <button onclick="shareTicket(${index}, 'wa')" style="border:none; background:none; color:#25D366; cursor:pointer; font-size:1.2rem;" title="Kirim WhatsApp"><i class="fab fa-whatsapp"></i></button>
                    <button onclick="shareTicket(${index}, 'email')" style="border:none; background:none; color:#EA4335; cursor:pointer; font-size:1.2rem;" title="Kirim Email"><i class="fas fa-envelope"></i></button>
                </div>
                <button class="delete-btn" onclick="deleteHistory(${index})">Hapus Riwayat</button>
            </div>
        `;
        historyContainer.appendChild(card);
    });
}

// Sharing Logic
function getLatestTicket() {
    const history = JSON.parse(localStorage.getItem('ferryHistory') || '[]');
    return history.length > 0 ? history[0] : null;
}

function formatTicketMessage(ticket) {
    if (!ticket) return '';

    // Parse Items
    let itemString = [];
    if (ticket.items.adult && ticket.items.adult.qty > 0) itemString.push(`${ticket.items.adult.qty} Dewasa`);
    if (ticket.items.child && ticket.items.child.qty > 0) itemString.push(`${ticket.items.child.qty} Anak`);
    if (ticket.items.motor && ticket.items.motor.qty > 0) itemString.push(`${ticket.items.motor.qty} Motor`);
    if (ticket.items.carPax && ticket.items.carPax.qty > 0) itemString.push(`${ticket.items.carPax.qty} Mobil Penumpang`);
    if (ticket.items.carPickup && ticket.items.carPickup.qty > 0) itemString.push(`${ticket.items.carPickup.qty} Pick Up`);
    if (ticket.items.truckSmall && ticket.items.truckSmall.qty > 0) itemString.push(`${ticket.items.truckSmall.qty} Truk Kecil`);
    if (ticket.items.truckLarge && ticket.items.truckLarge.qty > 0) itemString.push(`${ticket.items.truckLarge.qty} Truk Besar`);

    // Parse Route
    let from = 'Kayangan', to = 'Pototano';
    if (ticket.route && ticket.route.includes('->')) {
        [from, to] = ticket.route.split(' -> ');
    }

    return `*TIKET PENYEBRANGAN FERRY*
========================
Kode Booking: ${ticket.id}
Status: LUNAS

*Rute:* ${from} -> ${to}
*Jadwal:* ${ticket.date}, ${ticket.time} WITA
*Pemesan:* ${ticket.name}

*Detail Tiket:*
${itemString.join('\n')}

*Total Bayar:* ${ticket.total}
*Metode Bayar:* ${ticket.payment}
========================
Tunjukkan pesan ini kepada petugas pelabuhan saat boarding.`;
}

function sendToWhatsapp() {
    const ticket = getLatestTicket();
    if (!ticket) return;

    const message = encodeURIComponent(formatTicketMessage(ticket));
    window.open(`https://wa.me/?text=${message}`, '_blank');
}

function sendToEmail() {
    const ticket = getLatestTicket();
    if (!ticket) return;

    const subject = encodeURIComponent(`E-Tiket Penyebrangan Ferry - ${ticket.id}`);
    const body = encodeURIComponent(formatTicketMessage(ticket));
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
}

function shareTicket(index, method) {
    const history = JSON.parse(localStorage.getItem('ferryHistory') || '[]');
    const ticket = history[index];
    if (!ticket) return;

    if (method === 'wa') {
        const message = encodeURIComponent(formatTicketMessage(ticket));
        window.open(`https://wa.me/?text=${message}`, '_blank');
    } else if (method === 'email') {
        const subject = encodeURIComponent(`E-Tiket Penyebrangan Ferry - ${ticket.id}`);
        const body = encodeURIComponent(formatTicketMessage(ticket));
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    }
}

function deleteHistory(index) {
    if (confirm('Hapus riwayat tiket ini?')) {
        let history = JSON.parse(localStorage.getItem('ferryHistory') || '[]');
        history.splice(index, 1);
        localStorage.setItem('ferryHistory', JSON.stringify(history));
        renderHistory();
    }
}

// Initial Render
document.addEventListener('DOMContentLoaded', renderHistory);

// Reset Booking Flow
function resetBooking() {
    const successSection = document.getElementById('success-notification');
    successSection.style.display = 'none';

    // Scroll to Top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// FAQ Accordion
faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
        const item = question.parentNode;
        item.classList.toggle('active');
    });
});
