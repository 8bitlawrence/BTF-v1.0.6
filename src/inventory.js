// Inventory functionality
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
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            state.coins = parsed.coins ?? 0;
            state.inventory = parsed.inventory ?? {};
            state.petEnchantments = parsed.petEnchantments ?? {};
            state.potionActive = parsed.potionActive ?? false;
            state.potionEndsAt = parsed.potionEndsAt ?? 0;
            state.luckStacks = parsed.luckStacks ?? 0;
            state.purchasedItems = parsed.purchasedItems ?? [];
            state.potionInventory = parsed.potionInventory ?? [];
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
        const cappedStacks = Math.min(state.luckStacks, 100);
        luckMultiplierEl.textContent = isActive ? `${1 + cappedStacks * 2}x` : "1x";
    }
    
    // Update active effects
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

    // Update brewed potions section
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
                useBtn.addEventListener('click', () => useBrewedPotion(idx));
                potionEl.appendChild(useBtn);
                brewedPotionsEl.appendChild(potionEl);
            });
        }
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