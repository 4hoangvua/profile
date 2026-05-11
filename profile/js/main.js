/**
 * main.js — Frontend logic: fetch API, render dữ liệu, animations
 */

const API_BASE = 'api/index.php';

// === State ===
let profileData = {};
let skillsData = [];
let projectsData = [];
let educationData = [];
let experienceData = [];
let settingsData = {};

// === Init ===
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadAllData();
    initNavigation();
    initScrollAnimations();
    initContactForm();
    initThemeSwitcher();
});

// === API Helper ===
async function apiGet(action) {
    const res = await fetch(`${API_BASE}?action=${action}`);
    return res.json();
}

async function apiPost(action, data) {
    const res = await fetch(`${API_BASE}?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return res.json();
}

// === Load Data ===
async function loadAllData() {
    try {
        const [profile, skills, projects, education, experience] = await Promise.all([
            apiGet('get_profile'),
            apiGet('get_skills'),
            apiGet('get_projects'),
            apiGet('get_education'),
            apiGet('get_experience')
        ]);

        if (profile.success) { profileData = profile.data; renderProfile(); }
        if (skills.success) { skillsData = skills.data; renderSkills(); }
        if (projects.success) { projectsData = projects.data; renderProjects(); }
        if (education.success) { educationData = education.data; renderEducation(); }
        if (experience.success) { experienceData = experience.data; renderExperience(); }
    } catch (err) {
        console.error('Failed to load data:', err);
    } finally {
        hidePreloader();
    }
}

function hidePreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('fade-out');
        // Remove from DOM after transition to save resources
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
}

async function loadSettings() {
    try {
        const res = await apiGet('get_settings');
        if (res.success) {
            settingsData = res.data;
            if (settingsData.theme) {
                document.documentElement.setAttribute('data-theme', settingsData.theme);
            }
        }
    } catch (err) {
        console.error('Failed to load settings:', err);
    }
}

// === Render Profile (Hero + About) ===
function renderProfile() {
    const d = profileData;
    if (!d) return;

    // Hero
    const heroName = document.getElementById('heroName');
    const heroTitle = document.getElementById('heroTitle');
    const heroBio = document.getElementById('heroBio');
    const heroAvatar = document.getElementById('heroAvatar');
    const navLogo = document.getElementById('navLogo');

    if (heroName) heroName.textContent = d.full_name || 'Your Name';
    if (heroTitle) heroTitle.textContent = d.title || 'Web Developer';
    if (heroBio) heroBio.textContent = d.bio || '';
    if (navLogo) navLogo.innerHTML = `<span>${(d.full_name || 'P')[0]}</span>${(d.full_name || 'Portfolio').split(' ').pop()}`;

    if (heroAvatar) {
        if (d.avatar) {
            heroAvatar.innerHTML = `<img src="${d.avatar}" alt="${d.full_name}" onload="this.classList.add('loaded')" />`;
        } else {
            heroAvatar.innerHTML = `<div class="avatar-placeholder">👤</div>`;
        }
    }

    // CV Download button
    const cvBtn = document.getElementById('cvDownloadBtn');
    if (cvBtn && d.cv_url) {
        cvBtn.href = d.cv_url;
        cvBtn.style.display = 'inline-flex';
        
        // Đặt tên file khi tải về: hoten_chucdanh_CV.ext
        const ext = d.cv_url.split('.').pop();
        const safeName = (d.full_name || 'My').replace(/\s+/g, '_');
        const safeTitle = (d.title || 'Profile').replace(/\s+/g, '_');
        cvBtn.download = `${safeName}_${safeTitle}_CV.${ext}`;
    } else if (cvBtn) {
        cvBtn.style.display = 'none';
    }

    // Contact info
    const updateContactUI = (elId) => {
        const el = document.getElementById(elId);
        if (el) {
            let html = '';
            if (d.email) html += `<div class="contact-detail"><div class="icon">✉️</div><span>${d.email}</span></div>`;
            if (d.phone) html += `<div class="contact-detail"><div class="icon">📞</div><span>${d.phone}</span></div>`;
            if (d.address) html += `<div class="contact-detail"><div class="icon">📍</div><span>${d.address}</span></div>`;
            el.innerHTML = html;
        }
    };
    updateContactUI('contactInfoDetails');
    updateContactUI('contactInfoDetails2');

    // Social links
    const socialLinks = document.getElementById('socialLinks');
    if (socialLinks) {
        let html = '';
        if (d.github) html += `<a href="${d.github}" target="_blank" class="social-link" title="GitHub">🐙</a>`;
        if (d.linkedin) html += `<a href="${d.linkedin}" target="_blank" class="social-link" title="LinkedIn">🔗</a>`;
        if (d.facebook) html += `<a href="${d.facebook}" target="_blank" class="social-link" title="Facebook">🌐</a>`;
        if (d.website) html += `<a href="${d.website}" target="_blank" class="social-link" title="Website">🌍</a>`;
        socialLinks.innerHTML = html;
    }
}

// === Render Skills ===
function renderSkills() {
    const container = document.getElementById('skillsContainer');
    if (!container || !skillsData.length) {
        if (container) container.innerHTML = '<p style="text-align:center;color:var(--text-muted)">Chưa có kỹ năng nào.</p>';
        return;
    }

    const groups = { frontend: [], backend: [], other: [] };
    skillsData.forEach(s => {
        const cat = groups[s.category] ? s.category : 'other';
        groups[cat].push(s);
    });

    const labels = { frontend: '🎨 Frontend', backend: '⚙️ Backend', other: '🔧 Other' };
    let html = '';

    for (const [cat, skills] of Object.entries(groups)) {
        if (!skills.length) continue;
        html += `<div class="skill-category animate-on-scroll"><h3>${labels[cat]}</h3>`;
        skills.forEach(s => {
            html += `
                <div class="skill-item">
                    <div class="skill-info">
                        <span class="skill-name">${s.name}</span>
                        <span class="skill-level">${s.level}%</span>
                    </div>
                    <div class="skill-bar">
                        <div class="skill-bar-fill" data-level="${s.level}"></div>
                    </div>
                </div>`;
        });
        html += '</div>';
    }

    container.innerHTML = html;
    // Re-init animations for new elements
    initScrollAnimations();
}

// === Render Projects ===
function renderProjects() {
    const container = document.getElementById('projectsContainer');
    if (!container) return;
    if (!projectsData.length) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-muted)">Chưa có dự án nào.</p>';
        return;
    }

    let html = '';
    projectsData.forEach(p => {
        const imgHtml = p.image
            ? `<img src="${p.image}" alt="${p.title}" class="project-image" />`
            : `<div class="project-image-placeholder">📁</div>`;

        const techHtml = p.tech_stack
            ? p.tech_stack.split(',').map(t => `<span>${t.trim()}</span>`).join('')
            : '';

        let linksHtml = '';
        if (p.demo_url) linksHtml += `<a href="${p.demo_url}" target="_blank">🔗 Demo</a>`;
        if (p.source_url) linksHtml += `<a href="${p.source_url}" target="_blank">💻 Source</a>`;

        html += `
            <div class="project-card animate-on-scroll">
                ${imgHtml}
                <div class="project-body">
                    <h3>${p.title}</h3>
                    <p>${p.description || ''}</p>
                    <div class="project-tech">${techHtml}</div>
                    <div class="project-links">${linksHtml}</div>
                </div>
            </div>`;
    });

    container.innerHTML = html;
    initScrollAnimations();
}

// === Render Education ===
function renderEducation() {
    const container = document.getElementById('educationContainer');
    if (!container) return;
    if (!educationData.length) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-muted)">Chưa có thông tin học vấn.</p>';
        return;
    }

    let html = '';
    educationData.forEach(e => {
        const dateStr = [e.start_year, e.end_year].filter(Boolean).join(' - ');
        html += `
            <div class="timeline-item animate-on-scroll">
                <h3>${e.school}</h3>
                <div class="subtitle">${e.degree || ''}</div>
                <div class="date">${dateStr}</div>
                <p>${e.description || ''}</p>
            </div>`;
    });

    container.innerHTML = html;
    initScrollAnimations();
}

// === Render Experience ===
function renderExperience() {
    const container = document.getElementById('experienceContainer');
    if (!container) return;
    if (!experienceData.length) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-muted)">Chưa có kinh nghiệm làm việc.</p>';
        return;
    }

    let html = '';
    experienceData.forEach(e => {
        const dateStr = [e.start_date, e.end_date || 'Hiện tại'].filter(Boolean).join(' - ');
        html += `
            <div class="timeline-item animate-on-scroll">
                <h3>${e.company}</h3>
                <div class="subtitle">${e.position || ''}</div>
                <div class="date">${dateStr}</div>
                <p>${e.description || ''}</p>
            </div>`;
    });

    container.innerHTML = html;
    initScrollAnimations();
}

// === Navigation ===
function initNavigation() {
    // Mobile toggle
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (toggle && links) {
        toggle.addEventListener('click', () => links.classList.toggle('open'));
        // Close menu on link click
        links.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => links.classList.remove('open'));
        });
    }

    // Active link on scroll
    const sections = document.querySelectorAll('.section[id]');
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY + 100;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav-links a[href="#${id}"]`);
            if (link) {
                if (scrollY >= top && scrollY < top + height) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            }
        });
    });
}

