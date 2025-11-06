// BTF Enchanting System
const STORAGE_KEY = 'mini_gacha_state_v1';

// Enchantment definitions with tiers
const ENCHANTMENTS = [
    // Tier 1 - Basic (coin-focused)
    { id: 'swift_1', name: 'Swift I', tier: 1, cost: 50, description: '+2% Coins per Second' },
    { id: 'lucky_1', name: 'Lucky I', tier: 1, cost: 50, description: '3% chance to double coins on sells' },
    { id: 'strong_1', name: 'Strong I', tier: 1, cost: 50, description: 'Sell Pets +5% coins' },
    { id: 'resilient_1', name: 'Resilient I', tier: 1, cost: 50, description: 'Sell Fruits +5% coins' },
    { id: 'wealthy_1', name: 'Wealthy I', tier: 1, cost: 50, description: '+10% to all coin gains' },
    { id: 'scavenger_1', name: 'Scavenger I', tier: 1, cost: 50, description: 'Capsule price -5%' },
    { id: 'efficient_1', name: 'Efficient I', tier: 1, cost: 50, description: 'Pet roll price -5%' },
    { id: 'durable_1', name: 'Durable I', tier: 1, cost: 50, description: '+10% Coins per Second' },
    {id: 'critical_1', name: 'Critical I', tier: 1, cost: 50, description: '+5% extra double-sell chance' },
    {id: 'vampiric_1', name: 'Vampiric I', tier: 1, cost: 50, description: 'Refund 2% of roll/capsule costs' },
    {id: 'legendary_1', name: 'Legendary I', tier: 1, cost: 75, description: '+5% all coin gains & CPS; -5% roll/capsule cost; +2% double-sell chance' },
    {id: 'ultimate_1', name: 'Ultimate I', tier: 1, cost: 75, description: '+2% all coin gains; -2% roll/capsule cost; +2% double-sell chance' },
    
    // Tier 2 - Advanced
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
    
    // Tier 3 - Legendary
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
    
    // Mage enchantments - Exclusive to Suspicious Creature
    { id: 'mage_1', name: 'Mage I', tier: 1, cost: 50, description: '+25% EP generation ', exclusiveTo: 'pet_sp_1' },
    { id: 'mage_2', name: 'Mage II', tier: 2, cost: 150, description: '+50% EP generation ', exclusiveTo: 'pet_sp_1' },
    { id: 'mage_3', name: 'Mage III', tier: 3, cost: 400, description: '+100% EP generation', exclusiveTo: 'pet_sp_1' }
];

const PETS = [
    { id: 'pet_c_1', name: 'Dirt Fox', rarity: 'common' },
    { id: 'pet_c_2', name: 'Dirt Finch', rarity: 'common' },
    { id: 'pet_c_3', name: 'Dirt Turtle', rarity: 'common' },
    { id: 'pet_r_1', name: 'Dusk Fox', rarity: 'rare' },
    { id: 'pet_r_2', name: 'Aero Lynx', rarity: 'rare' },
    { id: 'pet_e_1', name: 'Nebula Kirin', rarity: 'epic' },
    { id: 'pet_sp_1', name: 'Suspicious Creature', rarity: 'special' },
    { id: 'pet_l_1', name: 'Infinity Golem', rarity: 'legendary' },
    { id: 'pet_s_1', name: 'Nightmare Skeleton', rarity: 'spooky' },
    { id: 'pet_ch_1', name: 'Chroma Beast', rarity: 'chromatic' },
    { id: 'pet_s_2', name: 'Spooky Ghost', rarity: 'spooky' },
    { id: 'pet_u_1', name: 'Singularity Phoenix', rarity: 'unique' },
    { id: 'pet_u_2', name: 'Timekeeper Dragon', rarity: 'unique' },
    { id: 'pet_u_3', name: 'Max Verstappen', rarity: 'unique' }

];

// State
let currentState = {
    coins: 0,
    enchantPoints: 0,
    inventory: {},
    petEnchantments: {}, // { petId_index: [enchantmentId1, enchantmentId2, ...] }
    petRerollsUsed: {} // { petId_index: rerollCount }
};

let selectedPetKey = null;
let currentEnchantOptions = [];
let currentPetId = null;

// DOM elements
let coinsEl, enchantPointsEl, petGridEl, selectedPetInfoEl, selectedPetNameEl, selectedPetEnchantsEl, enchantOptionsEl;
let petSelectorModal, closePetSelector, petSelectorTitle, petInstanceList;

