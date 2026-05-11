/**
 * admin.js — Logic admin: CRUD, upload, xác thực
 */

const API = '../api/index.php';
let currentPanel = 'dashboard';
let deleteCallback = null;

// === Init ===
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initSidebar();
    initLogout();
    initModal();
});

// === API Helpers ===
async function api(action, data = null, method = 'GET') {
    const opts = { method, credentials: 'include' };
    if (data && method === 'POST') {
        opts.headers = { 'Content-Type': 'application/json' };
        opts.body = JSON.stringify(data);
    }
    const res = await fetch(`${API}?action=${action}`, opts);
    return res.json();
}

async function uploadFile(file) {
    const fd = new FormData();
    fd.append('image', file);
    const res = await fetch(`${API}?action=upload_image`, {
        method: 'POST', body: fd, credentials: 'include'
    });
    return res.json();
}

// === Toast ===
function showToast(msg, type = 'success') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = `toast ${type}`;
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// === Auth ===
async function checkAuth() {
    const loading = document.getElementById('adminLoading');
    try {
        const res = await api('check_auth');
        if (res.success && res.data.authenticated) {
            showAdmin();
        } else {
            showLogin();
        }
    } catch {
        showLogin();
    } finally {
        if (loading) {
            loading.style.opacity = '0';
            setTimeout(() => loading.style.display = 'none', 500);
        }
    }
}

function showLogin() {
    document.getElementById('loginPage').classList.add('active');
    document.getElementById('adminLayout').classList.remove('active');
    initLoginForm();
}

function showAdmin() {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('adminLayout').classList.add('active');
    
    // Đọc hash từ URL khi vừa vào trang
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    handleRouting(hash);
}

// Hàm xử lý điều hướng dựa trên chuỗi routing (ví dụ: 'skills' hoặc 'skills/edit/5')
function handleRouting(route) {
    const parts = route.split('/');
    const panel = parts[0];
    const action = parts[1]; // 'edit' hoặc 'add'
    const id = parts[2];

    switchPanel(panel, false); // false để không tạo vòng lặp hash

    if (action === 'edit' && id) {
        // Tùy theo panel mà gọi hàm edit tương ứng
        setTimeout(() => {
            if (panel === 'skills') editSkill(parseInt(id));
            if (panel === 'projects') editProject(parseInt(id));
            if (panel === 'education') editEducation(parseInt(id));
            if (panel === 'experience') editExperience(parseInt(id));
        }, 300); // Đợi dữ liệu panel load xong
    } else if (action === 'add') {
        const singularMap = {
            'skills': 'skill',
            'projects': 'project',
            'education': 'education',
            'experience': 'experience'
        };
        setTimeout(() => showAddForm(singularMap[panel] || panel), 300);
    }
}

function initLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    initPasswordToggle();
    form.onsubmit = async (e) => {
        e.preventDefault();
        const errEl = document.getElementById('loginError');
        const username = document.getElementById('loginUser').value.trim();
        const password = document.getElementById('loginPass').value;
        errEl.style.display = 'none';

        try {
            const res = await api('login', { username, password }, 'POST');
            if (res.success) {
                showAdmin();
            } else {
                errEl.textContent = res.message;
                errEl.style.display = 'block';
            }
        } catch {
            errEl.textContent = 'Connection error';
            errEl.style.display = 'block';
        }
    };
}

function initLogout() {
    const btn = document.getElementById('logoutBtn');
    if (btn) {
        btn.onclick = async () => {
            await api('logout', null, 'POST');
            showLogin();
        };
    }
}

// === Sidebar Navigation ===
function initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const toggle = document.getElementById('mobileToggle');

    const closeSidebar = () => {
        sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
    };

    const openSidebar = () => {
        sidebar.classList.add('open');
        if (overlay) overlay.classList.add('active');
    };

    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const panel = link.dataset.panel;
            switchPanel(panel);
            closeSidebar();
        });
    });

    if (toggle) {
        toggle.onclick = (e) => {
            e.stopPropagation();
            if (sidebar.classList.contains('open')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        };
    }

    if (overlay) {
        overlay.onclick = closeSidebar;
    }

    // Lắng nghe sự kiện đổi hash (nút Back/Forward của trình duyệt)
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '') || 'dashboard';
        handleRouting(hash);
    });

    // Close sidebar on window resize if it's open and moving to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });
}

