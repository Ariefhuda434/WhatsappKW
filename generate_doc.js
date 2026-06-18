const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageNumber, Footer, PageBreak, TabStopType, TabStopPosition
} = require('docx');
const fs = require('fs');

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const headerBorder = { style: BorderStyle.SINGLE, size: 1, color: "1E3A5F" };
const headerBorders = { top: headerBorder, bottom: headerBorder, left: headerBorder, right: headerBorder };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 160 },
    children: [new TextRun({ text, bold: true, size: 32, font: "Arial", color: "1E3A5F" })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, size: 26, font: "Arial", color: "2E6DA4" })]
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 80 },
    children: [new TextRun({ text, bold: true, size: 22, font: "Arial", color: "3A7DC9" })]
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 100 },
    children: [new TextRun({ text, font: "Arial", size: 22, ...opts })]
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, font: "Arial", size: 22 })]
  });
}

function separator() {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 1 } },
    children: []
  });
}

function makeTable(headers, rows, colWidths) {
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) => new TableCell({
          borders: headerBorders,
          width: { size: colWidths[i], type: WidthType.DXA },
          shading: { fill: "1E3A5F", type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 120, right: 120 },
          children: [new Paragraph({
            children: [new TextRun({ text: h, bold: true, color: "FFFFFF", font: "Arial", size: 20 })]
          })]
        }))
      }),
      ...rows.map((row, rowIdx) => new TableRow({
        children: row.map((cell, i) => new TableCell({
          borders,
          width: { size: colWidths[i], type: WidthType.DXA },
          shading: { fill: rowIdx % 2 === 0 ? "F5F8FC" : "FFFFFF", type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({
            children: [new TextRun({ text: cell, font: "Arial", size: 20 })]
          })]
        }))
      }))
    ]
  });
}

