// Leaderboard functionality for BTF

const STORAGE_KEY = 'mini_gacha_state_v1';
const LEADERBOARD_API = 'https://api.jsonbin.io/v3/b/6720a1e1acd3cb34a89e8c9f'; // You'll need to replace this with your own JSONBin ID
const API_KEY = '$2a$10$YourAPIKeyHere'; // Replace with your JSONBin API key

// Load local game state
function loadLocalState() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		return JSON.parse(raw);
	} catch (e) {
		console.error('Error loading state:', e);
		return null;
	}
}

// Save username to local state
function saveUsername(username) {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		const state = raw ? JSON.parse(raw) : {};
		state.username = username;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
		return true;
	} catch (e) {
		console.error('Error saving username:', e);
		return false;
	}
}

// Get current username
function getCurrentUsername() {
	const state = loadLocalState();
	return state?.username || null;
}

// Elements
const usernameInput = document.getElementById('usernameInput');
const registerBtn = document.getElementById('registerBtn');
const registrationStatus = document.getElementById('registrationStatus');
const currentUsername = document.getElementById('currentUsername');
const displayUsername = document.getElementById('displayUsername');
const changeUsernameBtn = document.getElementById('changeUsernameBtn');
const registerSection = document.getElementById('registerSection');
const refreshLeaderboard = document.getElementById('refreshLeaderboard');
const submitScore = document.getElementById('submitScore');
const leaderboardList = document.getElementById('leaderboardList');
const playerInventoryModal = document.getElementById('playerInventoryModal');
const closePlayerInventory = document.getElementById('closePlayerInventory');
const playerInventoryTitle = document.getElementById('playerInventoryTitle');
const playerCoins = document.getElementById('playerCoins');
const playerRank = document.getElementById('playerRank');
const playerPetsList = document.getElementById('playerPetsList');
const playerFruitsList = document.getElementById('playerFruitsList');

// Data model (same as index.js)
const PETS = [
	{ id: 'pet_c_1', name: 'Dirt Fox', rarity: 'common', weight: 50, value: 20 },
	{ id: 'pet_c_2', name: 'Dirt Finch', rarity: 'common', weight: 50, value: 20 },
	{ id: 'pet_c_3', name: 'Dirt Turtle', rarity: 'common', weight: 50, value: 25 },
	{ id: 'pet_r_1', name: 'Dusk Fox', rarity: 'rare', weight: 25, value: 150 },
	{ id: 'pet_r_2', name: 'Aero Lynx', rarity: 'rare', weight: 25, value: 160 },
	{ id: 'pet_e_1', name: 'Nebula Kirin', rarity: 'epic', weight: 10, value: 800 },
	{ id: 'pet_u_1', name: 'Singularity Phoenix', rarity: 'unique', weight: 0.08, value: 20000 },
	{ id: 'pet_u_2', name: 'Timekeeper Dragon', rarity: 'unique', weight: 0.05, value: 30000 },
	{ id: 'pet_sp_1', name: 'Suspicious Creature', rarity: 'special', weight: 50, value: 1000 },
	{ id: 'pet_l_1', name: 'Infinity Golem', rarity: 'legendary', weight: 0.5, value: 1200 },
	{ id: 'pet_s_1', name: 'Nightmare Skeleton', rarity: 'spooky', weight: 0.3, value: 2500 },
	{ id: 'pet_ch_1', name: 'Chroma Beast', rarity: 'chromatic', weight: 0.25, value: 5000 },
	{ id: 'pet_s_2', name: 'Spooky Ghost', rarity: 'spooky', weight: 0.3, value: 2200 }
];

const FRUITS = [
	{ id: 'fruit_c_1', name: 'Pebble', rarity: 'common', weight: 50, value: 5 },
	{ id: 'fruit_c_2', name: 'Marble', rarity: 'common', weight: 50, value: 5 },
	{ id: 'fruit_r_1', name: 'Ruby', rarity: 'rare', weight: 25, value: 50 },
	{ id: 'fruit_r_2', name: 'Sapphire', rarity: 'rare', weight: 25, value: 55 },
	{ id: 'fruit_e_1', name: 'Diamond', rarity: 'epic', weight: 10, value: 300 },
	{ id: 'fruit_u_1', name: 'Aurora Berry', rarity: 'unique', weight: 0.06, value: 4000 },
	{ id: 'fruit_u_2', name: 'Stellar Pomegranate', rarity: 'unique', weight: 0.04, value: 6000 },
	{ id: 'fruit_l_1', name: 'Cosmic Shard', rarity: 'legendary', weight: 0.8, value: 450 },
	{ id: 'fruit_s_1', name: 'Cursed Pumpkin', rarity: 'spooky', weight: 0.4, value: 600 },
	{ id: 'fruit_ch_1', name: 'Prism Crystal', rarity: 'chromatic', weight: 0.3, value: 1200 }
];

// Coins-per-second mapping by rarity (mirror of index.js)
const RARITY_CPS = {
	common: 1,
	rare: 3,
	epic: 8,
	special: 12,
	legendary: 20,
	spooky: 30,
	chromatic: 80,
	unique: 60,
};

