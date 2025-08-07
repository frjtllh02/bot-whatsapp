const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// List kata terlarang
const forbiddenWords = ['bodoh', 'goblok', 'tolol', 'bangsat'];

// Menyimpan pesan gagal dihapus
let failedDeletes = [];

// Inisialisasi client
const client = new Client({
    authStrategy: new LocalAuth()
});

// Generate QR code
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

// Bot siap
client.on('ready', () => {
    console.log('✅ Bot WhatsApp siap digunakan!');
});

// Saat pesan masuk
client.on('message', async msg => {
    const text = msg.body.toLowerCase();

    // Deteksi kata terlarang
    const isForbidden = forbiddenWords.some(word => text.includes(word));

    if (isForbidden) {
        try {
            await msg.delete(true); // true = hapus untuk semua
            console.log(`❌ Pesan dihapus: "${msg.body}"`);
        } catch (error) {
            console.error(`⚠️ Gagal hapus pesan: "${msg.body}"`);
            failedDeletes.push(msg);
        }
    }
});

// Interval retry tiap 10 menit (600000 ms)
setInterval(async () => {
    if (failedDeletes.length === 0) return;

    console.log('🔁 Mencoba ulang hapus pesan yang gagal...');
    const stillFailed = [];

    for (const msg of failedDeletes) {
        try {
            await msg.delete(true);
            console.log(`✅ Berhasil dihapus saat retry: "${msg.body}"`);
        } catch (error) {
            console.error(`❌ Tetap gagal dihapus: "${msg.body}"`);
            stillFailed.push(msg); // Simpan lagi untuk retry selanjutnya
        }
    }

    failedDeletes = stillFailed; // Update daftar gagal
}, 600000); // 10 menit
