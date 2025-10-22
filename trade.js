// BTF Trading Client - Offline Code-Based System
const STORAGE_KEY = 'mini_gacha_state_v1';
const TRADE_CODES_KEY = 'btf_trade_codes';
const CODE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

// Pet and Fruit data for name lookups
const PETS = [
	{ id: 'pet_c_1', name: 'Dirt Fox', rarity: 'common', weight: 50, value: 20 },
	{ id: 'pet_c_2', name: 'Dirt Finch', rarity: 'common', weight: 50, value: 20 },
	{ id: 'pet_c_3', name: 'Dirt Turtle', rarity: 'common', weight: 50, value: 25 },
	{ id: 'pet_r_1', name: 'Dusk Fox', rarity: 'rare', weight: 25, value: 150 },
	{ id: 'pet_r_2', name: 'Aero Lynx', rarity: 'rare', weight: 25, value: 160 },
	{ id: 'pet_e_1', name: 'Nebula Kirin', rarity: 'epic', weight: 10, value: 800 },
	{ id: 'pet_l_1', name: 'Infinity Golem', rarity: 'legendary', weight: 0.5, value: 1200 },
	{ id: 'pet_s_1', name: 'Nightmare Skeleton', rarity: 'spooky', weight: 0.3, value: 2500 },
	{ id: 'pet_ch_1', name: 'Chroma Beast', rarity: 'chromatic', weight: 0.25, value: 5000 },
	{ id: 'pet_s_2', name: 'Spooky Ghost', rarity: 'spooky', weight: 0.3, value: 2200 }
];

const FRUITS = [
	{ id: 'fruit_c_1', name: 'Sandfruit', rarity: 'common', weight: 50, value: 5 },
	{ id: 'fruit_c_2', name: 'Fireberry', rarity: 'common', weight: 50, value: 5 },
	{ id: 'fruit_r_1', name: 'Golden Apple', rarity: 'rare', weight: 35, value: 30 },
	{ id: 'fruit_e_1', name: 'Starfruit', rarity: 'epic', weight: 10, value: 150 },
	{ id: 'fruit_l_1', name: 'Eternal Mango', rarity: 'legendary', weight: 0.5, value: 200 },
	{ id: 'fruit_c_3', name: 'Dirtfruit', rarity: 'common', weight: 50, value: 5 },
	{ id: 'fruit_c_4', name: 'Watermelon', rarity: 'common', weight: 50, value: 5 },
	{ id: 'fruit_ch_1', name: 'Chromafruit', rarity: 'chromatic', weight: 0.25, value: 1200 },
	{ id: 'fruit_r_2', name: 'Lunar Melon', rarity: 'rare', weight: 35, value: 30 },
	{ id: 'fruit_e_2', name: 'Solar Melon', rarity: 'epic', weight: 10, value: 150 },
	{ id: 'fruit_l_2', name: 'Mythic Pineapple', rarity: 'legendary', weight: 0.5, value: 200 },
	{ id: 'fruit_ch_2', name: 'Positive Potato', rarity: 'chromatic', weight: 0.25, value: 1200 },
	{ id: 'fruit_l_3', name: 'Negative Potato', rarity: 'legendary', weight: 0.5, value: 500 },
	{ id: 'fruit_s_1', name: 'Cursed Pumpkin', rarity: 'spooky', weight: 0.3, value: 800 }
];

// Helper functions to get item names
function getPetName(petId) {
    const pet = PETS.find(p => p.id === petId);
    return pet ? pet.name : petId;
}

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
let selectedItems = {
    pets: {},
    fruits: {},
    coins: 0
};
let tradeMessage = '';

// DOM elements (will be initialized after DOM loads)
let coinsEl, yourOfferPreviewEl, selectItemsBtn, generateCodeBtn, tradeCodeDisplay, tradeCodeInput, copyCodeBtn;
let redeemCodeInput, redeemCodeBtn, tradeOfferDisplay, itemSelectionModal, closeItemModal;
let yourInventoryEl, tradeNoteEl, cancelItemSelectionBtn, confirmItemSelectionBtn;

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

// Generate random trade code
function generateTradeCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'BTF-';
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