// Local leaderboard storage (fallback if API not configured)
const LOCAL_LEADERBOARD_KEY = 'btf_leaderboard_v1';

function getLocalLeaderboard() {
	try {
		const raw = localStorage.getItem(LOCAL_LEADERBOARD_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch (e) {
		return [];
	}
}

function saveLocalLeaderboard(data) {
	try {
		localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(data));
		return true;
	} catch (e) {
		console.error('Error saving leaderboard:', e);
		return false;
	}
}

// Check if user is registered
function checkRegistration() {
	const username = getCurrentUsername();
	if (username) {
		usernameInput.value = '';
		displayUsername.textContent = username;
		currentUsername.style.display = 'block';
		registrationStatus.style.display = 'none';
		usernameInput.parentElement.style.display = 'none';
	} else {
		currentUsername.style.display = 'none';
		registrationStatus.style.display = 'block';
		usernameInput.parentElement.style.display = 'flex';
	}
}

// Register username
registerBtn.addEventListener('click', () => {
	const username = usernameInput.value.trim();
	
	if (username.length < 3) {
		alert('Username must be at least 3 characters long!');
		return;
	}
	
	if (username.length > 20) {
		alert('Username must be 20 characters or less!');
		return;
	}
	
	if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
		alert('Username can only contain letters, numbers, underscores, and hyphens!');
		return;
	}
	
	if (saveUsername(username)) {
		alert(`Successfully registered as "${username}"!`);
		checkRegistration();
		loadLeaderboard();
	} else {
		alert('Error saving username. Please try again.');
	}
});

// Change username
changeUsernameBtn.addEventListener('click', () => {
	if (confirm('Are you sure you want to change your username? Your previous scores will remain under the old username.')) {
		currentUsername.style.display = 'none';
		registrationStatus.style.display = 'block';
		usernameInput.parentElement.style.display = 'flex';
		usernameInput.value = '';
		usernameInput.focus();
	}
});

// Submit score to leaderboard
submitScore.addEventListener('click', async () => {
	const username = getCurrentUsername();
	if (!username) {
		alert('Please register a username first!');
		return;
	}
	
	const state = loadLocalState();
	if (!state) {
		alert('No game data found. Play the game first!');
		return;
	}
	
	const scoreData = {
		username: username,
		coins: state.coins || 0,
		inventory: state.inventory || {},
		fruits: state.fruits || {},
		timestamp: Date.now()
	};
	
	// Use local storage leaderboard
	const leaderboard = getLocalLeaderboard();
	
	// Remove any previous entries from this user
	const filtered = leaderboard.filter(entry => entry.username !== username);
	
	// Add new entry
	filtered.push(scoreData);
	
	// Sort by coins descending
	filtered.sort((a, b) => b.coins - a.coins);
	
	// Keep top 100
	const top100 = filtered.slice(0, 100);
	
	if (saveLocalLeaderboard(top100)) {
		alert('Score submitted successfully!');
		loadLeaderboard();
	} else {
		alert('Error submitting score. Please try again.');
	}
});

// Load and display leaderboard
async function loadLeaderboard() {
	leaderboardList.innerHTML = '<p style="text-align:center;color:var(--muted);padding:40px">Loading...</p>';
	
	try {
		// Use local leaderboard
		const leaderboard = getLocalLeaderboard();
		
		if (leaderboard.length === 0) {
			leaderboardList.innerHTML = '<p style="text-align:center;color:var(--muted);padding:40px">No scores yet. Be the first to submit!</p>';
			return;
		}
		
		// Sort by coins
		leaderboard.sort((a, b) => b.coins - a.coins);
		
		// Build table
		let html = '<table style="width:100%;border-collapse:collapse">';
		html += '<thead><tr style="border-bottom:2px solid rgba(255,255,255,0.1)">';
		html += '<th style="padding:12px;text-align:left;color:var(--muted)">Rank</th>';
		html += '<th style="padding:12px;text-align:left;color:var(--muted)">Player</th>';
		html += '<th style="padding:12px;text-align:right;color:var(--muted)">Coins</th>';
		html += '<th style="padding:12px;text-align:center;color:var(--muted)">Action</th>';
		html += '</tr></thead>';
		html += '<tbody>';
		
		leaderboard.forEach((entry, index) => {
			const rank = index + 1;
			let rankDisplay = rank;
			let rankColor = 'white';
			
			if (rank === 1) {
				rankDisplay = '🥇';
			} else if (rank === 2) {
				rankDisplay = '🥈';
			} else if (rank === 3) {
				rankDisplay = '🥉';
			} else if (rank <= 10) {
				rankColor = '#ffd700';
			} else if (rank <= 25) {
				rankColor = '#c0c0c0';
			}
			
			const isCurrentUser = entry.username === getCurrentUsername();
			const rowStyle = isCurrentUser ? 'background:rgba(16,185,129,0.1);border-left:3px solid #10b981' : '';
			
			html += `<tr style="border-bottom:1px solid rgba(255,255,255,0.05);${rowStyle}">`;
			html += `<td style="padding:12px;color:${rankColor};font-weight:600;font-size:18px">${rankDisplay}</td>`;
			html += `<td style="padding:12px;color:white;font-weight:${isCurrentUser ? '700' : '400'}">${entry.username}${isCurrentUser ? ' (You)' : ''}</td>`;
			html += `<td style="padding:12px;text-align:right;color:#ffd700;font-weight:600">${(entry.coins || 0).toLocaleString()}</td>`;
			html += `<td style="padding:12px;text-align:center"><button class="view-player-btn muted" data-index="${index}" style="padding:6px 12px">View</button></td>`;
			html += '</tr>';
		});
		
		html += '</tbody></table>';
		leaderboardList.innerHTML = html;
		
		// Add click handlers for view buttons
		document.querySelectorAll('.view-player-btn').forEach(btn => {
			btn.addEventListener('click', (e) => {
				const index = parseInt(e.target.getAttribute('data-index'));
				showPlayerInventory(leaderboard[index], index + 1);
			});
		});
		
	} catch (error) {
		console.error('Error loading leaderboard:', error);
		leaderboardList.innerHTML = '<p style="text-align:center;color:#ff4444;padding:40px">Error loading leaderboard. Please try again.</p>';
	}
}

