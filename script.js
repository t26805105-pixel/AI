document.addEventListener('DOMContentLoaded', () => {
    
    // --- ЗМІННА ДЛЯ ПІДКЛЮЧЕННЯ ДО ЛОКАЛЬНОГО NODE.JS СЕРВЕРА (ДЛЯ ДЕМО) ---
    const REGISTRATION_API_URL = 'http://localhost:3000/api/register'; 
    // -----------------------------------------------------------------

    // --- DOM Елементи ---
    const currentYearSpan = document.getElementById('current-year');
    const sections = document.querySelectorAll('.section');
    const navItems = document.querySelectorAll('.nav-item');
    const cookieNotice = document.getElementById('cookie-notice');
    const acceptCookiesBtn = document.getElementById('accept-cookies');
    
    // Модальні вікна
    const loginButton = document.getElementById('login-button');
    const loginModal = document.getElementById('login-modal');
    const analyticsModal = document.getElementById('analytics-modal');
    const closeButtons = document.querySelectorAll('.close-button');
    const simulateLoginBtn = document.getElementById('simulate-github-login');
    const emailInput = document.getElementById('modal-email-input');

    // Встановлення року
    if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();

    // --- 1. Плавна поява секцій та активація меню при скролі (Intersection Observer) ---
    const observerOptions = {
        threshold: 0.3 // Секція стає активною, коли видно 30%
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Додаємо клас для анімації появи
                entry.target.classList.add('visible');

                // Логіка активної лінії в меню
                const id = entry.target.getAttribute('id');
                // Видаляємо active у всіх
                navItems.forEach(link => link.classList.remove('active'));
                // Знаходимо посилання, що веде на цю секцію
                const activeLink = document.querySelector(`.nav-item[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    // --- 2. Модальні вікна ---
    function openModal(modal) {
        modal.classList.add('show');
    }

    function closeModal(modal) {
        modal.classList.remove('show');
    }

    // Відкриття
    loginButton.addEventListener('click', () => openModal(loginModal));

    // Закриття (кнопка хрестик)
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-modal');
            closeModal(document.getElementById(modalId));
        });
    });

    // Закриття (клік поза вікном)
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });

    // --- 3. Логіка входу (Fetch до Node.js) ---
    simulateLoginBtn.addEventListener('click', () => {
        const email = emailInput.value;
        
        if (!email || !email.includes('@')) {
            alert('Введіть коректний Email!');
            return;
        }

        // Відправка на сервер
        fetch(REGISTRATION_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        })
        .then(res => res.json())
        .then(data => {
            alert(data.message || 'Успішно зареєстровано! Перевірте консоль Node.js та вашу пошту.');
            closeModal(loginModal);
            loginButton.textContent = 'Вихід';
        })
        .catch(err => {
            console.error('Помилка реєстрації:', err);
            // Симуляція для демо, якщо сервер не запущено
            alert('Сервер недоступний (http://localhost:3000), але вхід симульовано для демонстрації!');
            closeModal(loginModal);
            loginButton.textContent = 'Вихід';
        });
    });

    // --- 4. Логіка Cookie-повідомлення ---
    function checkCookies() {
        if (localStorage.getItem('cookiesAccepted') !== 'true') {
            cookieNotice.classList.add('show');
        } else {
            cookieNotice.classList.remove('show');
        }
    }

    acceptCookiesBtn.addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        cookieNotice.classList.remove('show');
    });

    checkCookies(); 
    
    // --- 5. Плавний скролл для якірних посилань ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});