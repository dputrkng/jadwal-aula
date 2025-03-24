const firebaseConfig = {
    apiKey: "AIzaSyAgRYNgH-3HsnFVuJXAz5AbiBsU-Xe8o2g",
    authDomain: "jadwal-aula.firebaseapp.com",
    projectId: "jadwal-aula",
    storageBucket: "jadwal-aula.appspot.com",
    messagingSenderId: "1075933905095",
    appId: "1:1075933905095:web:c2836158c7d750516ebee2"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const form = document.getElementById('bookingForm');
const scheduleTableBody = document.querySelector('#schedule tbody');
let editBookingId = null;

function openPopup() {
    document.getElementById('bookingPopup').style.display = 'block';
}

function closePopup() {
    document.getElementById('bookingPopup').style.display = 'none';
    form.reset();
    editBookingId = null;
    document.getElementById('submitBtn').textContent = 'Pesan';
}

function checkForConflicts(room, date, startTime, endTime, callback) {
    db.collection('bookings')
        .where('room', '==', room)
        .where('date', '==', date)
        .get()
        .then(querySnapshot => {
            let isConflict = false;
            querySnapshot.forEach(doc => {
                const booking = doc.data();
                if (doc.id !== editBookingId &&
                    ((startTime < booking.endTime && endTime > booking.startTime))) {
                    isConflict = true;
                }
            });
            callback(isConflict);
        })
        .catch(error => {
            console.error('Error checking for conflicts:', error);
            alert('Terjadi kesalahan saat memeriksa konflik jadwal!');
        });
}

function handleFormSubmit(event) {
    event.preventDefault();

    const bookingData = {
        room: form.room.value,
        date: form.date.value,
        startTime: form.startTime.value,
        endTime: form.endTime.value,
        purpose: form.purpose.value,
        bidang: form.bidang.value,
        pic: form.pic.value
    };

    checkForConflicts(bookingData.room, bookingData.date, bookingData.startTime, bookingData.endTime, (isConflict) => {
        if (isConflict) {
            alert('Ruangan sudah terbooking pada waktu yang anda pilih, silahkan memilih jadwal lain!');
        } else {
            const operation = editBookingId
                ? db.collection('bookings').doc(editBookingId).update(bookingData)
                : db.collection('bookings').add({ ...bookingData, status: 'verifikasi' });

            operation.then(() => {
                alert(editBookingId ? 'Data berhasil diperbarui!' : 'Data berhasil disimpan!');
                closePopup();
                updateSchedule();
            }).catch(error => {
                console.error('Error handling document:', error);
                alert('Terjadi kesalahan saat memproses data!');
            });
        }
    });
}

form.addEventListener('submit', handleFormSubmit);

// Function to get day name in Indonesian
function getDayName(dateString) {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const date = new Date(dateString);
    return days[date.getDay()];
}

function formatDate(dateString) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

function updateSchedule() {
    scheduleTableBody.innerHTML = '';
    const today = new Date().toISOString().split('T')[0];
    db.collection('bookings')
        .orderBy('room')
        .orderBy('date')
        .orderBy('startTime')
        .get()
        .then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const booking = doc.data();
                if (booking.date >= today) {
                    const dayName = getDayName(booking.date);
                    const formattedDate = formatDate(booking.date);
                    
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${booking.room}</td>
                        <td>${dayName}</td>
                        <td>${formattedDate}</td>
                        <td>${booking.startTime} - ${booking.endTime}</td>
                        <td>${booking.purpose}</td>
                        <td>${booking.bidang}</td>
                        <td>${booking.pic}</td>
                        <td>${booking.status}</td>
                    `;
                    scheduleTableBody.appendChild(row);
                }
            });
        })
        .catch(error => {
            console.error('Error getting documents: ', error);
            alert('Terjadi kesalahan saat mengambil data jadwal!');
        });
}

// Initial call to display bookings
updateSchedule();