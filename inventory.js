// Inventory functionality
const STORAGE_KEY = 'mini_gacha_state_v1';

// DOM elements
const coinsEl = document.getElementById('coins');
const luckMultiplierEl = document.getElementById('luckMultiplier');
const activeEffectsEl = document.getElementById('activeEffects');
const purchasedItemsEl = document.getElementById('purchasedItems');

// State
let state = {
    coins: 0,
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
            state.potionActive = parsed.potionActive ?? false;
            state.potionEndsAt = parsed.potionEndsAt ?? 0;
            state.purchasedItems = parsed.purchasedItems ?? [];
        }
    } catch (e) { console.warn('load failed', e) }
    updateUI();
}

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

    // Update purchased items
    purchasedItemsEl.innerHTML = '';
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
    } else {
        purchasedItemsEl.innerHTML = '<p style="color:var(--muted)">No items purchased yet</p>';
    }
}

// Check effects timer every second
setInterval(updateUI, 1000);

// Initial load
loadState();