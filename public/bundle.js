/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/enchant.js":
/*!************************!*\
  !*** ./src/enchant.js ***!
  \************************/
/***/ (() => {

// BTF Enchanting System
// STORAGE_KEY, ENCHANTMENTS, PETS, and state are provided by index.js
// Local state object removed to use the shared state

let selectedPetKey = null;
let currentEnchantOptions = [];
let currentPetId = null;

// DOM elements (avoid redeclaring globals from index.js like coinsEl)
let enchantPointsEl, petGridEl, selectedPetInfoEl, selectedPetNameEl, selectedPetEnchantsEl, enchantOptionsEl;
let enchantPetSelectorModal, enchantClosePetSelector, enchantPetSelectorTitle, enchantPetInstanceList;

// Load state - now uses global state from index.js
function loadState() {
    // First, load from localStorage to ensure we have latest data
    const STORAGE_KEY = window.STORAGE_KEY || 'btf_state_v1';
    console.log('[Enchant] Loading from localStorage with key:', STORAGE_KEY);
    
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        console.log('[Enchant] Raw localStorage data:', raw ? raw.substring(0, 200) + '...' : 'null');
        
        if (raw) {
            const parsed = JSON.parse(raw);
            console.log('[Enchant] Parsed state keys:', Object.keys(parsed));
            console.log('[Enchant] Inventory from localStorage:', parsed.inventory);
            
            // Merge localStorage into global state (don't overwrite, merge deeply)
            if (window.state) {
                // Merge all properties, preserving nested objects like petEnchantments
                for (const key in parsed) {
                    if (typeof parsed[key] === 'object' && parsed[key] !== null && !Array.isArray(parsed[key])) {
                        // For objects like petEnchantments, merge them
                        if (!window.state[key]) window.state[key] = {};
                        Object.assign(window.state[key], parsed[key]);
                    } else {
                        // For primitives and arrays, directly assign
                        window.state[key] = parsed[key];
                    }
                }
            }
        }
    } catch (e) {
        console.error('[Enchant] Failed to load state:', e);
    }
    
    // Ensure petRerollsUsed exists for backward compatibility
    if (!state.petRerollsUsed) {
        state.petRerollsUsed = {};
    }
    updateUI();
}

// saveState() is now provided by index.js with hash integrity
// We'll use the global state object from index.js

// Update UI
function updateUI() {
    if (typeof coinsEl !== 'undefined' && coinsEl) coinsEl.textContent = state.coins;
    if (enchantPointsEl) enchantPointsEl.textContent = state.enchantPoints;
    renderPets();
}

// Get pet name from ID
function getPetName(petId) {
    const pet = PETS.find(p => p.id === petId);
    return pet ? pet.name : petId;
}

// Get pet rarity
function getPetRarity(petId) {
    const pet = PETS.find(p => p.id === petId);
    return pet ? pet.rarity : 'common';
}

// Render pets in grid (stacked by type)
function renderPets() {
    petGridEl.innerHTML = '';
    
    if (Object.keys(state.inventory).length === 0) {
        petGridEl.innerHTML = '<p style="color:var(--muted);text-align:center;padding:40px;grid-column:1/-1">No pets in inventory</p>';
        return;
    }
    
    for (const [petId, count] of Object.entries(state.inventory)) {
        const petCard = document.createElement('div');
        petCard.className = 'pet-card';
        
        // Check if any instance of this pet is selected
        const isSelected = selectedPetKey && selectedPetKey.startsWith(petId + '_');
        if (isSelected) {
            petCard.classList.add('selected');
        }
        
        const petName = getPetName(petId);
        const rarity = getPetRarity(petId);
        
        petCard.innerHTML = `
            <div style="font-size:32px">🐾</div>
            <div class="pet-name">${petName}</div>
            <div class="pet-rarity rarity-${rarity}">${rarity}</div>
            <div style="font-size:12px;margin-top:4px;color:var(--muted)">x${count}</div>
        `;
        
        petCard.addEventListener('click', () => showPetSelector(petId, count));
        petGridEl.appendChild(petCard);
    }
}

// Show pet selector modal for choosing which instance to enchant
function showPetSelector(petId, count) {
    currentPetId = petId;
    const petName = getPetName(petId);
    enchantPetSelectorTitle.textContent = `Select ${petName} to Enchant`;
    
    enchantPetInstanceList.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const petKey = `${petId}_${i}`;
        const enchants = state.petEnchantments[petKey] || [];
        
        const item = document.createElement('div');
        item.className = 'pet-instance-item';
        
        let enchantText = 'No enchantments';
        if (enchants.length > 0) {
            const enchantNames = enchants.map(eid => {
                const ench = ENCHANTMENTS.find(e => e.id === eid);
                return ench ? ench.name : eid;
            }).join(', ');
            enchantText = `<strong>Enchantments:</strong> ${enchantNames}`;
        }
        
        item.innerHTML = `
            <div style="font-weight:700;font-size:15px;margin-bottom:4px">${petName} #${i + 1}</div>
            <div style="font-size:13px;color:var(--muted)">${enchantText}</div>
        `;
        
        item.addEventListener('click', () => {
            selectPet(petKey, petId);
            closePetSelectorModal();
        });
        
        enchantPetInstanceList.appendChild(item);
    }
    
    enchantPetSelectorModal.classList.add('show');
}

// Close pet selector modal
function closePetSelectorModal() {
    enchantPetSelectorModal.classList.remove('show');
}

// Select a pet to enchant
function selectPet(petKey, petId) {
    selectedPetKey = petKey;
    renderPets();
    
    // Show selected pet info
    selectedPetInfoEl.style.display = 'block';
    selectedPetNameEl.textContent = getPetName(petId);
    
    const enchants = state.petEnchantments[petKey] || [];
    if (enchants.length === 0) {
        selectedPetEnchantsEl.textContent = 'No enchantments yet';
    } else {
        const enchantNames = enchants.map(eid => {
            const ench = ENCHANTMENTS.find(e => e.id === eid);
            return ench ? ench.name : eid;
        }).join(', ');
        selectedPetEnchantsEl.innerHTML = `<strong>Enchantments:</strong> ${enchantNames}`;
    }
    
    // Generate 3 random enchantment options
    generateEnchantOptions();
}

// Generate 3 random enchantment options
function generateEnchantOptions() {
    currentEnchantOptions = [];
    
    // Get the pet ID from selectedPetKey (format: petId_index)
    const petId = selectedPetKey ? selectedPetKey.split('_').slice(0, -1).join('_') : null;
    
    // Filter enchantments based on exclusiveTo property
    const availableEnchants = ENCHANTMENTS.filter(enchant => {
        // If enchant has no exclusiveTo, it's available for all pets
        if (!enchant.exclusiveTo) return true;
        // If enchant is exclusive, only include it if the pet matches
        return enchant.exclusiveTo === petId;
    });
    
    // Pick 3 random enchantments
    const shuffled = [...availableEnchants];
    for (let i = 0; i < 3 && shuffled.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * shuffled.length);
        currentEnchantOptions.push(shuffled[randomIndex]);
        shuffled.splice(randomIndex, 1);
    }
    
    renderEnchantOptions();
}

// Handle reroll with cost logic
function handleReroll(isFree, cost) {
    if (!selectedPetKey) {
        showAlert('Please select a pet first');
        return;
    }
    
    if (!isFree) {
        if (state.enchantPoints < cost) {
            showAlert(`Not enough Enchantment Points! You need ${cost} EP but only have ${state.enchantPoints} EP.`);
            return;
        }
        state.enchantPoints -= cost;
    }
    
    // Track reroll usage
    if (!state.petRerollsUsed[selectedPetKey]) {
        state.petRerollsUsed[selectedPetKey] = 0;
    }
    state.petRerollsUsed[selectedPetKey]++;
    
    saveState();
    updateUI();
    generateEnchantOptions();
}

// Render enchantment options
function renderEnchantOptions() {
    enchantOptionsEl.innerHTML = '';
    
    if (currentEnchantOptions.length === 0) {
        enchantOptionsEl.innerHTML = '<p style="color:var(--muted);text-align:center;padding:40px">No options available</p>';
        return;
    }
    
    currentEnchantOptions.forEach(enchant => {
        const option = document.createElement('div');
        option.className = 'enchant-option';
        
        option.innerHTML = `
            <div class="enchant-name">
                ${enchant.name}
                <span class="tier-badge tier-${enchant.tier}">Tier ${enchant.tier}</span>
            </div>
            <div class="enchant-desc">${enchant.description}</div>
            <div class="enchant-cost">💎 ${enchant.cost} Enchantment Points</div>
        `;
        
        option.addEventListener('click', () => applyEnchantment(enchant));
        enchantOptionsEl.appendChild(option);
    });
    
    // Add reroll button with cost logic
    const rerollsUsed = state.petRerollsUsed[selectedPetKey] || 0;
    const rerollCost = 20;
    const isFree = rerollsUsed === 0;
    
    const rerollBtn = document.createElement('button');
    if (isFree) {
        rerollBtn.textContent = '🔄 Reroll Options (1 Free Reroll)';
        rerollBtn.className = 'muted';
    } else {
        rerollBtn.textContent = `🔄 Reroll Options (${rerollCost} EP)`;
        rerollBtn.className = 'muted';
        if (state.enchantPoints < rerollCost) {
            rerollBtn.disabled = true;
            rerollBtn.style.opacity = '0.5';
            rerollBtn.style.cursor = 'not-allowed';
        }
    }
    rerollBtn.style.width = '100%';
    rerollBtn.style.marginTop = '12px';
    rerollBtn.addEventListener('click', () => handleReroll(isFree, rerollCost));
    enchantOptionsEl.appendChild(rerollBtn);
}

// Apply enchantment to selected pet
function applyEnchantment(enchant) {
    if (!selectedPetKey) {
        showAlert('Please select a pet first');
        return;
    }
    
    if (state.enchantPoints < enchant.cost) {
        showAlert(`Not enough Enchantment Points! You need ${enchant.cost} EP but only have ${state.enchantPoints} EP.`);
        return;
    }
    
    // Check if pet already has this enchantment
    const currentEnchants = state.petEnchantments[selectedPetKey] || [];
    if (currentEnchants.includes(enchant.id)) {
        showAlert('This pet already has this enchantment!');
        return;
    }
    
    // Apply enchantment
    state.enchantPoints -= enchant.cost;
    if (!state.petEnchantments[selectedPetKey]) {
        state.petEnchantments[selectedPetKey] = [];
    }
    state.petEnchantments[selectedPetKey].push(enchant.id);
    
    // Use global saveState from window to persist across pages
    if (window.saveState) {
        window.saveState();
    }
    // Update local enchant page UI
    updateUI();
    
    // Refresh selected pet display
    const petId = selectedPetKey.split('_').slice(0, -1).join('_');
    selectPet(selectedPetKey, petId);
    
    showAlert(`Successfully enchanted with ${enchant.name}!`);
}

// Custom alert modal
function showAlert(message){
    return new Promise((resolve)=>{
        const backdrop = document.createElement('div');
        backdrop.style.position = 'fixed';
        backdrop.style.left = '0'; backdrop.style.top = '0'; backdrop.style.right = '0'; backdrop.style.bottom = '0';
        backdrop.style.background = 'rgba(0,0,0,0.45)';
        backdrop.style.display = 'flex';
        backdrop.style.alignItems = 'center';
        backdrop.style.justifyContent = 'center';
        backdrop.style.zIndex = '9999';

        const modal = document.createElement('div');
        modal.style.width = 'min(420px, 92%)';
        modal.style.background = 'var(--modal-bg, #1f2937)';
        modal.style.color = 'var(--modal-fg, #fff)';
        modal.style.borderRadius = '10px';
        modal.style.boxShadow = '0 8px 24px rgba(0,0,0,0.35)';
        modal.style.padding = '18px';
        modal.style.display = 'flex';
        modal.style.flexDirection = 'column';
        modal.style.gap = '12px';

        const msg = document.createElement('div');
        msg.style.fontSize = '15px';
        msg.style.lineHeight = '1.4';
        msg.style.color = 'var(--modal-fg, #fff)';
        msg.textContent = message;

        const btnRow = document.createElement('div');
        btnRow.style.display = 'flex';
        btnRow.style.justifyContent = 'flex-end';

        const ok = document.createElement('button');
        ok.textContent = 'OK';
        ok.style.padding = '8px 14px';
        ok.style.borderRadius = '8px';
        ok.style.border = 'none';
        ok.style.cursor = 'pointer';
        ok.style.background = 'var(--accent, #3b82f6)';
        ok.style.color = 'white';

        btnRow.appendChild(ok);
        modal.appendChild(msg);
        modal.appendChild(btnRow);
        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);

        function close(){
            document.body.removeChild(backdrop);
            document.removeEventListener('keydown', onKey);
            resolve();
        }
        function onKey(e){ if(e.key === 'Escape') close(); }
        ok.addEventListener('click', close);
        backdrop.addEventListener('click', (e)=>{ if(e.target===backdrop) close(); });
        document.addEventListener('keydown', onKey);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Enchant] DOMContentLoaded fired');
    
    // Only run on enchant page
    const petGridElement = document.getElementById('petGrid');
    console.log('[Enchant] petGrid element:', petGridElement);
    
    if (!petGridElement) {
        console.log('[Enchant] Not on enchant page, exiting');
        return; // Not on enchant page
    }
    
    console.log('[Enchant] On enchant page, checking globals...');
    
    // Wait for globals to be available from index.js with retry mechanism
    let retries = 0;
    const maxRetries = 10;
    const checkGlobals = () => {
        if (typeof window.state !== 'undefined' && typeof window.PETS !== 'undefined' && typeof window.ENCHANTMENTS !== 'undefined') {
            initEnchantPage();
        } else {
            retries++;
            if (retries < maxRetries) {
                console.warn(`[Enchant] Waiting for globals from index.js... (attempt ${retries}/${maxRetries})`);
                setTimeout(checkGlobals, 100);
            } else {
                console.error('[Enchant] Failed to load globals after', maxRetries, 'attempts');
            }
        }
    };
    checkGlobals();
});

function initEnchantPage() {
    enchantPointsEl = document.getElementById('enchantPoints');
    petGridEl = document.getElementById('petGrid');
    selectedPetInfoEl = document.getElementById('selectedPetInfo');
    selectedPetNameEl = document.getElementById('selectedPetName');
    selectedPetEnchantsEl = document.getElementById('selectedPetEnchants');
    enchantOptionsEl = document.getElementById('enchantOptions');
    enchantPetSelectorModal = document.getElementById('petSelectorModal');
    enchantClosePetSelector = document.getElementById('closePetSelector');
    enchantPetSelectorTitle = document.getElementById('petSelectorTitle');
    enchantPetInstanceList = document.getElementById('petInstanceList');
    
    // Modal event listeners
    if (enchantClosePetSelector) enchantClosePetSelector.addEventListener('click', closePetSelectorModal);
    if (enchantPetSelectorModal) {
        enchantPetSelectorModal.addEventListener('click', (e) => {
            if (e.target === enchantPetSelectorModal) closePetSelectorModal();
        });
    }
    
    loadState();
    console.log('[Enchant] State loaded:', {
        coins: state.coins,
        inventoryKeys: Object.keys(state.inventory || {}),
        inventoryCount: Object.keys(state.inventory || {}).length,
        enchantPoints: state.enchantPoints
    });
    console.log('[Enchant] Initialized with', Object.keys(state.inventory || {}).length, 'pet types');
}


/***/ }),

/***/ "./src/inventory.js":
/*!**************************!*\
  !*** ./src/inventory.js ***!
  \**************************/
/***/ (() => {

// Inventory functionality
// Guard: only run if inventory page elements exist
if (!document.getElementById('brewedPotions')) {
	// Not on inventory page, skip this module
} else {

// Wait for DOM to be ready and globals to be available
document.addEventListener('DOMContentLoaded', () => {
	// Double-check we're on the inventory page after DOM loads
	if (!document.getElementById('brewedPotions')) return;
	
// STORAGE_KEY, PETS, ENCHANTMENTS, and DOM elements (coinsEl, luckMultiplierEl, state) are defined in index.js

// DOM elements specific to inventory page
const activeEffectsEl = document.getElementById('activeEffects');
const brewedPotionsEl = document.getElementById('brewedPotions');
const purchasedItemsEl = document.getElementById('purchasedItems');
const petDetailModal = document.getElementById('petDetailModal');
const closePetDetail = document.getElementById('closePetDetail');
const petDetailName = document.getElementById('petDetailName');
const enchantList = document.getElementById('enchantList');

// Load state
function loadState() {
    try {
        const raw = localStorage.getItem('btf_state_v1');
        if (raw) {
            const parsed = JSON.parse(raw);
            window.state.coins = parsed.coins ?? 0;
            window.state.inventory = parsed.inventory ?? {};
            window.state.petEnchantments = parsed.petEnchantments ?? {};
            window.state.potionActive = parsed.potionActive ?? false;
            window.state.potionEndsAt = parsed.potionEndsAt ?? 0;
            window.state.luckStacks = parsed.luckStacks ?? 0;
            window.state.purchasedItems = parsed.purchasedItems ?? [];
            window.state.potionInventory = parsed.potionInventory ?? [];
        }
    } catch (e) { console.warn('load failed', e) }
    updateUI();
}

// Show pet detail modal
function showPetDetail(petKey, petId) {
    const pet = PETS.find(p => p.id === petId);
    if (!pet) return;
    
    petDetailName.textContent = pet.name;
    
    const enchants = state.petEnchantments[petKey] || [];
    enchantList.innerHTML = '';
    
    if (enchants.length === 0) {
        enchantList.innerHTML = '<p style="color:var(--muted);font-size:13px">No enchantments yet. Visit the Enchanting page to add enchantments!</p>';
    } else {
        enchants.forEach(enchantId => {
            const enchant = ENCHANTMENTS.find(e => e.id === enchantId);
            if (enchant) {
                const badge = document.createElement('div');
                badge.className = `enchant-badge enchant-tier-${enchant.tier}`;
                badge.innerHTML = `<div style="font-weight:700">${enchant.name}</div><div style="font-size:11px;opacity:0.9">${enchant.description}</div>`;
                enchantList.appendChild(badge);
            }
        });
    }
    
    petDetailModal.classList.add('show');
}

// Close pet detail modal
function closePetDetailModal() {
    petDetailModal.classList.remove('show');
}

// Event listeners for modal
closePetDetail.addEventListener('click', closePetDetailModal);
petDetailModal.addEventListener('click', (e) => {
    if (e.target === petDetailModal) closePetDetailModal();
});

// Update UI
function updateUI() {
    coinsEl.textContent = window.state.coins;
    
    // Update luck multiplier
    if(luckMultiplierEl){
        const isActive = window.state.potionActive && window.state.potionEndsAt > Date.now();
        const cappedStacks = Math.min(window.state.luckStacks, 100);
        luckMultiplierEl.textContent = isActive ? `${1 + cappedStacks * 2}x` : "1x";
    }
    
    // Update active effects
    activeEffectsEl.innerHTML = '';
    if (window.state.potionActive && window.state.potionEndsAt > Date.now()) {
        const remaining = Math.ceil((window.state.potionEndsAt - Date.now()) / 1000);
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        const cappedStacks = Math.min(window.state.luckStacks, 100);
        
        const effectEl = document.createElement('div');
        effectEl.className = 'item-card';
        effectEl.innerHTML = `
            <div class="item-icon">🧪</div>
            <div class="item-info">
                <h3>Luck Potion</h3>
                <p class="effect-active">Active - ${minutes}:${seconds.toString().padStart(2, '0')} remaining</p>
                <p>+${cappedStacks * 2}x luck boost (${cappedStacks} stack${cappedStacks !== 1 ? 's' : ''})</p>
            </div>
        `;
        activeEffectsEl.appendChild(effectEl);
    } else {
        activeEffectsEl.innerHTML = '<p style="color:var(--muted)">No active effects</p>';
    }

    // Update brewed potions section
    if(brewedPotionsEl){
        brewedPotionsEl.innerHTML = '';
        const inv = Array.isArray(window.state.potionInventory) ? window.state.potionInventory : [];
        if(inv.length === 0){
            brewedPotionsEl.innerHTML = '<p style="color:var(--muted)">No brewed potions. Visit the Shop to brew potions!</p>';
        } else {
            inv.forEach((potion, idx) => {
                const potionEl = document.createElement('div');
                potionEl.className = 'item-card';
                potionEl.style.position = 'relative';
                potionEl.innerHTML = `
                    <div class="item-icon">🧪</div>
                    <div class="item-info">
                        <h3>${potion.name}</h3>
                        <p style="color:#10b981">+${potion.potency} luck stacks</p>
                        <p style="font-size:12px">Duration: ${Math.round(potion.durationMs/60000)} minutes</p>
                    </div>
                `;
                const useBtn = document.createElement('button');
                useBtn.className = 'buy-btn';
                useBtn.textContent = 'Use';
                useBtn.style.marginLeft = 'auto';
                useBtn.addEventListener('click', () => useBrewedPotion(idx));
                potionEl.appendChild(useBtn);
                brewedPotionsEl.appendChild(potionEl);
            });
        }
    }

    // Update purchased items - show pets with click to view enchantments
    purchasedItemsEl.innerHTML = '';
    
    // Show pets from inventory
    const petEntries = Object.entries(window.state.inventory || {});
    if (petEntries.length > 0) {
        petEntries.forEach(([petId, count]) => {
            const pet = PETS.find(p => p.id === petId);
            if (!pet) return;
            
            for (let i = 0; i < count; i++) {
                const petKey = `${petId}_${i}`;
                const enchants = window.state.petEnchantments[petKey] || [];
                
                const itemEl = document.createElement('div');
                itemEl.className = 'item-card';
                itemEl.style.cursor = 'pointer';
                itemEl.innerHTML = `
                    <div class="item-icon">🐾</div>
                    <div class="item-info">
                        <h3>${pet.name}</h3>
                        <p style="color:var(--${pet.rarity})">${pet.rarity.toUpperCase()}</p>
                        <p style="font-size:11px;margin-top:4px">${enchants.length} enchantment${enchants.length !== 1 ? 's' : ''} • Click to view</p>
                    </div>
                `;
                itemEl.addEventListener('click', () => showPetDetail(petKey, petId));
                purchasedItemsEl.appendChild(itemEl);
            }
        });
    }
    
    // Show other purchased items
    if (window.state.purchasedItems && window.state.purchasedItems.length > 0) {
        window.state.purchasedItems.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'item-card';
            itemEl.innerHTML = `
                <div class="item-icon">${item.icon}</div>
                <div class="item-info">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                </div>
            `;
            purchasedItemsEl.appendChild(itemEl);
        });
    }
    
    if (petEntries.length === 0 && (!window.state.purchasedItems || window.state.purchasedItems.length === 0)) {
        purchasedItemsEl.innerHTML = '<p style="color:var(--muted)">No items purchased yet</p>';
    }
}


function useBrewedPotion(idx){
    const inv = Array.isArray(window.state.potionInventory) ? window.state.potionInventory : [];
    if(idx < 0 || idx >= inv.length) return;
    const potion = inv[idx];
    if(!potion) return;

    // Apply potion effect
    applyPotionEffect(potion);

    // Remove used potion from inventory
    inv.splice(idx, 1);
    window.state.potionInventory = inv;
    if(typeof window.saveState === 'function') window.saveState();
    updateUI();
}

// Check effects timer every second
setInterval(updateUI, 1000);

// Initial load
loadState();

}); // End DOMContentLoaded
} // End inventory page guard