// Load state
function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            currentState = {
                coins: parsed.coins || 0,
                enchantPoints: parsed.enchantPoints || 0,
                inventory: parsed.inventory || {},
                petEnchantments: parsed.petEnchantments || {},
                petRerollsUsed: parsed.petRerollsUsed || {}
            };
        }
    } catch (e) {
        console.error('Failed to load state:', e);
    }
    updateUI();
}

// Save state
function saveState() {
    try {
        const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            ...current,
            coins: currentState.coins,
            enchantPoints: currentState.enchantPoints,
            petEnchantments: currentState.petEnchantments,
            petRerollsUsed: currentState.petRerollsUsed
        }));
    } catch (e) {
        console.error('Failed to save state:', e);
    }
}

// Update UI
function updateUI() {
    coinsEl.textContent = currentState.coins;
    enchantPointsEl.textContent = currentState.enchantPoints;
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
    
    if (Object.keys(currentState.inventory).length === 0) {
        petGridEl.innerHTML = '<p style="color:var(--muted);text-align:center;padding:40px;grid-column:1/-1">No pets in inventory</p>';
        return;
    }
    
    for (const [petId, count] of Object.entries(currentState.inventory)) {
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
    petSelectorTitle.textContent = `Select ${petName} to Enchant`;
    
    petInstanceList.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const petKey = `${petId}_${i}`;
        const enchants = currentState.petEnchantments[petKey] || [];
        
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
        
        petInstanceList.appendChild(item);
    }
    
    petSelectorModal.classList.add('show');
}

// Close pet selector modal
function closePetSelectorModal() {
    petSelectorModal.classList.remove('show');
}

// Select a pet to enchant
function selectPet(petKey, petId) {
    selectedPetKey = petKey;
    renderPets();
    
    // Show selected pet info
    selectedPetInfoEl.style.display = 'block';
    selectedPetNameEl.textContent = getPetName(petId);
    
    const enchants = currentState.petEnchantments[petKey] || [];
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
        if (currentState.enchantPoints < cost) {
            showAlert(`Not enough Enchantment Points! You need ${cost} EP but only have ${currentState.enchantPoints} EP.`);
            return;
        }
        currentState.enchantPoints -= cost;
    }
    
    // Track reroll usage
    if (!currentState.petRerollsUsed[selectedPetKey]) {
        currentState.petRerollsUsed[selectedPetKey] = 0;
    }
    currentState.petRerollsUsed[selectedPetKey]++;
    
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
    const rerollsUsed = currentState.petRerollsUsed[selectedPetKey] || 0;
    const rerollCost = 20;
    const isFree = rerollsUsed === 0;
    
    const rerollBtn = document.createElement('button');
    if (isFree) {
        rerollBtn.textContent = '🔄 Reroll Options (1 Free Reroll)';
        rerollBtn.className = 'muted';
    } else {
        rerollBtn.textContent = `🔄 Reroll Options (${rerollCost} EP)`;
        rerollBtn.className = 'muted';
        if (currentState.enchantPoints < rerollCost) {
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
    
    if (currentState.enchantPoints < enchant.cost) {
        showAlert(`Not enough Enchantment Points! You need ${enchant.cost} EP but only have ${currentState.enchantPoints} EP.`);
        return;
    }
    
    // Check if pet already has this enchantment
    const currentEnchants = currentState.petEnchantments[selectedPetKey] || [];
    if (currentEnchants.includes(enchant.id)) {
        showAlert('This pet already has this enchantment!');
        return;
    }
    
    // Apply enchantment
    currentState.enchantPoints -= enchant.cost;
    if (!currentState.petEnchantments[selectedPetKey]) {
        currentState.petEnchantments[selectedPetKey] = [];
    }
    currentState.petEnchantments[selectedPetKey].push(enchant.id);
    
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
    coinsEl = document.getElementById('coins');
    enchantPointsEl = document.getElementById('enchantPoints');
    petGridEl = document.getElementById('petGrid');
    selectedPetInfoEl = document.getElementById('selectedPetInfo');
    selectedPetNameEl = document.getElementById('selectedPetName');
    selectedPetEnchantsEl = document.getElementById('selectedPetEnchants');
    enchantOptionsEl = document.getElementById('enchantOptions');
    petSelectorModal = document.getElementById('petSelectorModal');
    closePetSelector = document.getElementById('closePetSelector');
    petSelectorTitle = document.getElementById('petSelectorTitle');
    petInstanceList = document.getElementById('petInstanceList');
    
    // Modal event listeners
    closePetSelector.addEventListener('click', closePetSelectorModal);
    petSelectorModal.addEventListener('click', (e) => {
        if (e.target === petSelectorModal) closePetSelectorModal();
    });
    
    loadState();
});
