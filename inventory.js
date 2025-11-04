// Inventory functionality
const STORAGE_KEY = 'mini_gacha_state_v1';

// Pet and enchantment data
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
    { id: 'pet_s_2', name: 'Spooky Ghost', rarity: 'spooky' }
];

const ENCHANTMENTS = [
    { id: 'swift_1', name: 'Swift I', tier: 1, description: '+2% Coins per Second' },
    { id: 'lucky_1', name: 'Lucky I', tier: 1, description: '3% chance to double coins on sells' },
    { id: 'strong_1', name: 'Strong I', tier: 1, description: 'Sell Pets +5% coins' },
    { id: 'resilient_1', name: 'Resilient I', tier: 1, description: 'Sell Fruits +5% coins' },
    { id: 'wealthy_1', name: 'Wealthy I', tier: 1, description: '+10% to all coin gains' },
    { id: 'scavenger_1', name: 'Scavenger I', tier: 1, description: 'Capsule price -5%' },
    { id: 'efficient_1', name: 'Efficient I', tier: 1, description: 'Pet roll price -5%' },
    { id: 'durable_1', name: 'Durable I', tier: 1, description: '+10% Coins per Second' },
    { id: 'critical_1', name: 'Critical I', tier: 1, description: '+5% extra double-sell chance' },
    { id: 'vampiric_1', name: 'Vampiric I', tier: 1, description: 'Refund 2% of roll/capsule costs' },
    {id: 'ultimate_1', name: 'Ultimate I', tier: 1, description: '+2% all coin gains; -2% roll/capsule cost; +2% double-sell chance' },
    {id: 'legendary_1', name: 'Legendary I', tier: 1, description: '+2% all coin gains & CPS; -2% roll/capsule cost; +2% double-sell chance' },
    { id: 'swift_2', name: 'Swift II', tier: 2, description: '+5% Coins per Second' },
    { id: 'lucky_2', name: 'Lucky II', tier: 2, description: '8% chance to double coins on sells' },
    { id: 'strong_2', name: 'Strong II', tier: 2, description: 'Sell Pets +12% coins' },
    { id: 'resilient_2', name: 'Resilient II', tier: 2, description: 'Sell Fruits +12% coins' },
    { id: 'wealthy_2', name: 'Wealthy II', tier: 2, description: '+25% to all coin gains' },
    { id: 'scavenger_2', name: 'Scavenger II', tier: 2, description: 'Capsule price -12%' },
    { id: 'efficient_2', name: 'Efficient II', tier: 2, description: 'Pet roll price -12%' },
    { id: 'durable_2', name: 'Durable II', tier: 2, description: '+25% Coins per Second' },
    { id: 'critical_2', name: 'Critical II', tier: 2, description: '+10% extra double-sell chance' },
    { id: 'vampiric_2', name: 'Vampiric II', tier: 2, description: 'Refund 5% of roll/capsule costs' },
    { id: 'swift_3', name: 'Swift III', tier: 3, description: '+10% Coins per Second' },
    { id: 'lucky_3', name: 'Lucky III', tier: 3, description: '15% chance to double coins on sells' },
    { id: 'strong_3', name: 'Strong III', tier: 3, description: 'Sell Pets +25% coins' },
    { id: 'resilient_3', name: 'Resilient III', tier: 3, description: 'Sell Fruits +25% coins' },
    { id: 'wealthy_3', name: 'Wealthy III', tier: 3, description: '+50% to all coin gains' },
    { id: 'scavenger_3', name: 'Scavenger III', tier: 3, description: 'Capsule price -20%' },
    { id: 'efficient_3', name: 'Efficient III', tier: 3, description: 'Pet roll price -20%' },
    { id: 'durable_3', name: 'Durable III', tier: 3, description: '+50% Coins per Second' },
    { id: 'critical_3', name: 'Critical III', tier: 3, description: '+20% extra double-sell chance' },
    { id: 'vampiric_3', name: 'Vampiric III', tier: 3, description: 'Refund 12% of roll/capsule costs' },
    { id: 'legendary_3', name: 'Legendary III', tier: 3, description: '+10% all coin gains & CPS; -10% roll/capsule cost; +5% double-sell chance' },
    { id: 'ultimate_3', name: 'Ultimate III', tier: 3, description: '+5% all coin gains; -5% roll/capsule cost; +5% double-sell chance' }
];

// DOM elements
const coinsEl = document.getElementById('coins');
const luckMultiplierEl = document.getElementById('luckMultiplier');
const activeEffectsEl = document.getElementById('activeEffects');
const purchasedItemsEl = document.getElementById('purchasedItems');
const petDetailModal = document.getElementById('petDetailModal');
const closePetDetail = document.getElementById('closePetDetail');
const petDetailName = document.getElementById('petDetailName');
const enchantList = document.getElementById('enchantList');

// State
let state = {
    coins: 0,
    inventory: {},
    petEnchantments: {},
    potionActive: false,
    potionEndsAt: 0,
    purchasedItems: [] // will store items purchased from shop
};

// Load state
function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            state.coins = parsed.coins ?? 0;
            state.inventory = parsed.inventory ?? {};
            state.petEnchantments = parsed.petEnchantments ?? {};
            state.potionActive = parsed.potionActive ?? false;
            state.potionEndsAt = parsed.potionEndsAt ?? 0;
            state.purchasedItems = parsed.purchasedItems ?? [];
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
    coinsEl.textContent = state.coins;
    
    // Update luck multiplier
    if(luckMultiplierEl){
        const isActive = state.potionActive && state.potionEndsAt > Date.now();
        luckMultiplierEl.textContent = isActive ? "3x" : "1x";
    }
    
    // Update active effects
    activeEffectsEl.innerHTML = '';
    if (state.potionActive && state.potionEndsAt > Date.now()) {
        const remaining = Math.ceil((state.potionEndsAt - Date.now()) / 1000);
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        
        const effectEl = document.createElement('div');
        effectEl.className = 'item-card';
        effectEl.innerHTML = `
            <div class="item-icon">🧪</div>
            <div class="item-info">
                <h3>Potion of Luck</h3>
                <p class="effect-active">Active - ${minutes}:${seconds.toString().padStart(2, '0')} remaining</p>
                <p>Makes all items 3x more common</p>
            </div>
        `;
        activeEffectsEl.appendChild(effectEl);
    } else {
        activeEffectsEl.innerHTML = '<p style="color:var(--muted)">No active effects</p>';
    }

    // Update purchased items - show pets with click to view enchantments
    purchasedItemsEl.innerHTML = '';
    
    // Show pets from inventory
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
    
    // Show other purchased items
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

// Check effects timer every second
setInterval(updateUI, 1000);

// Initial load
loadState();