/***/ }),

/***/ "./src/leaderboard.js":
/*!****************************!*\
  !*** ./src/leaderboard.js ***!
  \****************************/
/***/ (() => {

// Leaderboard functionality for BTF

// Only run on leaderboard page
if (typeof document !== 'undefined' && !document.getElementById('leaderboardList')) {
	// Not on leaderboard page, skip initialization
} else {

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
		alert('Score submitted locally! (This device only)');
		loadLeaderboard();
	} else {
		alert('Error submitting score. Please try again.');
	}
});

// Load and display leaderboard
async function loadLeaderboard() {
	leaderboardList.innerHTML = '<p style="text-align:center;color:var(--muted);padding:40px">Loading local scores…</p>';
	
	try {
		// Use local leaderboard
		const leaderboard = getLocalLeaderboard();
		
		if (leaderboard.length === 0) {
			leaderboardList.innerHTML = '<p style="text-align:center;color:var(--muted);padding:40px">No local scores on this device yet. Be the first to submit!</p>';
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

} // End of leaderboard page check


/***/ }),

/***/ "./src/shop.js":
/*!*********************!*\
  !*** ./src/shop.js ***!
  \*********************/
/***/ (() => {

// Christmas Gift dynamic card removed per request. No injection.

// Shop functionality
// Guard: only run if shop page elements exist
if (!document.getElementById('buyLuckPotion')) {
	// Not on shop page, skip this module
} else {

// Wait for DOM to be ready and globals to be availablec
document.addEventListener('DOMContentLoaded', () => {
	// Double-check we're on the shop page after DOM loads
	if (!document.getElementById('buyLuckPotion')) return;
	
// STORAGE_KEY is now defined in index.js
const POTION_COST = 100000;
const POTION_DURATION = 5 * 60 * 1000; // 5 minutes in ms
const BENNY_COST = 10000;
const BENNY_DURATION = 5 * 60 * 1000; // 5 minutes
const BLESSING_COST = 8000;
const BLESSING_DURATION = 5 * 60 * 1000; // 5 minutes
const CHRISTMAS_COST = 150000;
const CHRISTMAS_DURATION = 5 * 60 * 1000; // 5 minutes
const SLOT_MACHINE_COST = 1000000;
const SLOT_MACHINE_BONUS = 5;

// DOM elements (coinsEl and luckMultiplierEl are defined in index.js)
const buyBtn = document.getElementById('buyLuckPotion');
const timerEl = document.getElementById('potionTimer');
const buyBennyBtn = document.getElementById('buyBennyBoost');
const bennyTimerEl = document.getElementById('bennyTimer');
const buyBlessingBtn = document.getElementById('buyPumpkinBlessing');
const blessingTimerEl = document.getElementById('blessingTimer');
const buyChristmasBtn = document.getElementById('buyChristmasPotion');
const christmasTimerEl = document.getElementById('christmasTimer');
const buySlotMachineBtn = document.getElementById('buySlotMachine');
const slotsPurchasedEl = document.getElementById('slotsPurchased');
const buyThanksgivingPotion = document.getElementById('buyThanksgivingPotion');
let btf_plus = false;

// Brewing UI
const tearsDisplayEl = document.getElementById('tearsDisplay');
const brewFruitListEl = document.getElementById('brewFruitList');
const brewSelectionEl = document.getElementById('brewSelection');
const brewPreviewEl = document.getElementById('brewPreview');
const brewPotionBtn = document.getElementById('brewPotionBtn');

// Ensure we have local references to common header elements (may not rely on globals)
const coinsEl = document.getElementById('coins');
const luckMultiplierEl = document.getElementById('luckMultiplier');

// State is now defined in index.js - use the global state
// Local state object removed to avoid duplicate declaration



// Load state
function loadState() {
    try {
        const STORAGE_KEY = 'btf_state_v1'; // Use local constant for shop page
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if(!window.state) window.state = {};
            window.state.coins = parsed.coins ?? 0;
            window.state.potionActive = parsed.potionActive ?? false;
            window.state.potionEndsAt = parsed.potionEndsAt ?? 0;
            window.state.luckStacks = parsed.luckStacks ?? 0;
            window.state.bennyActive = parsed.bennyActive ?? false;
            window.state.bennyEndsAt = parsed.bennyEndsAt ?? 0;
            window.state.blessingActive = parsed.blessingActive ?? false;
            window.state.blessingEndsAt = parsed.blessingEndsAt ?? 0;
            window.state.christmasActive = parsed.christmasActive ?? false;
            window.state.christmasEndsAt = parsed.christmasEndsAt ?? 0;
            window.state.purchasedItems = parsed.purchasedItems ?? [];
            window.state.bonusInventorySlots = parsed.bonusInventorySlots ?? 0;
            window.state.inventory = parsed.inventory ?? (window.state.inventory || {});
            window.state.fruits = parsed.fruits ?? (window.state.fruits || {});
            window.state.tears = parsed.tears ?? 0;
            window.state.potionInventory = parsed.potionInventory ?? [];
        }
    } catch (e) { console.warn('load failed', e) }
    updateUI();
    renderBrewableFruits();
}

// saveState() is now provided by index.js with hash integrity

// Update UI
function updateUI() {
    if(coinsEl){ coinsEl.textContent = window.state.coins; }
    if(tearsDisplayEl){ tearsDisplayEl.textContent = Math.floor(window.state.tears || 0); }
    
    // Update luck multiplier
    if(luckMultiplierEl){
        const isActive = window.state.potionActive && window.state.potionEndsAt > Date.now();
        const cappedStacks = Math.min(window.state.luckStacks, 100);
        luckMultiplierEl.textContent = isActive ? `${1 + cappedStacks * 2}x` : "1x";
    }
    // Benny UI
    if(bennyTimerEl){
        const bActive = window.state.bennyActive && window.state.bennyEndsAt > Date.now();
        buyBennyBtn.disabled = window.state.coins < BENNY_COST || bActive;
        if(bActive){
            const remaining = Math.ceil((window.state.bennyEndsAt - Date.now())/1000);
            const minutes = Math.floor(remaining/60);
            const seconds = remaining%60;
            bennyTimerEl.textContent = `${minutes}:${seconds.toString().padStart(2,'0')} remaining`;
            bennyTimerEl.style.display = 'inline';
        } else {
            bennyTimerEl.style.display = 'none';
        }
    }
    // Blessing UI
    if(blessingTimerEl){
        const blActive = window.state.blessingActive && window.state.blessingEndsAt > Date.now();
        if(buyBlessingBtn) buyBlessingBtn.disabled = window.state.coins < BLESSING_COST || blActive;
        if(blActive){
            const remaining = Math.ceil((window.state.blessingEndsAt - Date.now())/1000);
            const minutes = Math.floor(remaining/60);
            const seconds = remaining%60;
            blessingTimerEl.textContent = `${minutes}:${seconds.toString().padStart(2,'0')} remaining`;
            blessingTimerEl.style.display = 'inline';
        } else {
            blessingTimerEl.style.display = 'none';
        }
    }
    
    // Christmas UI
    if(christmasTimerEl){
        const chrActive = window.state.christmasActive && window.state.christmasEndsAt > Date.now();
        if(buyChristmasBtn) buyChristmasBtn.disabled = window.state.coins < CHRISTMAS_COST || chrActive;
        if(chrActive){
            const remaining = Math.ceil((window.state.christmasEndsAt - Date.now())/1000);
            const minutes = Math.floor(remaining/60);
            const seconds = remaining%60;
            christmasTimerEl.textContent = `${minutes}:${seconds.toString().padStart(2,'0')} remaining`;
            christmasTimerEl.style.display = 'inline';
        } else {
            christmasTimerEl.style.display = 'none';
        }
    }
    
    // Allow buying potions even when active (for stacking)
    buyBtn.disabled = window.state.coins < POTION_COST;
    
    if (window.state.potionActive) {
        const remaining = Math.ceil((window.state.potionEndsAt - Date.now()) / 1000);
        if (remaining <= 0) {
            window.state.potionActive = false;
            window.state.potionEndsAt = 0;
            window.state.luckStacks = 0;
            if(typeof window.saveState === 'function') window.saveState();
            timerEl.style.display = 'none';
            buyBtn.disabled = window.state.coins < POTION_COST;
        } else {
            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;
            timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')} remaining`;
            timerEl.style.display = 'inline';
        }
    } else {
        timerEl.style.display = 'none';
    }
    
    // Slot Machine UI (one-time purchase)
    if(buySlotMachineBtn){
        const purchased = (window.state.bonusInventorySlots || 0) >= SLOT_MACHINE_BONUS;
        buySlotMachineBtn.disabled = (window.state.coins < SLOT_MACHINE_COST) || purchased;
        buySlotMachineBtn.textContent = purchased ? 'Purchased' : 'Buy Slot Machine';
    }
    if(slotsPurchasedEl){
        const base = 20;
        const totalSlots = base + (window.state.bonusInventorySlots || 0);
        const purchased = (window.state.bonusInventorySlots || 0) >= SLOT_MACHINE_BONUS;
        if(purchased){
            slotsPurchasedEl.textContent = `Current capacity: ${totalSlots} slots (Slot Machine owned)`;
        } else {
            slotsPurchasedEl.textContent = `Current capacity: ${base} slots (base)`;
        }
    }
}

// Brewing logic
const RARITY_POTENCY = {
    common: 1,
    rare: 2,
    epic: 4,
    special: 5,
    legendary: 6,
    spooky: 8,
    chromatic: 10,
    unique: 15,
    godly: 20
};
const RARITY_TEARS_COST = {
    common: 5,
    rare: 20,
    epic: 60,
    special: 80,
    legendary: 150,
    spooky: 200,
    chromatic: 300,
    unique: 1000,
    godly: 5000
};
const BREW_DURATION = 5 * 60 * 1000; // 5 minutes

function getFruitDef(fid){ return FRUITS.find(f=>f.id===fid); }

function renderBrewableFruits(){
    if(!brewFruitListEl) return;
    brewFruitListEl.innerHTML = '';
    const entries = Object.entries(window.state.fruits||{}).filter(([,cnt])=>cnt>0);
    if(entries.length===0){
        brewFruitListEl.innerHTML = '<div style="color:var(--muted)">No fruits available.</div>';
        return;
    }
    entries.forEach(([fid, cnt])=>{
        const def = getFruitDef(fid);
        const btn = document.createElement('button');
        btn.className = 'small';
        btn.textContent = `${def?def.name:fid} x${cnt}`;
        btn.addEventListener('click', ()=>toggleSelectedFruit(fid));
        brewFruitListEl.appendChild(btn);
    });
}

let selectedFruits = [];
function toggleSelectedFruit(fid){
    const idx = selectedFruits.indexOf(fid);
    if(idx>=0) selectedFruits.splice(idx,1); else if(selectedFruits.length<3) selectedFruits.push(fid);
    updateBrewPreview();
}

function updateBrewPreview(){
    if(!brewSelectionEl || !brewPreviewEl || !brewPotionBtn) return;
    if(selectedFruits.length===0){
        brewSelectionEl.textContent = 'No fruits selected.';
        brewPreviewEl.textContent = '';
        brewPotionBtn.disabled = true;
        return;
    }
    const names = selectedFruits.map(fid=>{ const d=getFruitDef(fid); return d?d.name:fid; }).join(', ');
    brewSelectionEl.textContent = `Selected: ${names}`;
    // potency is sum of individual potencies (capped at 100)
    let potency = 0; let cost = 0;
    selectedFruits.forEach(fid=>{
        const d = getFruitDef(fid);
        if(d){ potency += (RARITY_POTENCY[d.rarity]||0); cost += (RARITY_TEARS_COST[d.rarity]||0); }
    });
    potency = Math.min(potency, 100);
    brewPreviewEl.textContent = `Cost: ${cost} Tears`;
    const canAfford = (window.state.tears||0) >= cost;
    const haveAll = selectedFruits.every(fid => (window.state.fruits[fid]||0) > 0);
    brewPotionBtn.disabled = !(canAfford && haveAll);
    brewPotionBtn.onclick = ()=>brewPotion(potency, cost);
}

async function brewPotion(potency, cost){
    console.log('brewPotion called', {potency, cost, currentInventory: window.state.potionInventory});
    // consume fruits
    selectedFruits.forEach(fid=>{ if(window.state.fruits[fid]>0){ window.state.fruits[fid] -= 1; if(window.state.fruits[fid]===0) delete window.state.fruits[fid]; } });
    // consume tears
    window.state.tears = Math.max(0, (window.state.tears||0) - cost);
    
    // Determine potion name based on potency
    let potionName = 'Luck Potion';
    if (potency <= 3) {
        potionName = 'Buns Luck Potion';
    } else if (potency <= 8) {
        potionName = 'Weak Luck Potion';
    } else if (potency <= 15) {
        potionName = 'Basic Luck Potion';
    } else if (potency <= 25) {
        potionName = 'Better Luck Potion';
    } else if (potency <= 40) {
        potionName = 'Superior Luck Potion';
    } else if (potency <= 60) {
        potionName = 'Mega Superior Luck Potion';
    } else if (potency <= 80) {
        potionName = 'Mega Mega Superior Luck Potion';
    } else {
        potionName = 'Godly Luck Potion';
    }
    
    // add potion to inventory
    if(!Array.isArray(window.state.potionInventory)) window.state.potionInventory = [];
    window.state.potionInventory.push({ type:'luck', name: potionName, potency, durationMs: BREW_DURATION, createdAt: Date.now() });
    console.log('After push', {newInventory: window.state.potionInventory, stateKeys: Object.keys(window.state)});
    // reset selection
    selectedFruits = [];
    if(typeof window.saveState === 'function') window.saveState();
    console.log('After saveState');
    updateUI();
    renderBrewableFruits();
    if(typeof showAlert === 'function'){
        await showAlert(`${potionName} brewed successfully! Check your Inventory to use it.`);
    } else {
        alert(`${potionName} brewed! Check your Inventory to use it.`);
    }
}



// Buy potion (stackable - extends duration)
buyBtn.addEventListener('click', () => {
    if (window.state.coins >= POTION_COST) {
        window.state.coins -= POTION_COST;
        if (window.state.potionActive && window.state.potionEndsAt > Date.now()) {
            // Already active: increment stacks (max 100), reset timer
            window.state.luckStacks = Math.min(window.state.luckStacks + 1, 100);
            window.state.potionEndsAt = Date.now() + POTION_DURATION;
        } else {
            // Not active or expired: start new effect
            window.state.potionActive = true;
            window.state.luckStacks = 1;
            window.state.potionEndsAt = Date.now() + POTION_DURATION;
        }
        // Add to purchased items if not already there
        if (!window.state.purchasedItems.some(item => item.name === 'Potion of Luck')) {
            window.state.purchasedItems.push({
                name: 'Potion of Luck',
                icon: '',
                description: 'Makes all items 3x more common for 5 minutes'
            });
        }
        if(typeof window.saveState === 'function') window.saveState();
        updateUI();
    }
});

// Buy Benny Boost
if(buyBennyBtn){
    buyBennyBtn.addEventListener('click', ()=>{
        if(window.state.coins >= BENNY_COST && !window.state.bennyActive){
            window.state.coins -= BENNY_COST;
            window.state.bennyActive = true;
            window.state.bennyEndsAt = Date.now() + BENNY_DURATION;
            if(!window.state.purchasedItems.some(i=>i.name==='Benny Boost')){
                window.state.purchasedItems.push({ name: 'Happy Powder', icon: '😃', description: '+10% CPS for 5 minutes' });
            }
            if(typeof window.saveState === 'function') window.saveState();
            updateUI();
        }
    });
}

// Buy Blessing of the Pumpkin
if(buyBlessingBtn){
    buyBlessingBtn.addEventListener('click', ()=>{
        if(window.state.coins >= BLESSING_COST && !window.state.blessingActive){
            window.state.coins -= BLESSING_COST;
            window.state.blessingActive = true;
            window.state.blessingEndsAt = Date.now() + BLESSING_DURATION;
            if(!window.state.purchasedItems.some(i=>i.name==='Blessing of the Pumpkin')){
                window.state.purchasedItems.push({ name: 'Blessing of the Pumpkin', icon: '🎃', description: 'Makes spooky items 2/3 as rare for 5 minutes' });
            }
            if(typeof window.saveState === 'function') window.saveState();
            updateUI();
        }
    });
}

// Buy Christmas Spirit Potion
if(buyChristmasBtn){
    buyChristmasBtn.addEventListener('click', ()=>{
        if(window.state.coins >= CHRISTMAS_COST){
            window.state.coins -= CHRISTMAS_COST;
            window.state.christmasActive = true;
            window.state.christmasEndsAt = Date.now() + CHRISTMAS_DURATION;
            
            // Properly manage luck stacks with the potion system
            if (window.state.potionActive && window.state.potionEndsAt > Date.now()) {
                // Already active: add 1 stack (max 100), reset timer
                window.state.luckStacks = Math.min((window.state.luckStacks || 0) + 1, 100);
                window.state.potionEndsAt = Date.now() + CHRISTMAS_DURATION;
            } else {
                // Not active or expired: start new effect with 1 stack
                window.state.potionActive = true;
                window.state.luckStacks = 1;
                window.state.potionEndsAt = Date.now() + CHRISTMAS_DURATION;
            }
            
            if(typeof window.saveState === 'function') window.saveState();
            updateUI();
            if(typeof showAlert === 'function'){
                showAlert('🎄 Christmas Spirit Potion activated! +2x luck for 5 minutes!');
            } else {
                alert('🎄 Christmas Spirit Potion activated! +2x luck for 5 minutes!');
            }
        } else {
            if(typeof showAlert === 'function'){
                showAlert('Not enough coins!');
            } else {
                alert('Not enough coins!');
            }
        }
    });
}

// Buy Slot Machine
if(buySlotMachineBtn){
    buySlotMachineBtn.addEventListener('click', ()=>{
        const alreadyBought = (window.state.bonusInventorySlots || 0) >= SLOT_MACHINE_BONUS;
        if(alreadyBought){
            if(typeof showAlert === 'function'){
                showAlert('You already own the Slot Machine.');
            } else {
                alert('You already own the Slot Machine.');
            }
            return;
        }
        if(window.state.coins >= SLOT_MACHINE_COST){
            window.state.coins -= SLOT_MACHINE_COST;
            window.state.bonusInventorySlots = SLOT_MACHINE_BONUS; // one-time purchase
            if(!window.state.purchasedItems.some(i=>i.name==='Slot Machine')){
                window.state.purchasedItems.push({ name: 'Slot Machine', icon: '🎰', description: `Adds +5 pet inventory slots permanently` });
            }
            if(typeof window.saveState === 'function') window.saveState();
            updateUI();
            if(typeof showAlert === 'function'){
                showAlert(`Purchased! Your pet inventory capacity is now ${20 + window.state.bonusInventorySlots} slots.`);
            } else {
                alert(`Purchased! Your pet inventory capacity is now ${20 + window.state.bonusInventorySlots} slots.`);
            }
        }
    });
}


if(buyThanksgivingPotion){
    buyThanksgivingPotion.addEventListener('click', ()=>{
        if(window.state.coins >= THANKSGIVING_POTION_COST && !window.state.thanksgivingPotionActive){
            window.state.coins -= THANKSGIVING_POTION_COST;
            window.state.thanksgivingPotionActive = true;
            window.state.thanksgivingPotionEndsAt = Date.now() + THANKSGIVING_POTION_DURATION;
            if(!window.state.purchasedItems.some(i=>i.name==='Potion of Thanksgiving')){
                window.state.purchasedItems.push({ name: 'Potion of Thanksgiving', icon: '🦃', description: 'All shop items 50% off for 5 minutes' });
            }
            if(typeof window.saveState === 'function') window.saveState();
            updateUI();
        }
    });
} 

// Christmas Gift Claim handler
const claimChristmasGiftBtn = document.getElementById('claimChristmasGift');
if(claimChristmasGiftBtn){
    // Disable button immediately if already claimed (on page load)
    (function(){
        const GIFT_FLAG_KEY = 'btf_gift_christmas2025_claimed';
        const alreadyClaimed = localStorage.getItem(GIFT_FLAG_KEY) === '1' || (window.state && window.state.gifts && window.state.gifts.christmas2025);
        if(alreadyClaimed){
            claimChristmasGiftBtn.disabled = true;
            claimChristmasGiftBtn.textContent = 'Already Claimed';
        }
    })();

    claimChristmasGiftBtn.addEventListener('click', ()=>{
        const petId = 'pet_f_1';
        const GIFT_FLAG_KEY = 'btf_gift_christmas2025_claimed';
        const alreadyClaimed = localStorage.getItem(GIFT_FLAG_KEY) === '1' || (window.state && window.state.gifts && window.state.gifts.christmas2025);
        if(alreadyClaimed){
            claimChristmasGiftBtn.disabled = true;
            claimChristmasGiftBtn.textContent = 'Already Claimed';
            if(typeof showAlert === 'function'){
                showAlert('Already claimed. Enjoy your Festive Reindeer!');
            } else {
                alert('Already claimed. Enjoy your Festive Reindeer!');
            }
            return;
        }
        
        // Use window.state explicitly (set by index.js)
        if(!window.state || !window.state.inventory){
            // Initialize minimal structures to allow claim to proceed
            window.state = window.state || {};
            window.state.inventory = window.state.inventory || {};
            window.state.bonusInventorySlots = window.state.bonusInventorySlots || 0;
        }
        
        // Check inventory capacity
        const maxSlots = 20 + (window.state.bonusInventorySlots || 0);
        const currentCount = Object.values(window.state.inventory).reduce((s,v)=>s+v,0);
        if(currentCount >= maxSlots){
            if(typeof showAlert === 'function'){
                showAlert(`Your pet inventory is full (${maxSlots} slots). Sell pets first.`);
            } else {
                alert(`Your pet inventory is full (${maxSlots} slots). Sell pets first.`);
            }
            return;
        }
        
        // Grant the pet via global helper if available
        let granted = false;
        if(typeof window.grantPet === 'function'){
            granted = !!window.grantPet(petId, 1);
        }
        if(!granted){
            // Fallback: direct mutation guarded
            window.state.inventory[petId] = (window.state.inventory[petId] || 0) + 1;
            if(typeof window.saveState === 'function') window.saveState();
            if(typeof window.updateUI === 'function') window.updateUI();
        }

        // Persist one-time claim in both state and localStorage
        window.state.gifts = window.state.gifts || {};
        window.state.gifts.christmas2025 = true;
        try { localStorage.setItem(GIFT_FLAG_KEY, '1'); } catch(_) {}
        if(typeof window.saveState === 'function') window.saveState();

        // Update UI and notify
        claimChristmasGiftBtn.disabled = true;
        claimChristmasGiftBtn.textContent = 'Already Claimed';
        if(typeof showAlert === 'function'){
            showAlert('🎁 Christmas gift claimed successfully! Merry Christmas!');
        } else {
            alert('🎁 Christmas gift claimed successfully! Merry Christmas!');
        }
    });
}

// Gift Code redemption handler
const giftCodeInput = document.getElementById('giftCodeInput');
const redeemGiftCodeBtn = document.getElementById('redeemGiftCode');

if(redeemGiftCodeBtn && giftCodeInput){
    redeemGiftCodeBtn.addEventListener('click', async ()=>{
        const code = giftCodeInput.value.trim().toUpperCase();
        
        if(!code){
            if(typeof showAlert === 'function'){
                await showAlert('Please enter a gift code.');
            } else {
                alert('Please enter a gift code.');
            }
            return;
        }
        
        // Call redemption logic from index.js if available
        if(typeof redeemGiftCode === 'function'){
            const result = redeemGiftCode(code);
            
            if(result.success){
                // Refresh state from localStorage to get updated values
                loadState();
                updateUI();
                if(typeof showAlert === 'function'){
                    await showAlert('✅ ' + result.message);
                } else {
                    alert('✅ ' + result.message);
                }
                giftCodeInput.value = ''; // Clear input
            } else {
                if(typeof showAlert === 'function'){
                    await showAlert('❌ ' + result.message);
                } else {
                    alert('❌ ' + result.message);
                }
            }
        } else {
            if(typeof showAlert === 'function'){
                await showAlert('Gift code system not available. Please ensure you are on the correct page.');
            } else {
                alert('Gift code system not available. Please ensure you are on the correct page.');
            }
        }
    });
    
    // Allow Enter key to redeem
    giftCodeInput.addEventListener('keypress', (e)=>{
        if(e.key === 'Enter'){
            redeemGiftCodeBtn.click();
        }
    });
}

// Check timer every second
setInterval(updateUI, 1000);

// Initial load
loadState();
renderBrewableFruits();
updateBrewPreview();

}); // End DOMContentLoaded
} // End shop page guard

/***/ }),