function switchPanel(panel, updateHash = true) {
    currentPanel = panel;
    if (updateHash) {
        window.location.hash = panel;
    }
    // Update active nav
    document.querySelectorAll('.sidebar-nav a').forEach(a => {
        a.classList.toggle('active', a.dataset.panel === panel);
    });
    // Update header
    const titles = {
        dashboard: 'Dashboard', profile: 'Quản lý Profile',
        skills: 'Quản lý Kỹ năng', projects: 'Quản lý Dự án',
        education: 'Quản lý Học vấn', experience: 'Quản lý Kinh nghiệm',
        messages: 'Tin nhắn Liên hệ', settings: 'Cài đặt'
    };
    document.getElementById('panelTitle').textContent = titles[panel] || panel;
    // Show panel
    document.querySelectorAll('.admin-panel').forEach(p => {
        p.classList.toggle('active', p.id === `panel-${panel}`);
    });
    // Load panel data
    loadPanelData(panel);
}

// === Load Panel Data ===
async function loadPanelData(panel) {
    switch (panel) {
        case 'dashboard': loadDashboard(); break;
        case 'profile': loadProfileForm(); break;
        case 'skills': loadSkillsList(); break;
        case 'projects': loadProjectsList(); break;
        case 'education': loadEducationList(); break;
        case 'experience': loadExperienceList(); break;
        case 'messages': loadMessages(); break;
        case 'settings': loadSettingsForm(); break;
    }
}

// === Dashboard ===
async function loadDashboard() {
    try {
        const [skills, projects, edu, exp, msgs] = await Promise.all([
            api('get_skills'), api('get_projects'), api('get_education'),
            api('get_experience'), api('get_messages')
        ]);
        document.getElementById('statSkills').textContent = skills.data?.length || 0;
        document.getElementById('statProjects').textContent = projects.data?.length || 0;
        document.getElementById('statEducation').textContent = edu.data?.length || 0;
        document.getElementById('statExperience').textContent = exp.data?.length || 0;
        const unread = msgs.data?.unread_count || 0;
        document.getElementById('statMessages').textContent = unread;
        const badge = document.getElementById('msgBadge');
        if (badge) { badge.textContent = unread; badge.style.display = unread > 0 ? 'block' : 'none'; }
    } catch (err) { console.error(err); }
}

// === Password Toggle ===
function initPasswordToggle() {
    const toggle = document.getElementById('togglePassword');
    const pass = document.getElementById('loginPass');
    if (toggle && pass) {
        toggle.onclick = () => {
            const isPass = pass.type === 'password';
            pass.type = isPass ? 'text' : 'password';
            toggle.textContent = isPass ? '🙈' : '👁️';
        };
    }
}

// === CV Upload ===
function initCvUpload() {
    const fileInput = document.getElementById('cvFile');
    const nameLabel = document.getElementById('cvFileName');
    const urlInput = document.getElementById('pf_cv_url');
    if (fileInput) {
        fileInput.onchange = async () => {
            if (!fileInput.files[0]) return;
            const res = await uploadFile(fileInput.files[0]);
            if (res.success) {
                nameLabel.textContent = fileInput.files[0].name;
                urlInput.value = res.data.url;
                showToast('CV uploaded!');
            } else {
                showToast(res.message, 'error');
            }
        };
    }
}

// === Profile Form ===
async function loadProfileForm() {
    const res = await api('get_profile');
    if (!res.success) return;
    const d = res.data;
    const fields = ['full_name', 'title', 'bio', 'email', 'phone', 'address', 'github', 'linkedin', 'facebook', 'website', 'cv_url'];
    fields.forEach(f => {
        const el = document.getElementById('pf_' + f);
        if (el) el.value = d[f] || '';
    });
    // Avatar preview
    const preview = document.getElementById('avatarPreview');
    if (preview) {
        const avatarUrl = d.avatar ? (d.avatar.startsWith('http') ? d.avatar : '../' + d.avatar) : '';
        preview.innerHTML = avatarUrl ? `<img src="${avatarUrl}" onload="this.classList.add('loaded')" />` : '<p>Click để upload avatar</p>';
    }
    // CV file name
    const cvLabel = document.getElementById('cvFileName');
    if (cvLabel && d.cv_url) {
        cvLabel.textContent = d.cv_url.split('/').pop();
    }
}