// Show player inventory modal
function showPlayerInventory(playerData, rank) {
	playerInventoryTitle.textContent = `${playerData.username}'s Inventory`;
	playerCoins.textContent = (playerData.coins || 0).toLocaleString();
	playerRank.textContent = `#${rank}`;
	
	// Display pets (mirror the main inventory layout)
	const inventory = playerData.inventory || {};
	playerPetsList.innerHTML = '';

	const petEntries = Object.entries(inventory).sort((a,b)=>b[1]-a[1]);
	if (petEntries.length === 0) {
		playerPetsList.innerHTML = '<div style="color:var(--muted)">No pets yet.</div>';
	} else {
		for (const [petId, count] of petEntries) {
			const p = PETS.find(x=>x.id===petId) || {name:petId, rarity:'common', value:5};
			const el = document.createElement('div');
			el.className = 'inventory-item';
			const badge = document.createElement('div');
			badge.className = `badge ${p.rarity}`;
			badge.textContent = p.rarity.toUpperCase();
			const name = document.createElement('div');
			name.innerHTML = `<div style="font-weight:700">${p.name}</div><div style="color:var(--muted);font-size:12px">x${count} • Sell: ${p.value}c</div>`;
			// show CPS for this pet line
			const petCps = (RARITY_CPS[p.rarity] || 0) * count;
			const cpsLine = document.createElement('div');
			cpsLine.style.color = 'var(--muted)'; cpsLine.style.fontSize = '12px';
			cpsLine.textContent = `CPS: ${petCps}`;
			name.appendChild(cpsLine);

			// right side (no sell buttons for other players)
			const right = document.createElement('div');
			right.style.marginLeft = 'auto';
			// placeholder to keep layout consistent
			const viewOnly = document.createElement('span');
			viewOnly.style.color = 'var(--muted)';
			viewOnly.style.fontSize = '12px';
			viewOnly.textContent = 'view-only';
			right.appendChild(viewOnly);

			el.appendChild(badge);
			el.appendChild(name);
			el.appendChild(right);
			playerPetsList.appendChild(el);
		}
	}
	
	// Display fruits (mirror main inventory layout)
	const fruits = playerData.fruits || {};
	playerFruitsList.innerHTML = '';

	const fruitEntries = Object.entries(fruits).sort((a,b)=>b[1]-a[1]);
	if (fruitEntries.length === 0) {
		playerFruitsList.innerHTML = '<div style="color:var(--muted)">No fruits yet.</div>';
	} else {
		for (const [fruitId, count] of fruitEntries) {
			const f = FRUITS.find(x=>x.id===fruitId) || {name:fruitId, rarity:'common', value:1};
			const el = document.createElement('div');
			el.className = 'inventory-item';
			const badge = document.createElement('div');
			badge.className = `badge ${f.rarity}`;
			badge.textContent = f.rarity.toUpperCase();
			const name = document.createElement('div');
			name.innerHTML = `<div style="font-weight:700">${f.name}</div><div style=\"color:var(--muted);font-size:12px\">x${count} • Sell: ${f.value}c</div>`;
			const right = document.createElement('div');
			right.style.marginLeft = 'auto';
			const viewOnly = document.createElement('span');
			viewOnly.style.color = 'var(--muted)';
			viewOnly.style.fontSize = '12px';
			viewOnly.textContent = 'view-only';
			right.appendChild(viewOnly);

			el.appendChild(badge);
			el.appendChild(name);
			el.appendChild(right);
			playerFruitsList.appendChild(el);
		}
	}
	
	playerInventoryModal.style.display = 'flex';
}

// Close modal
closePlayerInventory.addEventListener('click', () => {
	playerInventoryModal.style.display = 'none';
});

playerInventoryModal.querySelector('.modal-backdrop').addEventListener('click', () => {
	playerInventoryModal.style.display = 'none';
});

// Refresh leaderboard
refreshLeaderboard.addEventListener('click', () => {
	loadLeaderboard();
});

// Initialize
checkRegistration();
loadLeaderboard();
