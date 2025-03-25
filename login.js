const firebaseConfig = {
    apiKey: "AIzaSyAgRYNgH-3HsnFVuJXAz5AbiBsU-Xe8o2g",
    authDomain: "jadwal-aula.firebaseapp.com",
    projectId: "jadwal-aula",
    storageBucket: "jadwal-aula.appspot.com",
    messagingSenderId: "1075933905095",
    appId: "1:1075933905095:web:c2836158c7d750516ebee2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    // Check user credentials in Firestore
    db.collection('users').where('username', '==', username)
        .where('password', '==', password)
        .get()
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                // Login successful
                querySnapshot.forEach((doc) => {
                    const userData = doc.data();
                    // Store user role in sessionStorage
                    sessionStorage.setItem('userRole', userData.role);
                    
                    // Redirect based on role
                    if (userData.role === 'admin') {
                        window.location.href = 'xxxindex.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                });
            } else {
                // Login failed
                errorMessage.textContent = 'Username atau password salah';
            }
        })
        .catch((error) => {
            console.error('Error logging in:', error);
            errorMessage.textContent = 'Terjadi kesalahan saat login';
        });
});