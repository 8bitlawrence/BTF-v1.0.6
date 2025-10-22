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
        
        // Check expiry (10 minutes)
        if (Date.now() - tradePackage.timestamp > CODE_EXPIRY_MS) {
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
    
    if (Object.keys(currentState.inventory).length === 0 && Object.keys(currentState.fruits).length === 0 && currentState.coins === 0) {
        yourInventoryEl.innerHTML = '<p style="color:var(--muted);text-align:center;padding:40px">No items available to trade</p>';
        return;
    }
    
    // Pets
    if (Object.keys(currentState.inventory).length > 0) {
        const petsHeader = document.createElement('div');
        petsHeader.innerHTML = '<strong style="color:var(--accent);font-size:14px;margin-bottom:8px;display:block">Pets:</strong>';
        yourInventoryEl.appendChild(petsHeader);

        const sel = modalMode === 'offer' ? selectedOffer : selectedRequest;
        for (const [petId, count] of Object.entries(currentState.inventory)) {
            const item = document.createElement('div');
            item.className = 'selectable-item';
            if (sel.pets[petId]) {
                item.classList.add('selected');
            }
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

    // Fruits
    if (Object.keys(currentState.fruits).length > 0) {
        const fruitsHeader = document.createElement('div');
        fruitsHeader.innerHTML = '<strong style="color:var(--accent);font-size:14px;margin-top:12px;margin-bottom:8px;display:block">Fruits:</strong>';
        yourInventoryEl.appendChild(fruitsHeader);

        const sel2 = modalMode === 'offer' ? selectedOffer : selectedRequest;
        for (const [fruitId, count] of Object.entries(currentState.fruits)) {
            const item = document.createElement('div');
            item.className = 'selectable-item';
            if (sel2.fruits[fruitId]) {
                item.classList.add('selected');
            }
            const fruitName = getFruitName(fruitId);
            item.innerHTML = `
                <span>${fruitName} (x${count})</span>
                <input type="number" min="0" max="${count}" value="${sel2.fruits[fruitId] || 0}"
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
            <input type="number" min="0" max="${currentState.coins}" value="${(modalMode==='offer'?selectedOffer.coins:selectedRequest.coins) || 0}"
                style="width:80px;padding:4px;border-radius:4px;background:var(--card);border:1px solid rgba(255,255,255,0.08);color:#e6eef8"
                onchange="updateSelectedCoins(this.value)">
        `;
        yourInventoryEl.appendChild(coinsItem);
    }
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
    const v = Math.max(0, Math.min(parseInt(value) || 0, currentState.coins));
    if (modalMode === 'offer') selectedOffer.coins = v; else selectedRequest.coins = v;
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
        showAlert('Trade offer has expired');
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

    showAlert('Trade completed! Your items were exchanged.');
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
    yourRequestPreviewEl = document.getElementById('yourRequestPreview');
    selectItemsBtn = document.getElementById('selectItemsBtn');
    selectRequestItemsBtn = document.getElementById('selectRequestItemsBtn');
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
        
        const code = generateTradeCode(tradeData);
        if (!code) {
            showAlert('Failed to generate trade code');
            return;
        }

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
        const code = redeemCodeInput.value.trim();
        if (!code) {
            showAlert('Please enter a trade code');
            return;
        }

        let tradeData = loadTradeCode(code);
        if (!tradeData) {
            showAlert('Invalid or expired trade code');
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
        html += `<button onclick="acceptTradeOffer('${code}')">Accept Trade</button>`;
        html += `</div>`;

        tradeOfferDisplay.innerHTML = html;
        tradeOfferDisplay.style.display = 'block';
    });

    // Load initial state
    loadState();
    updateUI();
});
