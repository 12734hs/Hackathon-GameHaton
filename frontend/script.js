/* ============================================
   LetsPlay - JavaScript Functionality
   ============================================ */

const API_BASE = "https://backend-dev-production-4961.up.railway.app/";

// ============================================
// API HELPERS
// ============================================
async function apiFetch(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

// ============================================
// SCREEN NAVIGATION SYSTEM
// ============================================
function navigateTo(screenId) {
  try {
    const screens = document.querySelectorAll(".screen");
    screens.forEach((screen) => screen.classList.remove("active"));

    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
      targetScreen.classList.add("active");
      window.scrollTo(0, 0);
      console.log(`✓ Navigated to: ${screenId}`);

      if (screenId === "dashboard") {
        loadRooms();
        renderJoinedTeams();
      }

      if (screenId === "chat") {
        const activeTeam = getActiveTeam();
        if (activeTeam?.id) {
          loadRoomChat(activeTeam.id, activeTeam.name);
        } else {
          renderChatTeam("", []);
        }
      }

      if (screenId === "profile") {
        loadProfile();
      }
    } else {
      console.error(`✗ Screen "${screenId}" not found`);
    }
  } catch (error) {
    console.error("Navigation error:", error);
  }
}

// ============================================
// RESPONSIVE
// ============================================
const responsiveQueries = {
  mobile: window.matchMedia("(max-width: 768px)"),
  touch: window.matchMedia("(pointer: coarse)"),
};

const responsiveState = {
  isMobile: responsiveQueries.mobile.matches,
  isTouch: responsiveQueries.touch.matches,
};

function updateResponsiveState() {
  responsiveState.isMobile = responsiveQueries.mobile.matches;
  responsiveState.isTouch = responsiveQueries.touch.matches;

  const sidebar = document.getElementById("dashboard-sidebar");
  const sidebarToggle = document.querySelector(".sidebar-toggle");

  if (!responsiveState.isMobile && sidebar) {
    sidebar.classList.remove("open");
  }

  if (sidebarToggle) {
    const isOpen = sidebar ? sidebar.classList.contains("open") : false;
    sidebarToggle.setAttribute(
      "aria-expanded",
      responsiveState.isMobile && isOpen ? "true" : "false",
    );
  }

  document.body.dataset.viewport = responsiveState.isMobile ? "mobile" : "desktop";
  document.body.classList.toggle("is-mobile", responsiveState.isMobile);
  document.body.classList.toggle("is-touch", responsiveState.isTouch);
}

function toggleDashboardSidebar() {
  if (!responsiveState.isMobile) return;
  const sidebar = document.getElementById("dashboard-sidebar");
  if (!sidebar) return;
  sidebar.classList.toggle("open");
  updateResponsiveState();
}

// ============================================
// JOINED TEAMS (LOCAL STATE)
// ============================================
function getJoinedTeams() {
  try {
    return JSON.parse(localStorage.getItem("joinedTeams") || "[]");
  } catch {
    return [];
  }
}

function setJoinedTeams(teams) {
  localStorage.setItem("joinedTeams", JSON.stringify(teams));
}

function getActiveTeam() {
  try {
    return JSON.parse(localStorage.getItem("activeTeam") || "null");
  } catch {
    return null;
  }
}

function setActiveTeam(team) {
  localStorage.setItem("activeTeam", JSON.stringify(team));
}

function renderJoinedTeams() {
  const list = document.getElementById("joinedTeamsList");
  const count = document.getElementById("joinedTeamsCount");
  if (!list) return;

  const joinedTeams = getJoinedTeams();
  const activeTeam = getActiveTeam();

  if (count) count.textContent = String(joinedTeams.length);

  if (!joinedTeams.length) {
    list.innerHTML = "";
    return;
  }

  list.innerHTML = joinedTeams
    .map((team) => {
      const isActive = activeTeam?.id === team.id;
      return `
        <button class="joined-team-chip ${isActive ? "active" : ""}" type="button" onclick="openTeamChat('${team.id}', '${team.name.replace(/'/g, "\\'")}')">
          <i class="fas fa-users"></i>
          <span>${team.name}</span>
        </button>
      `;
    })
    .join("");
}