function initProfileForm() {
    const form = document.getElementById('profileForm');
    if (!form) return;
    initCvUpload();
    form.onsubmit = async (e) => {
        e.preventDefault();
        const fields = ['full_name', 'title', 'bio', 'email', 'phone', 'address', 'github', 'linkedin', 'facebook', 'website', 'cv_url'];
        const data = {};
        fields.forEach(f => { data[f] = document.getElementById('pf_' + f)?.value || ''; });

        const avatarUrl = document.getElementById('pf_avatar_url')?.value;
        if (avatarUrl) data.avatar = avatarUrl;

        const res = await api('save_profile', data, 'POST');
        showToast(res.success ? 'Profile đã cập nhật!' : res.message, res.success ? 'success' : 'error');
    };

    // Avatar upload
    const uploadArea = document.getElementById('avatarUpload');
    const fileInput = document.getElementById('avatarFile');
    if (uploadArea && fileInput) {
        uploadArea.onclick = () => fileInput.click();
        fileInput.onchange = async () => {
            if (!fileInput.files[0]) return;
            const res = await uploadFile(fileInput.files[0]);
            if (res.success) {
                const url = res.data.url.startsWith('http') ? res.data.url : '../' + res.data.url;
                document.getElementById('avatarPreview').innerHTML = `<img src="${url}" onload="this.classList.add('loaded')" />`;
                document.getElementById('pf_avatar_url').value = res.data.url;
                showToast('Avatar uploaded!');
            } else {
                showToast(res.message, 'error');
            }
        };
    }
}

// === Generic CRUD Table ===
async function loadSkillsList() {
    const res = await api('get_skills');
    const container = document.getElementById('skillsTableBody');
    if (!container || !res.success) return;
    const items = res.data || [];
    container.innerHTML = items.length === 0 ? '<tr><td colspan="5" style="text-align:center">Chưa có kỹ năng</td></tr>' : '';
    items.forEach(s => {
        container.innerHTML += `<tr>
            <td>${s.name}</td><td>${s.level}%</td><td>${s.category}</td><td>${s.sort_order}</td>
            <td class="table-actions">
                <button class="btn-edit" onclick="editSkill(${s.id})">✏️</button>
                <button class="btn-danger" onclick="confirmDelete('skill', ${s.id})">🗑️</button>
            </td></tr>`;
    });
}

async function loadProjectsList() {
    const res = await api('get_projects');
    const container = document.getElementById('projectsTableBody');
    if (!container || !res.success) return;
    const items = res.data || [];
    container.innerHTML = items.length === 0 ? '<tr><td colspan="4" style="text-align:center">Chưa có dự án</td></tr>' : '';
    items.forEach(p => {
        container.innerHTML += `<tr>
            <td>${p.title}</td><td>${p.tech_stack || '-'}</td><td>${p.sort_order}</td>
            <td class="table-actions">
                <button class="btn-edit" onclick="editProject(${p.id})">✏️</button>
                <button class="btn-danger" onclick="confirmDelete('project', ${p.id})">🗑️</button>
            </td></tr>`;
    });
}

async function loadEducationList() {
    const res = await api('get_education');
    const container = document.getElementById('educationTableBody');
    if (!container || !res.success) return;
    const items = res.data || [];
    container.innerHTML = items.length === 0 ? '<tr><td colspan="4" style="text-align:center">Chưa có học vấn</td></tr>' : '';
    items.forEach(e => {
        container.innerHTML += `<tr>
            <td>${e.school}</td><td>${e.degree || '-'}</td><td>${e.start_year || ''} - ${e.end_year || ''}</td>
            <td class="table-actions">
                <button class="btn-edit" onclick="editEducation(${e.id})">✏️</button>
                <button class="btn-danger" onclick="confirmDelete('education', ${e.id})">🗑️</button>
            </td></tr>`;
    });
}