/***/ "./src/trade.js":
/*!**********************!*\
  !*** ./src/trade.js ***!
  \**********************/
/***/ (() => {

// Trading logic with code-based P2P. Updated to reserve/deduct creator's offered items at code generation
// and finalize via completion code without double-deducting.

// LocalStorage keys
const CLAIMED_CODES_KEY = (typeof window !== 'undefined' && window.CLAIMED_CODES_KEY) || 'btf_claimed_codes_v1';
const PENDING_TRADE_KEY = 'btf_pending_trade_v1';

function getFruitName(fruitId) {
    const fruit = FRUITS.find(f => f.id === fruitId);
    return fruit ? fruit.name : fruitId;
}

// State
let currentState = {
    coins: 0,
    inventory: {},
    fruits: {}
};
let selectedOffer = {
    pets: {},
    fruits: {},
    coins: 0
};
let selectedRequest = {
    pets: {},
    fruits: {},
    coins: 0
};
let modalMode = 'offer';
let tradeMessage = '';

// DOM elements (will be initialized after DOM loads)
let coinsEl, yourOfferPreviewEl, yourRequestPreviewEl, selectItemsBtn, selectRequestItemsBtn, generateCodeBtn, tradeCodeDisplay, tradeCodeInput, copyCodeBtn;
let redeemCodeInput, redeemCodeBtn, tradeOfferDisplay, itemSelectionModal, closeItemModal;
let yourInventoryEl, tradeNoteEl, cancelItemSelectionBtn, confirmItemSelectionBtn;
let completionCodeDisplay, completionCodeInput, copyCompletionBtn;

// Load state from localStorage
function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            currentState = {
                coins: parsed.coins || 0,
                inventory: parsed.inventory || {},
                fruits: parsed.fruits || {}
            };
        }
    } catch (e) {
        console.error('Failed to load state:', e);
    }
    updateUI();
}

// Save state to localStorage
function saveState() {
    try {
        const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            ...current,
            coins: currentState.coins,
            inventory: currentState.inventory,
            fruits: currentState.fruits
        }));
    } catch (e) {
        console.error('Failed to save state:', e);
    }
}

// Update UI
function updateUI() {
    coinsEl.textContent = currentState.coins;
}

// Generate trade code with embedded data (Base64 encoded)
function generateTradeCode(tradeData) {
    try {
        // Create trade package with timestamp
        const tradePackage = {
            offer: tradeData.offer,
            request: tradeData.request,
            message: tradeData.message,
            timestamp: Date.now()
        };
        
        // Encode to Base64 (handle Unicode)
        const jsonString = JSON.stringify(tradePackage);
        const base64 = btoa(encodeURIComponent(jsonString));
        
        // Create code with BTF prefix
        return 'BTF-' + base64;
    } catch (e) {
        console.error('Failed to generate trade code:', e);
        return null;
    }
}

// Check if a code has been claimed
function isCodeClaimed(code) {
    try {
        const claimed = JSON.parse(localStorage.getItem(CLAIMED_CODES_KEY) || '{}');
        return !!claimed[code];
    } catch (e) {
        return false;
    }
}

// Mark a code as claimed
function markCodeClaimed(code) {
    try {
        const claimed = JSON.parse(localStorage.getItem(CLAIMED_CODES_KEY) || '{}');
        claimed[code] = Date.now();
        localStorage.setItem(CLAIMED_CODES_KEY, JSON.stringify(claimed));
    } catch (e) {
        console.error('Failed to mark code as claimed:', e);
    }
}

// Generate a completion code after joiner accepts, so creator can finalize
function generateCompletionCode(tradeData, originCode) {
    try {
        const completionPackage = {
            completed: true,
            offer: tradeData.offer,
            request: tradeData.request,
            origin: originCode || null,
            timestamp: Date.now()
        };
        const jsonString = JSON.stringify(completionPackage);
        const base64 = btoa(encodeURIComponent(jsonString));
        return 'BTF-' + base64;
    } catch (e) {
        console.error('Failed to generate completion code:', e);
        return null;
    }
}

// Decode trade code and extract data
function loadTradeCode(code) {
    try {
        // Remove all whitespace and trim
        code = code.replace(/\s+/g, '').trim();
        
        // Remove BTF- prefix
        if (!code.toUpperCase().startsWith('BTF-')) {
            return null;
        }
        
        const base64 = code.substring(4);
        
        // Decode from Base64 (handle Unicode)
        const jsonString = decodeURIComponent(atob(base64));
        const tradePackage = JSON.parse(jsonString);
        
        // Check if code has been claimed
        if (isCodeClaimed(code)) {
            return null;
        }
        
        return tradePackage;
    } catch (e) {
        console.error('Failed to decode trade code:', e);
        return null;
    }
}

// Custom alert modal (same as index.js)
function showAlert(message){
    return new Promise((resolve)=>{
        const backdrop = document.createElement('div');
        backdrop.style.position = 'fixed';
        backdrop.style.left = '0'; backdrop.style.top = '0'; backdrop.style.right = '0'; backdrop.style.bottom = '0';
        backdrop.style.background = 'rgba(0,0,0,0.45)';
        backdrop.style.display = 'flex';
        backdrop.style.alignItems = 'center';
        backdrop.style.justifyContent = 'center';
        backdrop.style.zIndex = '9999';

        const modal = document.createElement('div');
        modal.style.width = 'min(420px, 92%)';
        modal.style.background = 'var(--modal-bg, #1f2937)';
        modal.style.color = 'var(--modal-fg, #fff)';
        modal.style.borderRadius = '10px';
        modal.style.boxShadow = '0 8px 24px rgba(0,0,0,0.35)';
        modal.style.padding = '18px';
        modal.style.display = 'flex';
        modal.style.flexDirection = 'column';
        modal.style.gap = '12px';

        const msg = document.createElement('div');
        msg.style.fontSize = '15px';
        msg.style.lineHeight = '1.4';
        msg.style.color = 'var(--modal-fg, #fff)';
        msg.textContent = message;

        const btnRow = document.createElement('div');
        btnRow.style.display = 'flex';
        btnRow.style.justifyContent = 'flex-end';

        const ok = document.createElement('button');
        ok.textContent = 'OK';
        ok.style.padding = '8px 14px';
        ok.style.borderRadius = '8px';
        ok.style.border = 'none';
        ok.style.cursor = 'pointer';
        ok.style.background = 'var(--accent, #3b82f6)';
        ok.style.color = 'white';

        btnRow.appendChild(ok);
        modal.appendChild(msg);
        modal.appendChild(btnRow);
        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);

        function close(){
            document.body.removeChild(backdrop);
            document.removeEventListener('keydown', onKey);
            resolve();
        }
        function onKey(e){ if(e.key === 'Escape') close(); }
        ok.addEventListener('click', close);
        backdrop.addEventListener('click', (e)=>{ if(e.target===backdrop) close(); });
        document.addEventListener('keydown', onKey);
    });
}

// Close item selection modal
function closeItemSelectionModal() {
    itemSelectionModal.classList.remove('show');
}

// Render your inventory in item selection modal
function renderYourInventory() {
    yourInventoryEl.innerHTML = '';
    // If in offer mode, show only what the player actually has. If in request mode, show full catalog
    const sel = modalMode === 'offer' ? selectedOffer : selectedRequest;

    // Pets
    const petsHeader = document.createElement('div');
    petsHeader.innerHTML = '<strong style="color:var(--accent);font-size:14px;margin-bottom:8px;display:block">Pets:</strong>';
    yourInventoryEl.appendChild(petsHeader);

    if (modalMode === 'offer') {
        if (Object.keys(currentState.inventory).length === 0) {
            const p = document.createElement('p');
            p.style.color = 'var(--muted)';
            p.style.textAlign = 'center';
            p.style.padding = '20px 0';
            p.textContent = 'No pets available to offer';
            yourInventoryEl.appendChild(p);
        } else {
            for (const [petId, count] of Object.entries(currentState.inventory)) {
                const item = document.createElement('div');
                item.className = 'selectable-item';
                if (sel.pets[petId]) item.classList.add('selected');
                const petName = getPetName(petId);
                item.innerHTML = `
                    <span>${petName} (x${count})</span>
                    <input type="number" min="0" max="${count}" value="${sel.pets[petId] || 0}" 
                        style="width:60px;padding:4px;border-radius:4px;background:var(--card);border:1px solid rgba(255,255,255,0.08);color:#e6eef8"
                        onchange="updateSelectedItem('pets', '${petId}', this.value, ${count})">
                `;
                yourInventoryEl.appendChild(item);
            }
        }
    } else {
        // Request mode: show the full PETS catalog so creator can request items they don't yet own
        for (const petObj of PETS) {
            const petId = petObj.id;
            const available = currentState.inventory[petId] || 0;
            const item = document.createElement('div');
            item.className = 'selectable-item';
            if (sel.pets[petId]) item.classList.add('selected');
            const petName = petObj.name;
            item.innerHTML = `
                <span>${petName}${available>0?` (have: ${available})`:''}</span>
                <input type="number" min="0" max="9999" value="${sel.pets[petId] || 0}" 
                    style="width:60px;padding:4px;border-radius:4px;background:var(--card);border:1px solid rgba(255,255,255,0.08);color:#e6eef8"
                    onchange="updateSelectedItem('pets', '${petId}', this.value, 9999)">
            `;
            yourInventoryEl.appendChild(item);
        }
    }

    // Fruits
    const fruitsHeader = document.createElement('div');
    fruitsHeader.innerHTML = '<strong style="color:var(--accent);font-size:14px;margin-top:12px;margin-bottom:8px;display:block">Fruits:</strong>';
    yourInventoryEl.appendChild(fruitsHeader);

    if (modalMode === 'offer') {
        if (Object.keys(currentState.fruits).length === 0) {
            const p = document.createElement('p');
            p.style.color = 'var(--muted)';
            p.style.textAlign = 'center';
            p.style.padding = '12px 0';
            p.textContent = 'No fruits available to offer';
            yourInventoryEl.appendChild(p);
        } else {
            for (const [fruitId, count] of Object.entries(currentState.fruits)) {
                const item = document.createElement('div');
                item.className = 'selectable-item';
                if (sel.fruits[fruitId]) item.classList.add('selected');
                const fruitName = getFruitName(fruitId);
                item.innerHTML = `
                    <span>${fruitName} (x${count})</span>
                    <input type="number" min="0" max="${count}" value="${sel.fruits[fruitId] || 0}"
                        style="width:60px;padding:4px;border-radius:4px;background:var(--card);border:1px solid rgba(255,255,255,0.08);color:#e6eef8"
                        onchange="updateSelectedItem('fruits', '${fruitId}', this.value, ${count})">
                `;
                yourInventoryEl.appendChild(item);
            }
        }
    } else {
        // Request mode: show full FRUITS catalog
        for (const fruitObj of FRUITS) {
            const fruitId = fruitObj.id;
            const available = currentState.fruits[fruitId] || 0;
            const item = document.createElement('div');
            item.className = 'selectable-item';
            if (sel.fruits[fruitId]) item.classList.add('selected');
            const fruitName = fruitObj.name;
            item.innerHTML = `
                <span>${fruitName}${available>0?` (have: ${available})`:''}</span>
                <input type="number" min="0" max="9999" value="${sel.fruits[fruitId] || 0}"
                    style="width:60px;padding:4px;border-radius:4px;background:var(--card);border:1px solid rgba(255,255,255,0.08);color:#e6eef8"
                    onchange="updateSelectedItem('fruits', '${fruitId}', this.value, 9999)">
            `;
            yourInventoryEl.appendChild(item);
        }
    }

    // Coins
    const coinsHeader = document.createElement('div');
    coinsHeader.innerHTML = '<strong style="color:var(--accent);font-size:14px;margin-top:12px;margin-bottom:8px;display:block">Coins:</strong>';
    yourInventoryEl.appendChild(coinsHeader);
    
    const coinsItem = document.createElement('div');
    coinsItem.className = 'selectable-item';
    if (modalMode === 'offer') {
        coinsItem.innerHTML = `
            <span>💰 Coins (${currentState.coins} available)</span>
            <input type="number" min="0" max="${currentState.coins}" value="${(sel.coins) || 0}"
                style="width:80px;padding:4px;border-radius:4px;background:var(--card);border:1px solid rgba(255,255,255,0.08);color:#e6eef8"
                onchange="updateSelectedCoins(this.value)">
        `;
    } else {
        // Request mode: allow requesting coins even if you don't own them
        coinsItem.innerHTML = `
            <span>💰 Coins (request amount)</span>
            <input type="number" min="0" max="999999999" value="${(sel.coins) || 0}"
                style="width:80px;padding:4px;border-radius:4px;background:var(--card);border:1px solid rgba(255,255,255,0.08);color:#e6eef8"
                onchange="updateSelectedCoins(this.value)">
        `;
    }
    yourInventoryEl.appendChild(coinsItem);
}

// Update selected item
function updateSelectedItem(type, id, value, max) {
    const count = Math.max(0, Math.min(parseInt(value) || 0, max));
    const target = modalMode === 'offer' ? selectedOffer : selectedRequest;
    if (count > 0) {
        target[type][id] = count;
    } else {
        delete target[type][id];
    }
    renderOfferPreview();
    renderRequestPreview();
}
window.updateSelectedItem = updateSelectedItem;

// Update selected coins
function updateSelectedCoins(value) {
    let v = Math.max(0, parseInt(value) || 0);
    if (modalMode === 'offer') {
        v = Math.min(v, currentState.coins);
        selectedOffer.coins = v;
    } else {
        // Request mode: allow requesting any positive amount
        selectedRequest.coins = v;
    }
    renderOfferPreview();
    renderRequestPreview();
}
window.updateSelectedCoins = updateSelectedCoins;

// Render offer preview
function renderOfferPreview() {
    yourOfferPreviewEl.innerHTML = '';
    let hasItems = false;

    for (const [petId, count] of Object.entries(selectedOffer.pets)) {
        hasItems = true;
        const item = document.createElement('span');
        item.className = 'trade-item';
        const petName = getPetName(petId);
        item.textContent = `${petName}: x${count}`;
        yourOfferPreviewEl.appendChild(item);
    }

    for (const [fruitId, count] of Object.entries(selectedOffer.fruits)) {
        hasItems = true;
        const item = document.createElement('span');
        item.className = 'trade-item';
        const fruitName = getFruitName(fruitId);
        item.textContent = `${fruitName}: x${count}`;
        yourOfferPreviewEl.appendChild(item);
    }

    if (selectedOffer.coins > 0) {
        hasItems = true;
        const item = document.createElement('span');
        item.className = 'trade-item';
        item.textContent = `💰 ${selectedOffer.coins} coins`;
        yourOfferPreviewEl.appendChild(item);
    }

    if (!hasItems) {
        yourOfferPreviewEl.innerHTML = '<p style="color:var(--muted);font-size:13px;margin:0">No items selected</p>';
    }
}

function renderRequestPreview() {
    yourRequestPreviewEl.innerHTML = '';
    let hasItems = false;

    for (const [petId, count] of Object.entries(selectedRequest.pets)) {
        hasItems = true;
        const item = document.createElement('span');
        item.className = 'trade-item';
        const petName = getPetName(petId);
        item.textContent = `${petName}: x${count}`;
        yourRequestPreviewEl.appendChild(item);
    }

    for (const [fruitId, count] of Object.entries(selectedRequest.fruits)) {
        hasItems = true;
        const item = document.createElement('span');
        item.className = 'trade-item';
        const fruitName = getFruitName(fruitId);
        item.textContent = `${fruitName}: x${count}`;
        yourRequestPreviewEl.appendChild(item);
    }

    if (selectedRequest.coins > 0) {
        hasItems = true;
        const item = document.createElement('span');
        item.className = 'trade-item';
        item.textContent = `💰 ${selectedRequest.coins} coins`;
        yourRequestPreviewEl.appendChild(item);
    }

    if (!hasItems) {
        yourRequestPreviewEl.innerHTML = '<p style="color:var(--muted);font-size:13px;margin:0">No requested items</p>';
    }
}



// Render incoming trade offer
function renderTradeOffer(tradeData, code) {
    tradeOfferDisplay.innerHTML = '';
    tradeOfferDisplay.style.display = 'block';

    const offer = document.createElement('div');
    offer.className = 'trade-offer';
    offer.style.margin = '0';

    let itemsHtml = '<div class="trade-items">';
    let hasItems = false;

    for (const [petId, count] of Object.entries(tradeData.items.pets || {})) {
        hasItems = true;
        itemsHtml += `<span class="trade-item">${petId}: x${count}</span>`;
    }

    for (const [fruitId, count] of Object.entries(tradeData.items.fruits || {})) {
        hasItems = true;
        itemsHtml += `<span class="trade-item">${fruitId}: x${count}</span>`;
    }

    if (tradeData.items.coins > 0) {
        hasItems = true;
        itemsHtml += `<span class="trade-item">💰 ${tradeData.items.coins} coins</span>`;
    }

    itemsHtml += '</div>';

    if (!hasItems) {
        itemsHtml = '<p style="color:var(--muted);font-size:13px">No items offered</p>';
    }

    const messageHtml = tradeData.message ? 
        `<div style="margin-top:12px;padding:8px;background:var(--card);border-radius:6px;font-size:13px;color:var(--muted)">
            <strong>Message:</strong> ${tradeData.message}
        </div>` : '';

    offer.innerHTML = `
        <div style="margin-bottom:12px">
            <strong style="color:var(--accent)">Trade Offer (Code: ${code})</strong>
        </div>
        <div style="margin-bottom:12px">
            <div style="font-size:14px;margin-bottom:6px;color:var(--muted)">They are offering:</div>
            ${itemsHtml}
            ${messageHtml}
        </div>
        <div style="display:flex;gap:8px">
            <button onclick="acceptTradeOffer('${code}')" style="flex:1;background:#10b981">Accept Trade</button>
            <button onclick="declineTradeOffer()" class="muted" style="flex:1">Decline</button>
        </div>
    `;

    tradeOfferDisplay.appendChild(offer);
}

// Accept trade offer
function acceptTradeOffer(code) {
    let tradeData = loadTradeCode(code);
    if (!tradeData) {
        showAlert('This trade code is invalid or has already been claimed');
        return;
    }
    // Backward compatibility
    if (tradeData.items && !tradeData.offer) {
        tradeData = { offer: tradeData.items, request: { pets:{}, fruits:{}, coins:0 } };
    }

    // Validate you can give requested items
    for (const [petId, count] of Object.entries(tradeData.request?.pets || {})) {
        if ((currentState.inventory[petId] || 0) < count) {
            showAlert(`You don't have enough ${getPetName(petId)} (need ${count}, have ${currentState.inventory[petId] || 0})`);
            return;
        }
    }
    for (const [fruitId, count] of Object.entries(tradeData.request?.fruits || {})) {
        if ((currentState.fruits[fruitId] || 0) < count) {
            showAlert(`You don't have enough ${getFruitName(fruitId)} (need ${count}, have ${currentState.fruits[fruitId] || 0})`);
            return;
        }
    }
    if ((tradeData.request?.coins || 0) > currentState.coins) {
        showAlert(`You don't have enough coins (need ${tradeData.request.coins}, have ${currentState.coins})`);
        return;
    }

    // Apply trade: subtract requested, add offered
    for (const [petId, count] of Object.entries(tradeData.request?.pets || {})) {
        currentState.inventory[petId] = (currentState.inventory[petId] || 0) - count;
        if (currentState.inventory[petId] <= 0) delete currentState.inventory[petId];
    }
    for (const [fruitId, count] of Object.entries(tradeData.request?.fruits || {})) {
        currentState.fruits[fruitId] = (currentState.fruits[fruitId] || 0) - count;
        if (currentState.fruits[fruitId] <= 0) delete currentState.fruits[fruitId];
    }
    currentState.coins -= (tradeData.request?.coins || 0);

    for (const [petId, count] of Object.entries(tradeData.offer?.pets || {})) {
        currentState.inventory[petId] = (currentState.inventory[petId] || 0) + count;
    }
    for (const [fruitId, count] of Object.entries(tradeData.offer?.fruits || {})) {
        currentState.fruits[fruitId] = (currentState.fruits[fruitId] || 0) + count;
    }
    currentState.coins += (tradeData.offer?.coins || 0);

    saveState();
    updateUI();

    // Mark this trade code as claimed to prevent reuse
    markCodeClaimed(code);

    // Generate completion code for creator to finalize their side
    const completionCode = generateCompletionCode(tradeData, code);
    if (completionCode && completionCodeInput && completionCodeDisplay) {
        completionCodeInput.value = completionCode;
        completionCodeDisplay.style.display = 'block';
    }

    showAlert('Trade accepted! Share the completion code back to the creator so their device updates.');
    tradeOfferDisplay.style.display = 'none';
    redeemCodeInput.value = '';
}
window.acceptTradeOffer = acceptTradeOffer;

