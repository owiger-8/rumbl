const fs = require('fs');

function makeSvg(title, subtitle, type) {
  let inner = '';
  if (type === 'night') {
    inner = `
      <defs>
        <radialGradient id="lamp" cx="50%" cy="30%" r="50%">
          <stop offset="0%" stop-color="#ff9955" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#050505" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="150" cy="120" r="140" fill="url(#lamp)"/>
      <line x1="150" y1="20" x2="150" y2="120" stroke="#333" stroke-width="2"/>
      <ellipse cx="150" cy="360" rx="90" ry="14" fill="#000" opacity="0.6"/>
      <!-- Silhouetted walking figure -->
      <circle cx="150" cy="210" r="14" fill="#151515" stroke="#ff5500" stroke-width="0.8"/>
      <path d="M140 230 L160 230 L165 310 L155 350 L145 310 Z" fill="#121212"/>
      <path d="M142 240 L132 290" stroke="#222" stroke-width="4" stroke-linecap="round"/>
      <path d="M158 240 L168 285" stroke="#ff5500" stroke-width="3" stroke-linecap="round"/>
      <circle cx="168" cy="285" r="3" fill="#ff5500"/>
    `;
  } else if (type === 'approach') {
    inner = `
      <!-- Proximity silhouette behind -->
      <ellipse cx="110" cy="370" rx="50" ry="12" fill="#000" opacity="0.8"/>
      <ellipse cx="190" cy="360" rx="70" ry="14" fill="#000" opacity="0.6"/>
      <circle cx="110" cy="180" r="22" fill="#0a0a0a" stroke="#ff3300" stroke-width="1"/>
      <path d="M90 210 L130 210 L135 340 L85 340 Z" fill="#0d0d0d"/>
      <!-- Foreground user -->
      <circle cx="190" cy="200" r="16" fill="#1a1a1a"/>
      <path d="M175 220 L205 220 L210 330 L170 330 Z" fill="#181818"/>
      <circle cx="185" cy="265" r="4" fill="#ff5500"/>
      <!-- Distance indicator -->
      <line x1="110" y1="260" x2="185" y2="260" stroke="#ff5500" stroke-dasharray="3,3" stroke-width="1.5"/>
      <text x="147" y="254" fill="#ff5500" font-family="monospace" font-size="9" text-anchor="middle">2.4 M</text>
    `;
  } else if (type === 'threat') {
    inner = `
      <defs>
        <radialGradient id="threatGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ff2200" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#050505" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="150" cy="200" r="160" fill="url(#threatGlow)"/>
      <circle cx="150" cy="150" r="28" fill="#050505" stroke="#ff3300" stroke-width="2"/>
      <path d="M110 190 Q150 170 190 190 L195 330 L105 330 Z" fill="#080808" stroke="#ff5500" stroke-width="0.5"/>
      <!-- Imminent threat alert HUD -->
      <rect x="75" y="80" width="150" height="24" rx="4" fill="#ff0000" fill-opacity="0.15" stroke="#ff3300" stroke-width="1"/>
      <text x="150" y="96" fill="#ff4422" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle" letter-spacing="2">THREAT: 0.8s</text>
    `;
  } else if (type === 'activate') {
    inner = `
      <!-- Glowing wrist device activated -->
      <defs>
        <radialGradient id="actGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ff7700" stop-opacity="0.9"/>
          <stop offset="40%" stop-color="#ff4400" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#050505" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="150" cy="200" r="130" fill="url(#actGlow)"/>
      <!-- Forearm & Watch silhouette -->
      <path d="M40 260 L140 200 L170 190 L260 170" stroke="#222" stroke-width="28" stroke-linecap="round"/>
      <circle cx="150" cy="200" r="26" fill="#ff5500" stroke="#fff" stroke-width="2"/>
      <circle cx="150" cy="200" r="14" fill="#fff"/>
      <!-- Tapping hand pressing the watch -->
      <path d="M130 90 L150 190" stroke="#ffaa66" stroke-width="16" stroke-linecap="round"/>
      <circle cx="150" cy="190" r="10" fill="#fff" opacity="0.9"/>
      <text x="150" y="270" fill="#fff" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle" letter-spacing="1">INDEXED / TAP</text>
    `;
  } else {
    inner = `
      <!-- Acoustic pulse shockwave response -->
      <defs>
        <radialGradient id="respGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8"/>
          <stop offset="25%" stop-color="#ff5500" stop-opacity="0.6"/>
          <stop offset="70%" stop-color="#ff2200" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="#050505" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="150" cy="200" r="140" fill="url(#respGlow)"/>
      <circle cx="150" cy="200" r="30" fill="none" stroke="#fff" stroke-width="3"/>
      <circle cx="150" cy="200" r="60" fill="none" stroke="#ff7700" stroke-width="2.5"/>
      <circle cx="150" cy="200" r="95" fill="none" stroke="#ff4400" stroke-width="2"/>
      <circle cx="150" cy="200" r="130" fill="none" stroke="#ff2200" stroke-width="1.5" stroke-dasharray="6,4"/>
      <!-- Disoriented target silhouette stepping back -->
      <path d="M210 180 Q230 220 260 340" stroke="#000" stroke-width="24" stroke-linecap="round" opacity="0.7"/>
      <text x="150" y="205" fill="#fff" font-family="monospace" font-size="14" font-weight="900" text-anchor="middle" letter-spacing="2">130 dB</text>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400">
    <defs>
      <radialGradient id="bgRad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#141010"/>
        <stop offset="100%" stop-color="#050505"/>
      </radialGradient>
    </defs>
    <rect width="300" height="400" fill="url(#bgRad)"/>
    <rect width="300" height="400" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    ${inner}
    <!-- Technical HUD overlays -->
    <text x="16" y="28" fill="#ff5500" font-family="monospace" font-size="11" font-weight="bold" letter-spacing="1">${title}</text>
    <text x="16" y="380" fill="#777" font-family="monospace" font-size="9" letter-spacing="1">${subtitle}</text>
    <line x1="16" y1="36" x2="60" y2="36" stroke="#ff5500" stroke-width="1"/>
  </svg>`;
}

fs.writeFileSync('public/frames/frame1.svg', makeSvg('01:42 AM', '01 // NIGHT', 'night'));
fs.writeFileSync('public/frames/frame2.svg', makeSvg('PROXIMITY', '02 // APPROACH', 'approach'));
fs.writeFileSync('public/frames/frame3.svg', makeSvg('THREAT', '03 // THREAT', 'threat'));
fs.writeFileSync('public/frames/frame4.svg', makeSvg('ACTIVATE', '04 // ACTIVATE', 'activate'));
fs.writeFileSync('public/frames/frame5.svg', makeSvg('RESPONSE', '05 // RESPONSE', 'response'));
console.log('Created frames 1-5');
