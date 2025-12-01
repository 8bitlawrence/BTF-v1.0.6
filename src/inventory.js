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