// Decline trade offer
function declineTradeOffer() {
    tradeOfferDisplay.style.display = 'none';
    redeemCodeInput.value = '';
}
window.declineTradeOffer = declineTradeOffer;

// Start a counter offer: prefill the Create Trade Offer panel with inverted values
function counterOffer(code) {
    let tradeData = loadTradeCode(code);
    if (!tradeData) {
        showAlert('This trade code is invalid or has already been claimed');
        return;
    }
    if (tradeData.items && !tradeData.offer) {
        tradeData = { offer: tradeData.items, request: { pets:{}, fruits:{}, coins:0 } };
    }

    // Prefill: your offer becomes their request; your request becomes their offer
    const invert = (obj) => JSON.parse(JSON.stringify(obj || { pets:{}, fruits:{}, coins:0 }));
    const proposedOffer = invert(tradeData.request);
    const proposedRequest = invert(tradeData.offer);

    // Clamp proposedOffer to what you actually have
    // Pets
    for (const [petId, count] of Object.entries(proposedOffer.pets)) {
        const have = currentState.inventory[petId] || 0;
        if (have <= 0) delete proposedOffer.pets[petId];
        else if (count > have) proposedOffer.pets[petId] = have;
    }
    // Fruits
    for (const [fruitId, count] of Object.entries(proposedOffer.fruits)) {
        const have = currentState.fruits[fruitId] || 0;
        if (have <= 0) delete proposedOffer.fruits[fruitId];
        else if (count > have) proposedOffer.fruits[fruitId] = have;
    }
    // Coins
    if ((proposedOffer.coins || 0) > currentState.coins) {
        proposedOffer.coins = currentState.coins;
    }

    // Apply to selection state and render in Create panel
    selectedOffer = proposedOffer;
    selectedRequest = proposedRequest;
    renderOfferPreview();
    renderRequestPreview();

    // Enable generate code if there is any offer content
    const hasOffer = Object.keys(selectedOffer.pets).length > 0 ||
                     Object.keys(selectedOffer.fruits).length > 0 ||
                     (selectedOffer.coins || 0) > 0;
    generateCodeBtn.disabled = !hasOffer;

    // Guide user
    showAlert('Your counter offer has been prefilled in the Create Trade Offer panel. Adjust as needed, then click "Generate Trade Code" to share it back.');
}
window.counterOffer = counterOffer;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only run on trade page
    if (!document.getElementById('selectItemsBtn')) {
        return; // Not on trade page
    }
    
    // Initialize DOM elements
    coinsEl = document.getElementById('coins');
    yourOfferPreviewEl = document.getElementById('yourOfferPreview');
    yourRequestPreviewEl = document.getElementById('yourRequestPreview');
    selectItemsBtn = document.getElementById('selectItemsBtn');
    selectRequestItemsBtn = document.getElementById('selectRequestItemsBtn');
    generateCodeBtn = document.getElementById('generateCodeBtn');
    tradeCodeDisplay = document.getElementById('tradeCodeDisplay');
    tradeCodeInput = document.getElementById('tradeCodeInput');
    copyCodeBtn = document.getElementById('copyCodeBtn');
    completionCodeDisplay = document.getElementById('completionCodeDisplay');
    completionCodeInput = document.getElementById('completionCodeInput');
    copyCompletionBtn = document.getElementById('copyCompletionBtn');
    redeemCodeInput = document.getElementById('redeemCodeInput');
    redeemCodeBtn = document.getElementById('redeemCodeBtn');
    tradeOfferDisplay = document.getElementById('tradeOfferDisplay');
    itemSelectionModal = document.getElementById('itemSelectionModal');
    closeItemModal = document.getElementById('closeItemModal');
    yourInventoryEl = document.getElementById('yourInventory');
    tradeNoteEl = document.getElementById('tradeNote');
    cancelItemSelectionBtn = document.getElementById('cancelItemSelection');
    confirmItemSelectionBtn = document.getElementById('confirmItemSelection');

    // Set up event listeners
    selectItemsBtn.addEventListener('click', () => {
        modalMode = 'offer';
        renderYourInventory();
        itemSelectionModal.classList.add('show');
    });
    selectRequestItemsBtn.addEventListener('click', () => {
        modalMode = 'request';
        renderYourInventory();
        itemSelectionModal.classList.add('show');
    });

    closeItemModal.addEventListener('click', closeItemSelectionModal);
    cancelItemSelectionBtn.addEventListener('click', closeItemSelectionModal);

    confirmItemSelectionBtn.addEventListener('click', () => {
        tradeMessage = tradeNoteEl.value.trim();
        closeItemSelectionModal();
        renderOfferPreview();
        renderRequestPreview();
        
        // Enable generate code button if offering has items
        const hasOffer = Object.keys(selectedOffer.pets).length > 0 || 
                         Object.keys(selectedOffer.fruits).length > 0 || 
                         selectedOffer.coins > 0;
        generateCodeBtn.disabled = !hasOffer;
    });

    generateCodeBtn.addEventListener('click', () => {
        const tradeData = {
            offer: selectedOffer,
            request: selectedRequest,
            message: tradeMessage
        };

        // Validate you actually have the offered items/coins right now
        for (const [petId, count] of Object.entries(tradeData.offer?.pets || {})) {
            if ((currentState.inventory[petId] || 0) < count) {
                showAlert(`You don't have enough ${getPetName(petId)} to offer (need ${count}, have ${currentState.inventory[petId] || 0}).`);
                return;
            }
        }
        for (const [fruitId, count] of Object.entries(tradeData.offer?.fruits || {})) {
            if ((currentState.fruits[fruitId] || 0) < count) {
                showAlert(`You don't have enough ${getFruitName(fruitId)} to offer (need ${count}, have ${currentState.fruits[fruitId] || 0}).`);
                return;
            }
        }
        if ((tradeData.offer?.coins || 0) > currentState.coins) {
            showAlert(`You don't have enough coins to offer (need ${tradeData.offer.coins}, have ${currentState.coins}).`);
            return;
        }

        const code = generateTradeCode(tradeData);
        if (!code) {
            showAlert('Failed to generate trade code');
            return;
        }

        // Deduct your offered items immediately (reserve/escrow locally)
        for (const [petId, count] of Object.entries(tradeData.offer?.pets || {})) {
            currentState.inventory[petId] = (currentState.inventory[petId] || 0) - count;
            if (currentState.inventory[petId] <= 0) delete currentState.inventory[petId];
        }
        for (const [fruitId, count] of Object.entries(tradeData.offer?.fruits || {})) {
            currentState.fruits[fruitId] = (currentState.fruits[fruitId] || 0) - count;
            if (currentState.fruits[fruitId] <= 0) delete currentState.fruits[fruitId];
        }
        currentState.coins -= (tradeData.offer?.coins || 0);

        saveState();
        updateUI();

        // Store pending trade so completion code won't double-deduct
        try {
            localStorage.setItem(PENDING_TRADE_KEY, JSON.stringify({
                code,
                offer: tradeData.offer,
                request: tradeData.request,
                createdAt: Date.now()
            }));
        } catch (e) { console.warn('Failed to store pending trade', e); }

        tradeCodeInput.value = code;
        tradeCodeDisplay.style.display = 'block';
        showAlert('Trade code created. Your offered items/coins have been reserved and deducted on this device. Share the code for the other player to accept.');
    });

    copyCodeBtn.addEventListener('click', () => {
        const text = tradeCodeInput.value;
        const doFeedback = () => {
            const orig = copyCodeBtn.textContent;
            copyCodeBtn.textContent = '✓ Copied!';
            setTimeout(() => copyCodeBtn.textContent = orig, 2000);
        };
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(doFeedback).catch(() => {
                tradeCodeInput.select();
                document.execCommand('copy');
                doFeedback();
            });
        } else {
            tradeCodeInput.select();
            document.execCommand('copy');
            doFeedback();
        }
    });

    if (copyCompletionBtn) {
        copyCompletionBtn.addEventListener('click', () => {
            const text = completionCodeInput.value;
            const doFeedback = () => {
                const orig = copyCompletionBtn.textContent;
                copyCompletionBtn.textContent = '✓ Copied!';
                setTimeout(() => copyCompletionBtn.textContent = orig, 2000);
            };
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(doFeedback).catch(() => {
                    completionCodeInput.select();
                    document.execCommand('copy');
                    doFeedback();
                });
            } else {
                completionCodeInput.select();
                document.execCommand('copy');
                doFeedback();
            }
        });
    }

    redeemCodeBtn.addEventListener('click', () => {
        const code = redeemCodeInput.value.trim();
        if (!code) {
            showAlert('Please enter a trade code');
            return;
        }

        let tradeData = loadTradeCode(code);
        if (!tradeData) {
            showAlert('This trade code is invalid or has already been claimed');
            return;
        }

        // If this is a completion code from joiner, finalize creator's side
        if (tradeData.completed === true) {
            const offer = tradeData.offer || { pets:{}, fruits:{}, coins:0 };
            const request = tradeData.request || { pets:{}, fruits:{}, coins:0 };

            // Check for a pending trade reserved at code-generation time
            let pending = null;
            try { pending = JSON.parse(localStorage.getItem(PENDING_TRADE_KEY) || 'null'); } catch(e) { pending = null; }
            const origin = tradeData.origin || null;
            const deepEqual = (a,b) => JSON.stringify(a||{}) === JSON.stringify(b||{});
            const matchesPending = pending && (
                (origin && pending.code === origin) ||
                (!origin && deepEqual(pending.offer, offer) && deepEqual(pending.request, request))
            );

            if (!matchesPending) {
                // Legacy path: validate you still have the offered items, then subtract now
                for (const [petId, count] of Object.entries(offer.pets || {})) {
                    if ((currentState.inventory[petId] || 0) < count) {
                        showAlert(`Can't complete trade: you no longer have enough ${getPetName(petId)} (need ${count}, have ${currentState.inventory[petId] || 0}).`);
                        return;
                    }
                }
                for (const [fruitId, count] of Object.entries(offer.fruits || {})) {
                    if ((currentState.fruits[fruitId] || 0) < count) {
                        showAlert(`Can't complete trade: you no longer have enough ${getFruitName(fruitId)} (need ${count}, have ${currentState.fruits[fruitId] || 0}).`);
                        return;
                    }
                }
                if ((offer.coins || 0) > currentState.coins) {
                    showAlert(`Can't complete trade: you don't have enough coins (need ${offer.coins}, have ${currentState.coins}).`);
                    return;
                }

                // Subtract your offer now
                for (const [petId, count] of Object.entries(offer.pets || {})) {
                    currentState.inventory[petId] = (currentState.inventory[petId] || 0) - count;
                    if (currentState.inventory[petId] <= 0) delete currentState.inventory[petId];
                }
                for (const [fruitId, count] of Object.entries(offer.fruits || {})) {
                    currentState.fruits[fruitId] = (currentState.fruits[fruitId] || 0) - count;
                    if (currentState.fruits[fruitId] <= 0) delete currentState.fruits[fruitId];
                }
                currentState.coins -= (offer.coins || 0);
            } else {
                // We already reserved (deducted) the offer; clear the pending marker
                try { localStorage.removeItem(PENDING_TRADE_KEY); } catch(e) {}
            }

            // Add what you requested
            for (const [petId, count] of Object.entries(request.pets || {})) {
                currentState.inventory[petId] = (currentState.inventory[petId] || 0) + count;
            }
            for (const [fruitId, count] of Object.entries(request.fruits || {})) {
                currentState.fruits[fruitId] = (currentState.fruits[fruitId] || 0) + count;
            }
            currentState.coins += (request.coins || 0);

            saveState();
            updateUI();
            redeemCodeInput.value = '';
            tradeOfferDisplay.style.display = 'none';
            showAlert('Trade finalized! Your inventory has been updated.');
            return;
        }

        // Backward compatibility for older codes
        if (tradeData.items && !tradeData.offer) {
            tradeData = { offer: tradeData.items, request: { pets:{}, fruits:{}, coins:0 }, message: tradeData.message, timestamp: tradeData.timestamp };
        }

        // Display the trade offer
        let html = '<h3 style="margin-top:0">Trade Offer</h3>';
        
        if (tradeData.message) {
            html += `<p style=\"color:var(--muted);font-style:italic;margin-bottom:12px\">\"${tradeData.message}\"</p>`;
        }

        html += '<div style="margin-bottom:12px">'
              + '<div style="font-weight:700;color:#10b981">You will receive:</div>'
              + '<div class="trade-items">';
        for (const [petId, count] of Object.entries(tradeData.offer?.pets || {})) {
            const petName = getPetName(petId);
            html += `<div class="trade-item"><span>${petName}</span><span>×${count}</span></div>`;
        }
        for (const [fruitId, count] of Object.entries(tradeData.offer?.fruits || {})) {
            const fruitName = getFruitName(fruitId);
            html += `<div class="trade-item"><span>${fruitName}</span><span>×${count}</span></div>`;
        }
        if (tradeData.offer?.coins > 0) {
            html += `<div class="trade-item"><span>💰 Coins</span><span>×${tradeData.offer.coins}</span></div>`;
        }
        html += '</div></div>';

        html += '<div>'
              + '<div style="font-weight:700;color:#f59e0b">You will give:</div>'
              + '<div class="trade-items">';
        for (const [petId, count] of Object.entries(tradeData.request?.pets || {})) {
            const petName = getPetName(petId);
            html += `<div class="trade-item"><span>${petName}</span><span>×${count}</span></div>`;
        }
        for (const [fruitId, count] of Object.entries(tradeData.request?.fruits || {})) {
            const fruitName = getFruitName(fruitId);
            html += `<div class="trade-item"><span>${fruitName}</span><span>×${count}</span></div>`;
        }
        if (tradeData.request?.coins > 0) {
            html += `<div class="trade-item"><span>💰 Coins</span><span>×${tradeData.request.coins}</span></div>`;
        }
        html += '</div></div>';

        html += `<div style="display:flex;gap:10px;justify-content:flex-end">`;
        html += `<button class="muted" onclick="declineTradeOffer()">Decline</button>`;
        html += `<button class="muted" onclick="counterOffer('${code}')">Counter Offer</button>`;
        html += `<button onclick="acceptTradeOffer('${code}')">Accept Trade</button>`;
        html += `</div>`;

        tradeOfferDisplay.innerHTML = html;
        tradeOfferDisplay.style.display = 'block';
    });

    // Load initial state
    loadState();
    updateUI();
});


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
// Seasonal events toggle
(() => {
	try {
		const now = Date.now();
		// Christmas 2025 window (local time): Nov 27 — Dec 31
		const start = new Date(2025, 10, 27, 0, 0, 0).getTime(); // months 0-indexed
		const end = new Date(2025, 11, 31, 23, 59, 59).getTime();
		const active = now >= start && now <= end;
		if (typeof document !== 'undefined' && document.body) {
			document.body.classList.toggle('event-christmas', !!active);
		}
	} catch (_) {}
})();

// Console warning
console.log('%c CHARLES SPENCER MCGINNIS CLOSE THE CONSOLE RIGHT THIS INSTANT', 'color: #ff0000; font-size: 24px; font-weight: bold;');
console.log("%c You're not slick", 'color: #ffffffff; font-size: 12px; font-weight: bold;');

// Christmas Update Modal logic (unified, non-recursive)
(() => {
	try {
		if (typeof document === 'undefined') return;
		const modal = document.getElementById('christmasUpdateModal');
		const closeBtn = document.getElementById('closeChristmasUpdate');
		if (!modal || !closeBtn) return; // not on this page

		const STORAGE_FLAG = 'btf_seen_christmas_update';
		const now = Date.now();
		const start = new Date(2025, 10, 27, 0, 0, 0).getTime();
		const end = new Date(2025, 11, 31, 23, 59, 59).getTime();
		const active = now >= start && now <= end;
		const alreadySeen = localStorage.getItem(STORAGE_FLAG) === '1';

		function openModal() {
			modal.style.display = 'flex';
			const backdrop = modal.querySelector('.modal-backdrop');
			if (backdrop) backdrop.style.display = 'block';
			console.log('[Christmas] Modal opened');
		}
		function closeModal() {
			modal.style.display = 'none';
			const backdrop = modal.querySelector('.modal-backdrop');
			if (backdrop) backdrop.style.display = 'none';
			localStorage.setItem(STORAGE_FLAG, '1');
			console.log('[Christmas] Modal closed & flagged');
		}
		closeBtn.addEventListener('click', closeModal);
		modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
		window.showChristmasModal = openModal; // global manual trigger

		const urlParams = (typeof location !== 'undefined' && location.search) ? new URLSearchParams(location.search) : null;
		const forceShow = urlParams ? urlParams.get('show_christmas') === '1' : false;
		if (forceShow) {
			setTimeout(openModal, 200);
		} else if (active && !alreadySeen) {
			// Show shortly after load so decorations render first
			setTimeout(openModal, 400);
		} else {
			console.log('[Christmas] Modal not opened (active:', active, 'alreadySeen:', alreadySeen, ')');
		}
	} catch (e) {
		console.warn('Christmas modal init failed', e);
	}
})();

// Enchantment definitions for modal display
const ENCHANTMENTS = [
	{ id: 'swift_1', name: 'Swift I', tier: 1, cost: 50, description: '+2% Coins per Second' },
	{ id: 'lucky_1', name: 'Lucky I', tier: 1, cost: 50, description: '3% chance to double coins on sells' },
	{ id: 'strong_1', name: 'Strong I', tier: 1, cost: 50, description: 'Sell Pets +5% coins' },
	{ id: 'resilient_1', name: 'Resilient I', tier: 1, cost: 50, description: 'Sell Fruits +5% coins' },
	{ id: 'wealthy_1', name: 'Wealthy I', tier: 1, cost: 50, description: '+10% to all coin gains' },
	{ id: 'scavenger_1', name: 'Scavenger I', tier: 1, cost: 50, description: 'Capsule price -5%' },
	{ id: 'efficient_1', name: 'Efficient I', tier: 1, cost: 50, description: 'Pet roll price -5%' },
	{ id: 'durable_1', name: 'Durable I', tier: 1, cost: 50, description: '+10% Coins per Second' },
	{ id: 'critical_1', name: 'Critical I', tier: 1, cost: 50, description: '+5% extra double-sell chance' },
	{ id: 'vampiric_1', name: 'Vampiric I', tier: 1, cost: 50, description: 'Refund 2% of roll/capsule costs' },
	{ id: 'legendary_1', name: 'Legendary I', tier: 1, cost: 75, description: '+5% all coin gains & CPS; -5% roll/capsule cost; +2% double-sell chance' },
	{ id: 'ultimate_1', name: 'Ultimate I', tier: 1, cost: 75, description: '+2% all coin gains; -2% roll/capsule cost; +2% double-sell chance' },
	{ id: 'swift_2', name: 'Swift II', tier: 2, cost: 150, description: '+5% Coins per Second' },
	{ id: 'lucky_2', name: 'Lucky II', tier: 2, cost: 150, description: '8% chance to double coins on sells' },
	{ id: 'strong_2', name: 'Strong II', tier: 2, cost: 150, description: 'Sell Pets +12% coins' },
	{ id: 'resilient_2', name: 'Resilient II', tier: 2, cost: 150, description: 'Sell Fruits +12% coins' },
	{ id: 'wealthy_2', name: 'Wealthy II', tier: 2, cost: 150, description: '+25% to all coin gains' },
	{ id: 'scavenger_2', name: 'Scavenger II', tier: 2, cost: 150, description: 'Capsule price -12%' },
	{ id: 'efficient_2', name: 'Efficient II', tier: 2, cost: 150, description: 'Pet roll price -12%' },
	{ id: 'durable_2', name: 'Durable II', tier: 2, cost: 150, description: '+25% Coins per Second' },
	{ id: 'critical_2', name: 'Critical II', tier: 2, cost: 150, description: '+10% extra double-sell chance' },
	{ id: 'vampiric_2', name: 'Vampiric II', tier: 2, cost: 150, description: 'Refund 5% of roll/capsule costs' },
	{ id: 'swift_3', name: 'Swift III', tier: 3, cost: 400, description: '+10% Coins per Second' },
	{ id: 'lucky_3', name: 'Lucky III', tier: 3, cost: 400, description: '15% chance to double coins on sells' },
	{ id: 'strong_3', name: 'Strong III', tier: 3, cost: 400, description: 'Sell Pets +25% coins' },
	{ id: 'resilient_3', name: 'Resilient III', tier: 3, cost: 400, description: 'Sell Fruits +25% coins' },
	{ id: 'wealthy_3', name: 'Wealthy III', tier: 3, cost: 400, description: '+50% to all coin gains' },
	{ id: 'scavenger_3', name: 'Scavenger III', tier: 3, cost: 400, description: 'Capsule price -20%' },
	{ id: 'efficient_3', name: 'Efficient III', tier: 3, cost: 400, description: 'Pet roll price -20%' },
	{ id: 'durable_3', name: 'Durable III', tier: 3, cost: 400, description: '+50% Coins per Second' },
	{ id: 'critical_3', name: 'Critical III', tier: 3, cost: 400, description: '+20% extra double-sell chance' },
	{ id: 'vampiric_3', name: 'Vampiric III', tier: 3, cost: 400, description: 'Refund 12% of roll/capsule costs' },
	{ id: 'legendary_3', name: 'Legendary III', tier: 3, cost: 500, description: '+10% all coin gains & CPS; -10% roll/capsule cost; +5% double-sell chance' },
	{ id: 'ultimate_3', name: 'Ultimate III', tier: 3, cost: 500, description: '+5% all coin gains; -5% roll/capsule cost; +5% double-sell chance' },
	{ id: 'mage_1', name: 'Mage I', tier: 1, cost: 50, description: '+25% EP generation (Suspicious Creature only)', exclusiveTo: 'pet_sp_1' },
	{ id: 'mage_2', name: 'Mage II', tier: 2, cost: 150, description: '+50% EP generation (Suspicious Creature only)', exclusiveTo: 'pet_sp_1' },
	{ id: 'mage_3', name: 'Mage III', tier: 3, cost: 400, description: '+100% EP generation (Suspicious Creature only)', exclusiveTo: 'pet_sp_1' }
	
];

// Configure rarity of enchant tiers (relative weights). Higher means more common.
// Goal: Tier 2 and 3 should be rarer than Tier 1.
const ENCHANT_TIER_WEIGHTS = {
	1: 1.0,   // Tier 1 baseline
	2: 0.4,   // Tier 2 ~2.5x rarer than T1
	3: 0.15   // Tier 3 ~6.6x rarer than T1
};

// Annotate enchantments with a weight property based on tier so they can be used
// with the generic weightedPick() selector.
ENCHANTMENTS.forEach(e => { e.weight = ENCHANT_TIER_WEIGHTS[e.tier] ?? 1.0; });

// Helper to roll an enchantment using the tier weights above.
function rollEnchantment(){
	return weightedPick(ENCHANTMENTS);
}