// Save trade code
function saveTradeCode(code, data) {
    try {
        const codes = JSON.parse(localStorage.getItem(TRADE_CODES_KEY) || '{}');
        codes[code] = {
            data: data,
            timestamp: Date.now(),
            expires: Date.now() + CODE_EXPIRY_MS
        };
        localStorage.setItem(TRADE_CODES_KEY, JSON.stringify(codes));
    } catch (e) {
        console.error('Failed to save trade code:', e);
    }
}

// Load trade code
function loadTradeCode(code) {
    try {
        const codes = JSON.parse(localStorage.getItem(TRADE_CODES_KEY) || '{}');
        const trade = codes[code];
        
        if (!trade) return null;
        
        // Check expiry
        if (Date.now() > trade.expires) {
            delete codes[code];
            localStorage.setItem(TRADE_CODES_KEY, JSON.stringify(codes));
            return null;
        }
        
        return trade.data;
    } catch (e) {
        console.error('Failed to load trade code:', e);
        return null;
    }
}

// Clean expired codes
function cleanExpiredCodes() {
    try {
        const codes = JSON.parse(localStorage.getItem(TRADE_CODES_KEY) || '{}');
        const now = Date.now();
        let changed = false;
        
        for (const [code, trade] of Object.entries(codes)) {
            if (now > trade.expires) {
                delete codes[code];
                changed = true;
            }
        }
        
        if (changed) {
            localStorage.setItem(TRADE_CODES_KEY, JSON.stringify(codes));
        }
    } catch (e) {
        console.error('Failed to clean codes:', e);
    }
}

// Close item selection modal
function closeItemSelectionModal() {
    itemSelectionModal.classList.remove('show');
}

// Render your inventory in item selection modal
function renderYourInventory() {
    yourInventoryEl.innerHTML = '';
    
    if (Object.keys(currentState.inventory).length === 0 && Object.keys(currentState.fruits).length === 0 && currentState.coins === 0) {
        yourInventoryEl.innerHTML = '<p style="color:var(--muted);text-align:center;padding:40px">No items available to trade</p>';
        return;
    }
    
    // Pets
    if (Object.keys(currentState.inventory).length > 0) {
        const petsHeader = document.createElement('div');
        petsHeader.innerHTML = '<strong style="color:var(--accent);font-size:14px;margin-bottom:8px;display:block">Pets:</strong>';
        yourInventoryEl.appendChild(petsHeader);

        for (const [petId, count] of Object.entries(currentState.inventory)) {
            const item = document.createElement('div');
            item.className = 'selectable-item';
            if (selectedItems.pets[petId]) {
                item.classList.add('selected');
            }
            const petName = getPetName(petId);
            item.innerHTML = `
                <span>${petName} (x${count})</span>
                <input type="number" min="0" max="${count}" value="${selectedItems.pets[petId] || 0}" 
                    style="width:60px;padding:4px;border-radius:4px;background:var(--card);border:1px solid rgba(255,255,255,0.08);color:#e6eef8"
                    onchange="updateSelectedItem('pets', '${petId}', this.value, ${count})">
            `;
            yourInventoryEl.appendChild(item);
        }
    }

    // Fruits
    if (Object.keys(currentState.fruits).length > 0) {
        const fruitsHeader = document.createElement('div');
        fruitsHeader.innerHTML = '<strong style="color:var(--accent);font-size:14px;margin-top:12px;margin-bottom:8px;display:block">Fruits:</strong>';
        yourInventoryEl.appendChild(fruitsHeader);

        for (const [fruitId, count] of Object.entries(currentState.fruits)) {
            const item = document.createElement('div');
            item.className = 'selectable-item';
            if (selectedItems.fruits[fruitId]) {
                item.classList.add('selected');
            }
            const fruitName = getFruitName(fruitId);
            item.innerHTML = `
                <span>${fruitName} (x${count})</span>
                <input type="number" min="0" max="${count}" value="${selectedItems.fruits[fruitId] || 0}"
                    style="width:60px;padding:4px;border-radius:4px;background:var(--card);border:1px solid rgba(255,255,255,0.08);color:#e6eef8"
                    onchange="updateSelectedItem('fruits', '${fruitId}', this.value, ${count})">
            `;
            yourInventoryEl.appendChild(item);
        }
    }

    // Coins
    if (currentState.coins > 0) {
        const coinsHeader = document.createElement('div');
        coinsHeader.innerHTML = '<strong style="color:var(--accent);font-size:14px;margin-top:12px;margin-bottom:8px;display:block">Coins:</strong>';
        yourInventoryEl.appendChild(coinsHeader);
        
        const coinsItem = document.createElement('div');
        coinsItem.className = 'selectable-item';
        coinsItem.innerHTML = `
            <span>💰 Coins (${currentState.coins} available)</span>
            <input type="number" min="0" max="${currentState.coins}" value="${selectedItems.coins || 0}"
                style="width:80px;padding:4px;border-radius:4px;background:var(--card);border:1px solid rgba(255,255,255,0.08);color:#e6eef8"
                onchange="updateSelectedCoins(this.value)">
        `;
        yourInventoryEl.appendChild(coinsItem);
    }
}

