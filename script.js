// =================================================================
// ⚙️ PENGATURAN DATA VALIDASI LOGIN & WHATSAPP 
// =================================================================
const AUTH_CONFIG = {
  // Masukkan variasi nama panggilannya (Gunakan HURUF KECIL SEMUA)
  partnerNames: ["ale", "jalal"], 
  
  // Masukkan variasi nama kamu (Gunakan HURUF KECIL SEMUA)
  yourNames: ["kila", "nabhita", "nabhita akhilla"], 
  
  // Tanggal jadian dengan format YYYY-MM-DD (Contoh: "2024-05-20")
  anniversaryDate: "2026-06-06" 
};

// Masukkan nomor WhatsApp kamu untuk menerima ajakan (Awali dengan kode negara 62)
const myPhoneNumber = "6285136407907"; 

// =================================================================

// Database Pesan Mood
const moodMessages = {
  capek: "Istirahat dulu yaa. Kamu udah melakukan yang terbaik hari ini. Rebahan aja, gak usah mikirin apa-apa dulu. I'm so proud of you 🤍",
  overthinking: "Tarik napas dalam-dalam... hembuskan perlahan. Segala hal yang kamu khawatirkan belum tentu terjadi kok. Kalau butuh teman cerita, aku selalu ada di sini.",
  kangen: "Aku juga kangen banget sama kamu! Nanti kalau ada waktu senggang, kita obrolin hal-hal lucu yaa 🥰",
  tenang: "Selamat menikmati waktu tenangmu. Semoga harimu damai dan menyenangkan ✨"
};

// Database Toples Pesan Acak
const notes = [
  "Makasih ya udah selalu bertahan sejauh ini!",
  "Senyum kamu itu selalu berhasil bikin hariku lebih cerah.",
  "Jangan lupa minum air putih hari ini!",
  "Kamu itu berharga banget buat aku.",
  "Kalau lagi capek, ingat ya ada aku yang siap dengerin cerita kamu.",
  "I'm always on your side, no matter what!"
];

let timerInterval = null;
let audioContext = null;
let isPlayingAudio = false;

// --- LOGIKA LOGIN ---
function checkLogin() {
  const pName = document.getElementById('partner-name').value.trim().toLowerCase();
  const yName = document.getElementById('your-name').value.trim().toLowerCase();
  const dateVal = document.getElementById('anniversary-date').value;

  const isPartnerValid = AUTH_CONFIG.partnerNames.includes(pName);
  const isYourNameValid = AUTH_CONFIG.yourNames.includes(yName);
  const isDateValid = (dateVal === AUTH_CONFIG.anniversaryDate);

  if (isPartnerValid && isYourNameValid && isDateValid) {
    localStorage.setItem('is_logged_in', 'true');
    document.getElementById('login-error').classList.add('hidden');
    showAppScreen();
  } else {
    document.getElementById('login-error').classList.remove('hidden');
  }
}

function showAppScreen() {
  document.getElementById('login-layer').classList.add('hidden');
  document.getElementById('app-layer').classList.remove('hidden');
  
  updateStreakDisplay();
  startRelationshipTimer();
}

function logout() {
  localStorage.removeItem('is_logged_in');
  if (timerInterval) clearInterval(timerInterval);
  document.getElementById('app-layer').classList.add('hidden');
  document.getElementById('login-layer').classList.remove('hidden');
}

// --- LOGIKA COUNTER HUBUNGAN ---
function startRelationshipTimer() {
  const startDate = new Date(AUTH_CONFIG.anniversaryDate);

  function updateTimer() {
    const now = new Date();
    const diffTime = Math.abs(now - startDate);

    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffTime / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diffTime / (1000 * 60)) % 60);
    const seconds = Math.floor((diffTime / 1000) % 60);

    document.getElementById('relationship-timer').innerText = 
      `${days} Hari ${hours} Jam ${minutes} Mnt ${seconds} Detik`;
  }

  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
}

// --- LOGIKA STREAK HARIAN ---
function updateStreakDisplay() {
  const streak = localStorage.getItem('user_streak') || 0;
  document.getElementById('streak-count').innerText = streak;

  const lastDate = localStorage.getItem('last_checkin_date');
  const today = new Date().toDateString();

  if (lastDate === today) {
    document.getElementById('checkin-btn').style.display = 'none';
    document.getElementById('checkin-status').innerText = '✓ Kamu sudah check-in hari ini!';
  }
}

function doCheckIn() {
  const today = new Date();
  const todayStr = today.toDateString();
  const lastDateStr = localStorage.getItem('last_checkin_date');

  let streak = parseInt(localStorage.getItem('user_streak') || '0');

  if (lastDateStr) {
    const lastDate = new Date(lastDateStr);
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak += 1;
    } else if (diffDays > 1) {
      streak = 1;
    }
  } else {
    streak = 1;
  }

  localStorage.setItem('user_streak', streak);
  localStorage.setItem('last_checkin_date', todayStr);

  updateStreakDisplay();
}

// --- LOGIKA MOOD & TOPLES ---
function selectMood(moodKey) {
  const card = document.getElementById('response-card');
  const text = document.getElementById('response-text');

  text.innerText = moodMessages[moodKey];
  card.classList.remove('hidden');
}

function closeCard() {
  document.getElementById('response-card').classList.add('hidden');
}

function getRandomNote() {
  const noteBox = document.getElementById('note-display');
  const randomIndex = Math.floor(Math.random() * notes.length);

  noteBox.innerText = `"${notes[randomIndex]}"`;
  noteBox.classList.remove('hidden');
}

// --- LOGIKA QUALITY TIME REQUEST ---
function requestQT(activityName) {
  const textMessage = `Haiii! Aku lagi pengen ${activityName} nih kalau kamu lagi senggang 🤍`;
  const encodedMessage = encodeURIComponent(textMessage);

  const status = document.getElementById('qt-status');
  status.innerText = `✓ Kode ajakan "${activityName}" disiapkan! Mengarahkan ke WhatsApp...`;
  status.classList.remove('hidden');

  setTimeout(() => {
    window.open(`https://wa.me/${myPhoneNumber}?text=${encodedMessage}`, '_blank');
  }, 1000);
}

// --- LOGIKA PEMUTAR MUSIK (BGM.MP3) ---
// Membuat objek Audio yang mengarah ke file bgm.mp3 kamu
const bgmAudio = new Audio('bgm.mp3');
bgmAudio.loop = true; // Musik akan otomatis berulang saat selesai
bgmAudio.volume = 0.5; // Volume diset ke 50% agar tidak terlalu keras/kaget

function toggleAudio() {
  const btn = document.getElementById('music-btn');

  if (bgmAudio.paused) {
    bgmAudio.play()
      .then(() => {
        btn.innerText = '⏸️ Hentikan Musik';
        btn.classList.add('playing');
      })
      .catch((error) => {
        alert('Gagal memutar audio. Pastikan file bgm.mp3 ada di folder yang sama yaa!');
        console.error(error);
      });
  } else {
    bgmAudio.pause();
    btn.innerText = '🎵 Musik Relaksasi';
    btn.classList.remove('playing');
  }
}