// Data model: pets with rarities and weights
const PETS = [
	{ id: 'pet_c_1', name: 'Dirt Fox', rarity: 'common', weight: 50, value: 20 },
	{ id: 'pet_c_2', name: 'Dirt Finch', rarity: 'common', weight: 50, value: 20 },
	{ id: 'pet_c_3', name: 'Dirt Turtle', rarity: 'common', weight: 50, value: 25 },

	{ id: 'pet_r_1', name: 'Dusk Fox', rarity: 'rare', weight: 25, value: 150 },
	{ id: 'pet_r_2', name: 'Aero Lynx', rarity: 'rare', weight: 25, value: 160 },

	{ id: 'pet_e_1', name: 'Nebula Kirin', rarity: 'epic', weight: 10, value: 800 },
	{ id: 'pet_u_1', name: 'Singularity Phoenix', rarity: 'unique', weight: 0.005, value: 10000000 },
	{ id: 'pet_u_2', name: 'Timekeeper Dragon', rarity: 'unique', weight: 0.005, value: 10000000 },
	{ id: 'pet_sp_1', name: 'Suspicious Creature', rarity: 'special', weight: 1, value: 1000 },
	{ id: 'pet_sp_2', name: 'Weeping Spirit', rarity: 'special', weight: 1, value: 1200 },
	{ id: 'pet_l_1', name: 'Infinity Golem', rarity: 'legendary', weight: 0.5, value: 1200 },
	{ id: 'pet_s_1', name: 'Nightmare Skeleton', rarity: 'spooky', weight: 0.3, value: 2500 },
	{ id: 'pet_ch_1', name: 'Chroma Beast', rarity: 'chromatic', weight: 0.25, value: 5000 },
	{ id: 'pet_s_2', name: 'Spooky Ghost', rarity: 'spooky', weight: 0.3, value: 2200 },
	{ id: 'pet_f_1', name: 'Festive Reindeer', rarity: 'festive', weight: 0.3, value: 2800 },
	{ id: 'pet_f_2', name: 'Gingerbread Man', rarity: 'festive', weight: 0.3, value: 2500 },
	{ id: 'pet_f_3', name: 'Santa', rarity: 'festive', weight: 0.2, value: 3000 },
	{ id: 'pet_u_3', name: 'Max Verstappen', rarity: 'unique', weight: 0.005, value: 10000000 },
	{ id: 'pet_g_1', name: 'Celestial Archon', rarity: 'godly', weight: 0.0005, value: 50000000 }
];

// Prices
const PRICE_SINGLE = 100;
const PRICE_TEN = 900;

// Inventory limits
const BASE_INVENTORY = 20;
function getMaxInventory(){
	return BASE_INVENTORY + (state.bonusInventorySlots || 0);
}

// Gift code system: maps 16-character codes to rewards
const GIFT_CODES = { 
	"fzsghnt6d675xv8w": { pets: { 'pet_ch_1': 10, 'pet_l_1':  6, 'pet_s_2': 5, 'pet_s_1': 3, 'pet_u_2': 1}, fruits: { 'fruit_l_1': 82, 'fruit_l_2': 75, 'fruit_l_3': 64, 'fruit_ch_1': 55, 'fruit_ch_2': 46, 'fruit_u_1': 2 } },
};

// Config: show admin button and starting coins
const SHOW_ADMIN_BUTTON = false; // set to false to hide admin button
const START_WITH_MILLION = false; // if true, default starting coins = 1,000,000 when no save exists

// Capsule prices for fruits
const CAP_PRICE_SINGLE = 20;
const CAP_PRICE_TEN = 180;

// Enchanting/EP tuning: make enchanting effectively more expensive by slowing EP income
const EP_GAIN_SINGLE_MIN = 1;
const EP_GAIN_SINGLE_MAX = 1; // was up to 3
const EP_GAIN_TEN_MIN = 5;
const EP_GAIN_TEN_MAX = 10; // was 10-20
const EP_PER_SEC_PER_SPECIAL = 0.5; // was 1.0 per special pet per second

// Halloween window: spooky items are available until Nov 1 of the current year (exclusive)
const HALLOWEEN_END = (function(){ const y = new Date().getFullYear(); return new Date(y, 10, 1).getTime(); })();
const THANKSGIVING_END = (function(){ const y = new Date().getFullYear(); return new Date(y, 11, 1).getTime(); })();
const CHRISTMAS_END = (function(){ const y = new Date().getFullYear(); return new Date(y + 1, 0, 1).getTime(); })(); // Jan 1 next year

// FRUITS: capsule pool
const FRUITS = [
	{ id: 'fruit_c_1', name: 'Sandfruit', rarity: 'common', weight: 50, value: 5 },
	{ id: 'fruit_c_2', name: 'Fireberry', rarity: 'common', weight: 50, value: 5 },
	{ id: 'fruit_r_1', name: 'Golden Apple', rarity: 'rare', weight: 35, value: 30 },
	{ id: 'fruit_e_1', name: 'Starfruit', rarity: 'epic', weight: 10, value: 150 },
	{ id: 'fruit_l_1', name: 'Eternal Mango', rarity: 'legendary', weight: 0.5, value: 200 },
	{id: 'fruit_c_3', name: 'Dirtfruit', rarity: 'common', weight: 50, value: 5},
	{id: 'fruit_c_4', name: 'Watermelon', rarity: 'common', weight: 50, value: 5},
	{id: 'fruit_ch_1', name: 'Chromafruit', rarity: 'chromatic', weight: 0.25, value: 1200}
	,{ id: 'fruit_r_2', name: 'Lunar Melon', rarity: 'rare', weight: 35, value: 30 }
	,{ id: 'fruit_e_2', name: 'Solar Melon', rarity: 'epic', weight: 10, value: 150 }
	,{ id: 'fruit_l_2', name: 'Mythic Pineapple', rarity: 'legendary', weight: 0.5, value: 200 }
	,{ id: 'fruit_ch_2', name: 'Positive Potato', rarity: 'chromatic',  weight: 0.25, value: 1200 }
	,{ id: 'fruit_l_3', name: 'Negative Potato', rarity: 'legendary', weight: 0.5, value: 500 }
	,{ id: 'fruit_u_1', name: 'Aurora Berry', rarity: 'unique', weight: 0.005, value: 60000000 }
	,{ id: 'fruit_u_2', name: 'Cookiefruit', rarity: 'unique', weight: 0.005, value: 60000000 }
	,	{ id: 'fruit_s_1', name: 'Cursed Pumpkin', rarity: 'spooky', weight: 0.3, value: 800 }
	,	{ id: 'fruit_f_1', name: 'Candy Cane', rarity: 'festive', weight: 0.3, value: 850 }
	,	{ id: 'fruit_f_2', name: 'Christmas Cookie', rarity: 'festive', weight: 0.3, value: 900 }
	,{ id: 'fruit_g_1', name: 'Omnifruit', rarity: 'godly', weight: 0.0005, value: 100000000 }
	




];

// State
let state = {
	coins: 2000,
	enchantPoints: 0,
	inventory: {}, // pets id -> count
	fruits: {}, // fruits id -> count
	petEnchantments: {}, // pet enchantments
	petNames: {}, // custom pet names { petId_index: 'name' }
	potionActive: false,
	potionEndsAt: 0,
	luckStacks: 0,
	christmasActive: false,
	christmasEndsAt: 0,
	bennyActive: false,
	bennyEndsAt: 0,
	bonusInventorySlots: 0, // extra slots from Slot Machine purchases
	redeemedGiftCodes: [], // track used gift codes
	petRerollsUsed: {}, // track pet enchant rerolls { 	petId_index: count }
	tears: 0, // new currency for brewing
	potionInventory: [] // brewed potions stored for later use
};

// Rarity ranks for sell confirmations (legendary or higher triggers prompt)
const RARITY_RANK = {
	common: 1,
	rare: 2,
	epic: 3,
	special: 4,
	legendary: 5,
	festive: 6,
	spooky: 6,
	chromatic: 7,
	unique: 8,
	godly: 9
};

// DOM - these will be initialized after DOMContentLoaded
let coinsEl, tearsDisplayMainEl, cpsEl, epDisplayEl, epsEl, luckMultiplierEl;
let singleBtn, tenBtn, resultArea, inventoryList, clearInv;
let inventoryListFruits, clearFruits, capSingle, capTen, capsuleResultArea;

// Persistence
const STORAGE_KEY = 'btf_state_v1';
const STORAGE_HASH_KEY = STORAGE_KEY + '_hash';

// Build a deterministic JSON string from an object (keys sorted),
// so the same logical state yields the same string across runs.
function stableStringify(value){
	if(value === null || typeof value !== 'object'){
		return JSON.stringify(value);
	}
	if(Array.isArray(value)){
		return '[' + value.map(v => stableStringify(v)).join(',') + ']';
	}
	const keys = Object.keys(value).sort();
	const parts = keys.map(k => JSON.stringify(k) + ':' + stableStringify(value[k]));
	return '{' + parts.join(',') + '}';
}

// Lightweight 64-bit FNV-1a hash (BigInt) -> hex string
function fnv1a64(str){
	let h = 0xcbf29ce484222325n; // FNV offset basis
	const prime = 0x100000001b3n; // FNV prime
	for(let i=0;i<str.length;i++){
		h ^= BigInt(str.charCodeAt(i) & 0xff);
		h = (h * prime) & 0xffffffffffffffffn; // keep 64-bit
	}
	let hex = h.toString(16);
	while(hex.length < 16) hex = '0' + hex;
	return hex;
}

// Extract only meaningful state to hash (avoid cosmetic/ephemeral fields)
function snapshotMeaningfulState(s){
	return {
		coins: s.coins || 0,
		enchantPoints: s.enchantPoints || 0,
		inventory: s.inventory || {},
		fruits: s.fruits || {},
		petEnchantments: s.petEnchantments || {},
		petNames: s.petNames || {},
		bonusInventorySlots: s.bonusInventorySlots || 0,
		redeemedGiftCodes: s.redeemedGiftCodes || [],
		petRerollsUsed: s.petRerollsUsed || {},
		tears: s.tears || 0,
		potionInventory: Array.isArray(s.potionInventory)? s.potionInventory.slice(0,50) : []
	};
}

function computeStateHash(s){
	const snap = snapshotMeaningfulState(s);
	const str = stableStringify(snap);
	return fnv1a64(str);
}

// Server state management
function saveStateToServer(stateData) {
	if (typeof window.gameSocket !== 'undefined' && window.isServerConnected()) {
		window.gameSocket.emit('saveState', stateData);
		console.log('[Server] State sent to server');
	} else {
		console.warn('[Server] Not connected, using localStorage fallback');
	}
}

function loadState(){
	// First, try to load from localStorage (fallback/initial)
	try{
		// Migrate from previous storage key if present
		if(!localStorage.getItem(STORAGE_KEY)){
			const OLD_KEYS = ['mini_gacha_state_v1'];
			for(const oldKey of OLD_KEYS){
				const oldRaw = localStorage.getItem(oldKey);
				if(oldRaw){
					try{ localStorage.setItem(STORAGE_KEY, oldRaw); }catch(e){ console.warn(e); }
					const oldHash = localStorage.getItem(oldKey + '_hash');
					if(oldHash){
						try{ localStorage.setItem(STORAGE_HASH_KEY, oldHash); }catch(e){ console.warn(e); }
					}
					break;
				}
			}
		}

		const raw = localStorage.getItem(STORAGE_KEY);
		const storedHash = localStorage.getItem(STORAGE_HASH_KEY);
		if(raw){
			const parsed = JSON.parse(raw);
			// Track which newer keys were absent in the persisted JSON for schema upgrade tolerance
			const hadRerollsKey = Object.prototype.hasOwnProperty.call(parsed,'petRerollsUsed');
			const hadRedeemedCodesKey = Object.prototype.hasOwnProperty.call(parsed,'redeemedGiftCodes');
			const hadTearsKey = Object.prototype.hasOwnProperty.call(parsed,'tears');
			const hadPotionInventoryKey = Object.prototype.hasOwnProperty.call(parsed,'potionInventory');
			// merge with defaults to ensure keys exist (older saves may miss fields)
			state = {
				coins: parsed.coins ?? (START_WITH_MILLION ? 1000000 : 2000),
				enchantPoints: parsed.enchantPoints ?? 0,
				inventory: parsed.inventory ?? {},
				fruits: parsed.fruits ?? {},
				petEnchantments: parsed.petEnchantments ?? {},
				petNames: parsed.petNames ?? {},
				petRerollsUsed: parsed.petRerollsUsed ?? {},
				potionActive: parsed.potionActive ?? false,
				potionEndsAt: parsed.potionEndsAt ?? 0,
				luckStacks: parsed.luckStacks ?? 0,
				christmasActive: parsed.christmasActive ?? false,
				christmasEndsAt: parsed.christmasEndsAt ?? 0,
				bennyActive: parsed.bennyActive ?? false,
				bennyEndsAt: parsed.bennyEndsAt ?? 0,
				blessingActive: parsed.blessingActive ?? false,
				blessingEndsAt: parsed.blessingEndsAt ?? 0,
				bonusInventorySlots: parsed.bonusInventorySlots ?? 0,
				redeemedGiftCodes: parsed.redeemedGiftCodes ?? [],
				tears: parsed.tears ?? 0,
				potionInventory: parsed.potionInventory ?? []
			};

			// Verify integrity if a hash exists; if not, backfill one for legacy saves
			const recalculated = computeStateHash(state);
			if(storedHash && storedHash !== recalculated){
				// If mismatch is solely due to newly introduced keys (schema evolution), upgrade silently
				if(!hadRerollsKey || !hadRedeemedCodesKey || !hadTearsKey || !hadPotionInventoryKey){
					console.info('Save hash mismatch due to schema upgrade; backfilling new fields without reset.');
					try{ localStorage.setItem(STORAGE_HASH_KEY, recalculated); }catch(e){ console.warn(e); }
				} else {
					// Tampered or corrupted — reset to safe defaults
					console.warn('Save integrity check failed. Resetting save.');
					localStorage.setItem('btf_save_tampered', '1');
					state = {
						coins: START_WITH_MILLION ? 1000000 : 2000,
						enchantPoints: 0,
						inventory: {},
						fruits: {},
						petEnchantments: {},
						petNames: {},
						petRerollsUsed: {},
						bonusInventorySlots: 0,
						redeemedGiftCodes: [],
						tears: 0,
						potionInventory: [],
						christmasActive: false,
						christmasEndsAt: 0
					};
					// Persist a clean save and hash right away
					try{
						localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
						localStorage.setItem(STORAGE_HASH_KEY, computeStateHash(state));
					}catch(e){ console.warn(e); }
				};
			} else if(!storedHash){
				// Legacy save without hash: create one
				try{ localStorage.setItem(STORAGE_HASH_KEY, recalculated); }catch(e){ console.warn(e); }
			}
		} else {
			// No save data found, start fresh
			state = {
				coins: START_WITH_MILLION ? 1000000 : 2000,
				enchantPoints: 0,
				inventory: {},
				fruits: {},
				petEnchantments: {},
				petNames: {},
				petRerollsUsed: {},
				bonusInventorySlots: 0,
				redeemedGiftCodes: [],
				tears: 0,
				potionInventory: []
			};
		}
	}catch(e){ console.warn('load failed', e) }
	// Ensure global reference points to the latest state object AFTER loading
	if (typeof window !== 'undefined') {
		window.state = state;
	}
}

// Load state from server (called by socket event)
window.loadServerState = function(serverState) {
	if (serverState) {
		console.log('[Server] Loading state from server');
		state = {
			coins: serverState.coins ?? (START_WITH_MILLION ? 1000000 : 2000),
			enchantPoints: serverState.enchantPoints ?? 0,
			inventory: serverState.inventory ?? {},
			fruits: serverState.fruits ?? {},
			petEnchantments: serverState.petEnchantments ?? {},
			petNames: serverState.petNames ?? {},
			petRerollsUsed: serverState.petRerollsUsed ?? {},
			potionActive: serverState.potionActive ?? false,
			potionEndsAt: serverState.potionEndsAt ?? 0,
			luckStacks: serverState.luckStacks ?? 0,
			christmasActive: serverState.christmasActive ?? false,
			christmasEndsAt: serverState.christmasEndsAt ?? 0,
			bennyActive: serverState.bennyActive ?? false,
			bennyEndsAt: serverState.bennyEndsAt ?? 0,
			blessingActive: serverState.blessingActive ?? false,
			blessingEndsAt: serverState.blessingEndsAt ?? 0,
			bonusInventorySlots: serverState.bonusInventorySlots ?? 0,
			redeemedGiftCodes: serverState.redeemedGiftCodes ?? [],
			tears: serverState.tears ?? 0,
			potionInventory: serverState.potionInventory ?? []
		};
		window.state = state; // Update global reference
		if (typeof updateUI === 'function') {
			updateUI();
		}
	} else {
		console.log('[Server] No saved state on server, using local state');
	}
};

function saveState(){
	try{
		const json = JSON.stringify(state);
		// Save to localStorage as backup
		localStorage.setItem(STORAGE_KEY, json);
		const hash = computeStateHash(state);
		localStorage.setItem(STORAGE_HASH_KEY, hash);
		
		// Also save to server
		saveStateToServer(state);
	}catch(e){ console.warn(e) }
}

// Helpers: weighted pick
function weightedPick(items){
	// Check if luck potion is active
	const potionActive = state.potionActive && state.potionEndsAt > Date.now();
	const christmasBuff = state.christmasActive && state.christmasEndsAt > Date.now();
	const cappedStacks = Math.min(state.luckStacks, 100);
	const multiplier = potionActive ? (1 + cappedStacks * 2) : 1;

	// If current date is past HALLOWEEN_END, exclude spooky items from the pick pool
	const halloweenStillOn = Date.now() < HALLOWEEN_END;
	const christmasStillOn = Date.now() < CHRISTMAS_END;
	const pool = items.filter(i => {
		if (i.rarity === 'spooky' && !halloweenStillOn) return false;
		if (i.rarity === 'festive' && !christmasStillOn) return false;
		return true;
	});
	const finalPool = pool;

	// All rarities can now be obtained multiple times (no unique filter)
	let useItems = pool;


	// Apply luck multiplier: multiply weights of rare items more than common
	// Rarity boost factors - rarer items get bigger multiplier
	const rarityBoost = {
		common: 1,
		rare: 1.003454446,
		epic: 1.008039297,
		special: 1.019653436,
		legendary: 1.025779402,
		spooky: 1.02577,
		chromatic: 1.02671028,
		unique: 1.04888665,
		godly: 1.058950408
	};
	
	const adjustedWeights = useItems.map(i => {
		// Base weight boosted by rarity when luck is active
		let w = i.weight;
		if(potionActive) {
			const boost = rarityBoost[i.rarity] || 1;
			w = i.weight * boost**multiplier;
		}
		// Christmas Spirit Potion: make festive items more common
		if (christmasBuff && i.rarity === 'festive') {
			w *= 3; // 3x more likely while potion is active
		}
		return w;
	});

	const total = adjustedWeights.reduce((s,w)=>s+w, 0);
	let r = Math.random()*total;
	for(let idx=0; idx<useItems.length; idx++){
		const it = useItems[idx];
		const w = adjustedWeights[idx];
		if(r < w) return it;
		r -= w;
	}
	return useItems[useItems.length-1];
}

// Coins-per-second mapping by rarity
const RARITY_CPS = {
	common: 1,
	rare: 3,
	epic: 8,
	special: 12,
	legendary: 20,
	festive: 30,
	spooky: 30,
	chromatic: 80,
	unique: 120,
	godly: 200,
};

// Aggregate coin-related effects from pet enchantments
function computeEnchantEffects(){
	const effects = {
		coinGainMult: 1,     // applies to all coin gains
		cpsMult: 1,          // passive income multiplier
		sellPetMult: 1,      // pet sell value multiplier
		sellFruitMult: 1,    // fruit sell value multiplier
		rollDiscount: 0,     // percent off pet roll prices
		capDiscount: 0,      // percent off capsule prices
		doubleSellChance: 0, // chance to double coins on sells
		spendRefundPercent: 0, // percent refund on roll/capsule spend
		epGenerationMult: 1  // EP generation multiplier for special pets
	};
	const ench = state.petEnchantments || {};
	// Only process enchantments for pets that still exist in inventory
	for(const [petKey, list] of Object.entries(ench)){
		// Extract pet ID from key (format: petId_index)
		const petId = petKey.split('_').slice(0, -1).join('_');
		const instanceIndex = parseInt(petKey.split('_').pop());
		// Skip if this pet type is no longer in inventory or if instance index exceeds current count
		if(!state.inventory[petId] || instanceIndex >= state.inventory[petId]) continue;
		
		for(const id of list){
			switch(id){
				case 'wealthy_1': effects.coinGainMult *= 1.10; break;
				case 'wealthy_2': effects.coinGainMult *= 1.25; break;
				case 'wealthy_3': effects.coinGainMult *= 1.50; break;

				case 'swift_1': effects.cpsMult *= 1.02; break;
				case 'swift_2': effects.cpsMult *= 1.05; break;
				case 'swift_3': effects.cpsMult *= 1.10; break;

				case 'durable_1': effects.cpsMult *= 1.10; break;
				case 'durable_2': effects.cpsMult *= 1.25; break;
				case 'durable_3': effects.cpsMult *= 1.50; break;

				case 'strong_1': effects.sellPetMult *= 1.05; break;
				case 'strong_2': effects.sellPetMult *= 1.12; break;
				case 'strong_3': effects.sellPetMult *= 1.25; break;

				case 'resilient_1': effects.sellFruitMult *= 1.05; break;
				case 'resilient_2': effects.sellFruitMult *= 1.12; break;
				case 'resilient_3': effects.sellFruitMult *= 1.25; break;

				case 'efficient_1': effects.rollDiscount += 0.05; break;
				case 'efficient_2': effects.rollDiscount += 0.12; break;
				case 'efficient_3': effects.rollDiscount += 0.20; break;

				case 'scavenger_1': effects.capDiscount += 0.05; break;
				case 'scavenger_2': effects.capDiscount += 0.12; break;
				case 'scavenger_3': effects.capDiscount += 0.20; break;

				case 'lucky_1': effects.doubleSellChance += 0.03; break;
				case 'lucky_2': effects.doubleSellChance += 0.08; break;
				case 'lucky_3': effects.doubleSellChance += 0.15; break;

				case 'critical_2': effects.doubleSellChance += 0.10; break;
				case 'critical_3': effects.doubleSellChance += 0.20; break;

				case 'vampiric_2': effects.spendRefundPercent += 0.05; break;
				case 'vampiric_3': effects.spendRefundPercent += 0.12; break;

				case 'legendary_3':
					effects.coinGainMult *= 1.10;
					effects.cpsMult *= 1.10;
					effects.sellPetMult *= 1.10;
					effects.sellFruitMult *= 1.10;
					effects.rollDiscount += 0.10;
					effects.capDiscount += 0.10;
					effects.doubleSellChance += 0.05;
					effects.spendRefundPercent += 0.05;
					break;

				case 'ultimate_3':
					effects.coinGainMult *= 1.05;
					effects.rollDiscount += 0.05;
					effects.capDiscount += 0.05;
					effects.doubleSellChance += 0.05;
					break;

				case 'mage_1': effects.epGenerationMult *= 1.25; break;
				case 'mage_2': effects.epGenerationMult *= 1.50; break;
				case 'mage_3': effects.epGenerationMult *= 2.00; break;

				default:
					// other combat-ish enchants are cosmetic here
			}
		}
	}
	// caps
	effects.rollDiscount = Math.min(0.5, effects.rollDiscount);
	effects.capDiscount = Math.min(0.5, effects.capDiscount);
	effects.doubleSellChance = Math.min(0.9, effects.doubleSellChance);
	return effects;
}

