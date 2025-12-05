# Accessing WordLock from Windows Browser (WSL Setup)

## Why file:// doesn't work
ES6 modules require an HTTP server due to CORS security policies. The `file://` protocol doesn't support module imports, which is why the game has no interactivity when opened directly.

## Problem with localhost:8000 in WSL
When you run a server in WSL on `localhost:8000`, it's only accessible within WSL itself. Your Windows browser can't reach WSL's localhost directly.

## ✅ Solution: Use WSL IP Address

### I've already started a server for you!

**From your Windows browser, open:**

```
http://172.18.83.180:8000
```

This should show your WordLock game with full functionality!

---

## Alternative Methods

### Method 1: Use WSL 2 with Windows 11 (Recommended)
If you have Windows 11 or recent Windows 10, WSL 2 has better networking:

```bash
# In WSL terminal:
python3 -m http.server 8000
```

Then in Windows browser:
```
http://localhost:8000
```

(This works in newer WSL versions where localhost is properly forwarded)

### Method 2: Manual IP Check (if IP changes)
Your WSL IP can change on reboot. To find it again:

```bash
# In WSL:
hostname -I | awk '{print $1}'
```

Then use that IP in your browser: `http://[YOUR_IP]:8000`

### Method 3: Use Node.js http-server (Alternative server)

```bash
# Install http-server globally
npm install -g http-server

# Run it
http-server -p 8000
```

Then access via the WSL IP address.

### Method 4: Use VS Code Live Server Extension
1. Install "Live Server" extension in VS Code
2. Open your wordlock folder
3. Right-click `index.html`
4. Select "Open with Live Server"
5. Automatically opens in browser with proper URL

### Method 5: Copy to Windows Filesystem
Copy your project to Windows and serve from there:

```bash
# Copy to your Windows user directory
cp -r /home/mimhoff/wordlock /mnt/c/Users/[YOUR_USERNAME]/Desktop/wordlock

# Then in Windows PowerShell or CMD, navigate to that folder:
cd C:\Users\[YOUR_USERNAME]\Desktop\wordlock
python -m http.server 8000

# Access at: http://localhost:8000
```

---

## Current Server Status

**✅ Server is RUNNING on:**
- WSL IP: http://172.18.83.180:8000
- WSL localhost: http://localhost:8000 (only accessible within WSL)

**To stop the server:**
```bash
# Find the process
ps aux | grep "http.server"

# Kill it
pkill -f "http.server"
```

**To restart the server:**
```bash
cd /home/mimhoff/wordlock
python3 -m http.server 8000 --bind 0.0.0.0
```

The `--bind 0.0.0.0` flag makes it accessible from Windows!

---

## Troubleshooting

### Can't access the WSL IP?

**Check Windows Firewall:**
1. Open Windows Security
2. Go to Firewall & network protection
3. Click "Allow an app through firewall"
4. Make sure Python is allowed on Private networks

**Check WSL 2 vs WSL 1:**
```bash
wsl -l -v
```

If you're on WSL 1, consider upgrading to WSL 2:
```powershell
# In Windows PowerShell (as Admin):
wsl --set-version Ubuntu 2
```

### Port already in use?
```bash
# Find what's using port 8000
lsof -i :8000

# Use a different port
python3 -m http.server 8080 --bind 0.0.0.0
# Then access: http://172.18.83.180:8080
```

### Still not working?

Try accessing from WSL itself using `curl` to verify the server works:
```bash
curl http://localhost:8000
```

If that works but Windows can't access it, it's a networking/firewall issue.

---

## Quick Start (Copy-Paste)

```bash
# Stop any existing server
pkill -f "http.server"

# Start server accessible from Windows
cd /home/mimhoff/wordlock
python3 -m http.server 8000 --bind 0.0.0.0

# Server will print: "Serving HTTP on 0.0.0.0 port 8000"
# Access from Windows: http://172.18.83.180:8000
```

Keep the terminal open while using the game!

---

## For Your Android Build

When you're ready to build for Android, the Capacitor setup uses the `www` folder. We can copy the working files there:

```bash
# Copy all files to www folder for Capacitor
cp index.html styles.css words.js manifest.json www/
cp -r js www/
cp -r icons www/

# Then build Android app
npx cap sync android
```

But for now, use the HTTP server method to test the game in your browser!
