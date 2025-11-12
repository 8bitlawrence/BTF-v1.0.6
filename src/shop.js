// Shop functionality
// STORAGE_KEY is now defined in index.js
const POTION_COST = 100000;
const POTION_DURATION = 5 * 60 * 1000; // 5 minutes in ms
const BENNY_COST = 10000;
const BENNY_DURATION = 5 * 60 * 1000; // 5 minutes
const BLESSING_COST = 8000;
const BLESSING_DURATION = 5 * 60 * 1000; // 5 minutes
const SLOT_MACHINE_COST = 1000000;
const SLOT_MACHINE_BONUS = 5;

// DOM elements (coinsEl and luckMultiplierEl are defined in index.js)
const buyBtn = document.getElementById('buyLuckPotion');
const timerEl = document.getElementById('potionTimer');
const buyBennyBtn = document.getElementById('buyBennyBoost');
const bennyTimerEl = document.getElementById('bennyTimer');
const buyBlessingBtn = document.getElementById('buyPumpkinBlessing');
const blessingTimerEl = document.getElementById('blessingTimer');
const buySlotMachineBtn = document.getElementById('buySlotMachine');
const slotsPurchasedEl = document.getElementById('slotsPurchased');
// Brewing UI
const tearsDisplayEl = document.getElementById('tearsDisplay');
const brewFruitListEl = document.getElementById('brewFruitList');
const brewSelectionEl = document.getElementById('brewSelection');
const brewPreviewEl = document.getElementById('brewPreview');
const brewPotionBtn = document.getElementById('brewPotionBtn');

// State is now defined in index.js - use the global state
// Local state object removed to avoid duplicate declaration



// Load state
function loadState() {
    try {
        const STORAGE_KEY = 'btf_state_v1'; // Use local constant for shop page
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            state.coins = parsed.coins ?? 0;
            state.potionActive = parsed.potionActive ?? false;
            state.potionEndsAt = parsed.potionEndsAt ?? 0;
            state.luckStacks = parsed.luckStacks ?? 0;
            state.bennyActive = parsed.bennyActive ?? false;
            state.bennyEndsAt = parsed.bennyEndsAt ?? 0;
            state.blessingActive = parsed.blessingActive ?? false;
            state.blessingEndsAt = parsed.blessingEndsAt ?? 0;
            state.purchasedItems = parsed.purchasedItems ?? [];
            state.bonusInventorySlots = parsed.bonusInventorySlots ?? 0;
            state.fruits = parsed.fruits ?? {};
            state.tears = parsed.tears ?? 0;
            state.potionInventory = parsed.potionInventory ?? [];
        }
    } catch (e) { console.warn('load failed', e) }
    updateUI();
}

// saveState() is now provided by index.js with hash integrity

// Update UI
function updateUI() {
    coinsEl.textContent = state.coins;
    if(tearsDisplayEl){ tearsDisplayEl.textContent = Math.floor(state.tears || 0); }
    
    // Update luck multiplier
    if(luckMultiplierEl){
        const isActive = state.potionActive && state.potionEndsAt > Date.now();
        const cappedStacks = Math.min(state.luckStacks, 100);
        luckMultiplierEl.textContent = isActive ? `${1 + cappedStacks * 2}x` : "1x";
    }
    // Benny UI
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
    // Blessing UI
    if(blessingTimerEl){
        const blActive = state.blessingActive && state.blessingEndsAt > Date.now();
        if(buyBlessingBtn) buyBlessingBtn.disabled = state.coins < BLESSING_COST || blActive;
        if(blActive){
            const remaining = Math.ceil((state.blessingEndsAt - Date.now())/1000);
            const minutes = Math.floor(remaining/60);
            const seconds = remaining%60;
            blessingTimerEl.textContent = `${minutes}:${seconds.toString().padStart(2,'0')} remaining`;
            blessingTimerEl.style.display = 'inline';
        } else {
            blessingTimerEl.style.display = 'none';
        }
    }
    
    // Allow buying potions even when active (for stacking)
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
    
    // Slot Machine UI (one-time purchase)
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
    const canAfford = (state.tears||0) >= cost;
    const haveAll = selectedFruits.every(fid => (state.fruits[fid]||0) > 0);
    brewPotionBtn.disabled = !(canAfford && haveAll);
    brewPotionBtn.onclick = ()=>brewPotion(potency, cost);
}