function getCurrentCosts(){
	const ef = computeEnchantEffects();
	return {
		priceSingle: Math.max(1, Math.ceil(PRICE_SINGLE * (1 - ef.rollDiscount))),
		priceTen: Math.max(1, Math.ceil(PRICE_TEN * (1 - ef.rollDiscount))),
		capSingle: Math.max(1, Math.ceil(CAP_PRICE_SINGLE * (1 - ef.capDiscount))),
		capTen: Math.max(1, Math.ceil(CAP_PRICE_TEN * (1 - ef.capDiscount))),
		_effects: ef
	};
}

function computeTotalCPS(){
	let total = 0;
	for(const [id,count] of Object.entries(state.inventory)){
		const p = PETS.find(x=>x.id===id);
		if(!p) continue;
		const per = RARITY_CPS[p.rarity] || 0;
		total += per * count;
	}
	// Apply enchantment CPS multiplier
	const ef = computeEnchantEffects();
	total = Math.floor(total * ef.cpsMult);

	// Apply Happy Powder (+10% CPS) if active
	if(state.bennyActive && state.bennyEndsAt > Date.now()){
		return Math.floor(total * 1.1);
	}
	return total;
}

// Pet roll functions
function rollOnce(){ return weightedPick(PETS); }
function rollTen(){
	const results = [];
	for(let i=0;i<9;i++) results.push(rollOnce());
	const hasRareOrBetter = results.some(r=> ['rare','legendary','epic','chromatic'].includes(r.rarity));
	if(hasRareOrBetter){
		results.push(rollOnce());
	}else{
		// include spooky in the guaranteed pool during Halloween window
		const spookyActive = Date.now() < HALLOWEEN_END;
		const rarePool = PETS.filter(p=>['rare','legendary','epic','special','chromatic'].concat(spookyActive?['spooky']:[]).includes(p.rarity));
		results.push(weightedPick(rarePool));
	}
	return results;
}

// Fruit roll functions
function rollFruitOnce(){ return weightedPick(FRUITS); }
function rollFruitTen(){
	const results = [];
	for(let i=0;i<10;i++) results.push(rollFruitOnce());
	return results;
}

// UI
function updateUI(){
	if(coinsEl) coinsEl.textContent = state.coins;
	if(tearsDisplayMainEl) tearsDisplayMainEl.textContent = Math.floor(state.tears||0);
	// update CPS display if element exists
	if(cpsEl){
		const totalCps = computeTotalCPS();
		cpsEl.textContent = `(+${totalCps}/s)`;
	}
    
    // Update EP display
    if(epDisplayEl){
        epDisplayEl.textContent = state.enchantPoints;
    }
    
	// Update EPS display (reflect tuned EP rate)
	if(epsEl){
		let specialCount = 0;
		for(const [id, count] of Object.entries(state.inventory)){
			const p = PETS.find(x=>x.id===id);
			if(p && p.rarity === 'special') specialCount += count;
		}
		const ef = computeEnchantEffects();
		const epsVal = specialCount * EP_PER_SEC_PER_SPECIAL * ef.epGenerationMult;
		const fmt = Number.isInteger(epsVal) ? epsVal : epsVal.toFixed(1);
		epsEl.textContent = `(+${fmt}/s)`;
	}
    
    // Update luck multiplier
    if(luckMultiplierEl){
        const isActive = state.potionActive && state.potionEndsAt > Date.now();
        const cappedStacks = Math.min(state.luckStacks, 100);
        luckMultiplierEl.textContent = isActive ? `${1 + cappedStacks * 2}x` : "1x";
    }

	// Update button price labels based on enchantment discounts
	if(singleBtn && tenBtn && capSingle && capTen){
		const costs = getCurrentCosts();
		singleBtn.textContent = `Open x1 (${costs.priceSingle}c)`;
		tenBtn.textContent = `Open x10 (${costs.priceTen}c)`;
		capSingle.textContent = `Open Capsule x1 (${costs.capSingle}c)`;
		capTen.textContent = `Open Capsule x10 (${costs.capTen}c)`;
	}

	// Pets inventory
	if(inventoryList){
		inventoryList.innerHTML = '';
		const entries = Object.entries(state.inventory).sort((a,b)=>b[1]-a[1]);
	if(entries.length===0){
		inventoryList.innerHTML = '<div style="color:var(--muted)">No pets yet. Roll to get some!</div>';
	} else {
			for(const [id,count] of entries){
				const p = PETS.find(x=>x.id===id) || {name:id, rarity:'common', value:5};
				const el = document.createElement('div');
				el.className = 'inventory-item';
				el.style.cursor = 'pointer';
				// apply benny glow to pet inventory items only
				if(state.bennyActive && state.bennyEndsAt > Date.now()){
					el.classList.add('benny-glow');
				}
				// Add rarity shimmer classes
				if(p.rarity === 'chromatic') el.classList.add('chromatic');
				else if(p.rarity === 'spooky') el.classList.add('spooky');
				else if(p.rarity === 'festive') el.classList.add('festive');
				else if(p.rarity === 'unique') el.classList.add('unique');
				else if(p.rarity === 'godly') el.classList.add('godly');
				const badge = document.createElement('div');
				badge.className = `badge ${p.rarity}`;
				badge.textContent = p.rarity.toUpperCase();
				const name = document.createElement('div');
				name.innerHTML = `<div style="font-weight:700">${p.name}</div><div style="color:var(--muted);font-size:12px">x${count} • Sell: ${p.value}c</div>`;

				// sell buttons
				const sell = document.createElement('button');
				sell.className = 'sell-btn small';
				sell.textContent = 'Sell x1';
				sell.addEventListener('click', async (e)=>{ e.stopPropagation(); await sellPet(id,1); });
				const sellAll = document.createElement('button');
				sellAll.className = 'sell-btn small';
				sellAll.textContent = 'Sell All';
				sellAll.addEventListener('click', async (e)=>{ e.stopPropagation(); await sellPet(id, state.inventory[id]); });
				const right = document.createElement('div');
				right.style.marginLeft = 'auto';
				right.appendChild(sell);
				right.appendChild(sellAll);

				el.appendChild(badge);
				el.appendChild(name);
				el.appendChild(right);
				
				// Click to select which instance to view
				el.addEventListener('click', ()=> showPetSelector(id, count));
				
				inventoryList.appendChild(el);
			}
		}
	}

	// Fruits inventory
	if(inventoryListFruits){
		inventoryListFruits.innerHTML = '';
		const fentries = Object.entries(state.fruits).sort((a,b)=>b[1]-a[1]);
	if(fentries.length===0){
		inventoryListFruits.innerHTML = '<div style="color:var(--muted)">No fruits yet. Roll capsules to collect fruits.</div>';
	} else {
		for(const [id,count] of fentries){
			const f = FRUITS.find(x=>x.id===id) || {name:id, rarity:'common', value:1};
			const el = document.createElement('div');
			el.className = 'inventory-item';
			// apply benny glow to pets only
			if(state.bennyActive && state.bennyEndsAt > Date.now()){
				el.classList.add('benny-glow');
			}
			// apply benny glow if active
			if(state.bennyActive && state.bennyEndsAt > Date.now()){
				el.classList.add('benny-glow');
			}
			// Add rarity shimmer classes
			if(f.rarity === 'chromatic') el.classList.add('chromatic');
			else if(f.rarity === 'spooky') el.classList.add('spooky');
			else if(f.rarity === 'festive') el.classList.add('festive');
			else if(f.rarity === 'unique') el.classList.add('unique');
			else if(f.rarity === 'godly') el.classList.add('godly');
			const badge = document.createElement('div');
			badge.className = `badge ${f.rarity}`;
			badge.textContent = f.rarity.toUpperCase();
			const name = document.createElement('div');
			name.innerHTML = `<div style="font-weight:700">${f.name}</div><div style="color:var(--muted);font-size:12px">x${count} • Sell: ${f.value}c</div>`;
			const sell = document.createElement('button');
			sell.className = 'sell-btn small';
			sell.textContent = 'Sell x1';
			sell.addEventListener('click', async ()=>{ await sellFruit(id,1); });
			const sellAll = document.createElement('button');
			sellAll.className = 'sell-btn small';
			sellAll.textContent = 'Sell All';
			sellAll.addEventListener('click', async ()=>{ await sellFruit(id, state.fruits[id]); });
			const right = document.createElement('div');
			right.style.marginLeft = 'auto';
			right.appendChild(sell);
			right.appendChild(sellAll);
			el.appendChild(badge);
			el.appendChild(name);
			el.appendChild(right);
			inventoryListFruits.appendChild(el);
		}
	}
	}
}

// Animation helper: run a pre-roll animation then reveal items
function animateRoll(makeItemsCallback, revealCallback){
	// disable controls (only if they exist)
	if(singleBtn) singleBtn.disabled = true;
	if(tenBtn) tenBtn.disabled = true;
	if(capSingle) capSingle.disabled = true;
	if(capTen) capTen.disabled = true;
	if(singleBtn) singleBtn.classList.add('anim-pulse');
	if(tenBtn) tenBtn.classList.add('anim-pulse');
	if(resultArea) resultArea.classList.add('animating');
	if(capsuleResultArea) capsuleResultArea.classList.add('animating');

	// small pre-roll delay
	setTimeout(()=>{
		// build items (the callback should return an array of item objects)
		const items = makeItemsCallback();
		// reveal them one by one with pop animation
		const revealDelay = 160;
		// clear current area
		if(revealCallback === showResults) resultArea.innerHTML = '';
		if(revealCallback === showCapsuleResults) capsuleResultArea.innerHTML = '';
		items.forEach((it, idx)=>{
			setTimeout(()=>{
				// create a minimal card for animation then pass to reveal callback
				const card = document.createElement('div');
				card.className = `result-card rarity-${it.rarity} pop`;
				// only apply Benny glow on pet reveals (showResults), not capsule/fruit reveals
				if(revealCallback === showResults && state.bennyActive && state.bennyEndsAt > Date.now()){
					card.classList.add('benny-glow');
				}
				const ic = document.createElement('div'); ic.style.fontSize='28px';
		// placeholder icons reused from showResults
		if(it.rarity==='godly'){ ic.textContent='⚡'; card.classList.add('godly'); }
		else if(it.rarity==='spooky'){ ic.textContent='🎃'; card.classList.add('spooky'); }
		else if(it.rarity==='festive'){ ic.textContent='🎄'; card.classList.add('festive'); }
		else if(it.rarity==='unique'){ ic.textContent='👑'; card.classList.add('unique'); }
		else if(it.rarity==='epic'){ ic.textContent='✨'; card.classList.add('epic'); }
		else if(it.rarity==='special'){ ic.textContent='👁️'; card.classList.add('special'); }
		else if(it.rarity==='chromatic'){ ic.textContent='🌈'; card.classList.add('chromatic'); }
		else if(it.rarity==='legendary'){ ic.textContent='🔱'; }
		else if(it.rarity==='rare'){ ic.textContent='⭐'; }
		else { ic.textContent='●'; }
				const nm = document.createElement('div'); nm.className='pet-name'; nm.textContent = it.name;
				card.appendChild(ic); card.appendChild(nm);
				if(revealCallback === showResults) resultArea.appendChild(card);
				if(revealCallback === showCapsuleResults) capsuleResultArea.appendChild(card);
				// small glow
				setTimeout(()=>{ card.classList.add('reveal-glow'); }, 80);
			}, idx*revealDelay);
		});

		// after all revealed, finalize: call revealCallback to add to inventory/state properly
		setTimeout(async ()=>{
			await revealCallback(items);
			// re-enable (only if they exist)
			if(singleBtn) singleBtn.disabled = false;
			if(tenBtn) tenBtn.disabled = false;
			if(capSingle) capSingle.disabled = false;
			if(capTen) capTen.disabled = false;
			if(singleBtn) singleBtn.classList.remove('anim-pulse');
			if(tenBtn) tenBtn.classList.remove('anim-pulse');
			if(resultArea) resultArea.classList.remove('animating');
			if(capsuleResultArea) capsuleResultArea.classList.remove('animating');
		}, items.length*revealDelay + 220);
	}, 220);
}

// Gift code redemption function
function redeemGiftCode(code){
	// Normalize code
	const normalizedCode = code.trim().toUpperCase();
	
	// Validate length
	if(normalizedCode.length !== 16){
		return { success: false, message: "Gift code must be exactly 16 characters." };
	}
	
	// Check if code exists
	if(!GIFT_CODES[normalizedCode]){
		return { success: false, message: "Invalid gift code." };
	}
	
	// Check if already redeemed
	if(state.redeemedGiftCodes && state.redeemedGiftCodes.includes(normalizedCode)){
		return { success: false, message: "This gift code has already been redeemed." };
	}
	
	// Get reward details
	const reward = GIFT_CODES[normalizedCode];
	
	// Grant rewards
	if(reward.coins){
		state.coins = (state.coins || 0) + reward.coins;
	}
	
	if(reward.enchantPoints){
		state.enchantPoints = (state.enchantPoints || 0) + reward.enchantPoints;
	}
	
	if(reward.pet){
		// Add pet(s) to inventory - can be a single pet ID or an array
		const pets = Array.isArray(reward.pet) ? reward.pet : [reward.pet];
		pets.forEach(petId => {
			state.inventory[petId] = (state.inventory[petId] || 0) + 1;
		});
	}
	
	if(reward.item === "luck_potion"){
		// Activate luck potion
		state.potionActive = true;
		state.potionEndsAt = Date.now() + 5 * 60 * 1000; // 5 minutes
		state.luckStacks = Math.min((state.luckStacks || 0) + 1, 100);
	}
	
	// Mark code as redeemed
	if(!state.redeemedGiftCodes) state.redeemedGiftCodes = [];
	state.redeemedGiftCodes.push(normalizedCode);
	
	// Save state
	saveState();
	
	return { 
		success: true, 
		message: reward.description || "Gift code redeemed successfully!" 
	};
}

// Custom alert modal (created dynamically). Returns a Promise that resolves when the user closes it.
function showAlert(message){
	return new Promise((resolve)=>{
		// create backdrop
		const backdrop = document.createElement('div');
		backdrop.style.position = 'fixed';
		backdrop.style.left = '0'; backdrop.style.top = '0'; backdrop.style.right = '0'; backdrop.style.bottom = '0';
		backdrop.style.background = 'rgba(0,0,0,0.45)';
		backdrop.style.display = 'flex';
		backdrop.style.alignItems = 'center';
		backdrop.style.justifyContent = 'center';
		backdrop.style.zIndex = '9999';

		// modal
		const modal = document.createElement('div');
	modal.style.width = 'min(420px, 92%)';
	modal.style.background = 'var(--modal-bg, #1f2937)';
	modal.style.color = 'var(--modal-fg, #fff)';
		modal.style.borderRadius = '10px';
		modal.style.boxShadow = '0 8px 24px rgba(0,0,0,0.35)';
		modal.style.padding = '18px';
		modal.style.display = 'flex';
		modal.style.flexDirection = 'column';
		modal.style.gap = '12px';

	const msg = document.createElement('div');
	msg.style.fontSize = '15px';
	msg.style.lineHeight = '1.4';
	msg.style.color = 'var(--modal-fg, #fff)';
	msg.textContent = message;

		const btnRow = document.createElement('div');
		btnRow.style.display = 'flex';
		btnRow.style.justifyContent = 'flex-end';

		const ok = document.createElement('button');
		ok.textContent = 'OK';
		ok.style.padding = '8px 14px';
		ok.style.borderRadius = '8px';
		ok.style.border = 'none';
		ok.style.cursor = 'pointer';
		ok.style.background = 'var(--accent, #3b82f6)';
		ok.style.color = 'white';

		btnRow.appendChild(ok);
		modal.appendChild(msg);
		modal.appendChild(btnRow);
		backdrop.appendChild(modal);
		document.body.appendChild(backdrop);

		function close(){
			document.body.removeChild(backdrop);
			document.removeEventListener('keydown', onKey);
			resolve();
		}
		function onKey(e){ if(e.key === 'Escape') close(); }
		ok.addEventListener('click', close);
		backdrop.addEventListener('click', (e)=>{ if(e.target===backdrop) close(); });
		document.addEventListener('keydown', onKey);
	});
}

// Custom confirm modal. Returns Promise<boolean> true if OK clicked, false if cancelled/closed.
function showConfirm(message){
	return new Promise((resolve)=>{
		const backdrop = document.createElement('div');
		backdrop.style.position = 'fixed';
		backdrop.style.left = '0'; backdrop.style.top = '0'; backdrop.style.right = '0'; backdrop.style.bottom = '0';
		backdrop.style.background = 'rgba(0,0,0,0.45)';
		backdrop.style.display = 'flex';
		backdrop.style.alignItems = 'center';
		backdrop.style.justifyContent = 'center';
		backdrop.style.zIndex = '9999';

		const modal = document.createElement('div');
	modal.style.width = 'min(520px, 94%)';
	modal.style.background = 'var(--modal-bg, #1f2937)';
	modal.style.color = 'var(--modal-fg, #fff)';
		modal.style.borderRadius = '10px';
		modal.style.boxShadow = '0 8px 24px rgba(0,0,0,0.35)';
		modal.style.padding = '18px';
		modal.style.display = 'flex';
		modal.style.flexDirection = 'column';
		modal.style.gap = '12px';

	const msg = document.createElement('div');
	msg.style.fontSize = '15px';
	msg.style.lineHeight = '1.4';
	msg.style.color = 'var(--modal-fg, #fff)';
	msg.textContent = message;

		const btnRow = document.createElement('div');
		btnRow.style.display = 'flex';
		btnRow.style.justifyContent = 'flex-end';
		btnRow.style.gap = '8px';

	const cancel = document.createElement('button');
	cancel.textContent = 'Cancel';
	cancel.style.padding = '8px 12px';
	cancel.style.borderRadius = '8px';
	cancel.style.border = '1px solid rgba(255,255,255,0.08)';
	cancel.style.cursor = 'pointer';
	cancel.style.color = 'var(--modal-fg, #fff)';
	cancel.style.background = 'transparent';

		const ok = document.createElement('button');
		ok.textContent = 'OK';
		ok.style.padding = '8px 14px';
		ok.style.borderRadius = '8px';
		ok.style.border = 'none';
		ok.style.cursor = 'pointer';
		ok.style.background = 'var(--accent, #3b82f6)';
		ok.style.color = 'white';

		btnRow.appendChild(cancel);
		btnRow.appendChild(ok);
		modal.appendChild(msg);
		modal.appendChild(btnRow);
		backdrop.appendChild(modal);
		document.body.appendChild(backdrop);

		function close(result){
			document.body.removeChild(backdrop);
			document.removeEventListener('keydown', onKey);
			resolve(result);
		}
		function onKey(e){ if(e.key === 'Escape') close(false); }
		cancel.addEventListener('click', ()=>close(false));
		ok.addEventListener('click', ()=>close(true));
		backdrop.addEventListener('click', (e)=>{ if(e.target===backdrop) close(false); });
		document.addEventListener('keydown', onKey);
	});
}

// Helpers: inventory counts
function getPetTotalCount(){
	return Object.values(state.inventory).reduce((s,v)=>s+v,0);
}

async function showResults(items){
	resultArea.innerHTML = '';
	let discarded = 0;
	let available = getMaxInventory() - getPetTotalCount();
	for(const it of items){
		const card = document.createElement('div');
		card.className = `result-card rarity-${it.rarity}`;
		const ic = document.createElement('div');
		ic.style.fontSize = '28px';
		// placeholder icons reused from showResults
		if(it.rarity==='godly'){ ic.textContent='⚡'; card.classList.add('godly'); }
		else if(it.rarity==='chromatic'){ ic.textContent='🌈'; card.classList.add('chromatic'); }
		else if(it.rarity==='spooky'){ ic.textContent='🎃'; card.classList.add('spooky'); }
		else if(it.rarity==='festive'){ ic.textContent='🎄'; card.classList.add('festive'); }
		else if(it.rarity==='unique'){ ic.textContent='👑'; card.classList.add('unique'); }
		else if(it.rarity==='epic'){ ic.textContent='✨'; card.classList.add('epic'); }
		else if(it.rarity==='special'){ ic.textContent='👁️'; card.classList.add('special'); }
		else if(it.rarity==='legendary'){ ic.textContent='🔱'; }
		else if(it.rarity==='rare'){ ic.textContent='⭐'; }
		else { ic.textContent='●'; }
			const el = document.createElement('div');
			el.className = 'inventory-item';
		// add to inventory if space; otherwise mark discarded
		if(available > 0){
			state.inventory[it.id] = (state.inventory[it.id] || 0) + 1;
			available--;
		} else {
			discarded++;
		}
	}
	saveState();
	updateUI();
	if(discarded>0){
		await showAlert(`Inventory full — ${discarded} item(s) were not added. Sell pets to free space or buy BTF+ for an inventory size of 50.`);
	}
}

function showCapsuleResults(items){
	capsuleResultArea.innerHTML = '';
	for(const it of items){
		const card = document.createElement('div');
		card.className = `result-card rarity-${it.rarity}`;
		const ic = document.createElement('div');
		ic.style.fontSize = '28px';
		// icon mapping for fruits
		if(it.rarity==='godly'){
			ic.textContent = '⚡';
			card.classList.add('godly');
		}else if(it.rarity==='chromatic'){
			ic.textContent = '🌈';
			card.classList.add('chromatic');
		}else if(it.rarity==='spooky'){
			ic.textContent = '🎃';
			card.classList.add('spooky');

		}else if(it.rarity==='festive'){
			ic.textContent = '🎄';
			card.classList.add('festive');
		}else if(it.rarity==='unique'){
			ic.textContent = '👑';
			card.classList.add('unique');
		}else if(it.rarity==='epic'){
			ic.textContent = '✨';
			card.classList.add('epic');
		}else if(it.rarity==='legendary'){
			ic.textContent = '🔱';
		}else if(it.rarity==='rare'){
			ic.textContent = '⭐';
		}else{
			ic.textContent = '●';
		}
		const nm = document.createElement('div');
		nm.className = 'pet-name';
		nm.textContent = it.name;
		card.appendChild(ic);
		card.appendChild(nm);
		capsuleResultArea.appendChild(card);
		// add to fruits inventory
		state.fruits[it.id] = (state.fruits[it.id] || 0) + 1;
	}
	saveState();
	updateUI();
}

