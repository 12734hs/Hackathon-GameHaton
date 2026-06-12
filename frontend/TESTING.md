# GameHaton - Testing Guide

## Quick Testing Instructions

### ✅ Manual Login Test

1. Open `index.html` in a browser
2. Click **Login** button on landing page
3. Fill in the form:
   - Email: `test@gamehaton.com`
   - Password: `password123`
   - Check "Remember Me" (optional)
4. Click **Login** button
5. You should see a success notification and navigate to the Dashboard

### ✅ Manual Signup Test

1. Open `index.html` in a browser
2. Click **Sign Up** button on landing page
3. Fill in the form:
   - Nickname: `TestGamer`
   - Email: `test@gamehaton.com`
   - Password: `TestPass123`
   - Confirm Password: `TestPass123`
   - Age: `21`
   - Language: Select any option
4. Click **Create Account** button
5. You should see a success notification and navigate to the Profile screen

### ✅ Automated Testing (Fastest)

1. Open `index.html` in a browser
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Run one of these commands:
   ```javascript
   window.testLogin();
   ```
   OR
   ```javascript
   window.testSignup();
   ```
5. Forms will auto-fill and submit
6. Watch for success notification and navigation

## Form Validation Rules

### Login Form

- ✓ Email is required
- ✓ Password is required (minimum 6 characters)
- ✓ Valid email format required
- ✓ Success: Stores data and navigates to dashboard

### Signup Form

- ✓ Nickname required (minimum 3 characters)
- ✓ Email required (valid format)
- ✓ Password required (minimum 6 characters)
- ✓ Passwords must match
- ✓ Age required (13-120 years old)
- ✓ Language required (must select)
- ✓ Success: Stores data and navigates to profile

## Console Debugging

### Check Initialization

Open browser console (F12) and look for these logs:

```
🎮 GameHaton Platform Initialized
✓ Screen: landing found
✓ Screen: login found
✓ Screen: signup found
✓ Screen: dashboard found
✓ Screen: chat found
✓ Screen: profile found
✓ Screen: createGameModal found
```

### Check User Data

In console, run:

```javascript
JSON.parse(localStorage.getItem("user"));
```

Should output something like:

```json
{
  "nick": "TestGamer",
  "email": "test@gamehaton.com",
  "age": "21",
  "language": "en",
  "loggedIn": true,
  "signupTime": "2026-06-11T10:30:00.000Z"
}
```

### Available Test Functions

```javascript
window.GameHatonApp.navigateTo("login"); // Go to login page
window.GameHatonApp.navigateTo("signup"); // Go to signup page
window.GameHatonApp.navigateTo("dashboard"); // Go to dashboard
window.GameHatonApp.navigateTo("chat"); // Go to chat page
window.GameHatonApp.navigateTo("profile"); // Go to profile page
window.GameHatonApp.navigateTo("landing"); // Go to landing page

window.testLogin(); // Auto-fill & submit login
window.testSignup(); // Auto-fill & submit signup

window.GameHatonApp.showNotification("Test"); // Test notification
```

## Testing Checklist

### Landing Page

- [ ] Title "GameHaton" displays correctly
- [ ] Two buttons visible: Login and Sign Up
- [ ] Animated neon orbs visible
- [ ] Clicking Login goes to login screen
- [ ] Clicking Sign Up goes to signup screen

### Login Screen

- [ ] Email field present and functional
- [ ] Password field present and functional
- [ ] "Remember Me" checkbox works
- [ ] Empty form shows validation errors
- [ ] Valid form submission navigates to dashboard
- [ ] User data saved to localStorage

### Signup Screen

- [ ] All form fields present and functional
- [ ] Password validation works (min 6 chars)
- [ ] Password match validation works
- [ ] Age validation works (13+ required)
- [ ] Language selection required
- [ ] Form submission navigates to profile
- [ ] User data saved to localStorage

### Dashboard

- [ ] Sidebar navigation visible
- [ ] Game cards display correctly
- [ ] "Add Game" button works
- [ ] Profile button navigates to profile page
- [ ] Logout button returns to landing page

### Chat

- [ ] User list displays
- [ ] Messages display
- [ ] Message input works
- [ ] Send button functional
- [ ] Session info visible on right

### Profile

- [ ] All profile fields editable
- [ ] Save button works
- [ ] Integration cards display
- [ ] Success notification on save

## Common Issues & Solutions

### Issue: Login/Signup not working

**Solution:**

1. Open browser DevTools (F12)
2. Go to Console tab
3. Check for errors
4. Run `window.testLogin()` to verify JavaScript is working
5. Check that index.html is opened (not from file:// if blocked)

### Issue: No notifications appearing

**Solution:**

1. Check browser console for JavaScript errors
2. Try `window.GameHatonApp.showNotification('Test')`
3. Look for notification in top-right corner

### Issue: Form fields not validating

**Solution:**

1. Open DevTools Console
2. Check if form fields exist: `document.getElementById('login-email')`
3. Verify all form IDs match between HTML and JavaScript

### Issue: Cannot navigate between pages

**Solution:**

1. Verify all screens exist in HTML
2. Run `document.querySelectorAll('.screen').forEach(s => console.log(s.id))`
3. Use `window.GameHatonApp.navigateTo('dashboard')` to test

## Browser Requirements

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern browser with ES6 support

## Performance Notes

- No external dependencies (except Font Awesome icons)
- All JavaScript is vanilla (no frameworks)
- CSS uses custom properties for theming
- Optimized for fast loading

## Data Persistence

All user data is stored in browser's localStorage:

- Location: Browser Developer Tools → Application → Local Storage
- Key: `user`
- Value: JSON object with user info
- Clears when: Browser history/cache cleared OR explicitly deleted

## Next Steps for Development

1. Connect to backend API
2. Add real-time chat with WebSockets
3. Implement user authentication
4. Add game session management
5. Create friend system
6. Add notifications

---

**Need help?** Check the browser console for detailed logs and error messages!