async function brewPotion(potency, cost){
    console.log('brewPotion called', {potency, cost, currentInventory: state.potionInventory});
    // consume fruits
    selectedFruits.forEach(fid=>{ if(state.fruits[fid]>0){ state.fruits[fid] -= 1; if(state.fruits[fid]===0) delete state.fruits[fid]; } });
    // consume tears
    state.tears = Math.max(0, (state.tears||0) - cost);
    // add potion to inventory
    if(!Array.isArray(state.potionInventory)) state.potionInventory = [];
    state.potionInventory.push({ type:'luck', name:'Brewed Luck Potion', potency, durationMs: BREW_DURATION, createdAt: Date.now() });
    console.log('After push', {newInventory: state.potionInventory, stateKeys: Object.keys(state)});
    // reset selection
    selectedFruits = [];
    saveState();
    console.log('After saveState');
    updateUI();
    renderBrewableFruits();
    if(typeof showAlert === 'function'){
        await showAlert(`✅ Potion brewed successfully! Check your Inventory to use it.`);
    } else {
        alert('Potion brewed! Check your Inventory to use it.');
    }
}



// Buy potion (stackable - extends duration)
buyBtn.addEventListener('click', () => {
    if (state.coins >= POTION_COST) {
        state.coins -= POTION_COST;
        if (state.potionActive && state.potionEndsAt > Date.now()) {
            // Already active: increment stacks (max 100), reset timer
            state.luckStacks = Math.min(state.luckStacks + 1, 100);
            state.potionEndsAt = Date.now() + POTION_DURATION;
        } else {
            // Not active or expired: start new effect
            state.potionActive = true;
            state.luckStacks = 1;
            state.potionEndsAt = Date.now() + POTION_DURATION;
        }
        // Add to purchased items if not already there
        if (!state.purchasedItems.some(item => item.name === 'Potion of Luck')) {
            state.purchasedItems.push({
                name: 'Potion of Luck',
                icon: '',
                description: 'Makes all items 3x more common for 5 minutes'
            });
        }
        saveState();
        updateUI();
    }
});

// Buy Benny Boost
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
            updateUI();
        }
    });
}

// Buy Blessing of the Pumpkin
if(buyBlessingBtn){
    buyBlessingBtn.addEventListener('click', ()=>{
        if(state.coins >= BLESSING_COST && !state.blessingActive){
            state.coins -= BLESSING_COST;
            state.blessingActive = true;
            state.blessingEndsAt = Date.now() + BLESSING_DURATION;
            if(!state.purchasedItems.some(i=>i.name==='Blessing of the Pumpkin')){
                state.purchasedItems.push({ name: 'Blessing of the Pumpkin', icon: '🎃', description: 'Makes spooky items 2/3 as rare for 5 minutes' });
            }
            saveState();
            updateUI();
        }
    });
}

// Buy Slot Machine
if(buySlotMachineBtn){
    buySlotMachineBtn.addEventListener('click', ()=>{
        const alreadyBought = (state.bonusInventorySlots || 0) >= SLOT_MACHINE_BONUS;
        if(alreadyBought){
            alert('You already own the Slot Machine.');
            return;
        }
        if(state.coins >= SLOT_MACHINE_COST){
            state.coins -= SLOT_MACHINE_COST;
            state.bonusInventorySlots = SLOT_MACHINE_BONUS; // one-time purchase
            if(!state.purchasedItems.some(i=>i.name==='Slot Machine')){
                state.purchasedItems.push({ name: 'Slot Machine', icon: '🎰', description: `Adds +5 pet inventory slots permanently` });
            }
            saveState();
            updateUI();
            alert(`Purchased! Your pet inventory capacity is now ${20 + state.bonusInventorySlots} slots.`);
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