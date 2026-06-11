/* ============================================
   GAMEHATON - JavaScript Functionality
   ============================================ */

// Screen Navigation System
function navigateTo(screenId) {
  try {
    // Hide all screens
    const screens = document.querySelectorAll(".screen");
    screens.forEach((screen) => {
      screen.classList.remove("active");
    });

    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
      targetScreen.classList.add("active");
      window.scrollTo(0, 0);
      console.log(`✓ Navigated to: ${screenId}`);
    } else {
      console.error(`✗ Screen with ID "${screenId}" not found`);
    }
  } catch (error) {
    console.error("Navigation error:", error);
  }
}

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

  document.body.dataset.viewport = responsiveState.isMobile
    ? "mobile"
    : "desktop";
  document.body.classList.toggle("is-mobile", responsiveState.isMobile);
  document.body.classList.toggle("is-touch", responsiveState.isTouch);
}

function toggleDashboardSidebar() {
  if (!responsiveState.isMobile) {
    return;
  }

  const sidebar = document.getElementById("dashboard-sidebar");
  if (!sidebar) {
    return;
  }

  sidebar.classList.toggle("open");
  updateResponsiveState();
}

// Modal Management
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

// Close modal when clicking outside
document.addEventListener("click", (e) => {
  const modal = document.getElementById("createGameModal");
  if (modal && e.target === modal) {
    closeCreateGameModal();
  }
});

// Close modal with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeCreateGameModal();
  }
});

// Form Handlers
async function handleLogin(event) {
  event.preventDefault();

  try {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();
    const rememberMe = document.getElementById("remember-me").checked;

    // Validation
    if (!email) {
      showNotification("Please enter your email");
      document.getElementById("login-email").focus();
      return;
    }

    if (!password) {
      showNotification("Please enter your password");
      document.getElementById("login-password").focus();
      return;
    }

    if (password.length < 6) {
      showNotification("Password must be at least 6 characters");
      return;
    }

    // Simulate login with basic validation
    console.log("Login attempt:", { email, password, rememberMe });

    // Store user data in localStorage
    localStorage.setItem(
      "user",
      JSON.stringify({
        email: email,
        loggedIn: true,
        rememberMe: rememberMe,
        loginTime: new Date().toISOString(),
      }),
    );

    // Show success message
    showNotification("Login successful! Welcome back!");

    // Clear form
    event.target.reset();

    // Navigate to dashboard after a brief delay
    setTimeout(() => {
      navigateTo("dashboard");
    }, 500);
  } catch (error) {
    console.error("Login error:", error);
    showNotification("An error occurred during login. Please try again.");
  }
}

async function handleSignup(event) {
  event.preventDefault();

  try {
    const nick = document.getElementById("signup-nick").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
    const confirm = document.getElementById("signup-confirm").value;
    const age = document.getElementById("signup-age").value;
    const lang = document.getElementById("signup-lang").value;

    // Validation
    if (!nick) {
      showNotification("Please enter a nickname");
      document.getElementById("signup-nick").focus();
      return;
    }

    if (nick.length < 3) {
      showNotification("Nickname must be at least 3 characters");
      return;
    }

    if (!email) {
      showNotification("Please enter your email");
      document.getElementById("signup-email").focus();
      return;
    }

    if (!password) {
      showNotification("Please enter a password");
      document.getElementById("signup-password").focus();
      return;
    }

    if (password.length < 6) {
      showNotification("Password must be at least 6 characters");
      return;
    }

    if (password !== confirm) {
      showNotification("Passwords do not match!");
      document.getElementById("signup-confirm").focus();
      return;
    }

    if (!age) {
      showNotification("Please enter your age");
      document.getElementById("signup-age").focus();
      return;
    }

    if (age < 13) {
      showNotification("You must be at least 13 years old to join GameHaton!");
      return;
    }

    if (age > 120) {
      showNotification("Please enter a valid age");
      return;
    }

    if (!lang) {
      showNotification("Please select a language");
      document.getElementById("signup-lang").focus();
      return;
    }

    console.log("Signup attempt:", { nick, email, password, age, lang });

    // Store user data
    localStorage.setItem(
      "user",
      JSON.stringify({
        nick: nick,
        email: email,
        age: age,
        language: lang,
        loggedIn: true,
        signupTime: new Date().toISOString(),
      }),
    );

    // Show success and navigate
    showNotification("🎮 Account created successfully! Welcome to GameHaton!");

    // Clear form
    event.target.reset();

    // Navigate to profile after a brief delay
    setTimeout(() => {
      populateProfileFields();
      navigateTo("profile");
    }, 900);
  } catch (error) {
    console.error("Signup error:", error);
    showNotification("An error occurred during signup. Please try again.");
  }
}