function space(before = 100) {
  return new Paragraph({ spacing: { before, after: 0 }, children: [] });
}

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
          { level: 1, format: LevelFormat.BULLET, text: "\u25E6", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 1080, hanging: 360 } } } },
        ]
      }
    ]
  },
  styles: {
    default: {
      document: { run: { font: "Arial", size: 22 } }
    },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 180, after: 80 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1260, bottom: 1440, left: 1260 }
      }
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Infrastructure Requirements Document - Room Chat | Halaman ", font: "Arial", size: 18, color: "888888" }),
              new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: "888888" }),
              new TextRun({ text: " dari ", font: "Arial", size: 18, color: "888888" }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], font: "Arial", size: 18, color: "888888" }),
            ]
          })
        ]
      })
    },
    children: [
      // ─── COVER PAGE ───
      space(1200),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: "INFRASTRUCTURE REQUIREMENTS DOCUMENT", bold: true, size: 44, font: "Arial", color: "1E3A5F" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 300 },
        children: [new TextRun({ text: "Website Room Chat", size: 36, font: "Arial", color: "2E6DA4" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: "1E3A5F", space: 1 } },
        spacing: { before: 0, after: 400 },
        children: []
      }),
      space(200),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: "Versi: 1.0", font: "Arial", size: 22, color: "555555" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: "Tanggal: Juni 2025", font: "Arial", size: 22, color: "555555" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: "Skala: Internal / Small Team (<100 Pengguna)", font: "Arial", size: 22, color: "555555" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: "Status: Draft", font: "Arial", size: 22, color: "C0392B", bold: true })]
      }),
      space(800),

      // ─── PAGE BREAK ───
      new Paragraph({ children: [new PageBreak()] }),

      // ─── 1. RINGKASAN EKSEKUTIF ───
      h1("1. Ringkasan Eksekutif"),
      p("Dokumen ini menjabarkan kebutuhan infrastruktur teknis untuk membangun platform room chat berbasis web dengan kapasitas hingga 100 pengguna. Platform ini dirancang untuk penggunaan internal atau small team dengan fitur lengkap termasuk real-time messaging, video/voice call, file sharing, dan end-to-end encryption."),
      space(80),
      p("Rekomendasi utama adalah menggunakan pendekatan cloud managed (misalnya AWS atau DigitalOcean) yang memberikan kemudahan pengelolaan, skalabilitas bertahap, dan biaya operasional yang terkontrol untuk skala kecil."),
      separator(),

      // ─── 2. LINGKUP DAN ASUMSI ───
      h1("2. Lingkup dan Asumsi"),
      h2("2.1 Skala Sistem"),
      makeTable(
        ["Parameter", "Nilai", "Keterangan"],
        [
          ["Jumlah Pengguna", "< 100 user", "Concurrent aktif ~20-30 user"],
          ["Jumlah Room/Channel", "10-50 room", "Campuran public dan private"],
          ["Retensi Pesan", "1-2 tahun", "Dengan arsip historis"],
          ["Ukuran File Upload", "Max 50 MB/file", "Gambar, dokumen, video pendek"],
          ["Ketersediaan", "99.5% uptime", "~22 jam downtime/tahun"],
          ["RPO (Recovery Point)", "1 jam", "Maksimal kehilangan data 1 jam"],
          ["RTO (Recovery Time)", "4 jam", "Waktu pemulihan pasca insiden"],
        ],
        [2800, 2800, 3760]
      ),
      space(160),
      h2("2.2 Fitur yang Dibutuhkan"),
      bullet("Real-time messaging (WebSocket)"),
      bullet("File & image sharing"),
      bullet("Video/voice call"),
      bullet("Multiple rooms/channels"),
      bullet("User authentication (login, register, SSO opsional)"),
      bullet("Notifikasi push (browser & mobile)"),
      bullet("Riwayat pesan (message history & search)"),
      bullet("End-to-end encryption (E2EE)"),
      separator(),

      // ─── PAGE BREAK ───
      new Paragraph({ children: [new PageBreak()] }),

      // ─── 3. ARSITEKTUR SISTEM ───
      h1("3. Arsitektur Sistem yang Direkomendasikan"),
      h2("3.1 Gambaran Arsitektur"),
      p("Sistem menggunakan arsitektur tiga lapis (three-tier architecture) dengan komponen terpisah untuk presentasi, logika bisnis, dan data. Pendekatan ini memudahkan pemeliharaan dan memungkinkan scaling horizontal jika kebutuhan tumbuh."),
      space(80),
      makeTable(
        ["Layer", "Komponen", "Teknologi Rekomendasi"],
        [
          ["Frontend", "Web App & Mobile Browser", "React.js / Next.js + PWA"],
          ["API Gateway", "Load Balancer & Routing", "Nginx / AWS ALB"],
          ["Backend", "Application Server", "Node.js (Socket.io) / Go"],
          ["Signaling Server", "Video/Voice Call", "WebRTC + Mediasoup / Janus"],
          ["Database", "Penyimpanan Data Utama", "PostgreSQL"],
          ["Cache & Pub/Sub", "Real-time & Session", "Redis"],
          ["Object Storage", "File & Media", "AWS S3 / MinIO"],
          ["Push Notification", "Notifikasi Browser & Mobile", "Firebase FCM / Web Push"],
          ["CDN", "Distribusi Konten Statis", "CloudFront / Cloudflare"],
        ],
        [2000, 2560, 3840]
      ),
      space(160),
      h2("3.2 Topologi Jaringan"),
      bullet("Semua trafik publik masuk melalui HTTPS (port 443)"),
      bullet("WebSocket untuk real-time messaging (wss://)"),
      bullet("WebRTC TURN/STUN server untuk video/voice call di belakang NAT"),
      bullet("Private network untuk komunikasi antar service (database, cache)"),
      bullet("VPN opsional untuk akses admin ke infrastruktur internal"),
      separator(),

      // ─── 4. SPESIFIKASI SERVER ───
      new Paragraph({ children: [new PageBreak()] }),
      h1("4. Spesifikasi Server"),
      h2("4.1 Server Utama (Application Server)"),
      makeTable(
        ["Komponen", "Minimum", "Rekomendasi", "Keterangan"],
        [
          ["vCPU", "2 Core", "4 Core", "Untuk handling concurrent connections"],
          ["RAM", "4 GB", "8 GB", "Redis + App Server dalam satu node (dev)"],
          ["Storage (OS)", "20 GB SSD", "40 GB SSD", "OS, aplikasi, dan log"],
          ["Storage (Data)", "50 GB SSD", "100 GB SSD", "Database & attachment lokal"],
          ["Network", "100 Mbps", "1 Gbps", "Untuk transfer file & streaming"],
          ["OS", "Ubuntu 22.04 LTS", "Ubuntu 22.04 LTS", "Long-term support"],
        ],
        [2200, 1760, 2000, 3440]
      ),
      space(160),
      h2("4.2 TURN/STUN Server (Video Call)"),
      p("Server khusus diperlukan untuk WebRTC agar video/voice call dapat berfungsi di balik firewall dan NAT."),
      space(60),
      makeTable(
        ["Komponen", "Spesifikasi", "Keterangan"],
        [
          ["vCPU", "2 Core", "Cukup untuk <30 concurrent call"],
          ["RAM", "2-4 GB", "Coturn / Janus server"],
          ["Bandwidth", "Minimal 100 Mbps", "Setiap call ~500 Kbps - 2 Mbps per user"],
          ["Software", "Coturn", "Open-source TURN/STUN server"],
          ["Port UDP", "3478, 5349, 49152-65535", "Harus dibuka di firewall"],
        ],
        [2000, 3000, 4400]
      ),
      space(160),
      h2("4.3 Opsi Deployment Cloud (Rekomendasi)"),
      makeTable(
        ["Provider", "Paket Server", "Estimasi Biaya/Bulan", "Keterangan"],
        [
          ["DigitalOcean", "Droplet 4 vCPU 8 GB", "~$48 USD (~Rp 770.000)", "Mudah setup, cocok pemula"],
          ["AWS", "t3.large (2 vCPU 8 GB)", "~$60 USD (~Rp 960.000)", "Ecosystem terlengkap"],
          ["Vultr", "4 vCPU 8 GB", "~$40 USD (~Rp 640.000)", "Harga kompetitif"],
          ["Linode (Akamai)", "Dedicated 4 vCPU 8 GB", "~$48 USD (~Rp 770.000)", "Performa stabil"],
        ],
        [2000, 2400, 2560, 2440]
      ),
      p("* Estimasi kurs USD 1 = Rp 16.000. Belum termasuk biaya storage, bandwidth, dan layanan tambahan.", { color: "888888", italics: true }),
      separator(),

      // ─── 5. DATABASE ───
      new Paragraph({ children: [new PageBreak()] }),
      h1("5. Kebutuhan Database"),
      h2("5.1 Database Utama - PostgreSQL"),
      p("PostgreSQL dipilih karena dukungan JSONB untuk data fleksibel, full-text search untuk riwayat pesan, dan kemampuan replikasi yang baik."),
      space(60),
      makeTable(
        ["Tabel/Entitas", "Estimasi Volume", "Keterangan"],
        [
          ["users", "< 100 record", "Data pengguna & profil"],
          ["rooms / channels", "< 50 record", "Public & private rooms"],
          ["messages", "~100.000 - 500.000/tahun", "Teks pesan dengan metadata"],
          ["attachments", "~10.000 - 50.000/tahun", "Referensi file di object storage"],
          ["sessions", "< 200 record aktif", "Token auth & refresh"],
          ["notifications", "~50.000/tahun", "Log notifikasi"],
        ],
        [2400, 2800, 4200]
      ),
      space(160),
      h2("5.2 Cache & Pub/Sub - Redis"),
      bullet("Menyimpan session token dan status online user"),
      bullet("Pub/Sub channel untuk broadcast pesan real-time antar server"),
      bullet("Rate limiting untuk mencegah spam"),
      bullet("Caching hasil query yang sering diakses (room list, user list)"),
      bullet("Kapasitas awal: Redis 512 MB - 1 GB sudah cukup untuk <100 user"),
      separator(),

      // ─── 6. KEAMANAN ───
      h1("6. Kebutuhan Keamanan"),
      h2("6.1 End-to-End Encryption (E2EE)"),
      p("E2EE memastikan bahwa hanya pengirim dan penerima yang dapat membaca isi pesan, bahkan server tidak dapat mengaksesnya."),
      space(60),
      makeTable(
        ["Aspek", "Implementasi", "Keterangan"],
        [
          ["Protokol", "Signal Protocol / MLS", "Standar industri (dipakai WhatsApp, Signal)"],
          ["Key Exchange", "X3DH (Extended Triple Diffie-Hellman)", "Untuk negosiasi kunci awal"],
          ["Enkripsi Pesan", "AES-256-GCM", "Enkripsi simetris per pesan"],
          ["Key Storage", "Client-side only", "Private key TIDAK disimpan di server"],
          ["Library", "libsignal / @signalapp/signal-client", "Open-source, teruji"],
          ["File Encryption", "AES-256 sebelum upload", "File dienkripsi di client sebelum kirim"],
        ],
        [2200, 3200, 4000]
      ),
      space(160),
      h2("6.2 Keamanan Infrastruktur"),
      bullet("TLS 1.3 untuk semua koneksi (HTTPS & WSS)"),
      bullet("Sertifikat SSL dari Let's Encrypt (gratis) atau DigiCert"),
      bullet("Firewall: hanya port 80, 443, dan UDP WebRTC yang terbuka ke publik"),
      bullet("SSH hanya via key-based authentication (non-root), port non-standar"),
      bullet("Rate limiting pada endpoint API (login, register, upload)"),
      bullet("Input validation & sanitasi untuk mencegah XSS dan SQL Injection"),
      bullet("CORS policy yang ketat - hanya domain terdaftar"),
      bullet("JWT dengan expiry pendek (15 menit) + refresh token"),
      bullet("Audit log untuk semua aksi administratif"),
      separator(),

      // ─── 7. USER AUTH ───
      new Paragraph({ children: [new PageBreak()] }),
      h1("7. Autentikasi Pengguna"),
      h2("7.1 Mekanisme Autentikasi"),
      makeTable(
        ["Metode", "Prioritas", "Keterangan"],
        [
          ["Email + Password", "Wajib", "Dengan bcrypt hashing (min. 12 rounds)"],
          ["JWT + Refresh Token", "Wajib", "Access token 15 menit, refresh 7 hari"],
          ["Google OAuth 2.0", "Opsional", "Single Sign-On via Google"],
          ["Multi-Factor Auth (TOTP)", "Direkomendasikan", "Google Authenticator / Authy"],
          ["Magic Link Email", "Opsional", "Login tanpa password via email"],
        ],
        [2400, 1800, 5200]
      ),
      space(160),
      h2("7.2 Manajemen Sesi"),
      bullet("Session disimpan di Redis dengan TTL sesuai kebijakan"),
      bullet("Logout paksa (revoke token) dari semua perangkat"),
      bullet("Deteksi login dari perangkat/lokasi baru"),
      bullet("Batas maksimal sesi aktif per user (misalnya 5 perangkat)"),
      separator(),

      // ─── 8. FILE & STORAGE ───
      h1("8. File Sharing & Object Storage"),
      h2("8.1 Kapasitas Storage"),
      makeTable(
        ["Tipe File", "Batas Ukuran", "Estimasi Volume/Tahun", "Keterangan"],
        [
          ["Gambar", "10 MB", "~5 GB", "JPEG, PNG, GIF, WebP"],
          ["Dokumen", "50 MB", "~10 GB", "PDF, DOCX, XLSX, TXT"],
          ["Video", "100 MB", "~20 GB", "MP4, MOV (video pendek)"],
          ["Audio", "25 MB", "~2 GB", "MP3, WAV, voice note"],
          ["Total Estimasi", "-", "~40-50 GB/tahun", "Termasuk thumbnail & backup"],
        ],
        [1800, 1600, 2400, 3600]
      ),
      space(160),
      h2("8.2 Opsi Object Storage"),
      bullet("AWS S3: Paling mature, biaya ~$0.023/GB/bulan"),
      bullet("DigitalOcean Spaces: Kompatibel S3 API, $5/bulan untuk 250 GB + CDN"),
      bullet("MinIO (Self-hosted): Gratis, cocok jika ingin kontrol penuh data"),
      bullet("Backblaze B2: Paling murah ~$0.006/GB/bulan"),
      space(60),
      p("Rekomendasi untuk <100 user: DigitalOcean Spaces atau Backblaze B2 karena biaya terjangkau dengan CDN terintegrasi.", { bold: true }),
      separator(),

      // ─── 9. VIDEO/VOICE ───
      new Paragraph({ children: [new PageBreak()] }),
      h1("9. Infrastruktur Video & Voice Call"),
      h2("9.1 Arsitektur WebRTC"),
      p("Untuk <100 user dengan group call kecil (2-8 orang), arsitektur Selective Forwarding Unit (SFU) direkomendasikan atas P2P atau MCU karena efisiensi bandwidth dan CPU."),
      space(60),
      makeTable(
        ["Komponen", "Fungsi", "Software / Service"],
        [
          ["STUN Server", "Menemukan IP publik client", "Coturn (self-hosted) / Google STUN (gratis)"],
          ["TURN Server", "Relay trafik jika P2P gagal", "Coturn (wajib self-hosted)"],
          ["SFU Server", "Routing media untuk group call", "Mediasoup / LiveKit / Janus"],
          ["Signaling", "Koordinasi koneksi WebRTC", "Socket.io di App Server"],
        ],
        [2000, 2800, 4600]
      ),
      space(160),
      h2("9.2 Kebutuhan Bandwidth Video Call"),
      makeTable(
        ["Kualitas Video", "Bandwidth per User", "Maks Concurrent Call", "Total Bandwidth"],
        [
          ["480p (SD)", "~500 Kbps", "10 call", "~5 Mbps"],
          ["720p (HD)", "~1.5 Mbps", "10 call", "~15 Mbps"],
          ["1080p (FHD)", "~3 Mbps", "5 call", "~15 Mbps"],
          ["Audio Only", "~50 Kbps", "50 call", "~2.5 Mbps"],
        ],
        [2200, 2200, 2200, 2800]
      ),
      p("* Rekomendasi: mulai dengan 720p, dengan opsi turun ke 480p secara otomatis (adaptive bitrate).", { color: "888888", italics: true }),
      separator(),

      // ─── 10. NOTIFIKASI PUSH ───
      h1("10. Notifikasi Push"),
      h2("10.1 Strategi Notifikasi"),
      makeTable(
        ["Platform", "Teknologi", "Keterangan"],
        [
          ["Browser (Desktop)", "Web Push API + Service Worker", "Notifikasi meski tab tertutup"],
          ["Android", "Firebase Cloud Messaging (FCM)", "Gratis, terintegrasi Google"],
          ["iOS", "Apple Push Notification (APNs)", "Jika ada versi iOS native"],
          ["Email Digest", "SMTP (SendGrid / Mailgun)", "Ringkasan pesan offline"],
        ],
        [2200, 2800, 4400]
      ),
      space(160),
      p("Catatan: Firebase Cloud Messaging (FCM) gratis untuk unlimited notifikasi. Tidak ada biaya tambahan untuk notifikasi push di skala <100 user."),
      separator(),

      // ─── 11. MONITORING ───
      new Paragraph({ children: [new PageBreak()] }),
      h1("11. Monitoring & Observabilitas"),
      h2("11.1 Stack Monitoring yang Direkomendasikan"),
      makeTable(
        ["Aspek", "Tool", "Biaya", "Fungsi"],
        [
          ["Infrastructure", "Prometheus + Grafana", "Gratis (self-hosted)", "CPU, RAM, disk, network"],
          ["Application Logs", "Loki / ELK Stack", "Gratis (self-hosted)", "Log aplikasi & error"],
          ["Error Tracking", "Sentry", "Gratis s/d 5.000 error/bln", "Error JS & backend"],
          ["Uptime Monitoring", "UptimeRobot", "Gratis (5 menit interval)", "Alert jika server down"],
          ["APM", "Datadog / New Relic", "~$15-30/bln", "Performance & tracing (opsional)"],
        ],
        [2000, 2400, 2400, 2600]
      ),
      space(160),
      h2("11.2 Alert & On-Call"),
      bullet("Alert via email atau Telegram bot jika server down"),
      bullet("Alert jika CPU > 80% atau RAM > 85% selama 5 menit"),
      bullet("Alert jika disk usage > 80%"),
      bullet("Alert jika response time API > 2 detik"),
      separator(),

      // ─── 12. BACKUP & DR ───
      h1("12. Backup & Disaster Recovery"),
      h2("12.1 Strategi Backup"),
      makeTable(
        ["Data", "Frekuensi", "Retensi", "Lokasi"],
        [
          ["Database PostgreSQL", "Setiap 6 jam", "30 hari", "S3 / Spaces (region berbeda)"],
          ["Redis Snapshot", "Setiap 1 jam", "7 hari", "Disk lokal + S3"],
          ["File Uploads", "Incremental harian", "Permanent", "S3 dengan versioning"],
          ["Konfigurasi Server", "Setiap perubahan", "Indefinite", "Git repository (private)"],
          ["Kunci Enkripsi", "Manual / event-based", "Permanent", "KMS atau HSM"],
        ],
        [2400, 1800, 1600, 3600]
      ),
      space(160),
      h2("12.2 Prosedur Recovery"),
      bullet("RPO (Recovery Point Objective): maksimal 1 jam kehilangan data"),
      bullet("RTO (Recovery Time Objective): sistem kembali normal dalam 4 jam"),
      bullet("Backup database diuji restore minimal 1x per bulan"),
      bullet("Dokumentasi runbook tersimpan di luar server (Notion, Confluence, atau Docs)"),
      separator(),

      // ─── 13. ESTIMASI BIAYA ───
      new Paragraph({ children: [new PageBreak()] }),
      h1("13. Estimasi Biaya Infrastruktur"),
      h2("13.1 Biaya Bulanan (Estimasi)"),
      makeTable(
        ["Komponen", "Spesifikasi", "Estimasi Biaya/Bln (USD)", "Keterangan"],
        [
          ["Application Server", "4 vCPU, 8 GB RAM", "$40-60", "DigitalOcean / Vultr"],
          ["TURN Server", "2 vCPU, 2 GB RAM", "$15-20", "Coturn self-hosted"],
          ["Object Storage", "100 GB + CDN", "$5-10", "DO Spaces / Backblaze"],
          ["Database Managed", "PostgreSQL Managed", "$15-25", "DO Managed DB (opsional)"],
          ["Domain + SSL", "Custom domain", "$1-2", "Let's Encrypt gratis"],
          ["Email (SMTP)", "Notifikasi email", "$0-10", "SendGrid free tier 100/hari"],
          ["Monitoring", "Uptime + basic stack", "$0-15", "Mostly free tier"],
          ["Backup Storage", "50-100 GB S3", "$1-3", "Database & konfigurasi"],
          ["TOTAL ESTIMASI", "", "$77 - $145/bulan", "~Rp 1,2 - 2,3 juta/bulan"],
        ],
        [2400, 2200, 2200, 2600]
      ),
      space(80),
      p("* Biaya dapat lebih rendah jika menggunakan free tier dan optimasi resource. Skala dapat ditingkatkan seiring pertumbuhan pengguna.", { color: "888888", italics: true }),
      separator(),

      // ─── 14. ROADMAP IMPLEMENTASI ───
      h1("14. Roadmap Implementasi"),
      h2("Fase 1 - Fondasi (Minggu 1-2)"),
      bullet("Setup server cloud dan konfigurasi firewall"),
      bullet("Install dan konfigurasi PostgreSQL + Redis"),
      bullet("Setup domain, SSL, dan reverse proxy (Nginx)"),
      bullet("Deploy backend API (autentikasi, rooms, messaging)"),
      bullet("Konfigurasi backup otomatis"),
      space(80),
      h2("Fase 2 - Fitur Core (Minggu 3-4)"),
      bullet("Implementasi WebSocket real-time messaging"),
      bullet("Upload & download file via Object Storage"),
      bullet("Web Push Notification + Firebase FCM"),
      bullet("Frontend web app (React/Next.js)"),
      bullet("Implementasi E2EE dengan Signal Protocol"),
      space(80),
      h2("Fase 3 - Video/Voice & Polish (Minggu 5-6)"),
      bullet("Setup TURN/STUN server (Coturn)"),
      bullet("Integrasi WebRTC SFU (Mediasoup / LiveKit)"),
      bullet("Testing load & security audit"),
      bullet("Setup monitoring dan alerting"),
      bullet("Dokumentasi teknis & user guide"),
      separator(),

      // ─── 15. PENUTUP ───
      h1("15. Penutup & Rekomendasi"),
      p("Untuk organisasi dengan <100 pengguna, infrastruktur yang diusulkan dalam dokumen ini memberikan keseimbangan optimal antara fitur, keamanan, dan biaya. Rekomendasi utama:"),
      space(60),
      bullet("Mulai dengan DigitalOcean atau Vultr untuk kemudahan setup dan harga terjangkau"),
      bullet("Gunakan Coturn untuk TURN server dan Mediasoup untuk SFU video call"),
      bullet("Implementasikan Signal Protocol untuk E2EE sejak awal - sulit ditambahkan belakangan"),
      bullet("Gunakan managed database (DigitalOcean Managed PostgreSQL) untuk mengurangi beban operasional"),
      bullet("Setup monitoring dari hari pertama - UptimeRobot + Sentry cukup untuk mulai"),
      bullet("Review dan audit keamanan minimal setiap 6 bulan"),
      space(120),
      p("Dokumen ini bersifat living document dan harus diperbarui seiring perkembangan kebutuhan sistem.", { color: "888888", italics: true }),
    ]
  }]
});

const outputDir = "./outputs";
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

Packer.toBuffer(doc).then(buffer => {
  const outputPath = `${outputDir}/Infrastructure_Requirements_RoomChat.docx`;
  fs.writeFileSync(outputPath, buffer);
  console.log("Done! File tersimpan di: " + outputPath);
});