// === Scroll Animations ===
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Animate skill bars
                const bars = entry.target.querySelectorAll('.skill-bar-fill');
                bars.forEach(bar => {
                    const level = bar.getAttribute('data-level');
                    setTimeout(() => { bar.style.width = level + '%'; }, 200);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll:not(.visible)').forEach(el => {
        observer.observe(el);
    });
}

// === Contact Form ===
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msgEl = document.getElementById('formMessage');
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Đang gửi...';

        const data = {
            name: form.querySelector('#contactName').value.trim(),
            email: form.querySelector('#contactEmail').value.trim(),
            subject: form.querySelector('#contactSubject').value.trim(),
            message: form.querySelector('#contactMessage').value.trim()
        };

        try {
            const res = await apiPost('send_contact', data);
            if (res.success) {
                msgEl.className = 'form-message success';
                msgEl.textContent = 'Tin nhắn đã được gửi thành công! 🎉';
                form.reset();
            } else {
                msgEl.className = 'form-message error';
                msgEl.textContent = res.message || 'Có lỗi xảy ra.';
            }
        } catch (err) {
            msgEl.className = 'form-message error';
            msgEl.textContent = 'Không thể kết nối server.';
        }

        btn.disabled = false;
        btn.textContent = 'Gửi tin nhắn';
        setTimeout(() => { msgEl.className = 'form-message'; }, 5000);
    });
}

// === Theme Switcher ===
function initThemeSwitcher() {
    const btn = document.getElementById('themeBtn');
    if (!btn) return;

    const themes = ['dark', 'light', 'ocean'];
    const icons = { dark: '🌙', light: '☀️', ocean: '🌊' };

    btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const idx = (themes.indexOf(current) + 1) % themes.length;
        const next = themes[idx];
        document.documentElement.setAttribute('data-theme', next);
        btn.textContent = icons[next] || '🌙';
        localStorage.setItem('theme', next);
    });

    // Load saved theme
    const saved = localStorage.getItem('theme');
    if (saved && themes.includes(saved)) {
        document.documentElement.setAttribute('data-theme', saved);
        btn.textContent = icons[saved] || '🌙';
    }
}