async function handleCreateGame(event) {
  event.preventDefault();
  const gameName = document.getElementById("game-name").value;
  const gameDate = document.getElementById("game-date").value;
  const gameType = document.getElementById("game-type").value;
  const playerAmount = document.getElementById("player-amount").value;
  const gameDesc = document.getElementById("game-desc").value;

  console.log("Game created:", {
    name: gameName,
    date: gameDate,
    type: gameType,
    players: playerAmount,
    description: gameDesc,
  });

  showNotification(`Game "${gameName}" created successfully!`);
  closeCreateGameModal();

  // Reset form
  event.target.reset();
}

async function handleProfileSave(event) {
  event.preventDefault();
  const nick = document.getElementById("profile-nick").value;
  const email = document.getElementById("profile-email").value;
  const password = document.getElementById("profile-password").value;
  const lang = document.getElementById("profile-lang").value;
  const age = document.getElementById("profile-age").value;

  console.log("Profile updated:", { nick, email, lang, age });

  // Update localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  user.nick = nick;
  user.email = email;
  if (password) {
    user.password = password;
  }
  user.language = lang;
  user.age = age;
  localStorage.setItem("user", JSON.stringify(user));

  showNotification("Profile updated successfully!");
}

function togglePasswordVisibility(button) {
  const targetId = button.getAttribute("data-target");
  const targetInput = document.getElementById(targetId);

  if (!targetInput) {
    return;
  }

  const icon = button.querySelector("i");
  const isPasswordHidden = targetInput.type === "password";

  targetInput.type = isPasswordHidden ? "text" : "password";

  if (icon) {
    icon.classList.toggle("fa-eye", !isPasswordHidden);
    icon.classList.toggle("fa-eye-slash", isPasswordHidden);
  }

  button.setAttribute(
    "aria-label",
    isPasswordHidden ? "Hide password" : "Show password",
  );
}

function populateProfileFields() {
  const userData = JSON.parse(localStorage.getItem("user") || "{}");

  const profileNick = document.getElementById("profile-nick");
  const profileEmail = document.getElementById("profile-email");
  const profileAge = document.getElementById("profile-age");
  const profileLang = document.getElementById("profile-lang");

  if (profileNick && userData.nick) {
    profileNick.value = userData.nick;
  }

  if (profileEmail && userData.email) {
    profileEmail.value = userData.email;
  }

  if (profileAge && userData.age) {
    profileAge.value = userData.age;
  }

  if (profileLang && userData.language) {
    profileLang.value = userData.language;
  }
}

