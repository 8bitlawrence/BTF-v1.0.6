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