async function loadExperienceList() {
    const res = await api('get_experience');
    const container = document.getElementById('experienceTableBody');
    if (!container || !res.success) return;
    const items = res.data || [];
    container.innerHTML = items.length === 0 ? '<tr><td colspan="4" style="text-align:center">Chưa có kinh nghiệm</td></tr>' : '';
    items.forEach(e => {
        container.innerHTML += `<tr>
            <td>${e.company}</td><td>${e.position || '-'}</td><td>${e.start_date || ''} - ${e.end_date || 'Hiện tại'}</td>
            <td class="table-actions">
                <button class="btn-edit" onclick="editExperience(${e.id})">✏️</button>
                <button class="btn-danger" onclick="confirmDelete('experience', ${e.id})">🗑️</button>
            </td></tr>`;
    });
}

// === Messages ===
async function loadMessages() {
    const res = await api('get_messages');
    const container = document.getElementById('messagesContainer');
    if (!container || !res.success) return;
    const msgs = res.data.messages || [];
    if (!msgs.length) { container.innerHTML = '<p style="text-align:center;color:var(--text-muted)">Chưa có tin nhắn.</p>'; return; }
    container.innerHTML = '';
    msgs.forEach(m => {
        container.innerHTML += `
            <div class="message-item ${m.is_read ? '' : 'unread'}">
                <div class="message-header">
                    <strong>${m.name}</strong>
                    <span class="date">${m.created_at}</span>
                </div>
                <div class="message-email">${m.email}</div>
                <div class="message-subject">${m.subject || '(Không có tiêu đề)'}</div>
                <div class="message-body">${m.message}</div>
                <div class="message-actions">
                    ${m.is_read ? '' : `<button class="btn-edit" onclick="markRead(${m.id})">✅ Đã đọc</button>`}
                    <button class="btn-danger" onclick="confirmDelete('message', ${m.id})">🗑️ Xóa</button>
                </div>
            </div>`;
    });
}

async function markRead(id) {
    const res = await api('mark_read', { id }, 'POST');
    if (res.success) { showToast('Đã đánh dấu đọc'); loadMessages(); loadDashboard(); }
}

// === Settings ===
async function loadSettingsForm() {
    const res = await api('get_settings');
    if (!res.success) return;
    const d = res.data;
    const themeSelect = document.getElementById('settingTheme');
    if (themeSelect) themeSelect.value = d.theme || 'dark';
    const titleInput = document.getElementById('settingSiteTitle');
    if (titleInput) titleInput.value = d.site_title || '';
}

// === Add / Edit Forms (inline) ===
// Hiển thị khung form (Add/Edit) mà không làm thay đổi currentPanel của Sidebar
function openFormUI(title) {
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    const formPanel = document.getElementById('panel-form');
    if (formPanel) formPanel.classList.add('active');
    const titleEl = document.getElementById('panelTitle');
    if (titleEl) titleEl.textContent = title;
}