function toggleJoinedTeamsDropdown() {
  const list = document.getElementById("joinedTeamsList");
  const chevron = document.getElementById("joinedTeamsChevron");
  if (!list) return;
  const isOpen = list.classList.toggle("is-open");
  if (chevron) chevron.style.transform = isOpen ? "rotate(0deg)" : "rotate(-90deg)";
}

// ============================================
// DASHBOARD — LOAD ROOMS FROM API
// ============================================
async function loadRooms() {
  const feed = document.querySelector(".games-feed");
  if (!feed) return;

  feed.innerHTML = `<div class="loading-spinner" style="text-align:center;padding:2rem;color:var(--text-secondary)"><i class="fas fa-spinner fa-spin"></i> Loading games...</div>`;

  try {
    const { ok, data } = await apiFetch("/api/rooms");
    if (!ok) {
      feed.innerHTML = `<p style="color:var(--danger);text-align:center;padding:2rem">Failed to load games.</p>`;
      return;
    }

    const joinedTeams = getJoinedTeams();
    const joinedIds = joinedTeams.map((t) => t.id);
    const rooms = (data.rooms || []).filter((r) => !joinedIds.includes(r.id));

    if (!rooms.length) {
      feed.innerHTML = `<p style="color:var(--text-secondary);text-align:center;padding:2rem">No active games found. Create one!</p>`;
      return;
    }

    feed.innerHTML = rooms.map((room) => buildGameCard(room)).join("");
  } catch (err) {
    console.error("loadRooms error:", err);
    feed.innerHTML = `<p style="color:var(--danger);text-align:center;padding:2rem">Could not connect to server.</p>`;
  }
}

