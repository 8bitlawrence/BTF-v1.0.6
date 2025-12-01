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
    // Load from localStorage since each page has its own runtime
    const STORAGE_KEY = window.STORAGE_KEY || 'btf_state_v1';
    console.log('[Enchant] Loading from localStorage with key:', STORAGE_KEY);
    
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        console.log('[Enchant] Raw localStorage data:', raw ? raw.substring(0, 200) + '...' : 'null');
        
        if (raw) {
            const parsed = JSON.parse(raw);
            console.log('[Enchant] Parsed state keys:', Object.keys(parsed));
            console.log('[Enchant] Inventory from localStorage:', parsed.inventory);
            
            // Update the global state with loaded data
            if (window.state) {
                Object.assign(window.state, parsed);
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
    
    saveState();
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