function showAddForm(type, isEdit = false) {
    const pluralMap = { 'skill': 'skills', 'project': 'projects', 'education': 'education', 'experience': 'experience' };
    const panel = pluralMap[type] || type;

    if (!isEdit && window.location.hash !== `#${panel}/add`) {
        window.location.hash = `${panel}/add`;
        return;
    }

    const content = document.getElementById('editFormContent');
    let html = '';
    let panelTitle = '';
    switch (type) {
        case 'skill':
            panelTitle = 'Thêm Kỹ năng';
            html = `
                <div class="admin-form"><div class="form-group"><label>Tên</label><input id="ef_name" /></div>
                <div class="form-group"><label>Level (0-100)</label><input id="ef_level" type="number" value="50" /></div>
                <div class="form-group"><label>Category</label><select id="ef_category"><option value="frontend">Frontend</option><option value="backend">Backend</option><option value="other">Other</option></select></div>
                <div class="form-group"><label>Sort Order</label><input id="ef_sort" type="number" value="0" /></div>
                <div class="form-actions"><button class="btn-save" onclick="saveAdd('skill')">Lưu</button><button type="button" class="btn-cancel" onclick="closeEditModal()">Hủy</button></div></div>`;
            break;
        case 'project':
            panelTitle = 'Thêm Dự án';
            html = `
                <div class="admin-form">
                    <div class="form-group">
                        <label>Ảnh minh họa</label>
                        <div class="image-upload-area" id="projectImgUpload">
                            <div id="projectImgPreview"><p>Click để upload ảnh</p></div>
                        </div>
                        <input type="file" id="projectImgFile" accept="image/*" style="display:none" />
                        <input type="hidden" id="ef_image" />
                    </div>
                    <div class="form-group"><label>Tên dự án</label><input id="ef_title" /></div>
                    <div class="form-group"><label>Mô tả</label><textarea id="ef_description"></textarea></div>
                    <div class="form-group"><label>Tech Stack (phân cách bằng dấu phẩy)</label><input id="ef_tech_stack" placeholder="VD: React, Node.js, SQLite" /></div>
                    <div class="form-row">
                        <div class="form-group"><label>Demo URL</label><input id="ef_demo_url" /></div>
                        <div class="form-group"><label>Source URL</label><input id="ef_source_url" /></div>
                    </div>
                    <div class="form-group"><label>Thứ tự hiển thị</label><input id="ef_sort" type="number" value="0" /></div>
                    <div class="form-actions">
                        <button class="btn-save" onclick="saveAdd('project')">💾 Lưu dự án</button>
                        <button type="button" class="btn-cancel" onclick="closeEditModal()">Hủy</button>
                    </div>
                </div>`;
            break;
        case 'education':
            panelTitle = 'Thêm Học vấn';
            html = `
                <div class="admin-form"><div class="form-group"><label>Trường</label><input id="ef_school" /></div>
                <div class="form-group"><label>Bằng cấp</label><input id="ef_degree" /></div>
                <div class="form-row"><div class="form-group"><label>Năm bắt đầu</label><input id="ef_start_year" /></div>
                <div class="form-group"><label>Năm kết thúc</label><input id="ef_end_year" /></div></div>
                <div class="form-group"><label>Mô tả</label><textarea id="ef_description"></textarea></div>
                <div class="form-actions"><button class="btn-save" onclick="saveAdd('education')">Lưu</button><button type="button" class="btn-cancel" onclick="closeEditModal()">Hủy</button></div></div>`;
            break;
        case 'experience':
            panelTitle = 'Thêm Kinh nghiệm';
            html = `
                <div class="admin-form"><div class="form-group"><label>Công ty</label><input id="ef_company" /></div>
                <div class="form-group"><label>Vị trí</label><input id="ef_position" /></div>
                <div class="form-row"><div class="form-group"><label>Ngày bắt đầu</label><input id="ef_start_date" /></div>
                <div class="form-group"><label>Ngày kết thúc</label><input id="ef_end_date" placeholder="Hiện tại" /></div></div>
                <div class="form-group"><label>Mô tả</label><textarea id="ef_description"></textarea></div>
                <div class="form-actions"><button class="btn-save" onclick="saveAdd('experience')">Lưu</button><button type="button" class="btn-cancel" onclick="closeEditModal()">Hủy</button></div></div>`;
            break;
    }
    content.innerHTML = html;
    openFormUI(panelTitle);
    
    // Init project image upload if it exists in modal
    const pImgUpload = document.getElementById('projectImgUpload');
    const pImgFile = document.getElementById('projectImgFile');
    if (pImgUpload && pImgFile) {
        pImgUpload.onclick = () => pImgFile.click();
        pImgFile.onchange = async () => {
            if (!pImgFile.files[0]) return;
            const res = await uploadFile(pImgFile.files[0]);
            if (res.success) {
                const url = res.data.url.startsWith('http') ? res.data.url : '../' + res.data.url;
                document.getElementById('projectImgPreview').innerHTML = `<img src="${url}" />`;
                document.getElementById('ef_image').value = res.data.url;
            } else { showToast(res.message, 'error'); }
        };
    }
}

