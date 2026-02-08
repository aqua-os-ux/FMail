// ──────────────────────────────────────────────
// Settings & Profile
// ──────────────────────────────────────────────

let userSettings = {
    username: "You",
    profile: "https://i.imgur.com/W8uyrTY.jpeg",
    darkMode: false
};

if (localStorage.getItem("fakeGmailSettings")) {
    userSettings = JSON.parse(localStorage.getItem("fakeGmailSettings"));
    document.body.classList.toggle("dark-mode", userSettings.darkMode);
}

function updateProfileDisplay() {
    document.getElementById("topbarName").textContent = userSettings.username;
    document.getElementById("topbarAvatar").src = userSettings.profile;
    document.getElementById("popupName").textContent = userSettings.username;
    document.getElementById("popupAvatar").src = userSettings.profile;
}

updateProfileDisplay();

const profileBtn = document.getElementById("profileBtn");
const profilePopup = document.getElementById("profilePopup");

profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    profilePopup.classList.toggle("show");
});

document.addEventListener("click", (e) => {
    if (!profilePopup.contains(e.target) && !profileBtn.contains(e.target)) {
        profilePopup.classList.remove("show");
    }
});

document.getElementById("settingsTrigger").addEventListener('click', () => {
    profilePopup.classList.remove("show");
    document.getElementById("darkModeToggle").checked = userSettings.darkMode;
    document.getElementById("userName").value = userSettings.username;
    document.getElementById("userProfile").value = userSettings.profile;
    document.getElementById("settingsModal").classList.add("active");
});

document.getElementById("logoutTrigger").addEventListener('click', () => {
    profilePopup.classList.remove("show");
    document.querySelector(".topbar").style.display = "none";
    document.querySelector(".main").style.display = "none";
    document.querySelector(".fab").style.display = "none";
    document.getElementById("logout-page").style.display = "flex";
});

// Settings modal close & save
const settingsModal = document.getElementById('settingsModal');

document.getElementById("closeSettings").addEventListener('click', () => {
    settingsModal.classList.remove("active");
});

document.getElementById("cancelSettings").addEventListener('click', () => {
    settingsModal.classList.remove("active");
});

document.getElementById("saveSettings").addEventListener('click', () => {
    userSettings.darkMode = document.getElementById("darkModeToggle").checked;
    userSettings.username = document.getElementById("userName").value.trim() || "You";
    const file = document.getElementById('settingsAvatarUpload').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            userSettings.profile = e.target.result;
            localStorage.setItem("fakeGmailSettings", JSON.stringify(userSettings));
            document.body.classList.toggle("dark-mode", userSettings.darkMode);
            updateProfileDisplay();
            settingsModal.classList.remove("active");
        };
        reader.readAsDataURL(file);
    } else {
        userSettings.profile = document.getElementById("userProfile").value.trim() || "https://i.imgur.com/W8uyrTY.jpeg";
        localStorage.setItem("fakeGmailSettings", JSON.stringify(userSettings));
        document.body.classList.toggle("dark-mode", userSettings.darkMode);
        updateProfileDisplay();
        settingsModal.classList.remove("active");
    }
});

settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) settingsModal.classList.remove("active");
});

// ──────────────────────────────────────────────
// Compose modal
// ──────────────────────────────────────────────

let composeAvatarDataUrl = null;

document.getElementById('composeAvatarUpload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => composeAvatarDataUrl = event.target.result;
        reader.readAsDataURL(file);
    }
});

document.getElementById('composeBtn').addEventListener('click', () => {
    document.getElementById('composeModal').classList.add('active');
    composeAvatarDataUrl = null;
});

document.getElementById('closeCompose').addEventListener('click', () => {
    document.getElementById('composeModal').classList.remove('active');
    resetCompose();
});

document.getElementById('avatarPickerBtn').addEventListener('click', () => {
    const opts = document.getElementById('avatarOptions');
    opts.style.display = opts.style.display === 'flex' ? 'none' : 'flex';
});

document.querySelectorAll('.avatar-select').forEach(img => {
    img.addEventListener('click', () => {
        document.querySelectorAll('.avatar-select').forEach(i => i.classList.remove('selected'));
        img.classList.add('selected');
        composeAvatarDataUrl = img.src;
    });
});

// Reliable send on mobile (touchend + click fallback)
const sendBtn = document.getElementById('sendBtn');

function handleSend(e) {
    if (e) e.preventDefault();
    const name = document.getElementById('c-from-name').value.trim();
    const email = document.getElementById('c-from-email').value.trim();
    const avatar = composeAvatarDataUrl || '';
    const subject = document.getElementById('c-subject').value.trim() || '(no subject)';
    const body = document.getElementById('c-body').innerHTML.trim();

    let category = 'Inbox';
    if (!name && !email && !avatar && !body) category = 'Warning';

    emails.unshift({ name, email, avatar, subject, body, category, replies: [] });

    resetCompose();
    document.getElementById('composeModal').classList.remove('active');
    renderInbox();
}

sendBtn.addEventListener('click', handleSend);
sendBtn.addEventListener('touchend', handleSend, { passive: false });

function resetCompose() {
    document.getElementById('c-from-name').value = '';
    document.getElementById('c-from-email').value = '';
    document.getElementById('c-subject').value = '';
    document.getElementById('c-body').innerHTML = '';
    composeAvatarDataUrl = null;
    document.getElementById('composeAvatarUpload').value = '';
    document.querySelectorAll('.avatar-select').forEach(i => i.classList.remove('selected'));
    document.getElementById('avatarOptions').style.display = 'none';
}