// Notification System
function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;

  const isMobileNotification = responsiveState.isMobile;

  // Add styles for notification
  notification.style.cssText = `
        position: fixed;
        ${isMobileNotification ? "left: 16px; right: 16px; bottom: 16px; top: auto; max-width: none;" : "top: 20px; right: 20px; max-width: 400px;"}
        background: linear-gradient(135deg, #ff0080, #00d4ff);
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 0 30px rgba(255, 0, 128, 0.5), 0 0 60px rgba(0, 212, 255, 0.3);
        z-index: 2000;
        animation: ${isMobileNotification ? "slideInUp" : "slideInRight"} 0.3s ease;
        font-weight: 600;
        border: 1px solid rgba(255, 255, 255, 0.2);
    `;

  document.body.appendChild(notification);

  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = isMobileNotification
      ? "slideOutDown 0.3s ease"
      : "slideOutRight 0.3s ease";
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Add animation styles
const style = document.createElement("style");
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

      @keyframes slideInUp {
        from {
          transform: translateY(24px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

      @keyframes slideOutDown {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(24px);
          opacity: 0;
        }
      }
`;
document.head.appendChild(style);

// Sidebar Navigation Active States
document.addEventListener("DOMContentLoaded", () => {
  updateResponsiveState();

  responsiveQueries.mobile.addEventListener("change", updateResponsiveState);
  responsiveQueries.touch.addEventListener("change", updateResponsiveState);

  // Initialize form handlers
  const loginForm = document.querySelector(".screen#login .auth-form");
  const signupForm = document.querySelector(".screen#signup .auth-form");

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
    console.log("Login form initialized");
  } else {
    console.warn("Login form not found");
  }

  if (signupForm) {
    signupForm.addEventListener("submit", handleSignup);
    console.log("Signup form initialized");
  } else {
    console.warn("Signup form not found");
  }

  const passwordToggleButtons = document.querySelectorAll(".password-toggle");
  passwordToggleButtons.forEach((button) => {
    button.addEventListener("click", () => togglePasswordVisibility(button));
  });

  populateProfileFields();

  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();

      // Remove active from all items
      navItems.forEach((nav) => nav.classList.remove("active"));

      // Add active to clicked item
      item.classList.add("active");

          if (responsiveState.isMobile) {
            const sidebar = document.getElementById("dashboard-sidebar");
            if (sidebar) {
              sidebar.classList.remove("open");
              updateResponsiveState();
            }
          }
    });
  });

  // Load user data if logged in
  const user = localStorage.getItem("user");
  if (user) {
    const userData = JSON.parse(user);
    if (userData.loggedIn) {
      // Optionally navigate to dashboard or keep current page
    }
  }

  // Game card hover effects
  const gameCards = document.querySelectorAll(".game-card");
  gameCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.animationPlayState = "paused";
    });
  });

  // Remove tag functionality
  const removeTags = document.querySelectorAll(".remove-tag");
  removeTags.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      btn.parentElement.remove();
    });
  });

  // Add game tag functionality
  const addGameBtn = document.querySelector(".game-tag-add .btn");
  const addGameInput = document.querySelector(".game-tag-add input");

  if (addGameBtn && addGameInput) {
    addGameBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const gameName = addGameInput.value.trim();

      if (gameName) {
        // Create new tag
        const newTag = document.createElement("div");
        newTag.className = "game-tag";
        newTag.innerHTML = `${gameName} <button type="button" class="remove-tag">×</button>`;

        // Insert before the add input
        addGameInput.parentElement.parentElement.insertBefore(
          newTag,
          addGameInput.parentElement,
        );

        // Clear input
        addGameInput.value = "";

        // Add remove functionality to new tag
        newTag.querySelector(".remove-tag").addEventListener("click", () => {
          newTag.remove();
        });
      }
    });

    // Add game on Enter key
    addGameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addGameBtn.click();
      }
    });
  }

  // Chat message sending
  const chatInput = document.querySelector(".chat-input");
  const sendBtn = document.querySelector(".chat-input-area .btn-neon");

  if (chatInput && sendBtn) {
    sendBtn.addEventListener("click", sendMessage);
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  function sendMessage() {
    const message = chatInput.value.trim();

    if (message) {
      // Create new message element
      const messageGroup = document.createElement("div");
      messageGroup.className = "message-group";
      messageGroup.innerHTML = `
                <div class="message message-own">
                    <p>${escapeHtml(message)}</p>
                    <span class="message-time">Now</span>
                </div>
            `;

      // Add to chat
      const chatMessages = document.querySelector(".chat-messages");
      chatMessages.appendChild(messageGroup);

      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Clear input
      chatInput.value = "";
      chatInput.focus();
    }
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // User item click for chat
  const userItems = document.querySelectorAll(".user-item");
  userItems.forEach((item) => {
    item.addEventListener("click", () => {
      userItems.forEach((u) => u.classList.remove("active"));
      item.classList.add("active");

      const userName = item.querySelector(".user-name").textContent;
      console.log("Selected user:", userName);
    });
  });

  // Integration buttons
  const integrationBtns = document.querySelectorAll(".integration-card .btn");
  integrationBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const card = btn.closest(".integration-card");
      const platform = card.querySelector("h4").textContent;
      showNotification(`${platform} connection initiated!`);
    });
  });

  // Dashboard section filtering
  const navItemsLink = document.querySelectorAll(".nav-item[data-section]");
  navItemsLink.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const section = item.getAttribute("data-section");
      filterGamesBySection(section);
    });
  });

  function filterGamesBySection(section) {
    const gameCards = document.querySelectorAll(".game-card");

    if (section === "all") {
      gameCards.forEach((card) => {
        card.style.display = "block";
      });
    } else {
      // Implement filtering logic based on section
      gameCards.forEach((card) => {
        card.style.display = "block";
      });
      showNotification(`Showing ${section} games`);
    }
  }
});

// Prevent form submission on Enter in text fields (except textarea)
document.addEventListener("keydown", (e) => {
  if (
    e.key === "Enter" &&
    e.target.tagName === "INPUT" &&
    e.target.type !== "textarea"
  ) {
    if (!e.target.closest(".chat-input-area")) {
      e.preventDefault();
    }
  }
});

// Add active state to nav items on page load
window.addEventListener("load", () => {
  const firstNavItem = document.querySelector(".nav-item");
  if (firstNavItem) {
    firstNavItem.classList.add("active");
  }
});

// Handle browser back button
window.addEventListener("popstate", () => {
  const currentScreen = document.querySelector(".screen.active");
  if (currentScreen) {
    console.log("Current page:", currentScreen.id);
  }
});

// Add smooth loading effects
window.addEventListener("load", () => {
  document.body.style.opacity = "1";
});

// ============================================
// DEBUG & INITIALIZATION
// ============================================

// Log system info on page load
window.addEventListener("load", () => {
  console.log("🎮 GameHaton Platform Initialized");
  console.log("================================");

  // Check if all screens exist
  const screenIds = [
    "landing",
    "login",
    "signup",
    "dashboard",
    "chat",
    "profile",
    "createGameModal",
  ];
  screenIds.forEach((id) => {
    const element = document.getElementById(id);
    console.log(
      `${element ? "✓" : "✗"} Screen: ${id}`,
      element ? "found" : "MISSING",
    );
  });

  // Check localStorage
  const user = localStorage.getItem("user");
  if (user) {
    console.log("✓ User data found in localStorage:", JSON.parse(user));
  } else {
    console.log("- No user logged in");
  }

  // Test functions
  console.log("================================");
  console.log("Available functions (window.GameHatonApp):");
  console.log("- navigateTo(screenId)");
  console.log("- handleLogin(event)");
  console.log("- handleSignup(event)");
  console.log("- showNotification(message)");
  console.log("================================");
});

// Add test data function for development
window.testLogin = function () {
  document.getElementById("login-email").value = "test@example.com";
  document.getElementById("login-password").value = "password123";
  const form = document.querySelector("#login .auth-form");
  form.dispatchEvent(new Event("submit"));
};

window.testSignup = function () {
  document.getElementById("signup-nick").value = "TestGamer123";
  document.getElementById("signup-email").value = "test@gamehaton.com";
  document.getElementById("signup-password").value = "TestPass123";
  document.getElementById("signup-confirm").value = "TestPass123";
  document.getElementById("signup-age").value = "21";
  document.getElementById("signup-lang").value = "en";
  const form = document.querySelector("#signup .auth-form");
  form.dispatchEvent(new Event("submit"));
};

console.log("💡 For testing, use: window.testLogin() or window.testSignup()");

// Export functions for debugging
window.GameHatonApp = {
  navigateTo,
  openCreateGameModal,
  closeCreateGameModal,
  toggleDashboardSidebar,
  showNotification,
  handleLogin,
  handleSignup,
  handleCreateGame,
  handleProfileSave,
};
