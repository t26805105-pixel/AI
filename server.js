const express = require('express');
const nodemailer = require('nodemailer');
const fs = require('fs');
const cors = require('cors'); // Дозволяє спілкування з фронтендом

const app = express();
const PORT = 3000;
const DB_FILE = 'users.json';
const ADMIN_EMAIL = 'rostislavmartsenyuk634@gmail.com'; // <--- ЗМІНІТЬ НА СВІЙ EMAIL!

// --- Налаштування Email (Nodemailer) ---
// ВАЖЛИВО: Використовуйте 'application password' (пароль для додатка),
// якщо ви використовуєте Gmail, а не ваш основний пароль.
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: ADMIN_EMAIL,
        pass: 'Brawltop123' // <--- ЗМІНІТЬ НА ПАРОЛЬ
    }
});

app.use(express.json()); // Для парсингу JSON-запитів
app.use(cors()); // Дозволяє фронтенду спілкуватися з цим сервером

// --- Функції Бази Даних (JSON) ---

function readUsers() {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Створює порожній файл, якщо він не існує
        if (error.code === 'ENOENT') {
            fs.writeFileSync(DB_FILE, '[]');
            return [];
        }
        console.error("Помилка читання бази даних:", error);
        return [];
    }
}

function writeUsers(users) {
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
}

// --- Ендпоінт API для Реєстрації ---

app.post('/api/register', (req, res) => {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ status: 'error', message: 'Недійсний Email' });
    }

    const users = readUsers();
    
    // Перевірка на дублікат
    if (users.some(user => user.email === email)) {
        return res.status(200).json({ status: 'success', message: 'Ви вже зареєстровані.' });
    }

    const newUser = {
        id: users.length + 1,
        email: email,
        timestamp: new Date().toISOString()
    };
    
    users.push(newUser);
    writeUsers(users);

    console.log(`[LOG] Нова реєстрація: ${email}`);

    // Надсилаємо відповідь фронтенду
    res.json({ status: 'success', message: 'Успішна реєстрація та вхід.' });
    
    // ПІСЛЯ успішної реєстрації надсилаємо Email-звіт
    sendAnalyticsReport(users);
});


// --- Функція Надсилання Email-Звіту ---

function sendAnalyticsReport(currentUsers) {
    const totalCount = currentUsers.length;
    const reportDate = new Date().toLocaleDateString("uk-UA");

    const mailOptions = {
        from: ADMIN_EMAIL,
        to: ADMIN_EMAIL,
        subject: `[AI ART ANALYTICS] Звіт. Всього користувачів: ${totalCount}`,
        html: `
            <h2>Звіт про Реєстрації</h2>
            <p><strong>Дата звіту:</strong> ${reportDate}</p>
            <p><strong>Загальна кількість зареєстрованих користувачів:</strong> <b>${totalCount}</b></p>
            
            <h3>Останні 5 реєстрацій:</h3>
            <ul>
                ${currentUsers.slice(-5).reverse().map(user => 
                    `<li>${user.email} (${new Date(user.timestamp).toLocaleString("uk-UA")})</li>`
                ).join('')}
            </ul>
            <p>Цей звіт генерується після кожної нової реєстрації (як мінімальний дашборд).</p>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("Помилка надсилання звіту:", error.message);
        }
        console.log('Звіт успішно надіслано:', info.response);
    });
}

// --- Запуск Сервера ---
app.listen(PORT, () => {
    console.log(`\n\nСервер запущено: http://localhost:${PORT}`);
    console.log(`Готовий приймати POST-запити на /api/register`);
    const currentUsers = readUsers();
    console.log(`Поточна кількість користувачів: ${currentUsers.length}`);
});