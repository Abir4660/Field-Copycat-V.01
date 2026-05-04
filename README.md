# Field-Copycat-V.01
Field Copycat — Multi-Field Form Autofill Tool
🐱 Field Copycat

A  extension that lets you visually copy form fields from one webpage and paste them into another — with a simple drag-select, just like taking a screenshot.
<img width="1644" height="708" alt="1" src="https://github.com/user-attachments/assets/0d14849b-6082-472c-9bd3-9e37722c477d" />

<img width="425" height="485" alt="2" src="https://github.com/user-attachments/assets/077fd5de-978a-475c-874f-715225c69f33" />

<img width="1917" height="878" alt="3" src="https://github.com/user-attachments/assets/2deb219a-592a-4f74-bc20-de24df05e04e" />

 <img width="235" height="60" alt="4" src="https://github.com/user-attachments/assets/f3ee95dc-3b3b-4325-a4fe-1a99bae7cb2f" />

<img width="248" height="467" alt="5" src="https://github.com/user-attachments/assets/7a400f54-01dc-4e72-88d2-52fd4d31486d" />

<img width="1611" height="834" alt="6" src="https://github.com/user-attachments/assets/243e66ea-7faa-4cf3-b3c9-603cf531cab1" />


🎯 What It Does
Tired of filling in the same information across multiple web forms? Field Copycat lets you:

Drag a selection box over filled form fields on any webpage
Capture all the field data instantly
Navigate to another form on any website
Paste the captured data into empty fields automatically

No typing. No clicking field by field. Just drag, capture, and paste.

✨ Features

🖱️ Visual drag-to-select — draw a box over fields like taking a screenshot
📋 Smart field detection — captures text inputs, emails, phone numbers, dropdowns, checkboxes, radio buttons, and textareas
🔢 Live field counter — shows how many fields are in your selection as you drag
🟢 Visual highlights — green/blue flashes confirm what was captured and filled
💾 Persistent capture — saved data stays until you clear it, so you can paste into multiple forms
⚡ Framework compatible — works with React, Angular, Vue, and other JS frameworks
⌨️ Keyboard shortcut — press Esc anytime to cancel without changes
🔒 100% private — all data stays local in your browser, nothing is sent anywhere


🚀 Installation
1. Load Unpacked (Developer Mode)

2. Download or clone this repository

3. bash   git clone https://github.com/yourusername/field-copycat.git

4 .Open Chrome and go to chrome://extensions
5. Enable Developer mode using the toggle in the top-right corner
6. Click "Load unpacked"
7. Select the copycat-extension folder
8. The Field Copycat icon will appear in your Chrome toolbar — pin it for easy access


⚠️ The extension only works on real websites (http:// or https://). It cannot run on Chrome system pages like chrome://extensions or the new tab page.


🧭 How To Use
Step 1 — Capture filled fields

1. Go to a webpage that has a form already filled in
2. Click the Field Copycat icon in your toolbar
3. Click "Select area to copy fields"
4. Your cursor becomes a crosshair — drag a box around the filled fields
5. The fields are captured and listed in the popup

Step 2 — Paste into empty fields

1. Go to another webpage with an empty form (or scroll to one on the same page)
2. Click the Field Copycat icon again
3. Click "Select area to paste into"
4. Drag a box around the empty fields
5. Your captured data fills them in automatically ✅

Tips

Fields paste in order — top to bottom, left to right — so align your selections the same way
Use "Clear all" in the popup to reset and start a fresh capture
You can paste the same captured data into multiple forms without re-capturing


📁 Project Structure
copycat-extension/
├── manifest.json       # Extension config (Manifest V3)
├── popup.html          # Toolbar popup UI
├── popup.js            # Popup logic & script injection
├── content.js          # Page-level overlay, field detection & paste logic
├── content.css         # Overlay, selection box & toast styles
└── icons/
    ├── icon48.png
    └── icon128.png

🛠️ How It Works (Technical)

When you click Capture or Paste, popup.js uses chrome.scripting.executeScript to inject content.js directly into the active tab
content.js creates a full-screen transparent overlay with a crosshair cursor
As you drag, it calculates which form elements fall within the selection rectangle using getBoundingClientRect()
On capture, field values are saved to chrome.storage.local
On paste, values are written back using native input setters and dispatching input + change events so JavaScript frameworks detect the changes
A double-injection guard (window.__fieldCopycatLoaded) prevents conflicts if the script is injected multiple times


🔐 Permissions
PermissionWhy It's NeededactiveTabAccess the current tab to inject the selection overlayscriptingInject content.js and content.css into the pagestorageSave captured field data locally between popup sessionshost_permissions: <all_urls>Allow the extension to work on any website
No external servers. No analytics. No tracking. Ever.

🧩 Supported Field Types
Field TypeCapturePasteText input✅✅Email / Phone / Number✅✅Textarea✅✅Dropdown (select)✅✅Checkbox✅✅Radio button✅✅

🐛 Known Limitations

Cannot access chrome:// or edge:// system pages
Fields inside cross-origin iframes may not be detected
Paste order depends on DOM position — best results when source and target forms have the same field order


🤝 Contributing
Pull requests are welcome! If you find a bug or want to suggest a feature, please open an issue.

Fork the repository
Create your branch: git checkout -b feature/your-feature
Commit your changes: git commit -m 'Add your feature'
Push to the branch: git push origin feature/your-feature
Open a Pull Request


📄 License
MIT License — free to use, modify, and distribute.

<p align="center">Made with ❤️ to save you from filling the same form twice</p>