// ──────────────────────────────────────────────
// View modal, reply, delete, sender reply
// ──────────────────────────────────────────────

let currentEmail = null;

function openEmail(email) {
    currentEmail = email;
    document.getElementById('view-subject').textContent = email.subject;
    document.getElementById('view-avatar').src = email.avatar || 'https://i.imgur.com/W8uyrTY.jpeg';
    document.getElementById('view-from').textContent = email.name || (email.email ? `${email.email}@gmail.com` : 'Unknown sender');

    renderEmailBody(email);
    document.getElementById('viewModal').classList.add('active');
}

function renderEmailBody(email) {
    const bodyEl = document.getElementById('view-body');
    bodyEl.innerHTML = email.body;

    let warning = '';
    if (!email.name && !email.email && !email.avatar) {
        warning = `<div class="warning">
      <span class="material-symbols-outlined warning-icon">warning</span>
      <div><strong>Warning:</strong> No sender information available.<br>Replying is not recommended.</div>
    </div>`;
    }
    document.getElementById('view-warning').innerHTML = warning;

    email.replies.forEach(reply => {
        const div = document.createElement('div');
        div.className = 'reply-message';
        div.innerHTML = `
      <img class="reply-avatar" src="${reply.profile}" alt="">
      <div class="reply-content">
        <div class="reply-from">${reply.from}:</div>
        <div>${reply.text}</div>
      </div>
    `;
        bodyEl.appendChild(div);
    });
}

document.getElementById('closeView').addEventListener('click', () => {
    document.getElementById('viewModal').classList.remove('active');
    currentEmail = null;
});

document.getElementById('sendReplyBtn').addEventListener('click', () => {
    if (!currentEmail) return;
    const text = document.getElementById('reply-text').value.trim();
    if (!text) return;

    currentEmail.replies.push({
        from: userSettings.username,
        profile: userSettings.profile,
        text
    });

    document.getElementById('reply-text').value = '';
    renderEmailBody(currentEmail);
});

document.getElementById('deleteBtn').addEventListener('click', () => {
    if (!currentEmail) return;

    currentEmail.category = 'Deleted';

    document.getElementById('viewModal').classList.remove('active');
    currentEmail = null;
    renderInbox();
});

document.getElementById('senderClickable').addEventListener('click', () => {
    if (!currentEmail) return;

    document.getElementById('replyAsSenderTo').textContent =
        currentEmail.name || (currentEmail.email ? `${currentEmail.email}@gmail.com` : 'Unknown sender');

    document.getElementById('replyAsSenderBody').innerHTML = '';
    document.getElementById('replyAsSenderModal').classList.add('active');
});

document.getElementById('closeReplyAsSender').addEventListener('click', () => {
    document.getElementById('replyAsSenderModal').classList.remove('active');
});

document.getElementById('cancelReplyAsSender').addEventListener('click', () => {
    document.getElementById('replyAsSenderModal').classList.remove('active');
});

document.getElementById('sendAsSenderBtn').addEventListener('click', () => {
    if (!currentEmail) return;

    const text = document.getElementById('replyAsSenderBody').innerHTML.trim();
    if (!text) return;

    currentEmail.replies.push({
        from: currentEmail.name || (currentEmail.email ? currentEmail.email : 'Sender'),
        profile: currentEmail.avatar || 'https://i.imgur.com/W8uyrTY.jpeg',
        text
    });

    document.getElementById('replyAsSenderModal').classList.remove('active');
    renderEmailBody(currentEmail);
});

// ──────────────────────────────────────────────
// Sidebar & Inbox
// ──────────────────────────────────────────────

let emails = [];
let currentFilter = 'Inbox';

document.getElementById('menuBtn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
});

document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        currentFilter = item.dataset.filter;
        renderInbox();
        if (window.innerWidth < 1024) document.getElementById('sidebar').classList.remove('open');
    });
});

function renderInbox() {
    const container = document.getElementById('inbox-container');
    container.innerHTML = '';

    const filtered = emails.filter(e => e.category === currentFilter);

    document.getElementById('count-inbox').textContent = emails.filter(e => e.category === 'Inbox').length;
    document.getElementById('count-warning').textContent = emails.filter(e => e.category === 'Warning').length;
    document.getElementById('count-sent').textContent = emails.filter(e => e.category === 'Sent').length;
    document.getElementById('count-spam').textContent = emails.filter(e => e.category === 'Spam').length;
    document.getElementById('count-deleted').textContent = emails.filter(e => e.category === 'Deleted').length;

    filtered.forEach(email => {
        const div = document.createElement('div');
        div.className = 'email';
        div.innerHTML = `
      <img class="avatar" src="${email.avatar || 'https://i.imgur.com/W8uyrTY.jpeg'}" alt="">
      <div class="email-info">
        <div class="from">${email.name || (email.email ? `${email.email}@gmail.com` : 'Unknown sender')}</div>
        <div class="subject">${email.subject}</div>
        <div class="snippet">${(email.body.replace(/<[^>]+>/g, '') || '').substring(0, 100)}${email.body.length > 100 ? '...' : ''}</div>
      </div>
    `;
        div.addEventListener('click', () => openEmail(email));
        container.appendChild(div);
    });
}

// Close modals on outside tap/click
[document.getElementById('composeModal'), document.getElementById('viewModal'), settingsModal, document.getElementById('replyAsSenderModal')].forEach(modal => {
    modal.addEventListener('click', e => {
        if (e.target === modal) modal.classList.remove('active');
    });
});

renderInbox();