// Selling
async function sellFruit(id, count){
	const have = state.fruits[id] || 0;
	if(!have) return;
	const sellCount = Math.min(have, count);
	const f = FRUITS.find(x=>x.id===id) || {value:1};
	// Confirm if legendary or higher
	const rank = RARITY_RANK[f.rarity] ?? 0;
	const threshold = RARITY_RANK.legendary;
	if(rank >= threshold){
		const ok = await showConfirm(`Sell ${sellCount} ${f.name}${sellCount>1?'s':''}? This item is ${f.rarity.toUpperCase()}.`);
		if(!ok) return;
	}
	let gained = (f.value || 1) * sellCount;
	const ef = computeEnchantEffects();
	// chance to double coins on sell
	if(Math.random() < ef.doubleSellChance){ gained *= 2; }
	// apply multipliers
	gained = Math.floor(gained * ef.sellFruitMult * ef.coinGainMult);
	state.fruits[id] = have - sellCount;
	if(state.fruits[id] <= 0) delete state.fruits[id];
	state.coins += gained;
	saveState();
	updateUI();
}

// Sell pets - with instance selection for multiples
async function sellPet(id, count){
	const have = state.inventory[id] || 0;
	if(!have) return;
	
	// If selling 1 pet and have multiple, show selection modal
	if(count === 1 && have > 1){
		showSellPetSelector(id);
		return;
	}
	
	const sellCount = Math.min(have, count);
	const p = PETS.find(x=>x.id===id) || {value:1};
	// Confirm if legendary or higher
	const rank = RARITY_RANK[p.rarity] ?? 0;
	const threshold = RARITY_RANK.legendary;
	if(rank >= threshold){
		const ok = await showConfirm(`Sell ${sellCount} ${p.name}${sellCount>1?'s':''}? This pet is ${p.rarity.toUpperCase()}.`);
		if(!ok) return;
	}
	let gained = (p.value || 1) * sellCount;
	const ef = computeEnchantEffects();
	// chance to double coins on sell
	if(Math.random() < ef.doubleSellChance){ gained *= 2; }
	// apply multipliers
	gained = Math.floor(gained * ef.sellPetMult * ef.coinGainMult);
	state.inventory[id] = have - sellCount;
	if(state.inventory[id] <= 0) delete state.inventory[id];
	
	// When selling all, clean up all associated data for this pet ID
	if(state.inventory[id] === undefined || state.inventory[id] <= 0){
		// Remove all enchantments and names for this pet type
		for(let i = 0; i < have; i++){
			const petKey = `${id}_${i}`;
			delete state.petEnchantments[petKey];
			delete state.petNames[petKey];
		}
	}
	
	state.coins += gained;
	saveState();
	updateUI();
}

// Sell a specific pet instance by index
async function sellPetInstance(id, instanceIndex){
	const have = state.inventory[id] || 0;
	if(!have || instanceIndex >= have) return;
	
	const p = PETS.find(x=>x.id===id) || {value:1};
	// Confirm if legendary or higher
	const rank = RARITY_RANK[p.rarity] ?? 0;
	const threshold = RARITY_RANK.legendary;
	if(rank >= threshold){
		const petKey = `${id}_${instanceIndex}`;
		const customName = state.petNames[petKey];
		const displayName = customName || `${p.name} #${instanceIndex + 1}`;
		const ok = await showConfirm(`Sell ${displayName}? This pet is ${p.rarity.toUpperCase()}.`);
		if(!ok) return;
	}
	
	let gained = p.value || 1;
	const ef = computeEnchantEffects();
	// chance to double coins on sell
	if(Math.random() < ef.doubleSellChance){ gained *= 2; }
	// apply multipliers
	gained = Math.floor(gained * ef.sellPetMult * ef.coinGainMult);
	
	// Remove the specific instance data
	const petKey = `${id}_${instanceIndex}`;
	delete state.petEnchantments[petKey];
	delete state.petNames[petKey];
	
	// Shift down all higher-indexed instances for this pet type
	for(let i = instanceIndex + 1; i < have; i++){
		const oldKey = `${id}_${i}`;
		const newKey = `${id}_${i-1}`;
		
		if(state.petEnchantments[oldKey]){
			state.petEnchantments[newKey] = state.petEnchantments[oldKey];
			delete state.petEnchantments[oldKey];
		}
		if(state.petNames[oldKey]){
			state.petNames[newKey] = state.petNames[oldKey];
			delete state.petNames[oldKey];
		}
	}
	
	// Decrement inventory count
	state.inventory[id] = have - 1;
	if(state.inventory[id] <= 0) delete state.inventory[id];
	
	state.coins += gained;
	saveState();
	updateUI();
	
	// Close the sell modal
	const modal = document.getElementById('sellPetModal');
	if(modal) modal.style.display = 'none';
}

// Sell pet selector modal
function showSellPetSelector(petId){
	const have = state.inventory[petId] || 0;
	if(have <= 0) return;
	
	const p = PETS.find(x=>x.id===petId);
	if(!p) return;
	
	const modal = document.getElementById('sellPetModal');
	const titleEl = document.getElementById('sellPetTitle');
	const listEl = document.getElementById('sellPetList');
	
	titleEl.textContent = `Select ${p.name} to Sell`;
	listEl.innerHTML = '';
	
	for(let i = 0; i < have; i++){
		const petKey = `${petId}_${i}`;
		const customName = state.petNames[petKey];
		const enchants = state.petEnchantments[petKey] || [];
		
		const item = document.createElement('div');
		item.className = 'pet-selector-item';
		item.style.cursor = 'pointer';
		item.style.padding = '14px';
		item.style.background = 'var(--glass)';
		item.style.borderRadius = '8px';
		item.style.border = '2px solid rgba(255,255,255,0.08)';
		item.style.transition = 'all 0.2s';
		
		const displayName = customName || `${p.name} #${i + 1}`;
		const cps = RARITY_CPS[p.rarity] || 0;
		let enchantText = '';
		if(enchants.length > 0){
			const enchantNames = enchants.map(eid => {
				const ench = ENCHANTMENTS.find(e => e.id === eid);
				return ench ? ench.name : eid;
			}).join(', ');
			enchantText = `<div style="font-size:12px;color:#a855f7;margin-top:4px">💎 ${enchantNames}</div>`;
		}
		
		item.innerHTML = `
			<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:6px">
				<div style="font-weight:700;font-size:15px">${displayName}</div>
				<div class="badge ${p.rarity}" style="font-size:10px;padding:3px 8px">${p.rarity.toUpperCase()}</div>
			</div>
			<div style="font-size:13px;color:var(--muted);margin-bottom:4px">
				${enchants.length} enchantment${enchants.length !== 1 ? 's' : ''} • ${cps} CPS • Sell: ${p.value}c
			</div>
			${enchantText}
		`;
		
		item.addEventListener('mouseenter', ()=>{
			item.style.borderColor = '#ef4444';
			item.style.background = 'rgba(239, 68, 68, 0.1)';
			item.style.transform = 'translateX(4px)';
		});
		item.addEventListener('mouseleave', ()=>{
			item.style.borderColor = 'rgba(255,255,255,0.08)';
			item.style.background = 'var(--glass)';
			item.style.transform = 'translateX(0)';
		});
		
		item.addEventListener('click', ()=>{
			sellPetInstance(petId, i);
		});
		
		listEl.appendChild(item);
	}
	
	modal.style.display = 'flex';
}

// Pet selector modal
function showPetSelector(petId, count){
	const p = PETS.find(x=>x.id===petId);
	if(!p) return;
	
	const modal = document.getElementById('petSelectorModal');
	const titleEl = document.getElementById('petSelectorTitle');
	const listEl = document.getElementById('petSelectorList');
	
	titleEl.textContent = `Select ${p.name} to View`;
	listEl.innerHTML = '';
	
	for(let i = 0; i < count; i++){
		const petKey = `${petId}_${i}`;
		const customName = state.petNames[petKey];
		const enchants = state.petEnchantments[petKey] || [];
		
		const item = document.createElement('div');
		item.className = 'pet-selector-item';
		item.style.cursor = 'pointer';
		item.style.padding = '12px';
		item.style.background = 'var(--glass)';
		item.style.borderRadius = '8px';
		item.style.border = '1px solid rgba(255,255,255,0.08)';
		item.style.transition = 'all 0.2s';
		
		const displayName = customName || `${p.name} #${i + 1}`;
		let enchantText = '';
		if(enchants.length > 0){
			const enchantNames = enchants.map(eid => {
				const ench = ENCHANTMENTS.find(e => e.id === eid);
				return ench ? ench.name : eid;
			}).join(', ');
			enchantText = `<div style="font-size:12px;color:#a855f7;margin-top:4px">💎 ${enchantNames}</div>`;
		}
		
		item.innerHTML = `
			<div style="font-weight:700;font-size:15px;margin-bottom:4px">${displayName}</div>
			<div style="font-size:13px;color:var(--muted)">${enchants.length} enchantment${enchants.length !== 1 ? 's' : ''}</div>
			${enchantText}
		`;
		
		item.addEventListener('mouseenter', ()=>{
			item.style.borderColor = 'var(--accent)';
			item.style.transform = 'translateX(4px)';
		});
		item.addEventListener('mouseleave', ()=>{
			item.style.borderColor = 'rgba(255,255,255,0.08)';
			item.style.transform = 'translateX(0)';
		});
		
		item.addEventListener('click', ()=>{
			modal.style.display = 'none';
			showPetInfo(petId, i);
		});
		
		listEl.appendChild(item);
	}
	
	modal.style.display = 'flex';
}

// Pet info modal
function showPetInfo(petId, instanceIndex){
	const p = PETS.find(x=>x.id===petId);
	if(!p) return;
	const petKey = `${petId}_${instanceIndex}`;
	const enchants = state.petEnchantments[petKey] || [];
	const customName = state.petNames[petKey];
	
	const modal = document.getElementById('petInfoModal');
	const nameEl = document.getElementById('petInfoName');
	const detailsEl = document.getElementById('petInfoDetails');
	const enchantsEl = document.getElementById('petInfoEnchants');
	const renameInput = document.getElementById('petRenameInput');
	const renameBtn = document.getElementById('petRenameBtn');
	
	const displayName = customName || `${p.name} #${instanceIndex + 1}`;
	nameEl.textContent = displayName;
	
	const cps = RARITY_CPS[p.rarity] || 0;
	detailsEl.innerHTML = `
		<div class="badge ${p.rarity}">${p.rarity.toUpperCase()}</div>
		<p style="margin:8px 0 4px 0"><strong>Coins per Second:</strong> ${cps}</p>
		<p style="margin:4px 0"><strong>Sell Value:</strong> ${p.value} coins</p>
		<p style="margin:4px 0;font-size:12px;color:var(--muted)">Instance: #${instanceIndex + 1}</p>
	`;
	
	enchantsEl.innerHTML = '';
	if(enchants.length === 0){
		enchantsEl.innerHTML = '<p style="color:var(--muted);font-size:13px">No enchantments yet. Visit the Enchanting page to add enchantments!</p>';
	} else {
		enchants.forEach(enchantId => {
			const enchant = ENCHANTMENTS.find(e => e.id === enchantId);
			if(enchant){
				const badge = document.createElement('div');
				badge.className = `enchant-badge enchant-tier-${enchant.tier}`;
				badge.innerHTML = `<div style="font-weight:700">${enchant.name}</div><div style="font-size:11px;opacity:0.9">${enchant.description}</div>`;
				enchantsEl.appendChild(badge);
			}
		});
	}
	
	// Set up rename input
	renameInput.value = customName || '';
	renameInput.placeholder = `${p.name} #${instanceIndex + 1}`;
	
	// Clear old listeners and add new one
	const newRenameBtn = renameBtn.cloneNode(true);
	renameBtn.parentNode.replaceChild(newRenameBtn, renameBtn);
	newRenameBtn.addEventListener('click', ()=>{
		const newName = renameInput.value.trim();
		if(newName){
			state.petNames[petKey] = newName;
		} else {
			delete state.petNames[petKey];
		}
		saveState();
		updateUI();
		showPetInfo(petId, instanceIndex); // Refresh modal
	});
	
	modal.style.display = 'flex';
}

// Modal setup function
function setupModals() {
	// Welcome modal: show on first visit
	const welcomeModal = document.getElementById('welcomeModal');
	const closeWelcome = document.getElementById('closeWelcome');
	if(welcomeModal && closeWelcome){
		const hasSeenWelcome = localStorage.getItem('btf_seen_welcome');
		if(!hasSeenWelcome){
			welcomeModal.style.display = 'flex';
			closeWelcome.addEventListener('click', ()=>{
				welcomeModal.style.display = 'none';
				localStorage.setItem('btf_seen_welcome', 'true');
			});
			welcomeModal.querySelector('.modal-backdrop')?.addEventListener('click', ()=>{
				welcomeModal.style.display = 'none';
				localStorage.setItem('btf_seen_welcome', 'true');
			});
		}
	}

	// Halloween Update modal: show on first visit (after welcome modal if both unseen)
	const halloweenUpdateModal = document.getElementById('halloweenUpdateModal');
	const closeHalloweenUpdate = document.getElementById('closeHalloweenUpdate');
	if(halloweenUpdateModal && closeHalloweenUpdate){
		const hasSeenHalloweenUpdate = localStorage.getItem('btf_seen_halloween_update');
		const hasSeenWelcome = localStorage.getItem('btf_seen_welcome');

		// Show Halloween update after welcome modal is closed (or immediately if welcome was already seen)
		const showHalloweenUpdate = () => {
			if(!hasSeenHalloweenUpdate){
				halloweenUpdateModal.style.display = 'flex';
			}
		};
		
		if(!hasSeenWelcome){
			// Wait for welcome modal to close before showing Halloween update
			closeWelcome?.addEventListener('click', ()=>{
				setTimeout(showHalloweenUpdate, 300);
			});
		} else {
			// Show immediately if welcome was already seen
			showHalloweenUpdate();
		}
		
		closeHalloweenUpdate.addEventListener('click', ()=>{
			halloweenUpdateModal.style.display = 'none';
			localStorage.setItem('btf_seen_halloween_update', 'true');
		});
		halloweenUpdateModal.querySelector('.modal-backdrop')?.addEventListener('click', ()=>{
			halloweenUpdateModal.style.display = 'none';
			localStorage.setItem('btf_seen_halloween_update', 'true');
		});
	}

	// Pet info modal close
	const closePetInfo = document.getElementById('closePetInfo');
	const petInfoModal = document.getElementById('petInfoModal');
	if(closePetInfo && petInfoModal){
		closePetInfo.addEventListener('click', ()=>{
			petInfoModal.style.display = 'none';
		});
		petInfoModal.addEventListener('click', (e)=>{
			if(e.target === petInfoModal) petInfoModal.style.display = 'none';
		});
	}

	// Pet selector modal close
	const closePetSelector = document.getElementById('closePetSelector');
	const petSelectorModal = document.getElementById('petSelectorModal');
	if(closePetSelector && petSelectorModal){
		closePetSelector.addEventListener('click', ()=>{
			petSelectorModal.style.display = 'none';
		});
		petSelectorModal.addEventListener('click', (e)=>{
			if(e.target === petSelectorModal) petSelectorModal.style.display = 'none';
		});
	}

	// Sell pet modal close
	const closeSellPet = document.getElementById('closeSellPet');
	const sellPetModal = document.getElementById('sellPetModal');
	if(closeSellPet && sellPetModal){
		closeSellPet.addEventListener('click', ()=>{
			sellPetModal.style.display = 'none';
		});
		sellPetModal.addEventListener('click', (e)=>{
			if(e.target === sellPetModal) sellPetModal.style.display = 'none';
		});
	}

	// Terms & Conditions button: opens terms.html in a new tab/window
	const openTermsBtn = document.getElementById('openTerms');
	if(openTermsBtn){
		openTermsBtn.addEventListener('click', ()=>{
			window.open('terms.html', '_blank');
		});
	}
}

// Init - moved to DOMContentLoaded to ensure DOM is ready
function initGame() {
	// Initialize DOM elements
	coinsEl = document.getElementById('coins');
	tearsDisplayMainEl = document.getElementById('tearsDisplayMain');
	cpsEl = document.getElementById('cps');
	epDisplayEl = document.getElementById('epDisplay');
	epsEl = document.getElementById('eps');
	luckMultiplierEl = document.getElementById('luckMultiplier');
	singleBtn = document.getElementById('singleRoll');
	tenBtn = document.getElementById('tenRoll');
	resultArea = document.getElementById('resultArea');
	inventoryList = document.getElementById('inventoryListPets');
	clearInv = document.getElementById('clearInv');
	inventoryListFruits = document.getElementById('inventoryListFruits');
	clearFruits = document.getElementById('clearFruits');
	capSingle = document.getElementById('capSingle');
	capTen = document.getElementById('capTen');
	capsuleResultArea = document.getElementById('capsuleResultArea');

	loadState();
	// Ensure window.state is bound to the loaded state
	window.state = state;
	// ensure required objects exist (in case older saves lack them)
	state.inventory = state.inventory || {};
	state.fruits = state.fruits || {};

	updateUI();
	saveState();

	// If a tampered save was detected during load, notify the player once
	const __tamperedFlag = localStorage.getItem('btf_save_tampered');
	if(__tamperedFlag === '1'){
		localStorage.removeItem('btf_save_tampered');
		setTimeout(()=>{
			try{ showAlert('Tampering detected! Your save was reset to defaults.'); }catch(_){ /* fallback */ alert('Tampering detected! Your save was reset to defaults.'); }
		}, 0);
	}

	// Setup button event listeners (only attach if elements exist)
	setupEventListeners();

	// Setup modals after DOM is ready
	setupModals();

	// run Halloween visuals update now and every minute in case the page stays open across the event end
	updateHalloweenVisuals();
	setInterval(updateHalloweenVisuals, 60*1000);
}

// Button handlers moved to a separate function
function setupEventListeners() {
	if(singleBtn){
		singleBtn.addEventListener('click', async ()=>{
			const costs = getCurrentCosts();
			if(state.coins < costs.priceSingle){ alert('Not enough coins for a single roll.'); return; }
			// prevent rolling if inventory full
			const maxInv = getMaxInventory();
			if(getPetTotalCount() >= maxInv){
				await showAlert(`Your pet inventory is full (${maxInv}). Sell some pets before rolling.`);
				return;
			}
			state.coins -= costs.priceSingle;
			// Cashback from enchants
			const ef = costs._effects;
			if(ef.spendRefundPercent > 0){
				const refund = Math.floor(costs.priceSingle * ef.spendRefundPercent * ef.coinGainMult);
				state.coins += refund;
			}
			// Grant Enchantment Points (tuned lower)
			const epGain = EP_GAIN_SINGLE_MIN + Math.floor(Math.random() * (EP_GAIN_SINGLE_MAX - EP_GAIN_SINGLE_MIN + 1));
			state.enchantPoints = (state.enchantPoints || 0) + epGain;
			// animate then reveal
			animateRoll(()=>[rollOnce()], showResults);
		});
	}

	if(tenBtn){
		tenBtn.addEventListener('click', async ()=>{
		const costs = getCurrentCosts();
		if(state.coins < costs.priceTen){ alert('Not enough coins for a ten-roll.'); return; }
		// check available slots
		const need = 10;
		const maxInv = getMaxInventory();
		const avail = maxInv - getPetTotalCount();
		if(avail <= 0){
			await showAlert(`Your pet inventory is full (${maxInv}). Sell some pets before rolling.`);
			return;
		}
		if(avail < need){
			const cont = await showConfirm(`You only have space for ${avail} more pet(s). Rolling x10 may discard the extra ${need-avail} pet(s). Continue?`);
			if(!cont) return;
		}
		state.coins -= costs.priceTen;
		// Cashback from enchants
		const ef = costs._effects;
		if(ef.spendRefundPercent > 0){
			const refund = Math.floor(costs.priceTen * ef.spendRefundPercent * ef.coinGainMult);
			state.coins += refund;
		}
		// Grant Enchantment Points (tuned lower)
		const epGain = EP_GAIN_TEN_MIN + Math.floor(Math.random() * (EP_GAIN_TEN_MAX - EP_GAIN_TEN_MIN + 1));
		state.enchantPoints = (state.enchantPoints || 0) + epGain;
		animateRoll(()=>rollTen(), showResults);
		});
	}

	if(capSingle){
		capSingle.addEventListener('click', ()=>{
			const costs = getCurrentCosts();
			if(state.coins < costs.capSingle){ alert('Not enough coins for capsule roll.'); return; }
			state.coins -= costs.capSingle;
			const ef = costs._effects;
			if(ef.spendRefundPercent > 0){
				const refund = Math.floor(costs.capSingle * ef.spendRefundPercent * ef.coinGainMult);
				state.coins += refund;
			}
			animateRoll(()=>[rollFruitOnce()], showCapsuleResults);
		});
	}

	if(capTen){
		capTen.addEventListener('click', ()=>{
			const costs = getCurrentCosts();
			if(state.coins < costs.capTen){ alert('Not enough coins for capsule x10.'); return; }
			state.coins -= costs.capTen;
			const ef = costs._effects;
			if(ef.spendRefundPercent > 0){
				const refund = Math.floor(costs.capTen * ef.spendRefundPercent * ef.coinGainMult);
				state.coins += refund;
			}
			animateRoll(()=>rollFruitTen(), showCapsuleResults);
		});
	}

	if(clearInv){
		clearInv.addEventListener('click', async ()=>{
			if(!await showConfirm('Clear your inventory?')) return;
			state.inventory = {};
			saveState();
			updateUI();
		});
	}

	if(clearFruits){
		clearFruits.addEventListener('click', async ()=>{
			if(!await showConfirm('Clear fruits inventory?')) return;
			state.fruits = {};
			saveState();
			updateUI();
		});
	}
}

// Initialize when DOM is ready
if (typeof document !== 'undefined') {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initGame);
	} else {
		// DOM already loaded
		initGame();
	}
}

// Toggle Halloween visuals based on HALLOWEEN_END
function updateHalloweenVisuals(){
	const h = document.querySelector('.halloween-shimmer');
	const s = document.querySelector('.subtitle');
	const active = Date.now() < HALLOWEEN_END;
	if(!h && !s) return;
	if(active){
		// ensure shimmer class exists and subtitle visible
		if(h) h.classList.add('halloween-shimmer');
		if(s) s.style.display = '';
	} else {
		// event ended: remove shimmer and hide subtitle
		if(h){ h.classList.remove('halloween-shimmer'); h.style.color = ''; }
		if(s) s.style.display = 'none';
	}
}