function buildGameCard(room) {
  const startDate = room.game_start_time
    ? new Date(room.game_start_time).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "TBD";
  const startTime = room.game_start_time
    ? new Date(room.game_start_time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "";
  const endTime = room.game_end_time
    ? new Date(room.game_end_time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "";

  return `
    <div class="game-card" data-room-id="${room.id}">
      <div class="game-card-header">
        <h3 class="game-title">${escapeHtml(room.game_name)}</h3>
        <span class="game-date"><i class="fas fa-calendar"></i> ${startDate}</span>
      </div>
      <div class="game-stats">
        <span class="stat-item"><i class="fas fa-users"></i><strong>${room.max_players}</strong> Max Players</span>
        <span class="stat-item"><i class="fas fa-language"></i><strong>${escapeHtml(room.language)}</strong></span>
        ${startTime ? `<span class="stat-item"><i class="fas fa-clock"></i><strong>${startTime}${endTime ? ' – ' + endTime : ''}</strong></span>` : ''}
        ${room.min_age || room.max_age ? `<span class="stat-item"><i class="fas fa-user"></i><strong>Age ${room.min_age}–${room.max_age}</strong></span>` : ''}
      </div>
      <p class="game-description">${escapeHtml(room.description)}</p>
      <div class="game-card-footer">
        <button class="btn btn-sm btn-outline team-join-btn" onclick="joinTeam('${room.id}', '${room.game_name.replace(/'/g, "\\'")}', this)">
          Join Team
        </button>
      </div>
    </div>
  `;
}

async function joinTeam(roomId, roomName, buttonElement) {
  const { ok, data } = await apiFetch(`/api/rooms/${roomId}/join`, { method: "POST" });

  if (!ok) {
    showNotification(data.message || "Failed to join team");
    return;
  }

  const joinedTeams = getJoinedTeams();
  if (!joinedTeams.find((t) => t.id === roomId)) {
    joinedTeams.push({ id: roomId, name: roomName });
    setJoinedTeams(joinedTeams);
  }

  setActiveTeam({ id: roomId, name: roomName });
  renderJoinedTeams();

  if (buttonElement) {
    const card = buttonElement.closest(".game-card");
    if (card) card.remove();
  }

  showNotification(`${roomName} added to Joined Teams`);
}

function openTeamChat(roomId, roomName) {
  setActiveTeam({ id: roomId, name: roomName });
  renderJoinedTeams();
  navigateTo("chat");
  loadRoomChat(roomId, roomName);
}

// ============================================
// CHAT — LOAD & SEND MESSAGES VIA API
// ============================================
let chatPollInterval = null;

async function loadRoomChat(roomId, roomName) {
  const chatTeamTitle = document.getElementById("chatTeamTitle");
  const chatTeamSubtitle = document.getElementById("chatTeamSubtitle");
  const chatSidebarTeam = document.getElementById("chatSidebarTeam");
  const chatMembersList = document.getElementById("chatMembersList");
  const chatMessages = document.getElementById("chatMessages");

  if (chatTeamTitle) chatTeamTitle.textContent = roomName || "Team Chat";
  if (chatSidebarTeam) chatSidebarTeam.textContent = roomName || "Select a team";

  if (chatPollInterval) clearInterval(chatPollInterval);

  try {
    const { ok, data } = await apiFetch(`/api/rooms/${roomId}`);
    if (!ok) return;

    // Update session info panel
    const infoItems = document.querySelectorAll(".info-item .value");
    if (infoItems[0]) infoItems[0].textContent = roomId.slice(0, 8).toUpperCase();
    if (infoItems[2]) infoItems[2].textContent = data.room?.language || "";

    const descSection = document.querySelector(".info-section:nth-child(2) p");
    if (descSection) descSection.textContent = data.room?.description || "";

    const dateSection = document.querySelector(".info-section:nth-child(3) p");
    if (dateSection && data.room?.game_start_time) {
      const d = new Date(data.room.game_start_time);
      dateSection.textContent = d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) + " • " +
        d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    }

    // Members
    const members = data.members || [];
    if (chatTeamSubtitle) chatTeamSubtitle.textContent = `${members.length} attending players`;
    if (chatMembersList) {
      chatMembersList.innerHTML = members.length
        ? members.map((m, i) => `
          <div class="user-item ${i === 0 ? "active" : ""}">
            <div class="user-avatar">${m.slice(0, 2).toUpperCase()}</div>
            <div class="user-info">
              <span class="user-name">${escapeHtml(m)}</span>
              <span class="user-status">Online</span>
            </div>
          </div>`).join("")
        : `<div class="user-item"><div class="user-avatar">--</div><div class="user-info"><span class="user-name">No members yet</span></div></div>`;
    }

    // Messages
    renderMessages(data.messages || [], chatMessages);

    // Poll for new messages every 5s
    chatPollInterval = setInterval(async () => {
      const { ok: ok2, data: d2 } = await apiFetch(`/api/rooms/${roomId}/messages`);
      if (ok2) renderMessages(d2.messages || [], chatMessages);
    }, 5000);

    // Wire up send button for this room
    const chatInput = document.querySelector(".chat-input");
    const sendBtn = document.querySelector(".chat-input-area .btn-neon");
    if (chatInput) chatInput._roomId = roomId;

    if (sendBtn) {
      sendBtn.onclick = () => sendChatMessage(roomId);
    }
    if (chatInput) {
      chatInput.onkeydown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          sendChatMessage(roomId);
        }
      };
    }
  } catch (err) {
    console.error("loadRoomChat error:", err);
  }
}

function renderMessages(messages, container) {
  if (!container) return;
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const myNick = userData.nickname || "";

  container.innerHTML = messages.length
    ? messages.map((msg) => {
        const isOwn = msg.nickname === myNick;
        return `
          <div class="message-group">
            <div class="message ${isOwn ? "message-own" : "message-other"}">
              ${!isOwn ? `<span class="message-sender">${escapeHtml(msg.nickname)}</span>` : ""}
              <p>${escapeHtml(msg.content)}</p>
              <span class="message-time">${new Date(msg.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>`;
      }).join("")
    : `<div class="message-group"><div class="message message-other"><span class="message-sender">Team Chat</span><p>Say hi to your squad!</p><span class="message-time">Now</span></div></div>`;

  container.scrollTop = container.scrollHeight;
}