async function saveAdd(type) {
    let data = {};
    switch (type) {
        case 'skill':
            data = { name: gef('name'), level: parseInt(gef('level')), category: gef('category'), sort_order: parseInt(gef('sort') || '0') };
            break;
        case 'project':
            data = {
                title: gef('title'),
                description: gef('description'),
                image: document.getElementById('ef_image')?.value || '',
                tech_stack: gef('tech_stack'),
                demo_url: gef('demo_url'),
                source_url: gef('source_url'),
                sort_order: parseInt(gef('sort') || '0')
            };
            break;
        case 'education':
            data = { school: gef('school'), degree: gef('degree'), start_year: gef('start_year'), end_year: gef('end_year'), description: gef('description') };
            break;
        case 'experience':
            data = { company: gef('company'), position: gef('position'), start_date: gef('start_date'), end_date: gef('end_date'), description: gef('description') };
            break;
    }
    const res = await api(`add_${type}`, data, 'POST');
    showToast(res.success ? 'Đã thêm!' : res.message, res.success ? 'success' : 'error');
    if (res.success) { closeEditModal(); loadPanelData(currentPanel); }
}

function gef(id) { return document.getElementById('ef_' + id)?.value || ''; }

// === Edit ===
async function editSkill(id) {
    if (window.location.hash !== `#skills/edit/${id}`) {
        window.location.hash = `skills/edit/${id}`;
        return;
    }
    const res = await api('get_skills');
    const item = res.data.find(s => s.id === id);
    if (!item) return;

    showAddForm('skill', true); 
    
    document.getElementById('ef_name').value = item.name;
    document.getElementById('ef_level').value = item.level;
    document.getElementById('ef_category').value = item.category;
    document.getElementById('ef_sort').value = item.sort_order;
    document.querySelector('#editFormContent .btn-save').onclick = async () => {
        const data = { id, name: gef('name'), level: parseInt(gef('level')), category: gef('category'), sort_order: parseInt(gef('sort') || '0') };
        const r = await api('update_skill', data, 'POST');
        showToast(r.success ? 'Đã cập nhật!' : r.message, r.success ? 'success' : 'error');
        if (r.success) { closeEditModal(); loadSkillsList(); }
    };
    document.getElementById('panelTitle').textContent = 'Sửa Kỹ năng';
}

async function editProject(id) {
    if (window.location.hash !== `#projects/edit/${id}`) {
        window.location.hash = `projects/edit/${id}`;
        return;
    }
    const res = await api('get_projects');
    const item = res.data.find(p => p.id === id);
    if (!item) return;

    showAddForm('project', true);

    document.getElementById('ef_title').value = item.title;
    document.getElementById('ef_description').value = item.description || '';
    document.getElementById('ef_tech_stack').value = item.tech_stack || '';
    document.getElementById('ef_demo_url').value = item.demo_url || '';
    document.getElementById('ef_source_url').value = item.source_url || '';
    document.getElementById('ef_sort').value = item.sort_order;

    if (item.image) {
        const url = item.image.startsWith('http') ? item.image : '../' + item.image;
        document.getElementById('projectImgPreview').innerHTML = `<img src="${url}" />`;
        document.getElementById('ef_image').value = item.image;
    }

    document.querySelector('#editFormContent .btn-save').onclick = async () => {
        const data = {
            id,
            title: gef('title'),
            description: gef('description'),
            image: document.getElementById('ef_image')?.value || '',
            tech_stack: gef('tech_stack'),
            demo_url: gef('demo_url'),
            source_url: gef('source_url'),
            sort_order: parseInt(gef('sort') || '0')
        };
        const r = await api('update_project', data, 'POST');
        showToast(r.success ? 'Đã cập nhật!' : r.message, r.success ? 'success' : 'error');
        if (r.success) { closeEditModal(); loadProjectsList(); }
    };
    document.getElementById('panelTitle').textContent = 'Sửa Dự án';
}