// Passive income: add coins every second based on total CPS
let __epOverflow = 0; // fractional EP accumulator for per-second generation
setInterval(()=>{
    const base = computeTotalCPS();
    if(base > 0){
        const ef = computeEnchantEffects();
        const coinsAdd = Math.floor(base * ef.cpsMult * ef.coinGainMult);
        if(coinsAdd > 0){
            state.coins += coinsAdd;
            saveState();
            updateUI();
            // show coin pop animation
            const pop = document.createElement('div');
            pop.className = 'coin-pop';
            pop.textContent = '+' + coinsAdd;
            document.querySelector('.wallet').appendChild(pop);
            // if Benny Boost active, add purple variant
            if(state.bennyActive && state.bennyEndsAt > Date.now()){
                pop.classList.add('benny');
            }
            // remove after animation
            pop.addEventListener('animationend', ()=>pop.remove());
        }
    }
	// Generate Enchantment Points from special rarity pets (tuned rate)
	let specialCount = 0;
	let weepingCount = 0;
	for(const [id, count] of Object.entries(state.inventory)){
		const p = PETS.find(x=>x.id===id);
		if(p && p.rarity === 'special') specialCount += count;
		if(id === 'pet_sp_2') weepingCount += count;
	}
	if(specialCount > 0){
		const ef = computeEnchantEffects();
		__epOverflow += specialCount * EP_PER_SEC_PER_SPECIAL * ef.epGenerationMult;
		const gained = Math.floor(__epOverflow);
		if(gained > 0){
			__epOverflow -= gained;
			state.enchantPoints = (state.enchantPoints || 0) + gained;
			saveState();
			updateUI();
			// show EP pop animation
			const epPop = document.createElement('div');
			epPop.className = 'ep-pop';
			epPop.textContent = '+' + gained;
			const epDisplayContainer = document.querySelector('.ep-display');
			if(epDisplayContainer){
				epDisplayContainer.appendChild(epPop);
				// remove after animation
				epPop.addEventListener('animationend', ()=>epPop.remove());
			}
		}
	}
	// Generate Tears from Weeping Spirits (linear rate: 0.2 tears/sec each)
	if(weepingCount > 0){
		const tearsGained = weepingCount * 0.2;
		state.tears = (state.tears || 0) + tearsGained;
		// cap tears for sanity (optional)
		if(state.tears > 1e9) state.tears = 1e9;
		saveState();
		updateUI();
		// show Tears pop animation near the Tears display
		if(typeof tearsDisplayMainEl !== 'undefined' && tearsDisplayMainEl && tearsDisplayMainEl.parentElement){
			const tPop = document.createElement('div');
			tPop.className = 'tear-pop';
			const shown = tearsGained % 1 === 0 ? tearsGained.toString() : tearsGained.toFixed(1);
			tPop.textContent = '+' + shown;
			tearsDisplayMainEl.parentElement.style.position = 'relative';
			tearsDisplayMainEl.parentElement.appendChild(tPop);
			tPop.addEventListener('animationend', ()=> tPop.remove());
		}
	}
}, 1000);

// Periodic check to clear expired effects
setInterval(()=>{
	let dirty = false;
	if(state.potionActive && state.potionEndsAt <= Date.now()){ state.potionActive = false; state.luckStacks = 0; dirty = true; }
	if(state.bennyActive && state.bennyEndsAt <= Date.now()){ state.bennyActive = false; dirty = true; }
	if(state.blessingActive && state.blessingEndsAt <= Date.now()){ state.blessingActive = false; dirty = true; }
	if(state.christmasActive && state.christmasEndsAt <= Date.now()){ state.christmasActive = false; dirty = true; }
	if(dirty){ saveState(); updateUI(); }
}, 1000);

// About is now a separate page (about.html); modal wiring removed

function getPetName(petId) {
	const pet = PETS.find(p => p.id === petId);
	return pet ? pet.name : "Undefined";
}

function getPetRarity(petId) {
	const pet = PETS.find(p => p.id === petId);
	return pet ? pet.rarity : "Undefined";
}

// Export ALL globals BEFORE requiring page modules so they can access them
if (typeof window !== 'undefined') {
	window.CLAIMED_CODES_KEY = 'btf_claimed_codes_v1';
	window.STORAGE_KEY = STORAGE_KEY;
	window.PETS = PETS;
	window.FRUITS = FRUITS;
	window.ENCHANTMENTS = ENCHANTMENTS;
	window.state = state;
	window.coinsEl = coinsEl;
	window.luckMultiplierEl = luckMultiplierEl;
	window.saveState = saveState;
	window.updateUI = updateUI;
	window.showAlert = showAlert;
	window.showConfirm = showConfirm;
	window.redeemGiftCode = redeemGiftCode;
	window.getPetName = getPetName;
	window.getPetRarity = getPetRarity;

	// Safe helper to grant a pet and persist
	window.grantPet = function(petId, count = 1){
		try{
			state.inventory = state.inventory || {};
			state.inventory[petId] = (state.inventory[petId] || 0) + (count||1);
			saveState();
			if(typeof updateUI === 'function') updateUI();
			return true;
		}catch(e){ console.warn('grantPet failed', e); return false; }
	};
	
	// Export useBrewedPotion function for inventory page
	window.useBrewedPotion = function(index){
		const inv = Array.isArray(state.potionInventory) ? state.potionInventory : [];
		const p = inv[index]; 
		if(!p) return;
		
		// apply effect but do not stack beyond 100
		if(state.potionActive && state.potionEndsAt > Date.now()){
			state.luckStacks = Math.min(100, (state.luckStacks||0) + (p.potency||0));
			state.potionEndsAt = Date.now() + (p.durationMs||0);
		} else {
			state.potionActive = true;
			state.luckStacks = Math.min(100, p.potency||0);
			state.potionEndsAt = Date.now() + (p.durationMs||0);
		}
		
  

		// remove from inventory
		inv.splice(index,1);
		state.potionInventory = inv;
		
		saveState();
		updateUI();
	};
}

// Import all page-specific modules AFTER globals are exported (CommonJS for simple bundling)
__webpack_require__(/*! ./shop.js */ "./src/shop.js");
__webpack_require__(/*! ./inventory.js */ "./src/inventory.js");
__webpack_require__(/*! ./enchant.js */ "./src/enchant.js");
__webpack_require__(/*! ./trade.js */ "./src/trade.js");
__webpack_require__(/*! ./leaderboard.js */ "./src/leaderboard.js");

// ==================== SHOP PAGE CODE ====================
// Only executes if shop page elements exist
if (document.getElementById('buyLuckPotion')) {
	const POTION_COST = 100000;
	const POTION_DURATION = 5 * 60 * 1000;
	const BENNY_COST = 10000;
	const BENNY_DURATION = 5 * 60 * 1000;
	const BLESSING_COST = 8000;
	const BLESSING_DURATION = 5 * 60 * 1000;
	const SLOT_MACHINE_COST = 1000000;
	const SLOT_MACHINE_BONUS = 5;
 
	const buyBtn = document.getElementById('buyLuckPotion');
	const timerEl = document.getElementById('potionTimer');
	const buyBennyBtn = document.getElementById('buyBennyBoost');
	const bennyTimerEl = document.getElementById('bennyTimer');
	const buyBlessingBtn = document.getElementById('buyPumpkinBlessing');
	const blessingTimerEl = document.getElementById('blessingTimer');
	const buySlotMachineBtn = document.getElementById('buySlotMachine');
	const slotsPurchasedEl = document.getElementById('slotsPurchased');
	const tearsDisplayEl = document.getElementById('tearsDisplay');
	const brewFruitListEl = document.getElementById('brewFruitList');
	const brewSelectionEl = document.getElementById('brewSelection');
	const brewPreviewEl = document.getElementById('brewPreview');
	const brewPotionBtn = document.getElementById('brewPotionBtn');

	const RARITY_POTENCY = {
		common: 1, rare: 2, epic: 4, special: 5, legendary: 6,
		spooky: 8, chromatic: 10, unique: 15, godly: 20
	};
	const RARITY_TEARS_COST = {
		common: 5, rare: 20, epic: 60, special: 80, legendary: 150,
		spooky: 200, chromatic: 300, unique: 1000, godly: 5000
	};
	const BREW_DURATION = 5 * 60 * 1000;

	function getFruitDef(fid){ return FRUITS.find(f=>f.id===fid); }
	let selectedFruits = [];

	function renderBrewableFruits(){
		if(!brewFruitListEl) return;
		brewFruitListEl.innerHTML = '';
		const entries = Object.entries(state.fruits||{}).filter(([,cnt])=>cnt>0);
		if(entries.length===0){
			brewFruitListEl.innerHTML = '<div style="color:var(--muted)">No fruits available.</div>';
			return;
		}
		entries.forEach(([fid, cnt])=>{
			const def = getFruitDef(fid);
			const btn = document.createElement('button');
			btn.className = 'small';
			btn.textContent = `${def?def.name:fid} x${cnt}`;
			btn.addEventListener('click', ()=>toggleSelectedFruit(fid));
			brewFruitListEl.appendChild(btn);
		});
	}

	function toggleSelectedFruit(fid){
		const idx = selectedFruits.indexOf(fid);
		if(idx>=0) selectedFruits.splice(idx,1); else if(selectedFruits.length<3) selectedFruits.push(fid);
		updateBrewPreview();
	}

	function updateBrewPreview(){
		if(!brewSelectionEl || !brewPreviewEl || !brewPotionBtn) return;
		if(selectedFruits.length===0){
			brewSelectionEl.textContent = 'No fruits selected.';
			brewPreviewEl.textContent = '';
			brewPotionBtn.disabled = true;
			return;
		}
		const names = selectedFruits.map(fid=>{ const d=getFruitDef(fid); return d?d.name:fid; }).join(', ');
		brewSelectionEl.textContent = `Selected: ${names}`;
		let potency = 0; let cost = 0;
		selectedFruits.forEach(fid=>{
			const d = getFruitDef(fid);
			if(d){ potency += (RARITY_POTENCY[d.rarity]||0); cost += (RARITY_TEARS_COST[d.rarity]||0); }
		});
		potency = Math.min(potency, 100);
		brewPreviewEl.textContent = `Cost: ${cost} Tears`;
		const canAfford = (state.tears||0) >= cost;
		const haveAll = selectedFruits.every(fid => (state.fruits[fid]||0) > 0);
		brewPotionBtn.disabled = !(canAfford && haveAll);
		brewPotionBtn.onclick = ()=>brewPotion(potency, cost);
	}

	async function brewPotion(potency, cost){
		selectedFruits.forEach(fid=>{ if(state.fruits[fid]>0){ state.fruits[fid] -= 1; if(state.fruits[fid]===0) delete state.fruits[fid]; } });
		state.tears = Math.max(0, (state.tears||0) - cost);
		
		let potionName = 'Luck Potion';
		if (potency <= 3) potionName = 'Buns Luck Potion';
		else if (potency <= 8) potionName = 'Weak Luck Potion';
		else if (potency <= 15) potionName = 'Basic Luck Potion';
		else if (potency <= 25) potionName = 'Better Luck Potion';
		else if (potency <= 40) potionName = 'Superior Luck Potion';
		else if (potency <= 60) potionName = 'Mega Superior Luck Potion';
		else if (potency <= 80) potionName = 'Mega Mega Superior Luck Potion';
		else potionName = 'Godly Luck Potion';
		
		if(!Array.isArray(state.potionInventory)) state.potionInventory = [];
		state.potionInventory.push({ type:'luck', name: potionName, potency, durationMs: BREW_DURATION, createdAt: Date.now() });
		selectedFruits = [];
		// Persist via global save to ensure other pages (inventory/index) see it
		if (typeof window !== 'undefined' && typeof window.saveState === 'function') {
			window.saveState();
		} else if (typeof saveState === 'function') {
			// fallback in same runtime
			saveState();
		}
		updateShopUI();
		renderBrewableFruits();
		await showAlert(` ${potionName} brewed successfully! Check your Inventory to use it.`);
	}

	function updateShopUI() {
		coinsEl.textContent = state.coins;
		if(tearsDisplayEl){ tearsDisplayEl.textContent = Math.floor(state.tears || 0); }
		
		if(luckMultiplierEl){
			const isActive = state.potionActive && state.potionEndsAt > Date.now();
			const cappedStacks = Math.min(state.luckStacks, 100);
			luckMultiplierEl.textContent = isActive ? `${1 + cappedStacks * 2}x` : "1x";
		}
		
		if(bennyTimerEl){
			const bActive = state.bennyActive && state.bennyEndsAt > Date.now();
			buyBennyBtn.disabled = state.coins < BENNY_COST || bActive;
			if(bActive){
				const remaining = Math.ceil((state.bennyEndsAt - Date.now())/1000);
				const minutes = Math.floor(remaining/60);
				const seconds = remaining%60;
				bennyTimerEl.textContent = `${minutes}:${seconds.toString().padStart(2,'0')} remaining`;
				bennyTimerEl.style.display = 'inline';
			} else {
				bennyTimerEl.style.display = 'none';
			}
		}
		
		buyBtn.disabled = state.coins < POTION_COST;
		if (state.potionActive) {
			const remaining = Math.ceil((state.potionEndsAt - Date.now()) / 1000);
			if (remaining <= 0) {
				state.potionActive = false;
				state.potionEndsAt = 0;
				state.luckStacks = 0;
				saveState();
				timerEl.style.display = 'none';
				buyBtn.disabled = state.coins < POTION_COST;
			} else {
				const minutes = Math.floor(remaining / 60);
				const seconds = remaining % 60;
				timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')} remaining`;
				timerEl.style.display = 'inline';
			}
		} else {
			timerEl.style.display = 'none';
		}
		
		if(buySlotMachineBtn){
			const purchased = (state.bonusInventorySlots || 0) >= SLOT_MACHINE_BONUS;
			buySlotMachineBtn.disabled = (state.coins < SLOT_MACHINE_COST) || purchased;
			buySlotMachineBtn.textContent = purchased ? 'Purchased' : 'Buy Slot Machine';
		}
		if(slotsPurchasedEl){
			const base = 20;
			const totalSlots = base + (state.bonusInventorySlots || 0);
			const purchased = (state.bonusInventorySlots || 0) >= SLOT_MACHINE_BONUS;
			if(purchased){
				slotsPurchasedEl.textContent = `Current capacity: ${totalSlots} slots (Slot Machine owned)`;
			} else {
				slotsPurchasedEl.textContent = `Current capacity: ${base} slots (base)`;
			}
		}
	}

	buyBtn.addEventListener('click', () => {
		if (state.coins >= POTION_COST) {
			state.coins -= POTION_COST;
			if (state.potionActive && state.potionEndsAt > Date.now()) {
				state.luckStacks = Math.min(state.luckStacks + 1, 100);
				state.potionEndsAt = Date.now() + POTION_DURATION;
			} else {
				state.potionActive = true;
				state.luckStacks = 1;
				state.potionEndsAt = Date.now() + POTION_DURATION;
			}
			if (!state.purchasedItems.some(item => item.name === 'Potion of Luck')) {
				state.purchasedItems.push({ name: 'Potion of Luck', icon: '', description: 'Makes all items 3x more common for 5 minutes' });
			}
			saveState();
			updateShopUI();
		}
	});

	if(buyBennyBtn){
		buyBennyBtn.addEventListener('click', ()=>{
			if(state.coins >= BENNY_COST && !state.bennyActive){
				state.coins -= BENNY_COST;
				state.bennyActive = true;
				state.bennyEndsAt = Date.now() + BENNY_DURATION;
				if(!state.purchasedItems.some(i=>i.name==='Benny Boost')){
					state.purchasedItems.push({ name: 'Happy Powder', icon: '😃', description: '+5% CPS for 5 minutes' });
				}
				saveState();
				updateShopUI();
			}
		});
	}

	if(buySlotMachineBtn){
		buySlotMachineBtn.addEventListener('click', ()=>{
			const alreadyBought = (state.bonusInventorySlots || 0) >= SLOT_MACHINE_BONUS;
			if(alreadyBought){ alert('You already own the Slot Machine.'); return; }
			if(state.coins >= SLOT_MACHINE_COST){
				state.coins -= SLOT_MACHINE_COST;
				state.bonusInventorySlots = SLOT_MACHINE_BONUS;
				if(!state.purchasedItems.some(i=>i.name==='Slot Machine')){
					state.purchasedItems.push({ name: 'Slot Machine', icon: '🎰', description: `Adds +5 pet inventory slots permanently` });
				}
				saveState();
				updateShopUI();
				alert(`Purchased! Your pet inventory capacity is now ${20 + state.bonusInventorySlots} slots.`);
			}
		});
	}

	const giftCodeInput = document.getElementById('giftCodeInput');
	const redeemGiftCodeBtn = document.getElementById('redeemGiftCode');
	if(redeemGiftCodeBtn && giftCodeInput){
		redeemGiftCodeBtn.addEventListener('click', async ()=>{
			const code = giftCodeInput.value.trim().toUpperCase();
			if(!code){ await showAlert('Please enter a gift code.'); return; }
			if(typeof redeemGiftCode === 'function'){
				const result = redeemGiftCode(code);
				if(result.success){
					updateShopUI();
					await showAlert('✅ ' + result.message);
					giftCodeInput.value = '';
				} else {
					await showAlert('❌ ' + result.message);
				}
			}
		});
		giftCodeInput.addEventListener('keypress', (e)=>{ if(e.key === 'Enter') redeemGiftCodeBtn.click(); });
	}

	setInterval(updateShopUI, 1000);
	renderBrewableFruits();
	updateBrewPreview();
}

// ==================== INVENTORY PAGE CODE ====================
// Only executes if inventory page elements exist
if (document.getElementById('brewedPotions')) {
	const activeEffectsEl = document.getElementById('activeEffects');
	const brewedPotionsEl = document.getElementById('brewedPotions');
	const purchasedItemsEl = document.getElementById('purchasedItems');
	const petDetailModal = document.getElementById('petDetailModal');
	const closePetDetail = document.getElementById('closePetDetail');
	const petDetailName = document.getElementById('petDetailName');
	const enchantList = document.getElementById('enchantList');

	function showPetDetail(petKey, petId) {
		const pet = PETS.find(p => p.id === petId);
		if (!pet) return;
		petDetailName.textContent = pet.name;
		const enchants = state.petEnchantments[petKey] || [];
		enchantList.innerHTML = '';
		if (enchants.length === 0) {
			enchantList.innerHTML = '<p style="color:var(--muted);font-size:13px">No enchantments yet. Visit the Enchanting page to add enchantments!</p>';
		} else {
			enchants.forEach(enchantId => {
				const enchant = ENCHANTMENTS.find(e => e.id === enchantId);
				if (enchant) {
					const badge = document.createElement('div');
					badge.className = `enchant-badge enchant-tier-${enchant.tier}`;
					badge.innerHTML = `<div style="font-weight:700">${enchant.name}</div><div style="font-size:11px;opacity:0.9">${enchant.description}</div>`;
					enchantList.appendChild(badge);
				}
			});
		}
		petDetailModal.classList.add('show');
	}

	function closePetDetailModal() { petDetailModal.classList.remove('show'); }
	closePetDetail.addEventListener('click', closePetDetailModal);
	petDetailModal.addEventListener('click', (e) => { if (e.target === petDetailModal) closePetDetailModal(); });

	function updateInventoryUI() {
		coinsEl.textContent = state.coins;
		if(luckMultiplierEl){
			const isActive = state.potionActive && state.potionEndsAt > Date.now();
			const cappedStacks = Math.min(state.luckStacks, 100);
			luckMultiplierEl.textContent = isActive ? `${1 + cappedStacks * 2}x` : "1x";
		}
		
		activeEffectsEl.innerHTML = '';
		if (state.potionActive && state.potionEndsAt > Date.now()) {
			const remaining = Math.ceil((state.potionEndsAt - Date.now()) / 1000);
			const minutes = Math.floor(remaining / 60);
			const seconds = remaining % 60;
			const cappedStacks = Math.min(state.luckStacks, 100);
			const effectEl = document.createElement('div');
			effectEl.className = 'item-card';
			effectEl.innerHTML = `
				<div class="item-icon">🧪</div>
				<div class="item-info">
					<h3>Luck Potion</h3>
					<p class="effect-active">Active - ${minutes}:${seconds.toString().padStart(2, '0')} remaining</p>
					<p>+${cappedStacks * 2}x luck boost (${cappedStacks} stack${cappedStacks !== 1 ? 's' : ''})</p>
				</div>
			`;
			activeEffectsEl.appendChild(effectEl);
		} else {
			activeEffectsEl.innerHTML = '<p style="color:var(--muted)">No active effects</p>';
		}

		if(brewedPotionsEl){
			brewedPotionsEl.innerHTML = '';
			const inv = Array.isArray(state.potionInventory) ? state.potionInventory : [];
			if(inv.length === 0){
				brewedPotionsEl.innerHTML = '<p style="color:var(--muted)">No brewed potions. Visit the Shop to brew potions!</p>';
			} else {
				inv.forEach((potion, idx) => {
					const potionEl = document.createElement('div');
					potionEl.className = 'item-card';
					potionEl.style.position = 'relative';
					potionEl.innerHTML = `
						<div class="item-icon">🧪</div>
						<div class="item-info">
							<h3>${potion.name}</h3>
							<p style="color:#10b981">+${potion.potency} luck stacks</p>
							<p style="font-size:12px">Duration: ${Math.round(potion.durationMs/60000)} minutes</p>
						</div>
					`;
					const useBtn = document.createElement('button');
					useBtn.className = 'buy-btn';
					useBtn.textContent = 'Use';
					useBtn.style.marginLeft = 'auto';
					useBtn.addEventListener('click', () => window.useBrewedPotion(idx));
					potionEl.appendChild(useBtn);
					brewedPotionsEl.appendChild(potionEl);
				});
			}
		}

		purchasedItemsEl.innerHTML = '';
		const petEntries = Object.entries(state.inventory || {});
		if (petEntries.length > 0) {
			petEntries.forEach(([petId, count]) => {
				const pet = PETS.find(p => p.id === petId);
				if (!pet) return;
				for (let i = 0; i < count; i++) {
					const petKey = `${petId}_${i}`;
					const enchants = state.petEnchantments[petKey] || [];
					const itemEl = document.createElement('div');
					itemEl.className = 'item-card';
					itemEl.style.cursor = 'pointer';
					itemEl.innerHTML = `
						<div class="item-icon">🐾</div>
						<div class="item-info">
							<h3>${pet.name}</h3>
							<p style="color:var(--${pet.rarity})">${pet.rarity.toUpperCase()}</p>
							<p style="font-size:11px;margin-top:4px">${enchants.length} enchantment${enchants.length !== 1 ? 's' : ''} • Click to view</p>
						</div>
					`;
					itemEl.addEventListener('click', () => showPetDetail(petKey, petId));
					purchasedItemsEl.appendChild(itemEl);
				}
			});
		}
		
		if (state.purchasedItems && state.purchasedItems.length > 0) {
			state.purchasedItems.forEach(item => {
				const itemEl = document.createElement('div');
				itemEl.className = 'item-card';
				itemEl.innerHTML = `
					<div class="item-icon">${item.icon}</div>
					<div class="item-info">
						<h3>${item.name}</h3>
						<p>${item.description}</p>
					</div>
				`;
				purchasedItemsEl.appendChild(itemEl);
			});
		}
		
		if (petEntries.length === 0 && (!state.purchasedItems || state.purchasedItems.length === 0)) {
			purchasedItemsEl.innerHTML = '<p style="color:var(--muted)">No items purchased yet</p>';
		}
	}

	setInterval(updateInventoryUI, 1000);
	updateInventoryUI();
}
})();

/******/ })()
;
//# sourceMappingURL=bundle.js.map