async function sendChatMessage(roomId) {
  const chatInput = document.querySelector(".chat-input");
  if (!chatInput) return;
  const message = chatInput.value.trim();
  if (!message) return;

  const { ok, data } = await apiFetch(`/api/rooms/${roomId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content: message }),
  });

  if (ok) {
    chatInput.value = "";
    // Immediately re-fetch messages
    const { ok: ok2, data: d2 } = await apiFetch(`/api/rooms/${roomId}/messages`);
    if (ok2) renderMessages(d2.messages || [], document.getElementById("chatMessages"));
  } else {
    showNotification(data.message || "Could not send message");
  }
}

// ============================================
// MODAL MANAGEMENT
// ============================================
function openCreateGameModal() {
  const modal = document.getElementById("createGameModal");
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeCreateGameModal() {
  const modal = document.getElementById("createGameModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
  }
}

document.addEventListener("click", (e) => {
  const modal = document.getElementById("createGameModal");
  if (modal && e.target === modal) closeCreateGameModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeCreateGameModal();
});

// ============================================
// FORM HANDLERS
// ============================================

// LOGIN
async function handleLogin(event) {
  event.preventDefault();
  try {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!email) { showNotification("Please enter your email"); return; }
    if (!password || password.length < 6) { showNotification("Password must be at least 6 characters"); return; }

    showNotification("Logging in...");

    const { ok, data } = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!ok) {
      showNotification(data.message || "Login failed");
      return;
    }

    localStorage.setItem("user", JSON.stringify(data.user));
    showNotification("Login successful! Welcome back!");
    event.target.reset();
    setTimeout(() => navigateTo("dashboard"), 500);
  } catch (err) {
    console.error("Login error:", err);
    showNotification("Could not connect to server. Is the backend running?");
  }
}

// SIGNUP
async function handleSignup(event) {
  event.preventDefault();
  try {
    const nick = document.getElementById("signup-nick").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
    const confirm = document.getElementById("signup-confirm").value;
    const age = document.getElementById("signup-age").value;
    const langVal = document.getElementById("signup-lang").value;

    if (!nick || nick.length < 3) { showNotification("Nickname must be at least 3 characters"); return; }
    if (!email) { showNotification("Please enter your email"); return; }
    if (!password || password.length < 6) { showNotification("Password must be at least 6 characters"); return; }
    if (password !== confirm) { showNotification("Passwords do not match!"); return; }
    if (!age || age < 13) { showNotification("You must be at least 13 years old"); return; }
    if (!langVal) { showNotification("Please select a language"); return; }

    // Map select option value to full language name for backend
    const langMap = { en: "English", az: "Azerbaijani", es: "Spanish", fr: "French" };
    const langName = langMap[langVal] || langVal;

    showNotification("Creating account...");

    const { ok, data } = await apiFetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        nickname: nick,
        email,
        password,
        age: parseInt(age),
        languages: [langName],
      }),
    });

    if (!ok) {
      showNotification(data.message || "Signup failed");
      return;
    }

    localStorage.setItem("user", JSON.stringify(data.user));
    showNotification("🎮 Account created! Welcome to LetsPlay!");
    event.target.reset();
    setTimeout(() => {
      populateProfileFields();
      navigateTo("profile");
    }, 900);
  } catch (err) {
    console.error("Signup error:", err);
    showNotification("Could not connect to server. Is the backend running?");
  }
}

// CREATE GAME
async function handleCreateGame(event) {
  event.preventDefault();
  try {
    const gameName = document.getElementById("game-name").value.trim();
    const lang = document.getElementById("game-lang").value;
    const startDate = document.getElementById("game-start-date").value;
    const startTime = document.getElementById("game-start-time").value;
    const endDate = document.getElementById("game-end-date").value;
    const endTime = document.getElementById("game-end-time").value;
    const maxPlayers = document.getElementById("player-amount").value;
    const minAge = document.getElementById("game-min-age").value || "0";
    const maxAge = document.getElementById("game-max-age").value || "99";
    const desc = document.getElementById("game-desc").value.trim();

    if (!gameName || !lang || !startDate || !startTime || !endDate || !endTime || !maxPlayers || !desc) {
      showNotification("Please fill in all required fields");
      return;
    }

    const startISO = `${startDate}T${startTime}:00`;
    const endISO = `${endDate}T${endTime}:00`;

    if (new Date(endISO) <= new Date(startISO)) {
      showNotification("End time must be after start time");
      return;
    }

    const { ok, data } = await apiFetch("/api/rooms", {
      method: "POST",
      body: JSON.stringify({
        game_name: gameName,
        language: lang,
        description: desc,
        max_players: parseInt(maxPlayers),
        min_age: parseInt(minAge),
        max_age: parseInt(maxAge),
        game_start_time: startISO,
        game_end_time: endISO,
      }),
    });

    if (!ok) {
      showNotification(data.message || "Failed to create game");
      return;
    }

    showNotification(`Game "${gameName}" created!`);
    closeCreateGameModal();
    event.target.reset();
    loadRooms();
  } catch (err) {
    console.error("Create game error:", err);
    showNotification("Could not connect to server.");
  }
}

// PROFILE SAVE
async function handleProfileSave(event) {
  event.preventDefault();
  try {
    const nick = document.getElementById("profile-nick").value.trim();
    const age = document.getElementById("profile-age").value;
    const lang = document.getElementById("profile-lang").value;
    const steam = document.getElementById("profile-steam")?.value?.trim() || "";
    const epic = document.getElementById("profile-epic")?.value?.trim() || "";
    const discord = document.getElementById("profile-discord")?.value?.trim() || "";

    const langMap = { en: "English", az: "Azerbaijani", es: "Spanish" };
    const langName = langMap[lang] || lang;

    const { ok, data } = await apiFetch("/api/profile/me", {
      method: "PUT",
      body: JSON.stringify({
        nickname: nick,
        age: parseInt(age),
        languages: [langName],
        steam,
        epic,
        discord,
      }),
    });

    if (!ok) {
      showNotification(data.message || "Profile update failed");
      return;
    }

    localStorage.setItem("user", JSON.stringify(data.profile));
    showNotification("Profile updated successfully!");
  } catch (err) {
    console.error("Profile save error:", err);
    showNotification("Could not connect to server.");
  }
}

// LOAD PROFILE
async function loadProfile() {
  try {
    const { ok, data } = await apiFetch("/api/auth/me");
    if (!ok) {
      navigateTo("login");
      return;
    }
    const user = data.user;
    localStorage.setItem("user", JSON.stringify(user));
    populateProfileFields(user);
  } catch (err) {
    console.error("loadProfile error:", err);
    populateProfileFields();
  }
}

function populateProfileFields(userData) {
  if (!userData) {
    userData = JSON.parse(localStorage.getItem("user") || "{}");
  }

  const profileNick = document.getElementById("profile-nick");
  const profileEmail = document.getElementById("profile-email");
  const profileAge = document.getElementById("profile-age");
  const profileLang = document.getElementById("profile-lang");

  if (profileNick && userData.nickname) profileNick.value = userData.nickname;
  if (profileEmail && userData.email) profileEmail.value = userData.email;
  if (profileAge && userData.age) profileAge.value = userData.age;

  if (profileLang && userData.languages && userData.languages.length) {
    const langRevMap = { English: "en", Azerbaijani: "az", Spanish: "es" };
    profileLang.value = langRevMap[userData.languages[0]] || userData.languages[0];
  }
}

// PASSWORD TOGGLE
function togglePasswordVisibility(button) {
  const targetId = button.getAttribute("data-target");
  const targetInput = document.getElementById(targetId);
  if (!targetInput) return;
  const icon = button.querySelector("i");
  const isPasswordHidden = targetInput.type === "password";
  targetInput.type = isPasswordHidden ? "text" : "password";
  if (icon) {
    icon.classList.toggle("fa-eye", !isPasswordHidden);
    icon.classList.toggle("fa-eye-slash", isPasswordHidden);
  }
  button.setAttribute("aria-label", isPasswordHidden ? "Hide password" : "Show password");
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================
function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  const isMobile = responsiveState.isMobile;
  notification.style.cssText = `
    position: fixed;
    ${isMobile ? "left:16px;right:16px;bottom:16px;top:auto;max-width:none;" : "top:20px;right:20px;max-width:400px;"}
    background: linear-gradient(135deg, #ff0080, #00d4ff);
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 0 30px rgba(255,0,128,0.5),0 0 60px rgba(0,212,255,0.3);
    z-index: 2000;
    animation: ${isMobile ? "slideInUp" : "slideInRight"} 0.3s ease;
    font-weight: 600;
    border: 1px solid rgba(255,255,255,0.2);
  `;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.animation = isMobile ? "slideOutDown 0.3s ease" : "slideOutRight 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

const style = document.createElement("style");
style.textContent = `
  @keyframes slideInRight { from{transform:translateX(400px);opacity:0} to{transform:translateX(0);opacity:1} }
  @keyframes slideInUp { from{transform:translateY(24px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes slideOutRight { from{transform:translateX(0);opacity:1} to{transform:translateX(400px);opacity:0} }
  @keyframes slideOutDown { from{transform:translateY(0);opacity:1} to{transform:translateY(24px);opacity:0} }
`;
document.head.appendChild(style);

// ============================================
// HELPERS
// ============================================
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = String(text || "");
  return div.innerHTML;
}

// ============================================
// LOGOUT
// ============================================
async function handleLogout() {
  await apiFetch("/api/auth/logout", { method: "POST" });
  localStorage.removeItem("user");
  localStorage.removeItem("joinedTeams");
  localStorage.removeItem("activeTeam");
  navigateTo("landing");
}

// ============================================
// DOM READY
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  updateResponsiveState();
  renderJoinedTeams();
  responsiveQueries.mobile.addEventListener("change", updateResponsiveState);
  responsiveQueries.touch.addEventListener("change", updateResponsiveState);

  // Form listeners
  const loginForm = document.querySelector(".screen#login .auth-form");
  const signupForm = document.querySelector(".screen#signup .auth-form");
  if (loginForm) loginForm.addEventListener("submit", handleLogin);
  if (signupForm) signupForm.addEventListener("submit", handleSignup);

  // Password toggles
  document.querySelectorAll(".password-toggle").forEach((btn) => {
    btn.addEventListener("click", () => togglePasswordVisibility(btn));
  });

  // Profile form
  const profileForm = document.querySelector(".profile-form");
  if (profileForm) profileForm.addEventListener("submit", handleProfileSave);

  // Logout button — wire it to real logout
  document.querySelectorAll(".btn-small").forEach((btn) => {
    if (btn.textContent.trim().includes("Logout")) {
      btn.onclick = handleLogout;
    }
  });

  populateProfileFields();

  // Nav item active states
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      navItems.forEach((nav) => nav.classList.remove("active"));
      item.classList.add("active");
      if (responsiveState.isMobile) {
        const sidebar = document.getElementById("dashboard-sidebar");
        if (sidebar) { sidebar.classList.remove("open"); updateResponsiveState(); }
      }
    });
  });

  // Remove tag functionality
  document.querySelectorAll(".remove-tag").forEach((btn) => {
    btn.addEventListener("click", (e) => { e.preventDefault(); btn.parentElement.remove(); });
  });

  // Add game tag
  const addGameBtn = document.querySelector(".game-tag-add .btn");
  const addGameInput = document.querySelector(".game-tag-add input");
  if (addGameBtn && addGameInput) {
    addGameBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const name = addGameInput.value.trim();
      if (name) {
        const tag = document.createElement("div");
        tag.className = "game-tag";
        tag.innerHTML = `${name} <button type="button" class="remove-tag">×</button>`;
        addGameInput.parentElement.parentElement.insertBefore(tag, addGameInput.parentElement);
        addGameInput.value = "";
        tag.querySelector(".remove-tag").addEventListener("click", () => tag.remove());
      }
    });
    addGameInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); addGameBtn.click(); } });
  }

  // Check if already logged in
  apiFetch("/api/auth/me").then(({ ok, data }) => {
    if (ok && data.logged_in) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }
  }).catch(() => {});
});

// Prevent accidental Enter-submit in text inputs outside chat
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.tagName === "INPUT" && e.target.type !== "textarea") {
    if (!e.target.closest(".chat-input-area")) e.preventDefault();
  }
});

window.addEventListener("load", () => {
  document.body.style.opacity = "1";
  const firstNavItem = document.querySelector(".nav-item");
  if (firstNavItem) firstNavItem.classList.add("active");
  console.log("🎮 LetsPlay Platform Initialized");
});

// Expose for debugging
window.GameHatonApp = {
  navigateTo, openCreateGameModal, closeCreateGameModal, toggleDashboardSidebar,
  joinTeam, openTeamChat, showNotification, handleLogin, handleSignup,
  handleCreateGame, handleProfileSave, handleLogout, loadRooms,
};