// Update selected item
function updateSelectedItem(type, id, value, max) {
    const count = Math.max(0, Math.min(parseInt(value) || 0, max));
    if (count > 0) {
        selectedItems[type][id] = count;
    } else {
        delete selectedItems[type][id];
    }
    renderYourOffer();
}
window.updateSelectedItem = updateSelectedItem;

// Update selected coins
function updateSelectedCoins(value) {
    selectedItems.coins = Math.max(0, Math.min(parseInt(value) || 0, currentState.coins));
    renderYourOffer();
}
window.updateSelectedCoins = updateSelectedCoins;

// Render offer preview
function renderOfferPreview() {
    yourOfferPreviewEl.innerHTML = '';
    let hasItems = false;

    for (const [petId, count] of Object.entries(selectedItems.pets)) {
        hasItems = true;
        const item = document.createElement('span');
        item.className = 'trade-item';
        const petName = getPetName(petId);
        item.textContent = `${petName}: x${count}`;
        yourOfferPreviewEl.appendChild(item);
    }

    for (const [fruitId, count] of Object.entries(selectedItems.fruits)) {
        hasItems = true;
        const item = document.createElement('span');
        item.className = 'trade-item';
        const fruitName = getFruitName(fruitId);
        item.textContent = `${fruitName}: x${count}`;
        yourOfferPreviewEl.appendChild(item);
    }

    if (selectedItems.coins > 0) {
        hasItems = true;
        const item = document.createElement('span');
        item.className = 'trade-item';
        item.textContent = `💰 ${selectedItems.coins} coins`;
        yourOfferPreviewEl.appendChild(item);
    }

    if (!hasItems) {
        yourOfferPreviewEl.innerHTML = '<p style="color:var(--muted);font-size:13px;margin:0">No items selected</p>';
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
    const tradeData = loadTradeCode(code);
    
    if (!tradeData) {
        alert('Trade offer has expired');
        return;
    }

    // Validate that items still exist
    for (const [petId, count] of Object.entries(tradeData.items.pets || {})) {
        if ((currentState.inventory[petId] || 0) < count) {
            alert(`You don't have enough ${petId} (need ${count}, have ${currentState.inventory[petId] || 0})`);
            return;
        }
    }

    for (const [fruitId, count] of Object.entries(tradeData.items.fruits || {})) {
        if ((currentState.fruits[fruitId] || 0) < count) {
            alert(`You don't have enough ${fruitId} (need ${count}, have ${currentState.fruits[fruitId] || 0})`);
            return;
        }
    }

    if (tradeData.items.coins > currentState.coins) {
        alert(`You don't have enough coins (need ${tradeData.items.coins}, have ${currentState.coins})`);
        return;
    }

    // Execute trade: Add items to your inventory
    for (const [petId, count] of Object.entries(tradeData.items.pets || {})) {
        currentState.inventory[petId] = (currentState.inventory[petId] || 0) + count;
    }

    for (const [fruitId, count] of Object.entries(tradeData.items.fruits || {})) {
        currentState.fruits[fruitId] = (currentState.fruits[fruitId] || 0) + count;
    }

    currentState.coins += (tradeData.items.coins || 0);

    saveState();
    updateUI();

    // Remove the used code
    try {
        const codes = JSON.parse(localStorage.getItem(TRADE_CODES_KEY) || '{}');
        delete codes[code];
        localStorage.setItem(TRADE_CODES_KEY, JSON.stringify(codes));
    } catch (e) {
        console.error('Failed to remove code:', e);
    }

    alert('Trade completed successfully! Items added to your inventory.');
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM elements
    coinsEl = document.getElementById('coins');
    yourOfferPreviewEl = document.getElementById('yourOfferPreview');
    selectItemsBtn = document.getElementById('selectItemsBtn');
    generateCodeBtn = document.getElementById('generateCodeBtn');
    tradeCodeDisplay = document.getElementById('tradeCodeDisplay');
    tradeCodeInput = document.getElementById('tradeCodeInput');
    copyCodeBtn = document.getElementById('copyCodeBtn');
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
        renderYourInventory();
        itemSelectionModal.classList.add('show');
    });

    closeItemModal.addEventListener('click', closeItemSelectionModal);
    cancelItemSelectionBtn.addEventListener('click', closeItemSelectionModal);

    confirmItemSelectionBtn.addEventListener('click', () => {
        tradeMessage = tradeNoteEl.value.trim();
        closeItemSelectionModal();
        renderOfferPreview();
        
        // Enable generate code button if items selected
        const hasItems = Object.keys(selectedItems.pets).length > 0 || 
                         Object.keys(selectedItems.fruits).length > 0 || 
                         selectedItems.coins > 0;
        generateCodeBtn.disabled = !hasItems;
    });

    generateCodeBtn.addEventListener('click', () => {
        const code = generateTradeCode();
        const tradeData = {
            items: selectedItems,
            message: tradeMessage,
            timestamp: Date.now()
        };
        saveTradeCode(code, tradeData);

        tradeCodeInput.value = code;
        tradeCodeDisplay.style.display = 'block';
    });

    copyCodeBtn.addEventListener('click', () => {
        tradeCodeInput.select();
        document.execCommand('copy');
        const orig = copyCodeBtn.textContent;
        copyCodeBtn.textContent = '✓ Copied!';
        setTimeout(() => copyCodeBtn.textContent = orig, 2000);
    });

    redeemCodeBtn.addEventListener('click', () => {
        const code = redeemCodeInput.value.trim().toUpperCase();
        if (!code) {
            alert('Please enter a trade code');
            return;
        }

        const tradeData = loadTradeCode(code);
        if (!tradeData) {
            alert('Invalid or expired trade code');
            return;
        }

        // Display the trade offer
        let html = '<h3 style="margin-top:0">Trade Offer</h3>';
        
        if (tradeData.message) {
            html += `<p style="color:var(--muted);font-style:italic;margin-bottom:12px">"${tradeData.message}"</p>`;
        }

        html += '<div class="trade-items" style="margin-bottom:16px">';
        
        // Pets
        for (const [petId, count] of Object.entries(tradeData.items.pets || {})) {
            const petName = getPetName(petId);
            html += `<div class="trade-item"><span>${petName}</span><span>×${count}</span></div>`;
        }
        
        // Fruits
        for (const [fruitId, count] of Object.entries(tradeData.items.fruits || {})) {
            const fruitName = getFruitName(fruitId);
            html += `<div class="trade-item"><span>${fruitName}</span><span>×${count}</span></div>`;
        }
        
        // Coins
        if (tradeData.items.coins > 0) {
            html += `<div class="trade-item"><span>💰 Coins</span><span>×${tradeData.items.coins}</span></div>`;
        }

        html += '</div>';
        html += `<div style="display:flex;gap:10px;justify-content:flex-end">`;
        html += `<button class="muted" onclick="declineTradeOffer()">Decline</button>`;
        html += `<button onclick="acceptTradeOffer('${code}')">Accept Trade</button>`;
        html += `</div>`;

        tradeOfferDisplay.innerHTML = html;
        tradeOfferDisplay.style.display = 'block';
    });

    // Load initial state
    loadState();
    cleanExpiredCodes();
    updateUI();
});

// Clean expired codes every minute
setInterval(cleanExpiredCodes, 60000);