async function editEducation(id) {
    if (window.location.hash !== `#education/edit/${id}`) {
        window.location.hash = `education/edit/${id}`;
        return;
    }
    const res = await api('get_education');
    const item = res.data.find(e => e.id === id);
    if (!item) return;

    showAddForm('education', true);

    document.getElementById('ef_school').value = item.school;
    document.getElementById('ef_degree').value = item.degree || '';
    document.getElementById('ef_start_year').value = item.start_year || '';
    document.getElementById('ef_end_year').value = item.end_year || '';
    document.getElementById('ef_description').value = item.description || '';
    document.querySelector('#editFormContent .btn-save').onclick = async () => {
        const data = { id, school: gef('school'), degree: gef('degree'), start_year: gef('start_year'), end_year: gef('end_year'), description: gef('description') };
        const r = await api('update_education', data, 'POST');
        showToast(r.success ? 'Đã cập nhật!' : r.message, r.success ? 'success' : 'error');
        if (r.success) { closeEditModal(); loadEducationList(); }
    };
    document.getElementById('panelTitle').textContent = 'Sửa Học vấn';
}

async function editExperience(id) {
    if (window.location.hash !== `#experience/edit/${id}`) {
        window.location.hash = `experience/edit/${id}`;
        return;
    }
    const res = await api('get_experience');
    const item = res.data.find(e => e.id === id);
    if (!item) return;

    showAddForm('experience', true);

    document.getElementById('ef_company').value = item.company;
    document.getElementById('ef_position').value = item.position || '';
    document.getElementById('ef_start_date').value = item.start_date || '';
    document.getElementById('ef_end_date').value = item.end_date || '';
    document.getElementById('ef_description').value = item.description || '';
    document.querySelector('#editFormContent .btn-save').onclick = async () => {
        const data = { id, company: gef('company'), position: gef('position'), start_date: gef('start_date'), end_date: gef('end_date'), description: gef('description') };
        const r = await api('update_experience', data, 'POST');
        showToast(r.success ? 'Đã cập nhật!' : r.message, r.success ? 'success' : 'error');
        if (r.success) { closeEditModal(); loadExperienceList(); }
    };
    document.getElementById('panelTitle').textContent = 'Sửa Kinh nghiệm';
}

// === Delete Confirm ===
function initModal() {
    document.getElementById('cancelDelete')?.addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDelete')?.addEventListener('click', async () => {
        if (deleteCallback) await deleteCallback();
        closeDeleteModal();
    });
    initProfileForm();
    initSettingsForm();
}

function confirmDelete(type, id) {
    const actions = {
        skill: 'delete_skill', project: 'delete_project',
        education: 'delete_education', experience: 'delete_experience',
        message: 'delete_message'
    };
    deleteCallback = async () => {
        const res = await api(actions[type], { id }, 'POST');
        showToast(res.success ? 'Đã xóa!' : res.message, res.success ? 'success' : 'error');
        if (res.success) loadPanelData(currentPanel);
    };
    document.getElementById('deleteModal').classList.add('active');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    deleteCallback = null;
}

function closeEditModal() {
    switchPanel(currentPanel);
}

// === Settings Form ===
function initSettingsForm() {
    const form = document.getElementById('settingsForm');
    if (!form) return;
    form.onsubmit = async (e) => {
        e.preventDefault();
        const data = {
            theme: document.getElementById('settingTheme').value,
            site_title: document.getElementById('settingSiteTitle').value
        };
        const res = await api('save_settings', data, 'POST');
        showToast(res.success ? 'Cài đặt đã lưu!' : res.message, res.success ? 'success' : 'error');
    };
}

// === Change Password ===
async function changePassword() {
    const cur = document.getElementById('currentPass').value;
    const newP = document.getElementById('newPass').value;
    if (!cur || !newP) { showToast('Vui lòng nhập đầy đủ', 'error'); return; }
    const res = await api('change_password', { current_password: cur, new_password: newP }, 'POST');
    showToast(res.success ? 'Đổi mật khẩu thành công!' : res.message, res.success ? 'success' : 'error');
    if (res.success) { document.getElementById('currentPass').value = ''; document.getElementById('newPass').value = ''; }
}
