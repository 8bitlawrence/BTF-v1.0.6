// Christmas Gift dynamic card removed per request. No injection.

// Shop functionality
// Guard: only run if shop page elements exist
if (!document.getElementById('buyLuckPotion')) {
	// Not on shop page, skip this module
} else {

// Wait for DOM to be ready and globals to be availablec
document.addEventListener('DOMContentLoaded', () => {
	// Double-check we're on the shop page after DOM loads
	if (!document.getElementById('buyLuckPotion')) return;
	
// STORAGE_KEY is now defined in index.js
const POTION_COST = 100000;
const POTION_DURATION = 5 * 60 * 1000; // 5 minutes in ms
const BENNY_COST = 10000;
const BENNY_DURATION = 5 * 60 * 1000; // 5 minutes
const BLESSING_COST = 8000;
const BLESSING_DURATION = 5 * 60 * 1000; // 5 minutes
const CHRISTMAS_COST = 150000;
const CHRISTMAS_DURATION = 5 * 60 * 1000; // 5 minutes
const SLOT_MACHINE_COST = 1000000;
const SLOT_MACHINE_BONUS = 5;

// DOM elements (coinsEl and luckMultiplierEl are defined in index.js)
const buyBtn = document.getElementById('buyLuckPotion');
const timerEl = document.getElementById('potionTimer');
const buyBennyBtn = document.getElementById('buyBennyBoost');
const bennyTimerEl = document.getElementById('bennyTimer');
const buyBlessingBtn = document.getElementById('buyPumpkinBlessing');
const blessingTimerEl = document.getElementById('blessingTimer');
const buyChristmasBtn = document.getElementById('buyChristmasPotion');
const christmasTimerEl = document.getElementById('christmasTimer');
const buySlotMachineBtn = document.getElementById('buySlotMachine');
const slotsPurchasedEl = document.getElementById('slotsPurchased');
const buyThanksgivingPotion = document.getElementById('buyThanksgivingPotion');
let btf_plus = false;

// Brewing UI
const tearsDisplayEl = document.getElementById('tearsDisplay');
const brewFruitListEl = document.getElementById('brewFruitList');
const brewSelectionEl = document.getElementById('brewSelection');
const brewPreviewEl = document.getElementById('brewPreview');
const brewPotionBtn = document.getElementById('brewPotionBtn');

// Ensure we have local references to common header elements (may not rely on globals)
const coinsEl = document.getElementById('coins');
const luckMultiplierEl = document.getElementById('luckMultiplier');

// State is now defined in index.js - use the global state
// Local state object removed to avoid duplicate declaration



// Load state
function loadState() {
    try {
        const STORAGE_KEY = 'btf_state_v1'; // Use local constant for shop page
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if(!window.state) window.state = {};
            window.state.coins = parsed.coins ?? 0;
            window.state.potionActive = parsed.potionActive ?? false;
            window.state.potionEndsAt = parsed.potionEndsAt ?? 0;
            window.state.luckStacks = parsed.luckStacks ?? 0;
            window.state.bennyActive = parsed.bennyActive ?? false;
            window.state.bennyEndsAt = parsed.bennyEndsAt ?? 0;
            window.state.blessingActive = parsed.blessingActive ?? false;
            window.state.blessingEndsAt = parsed.blessingEndsAt ?? 0;
            window.state.christmasActive = parsed.christmasActive ?? false;
            window.state.christmasEndsAt = parsed.christmasEndsAt ?? 0;
            window.state.purchasedItems = parsed.purchasedItems ?? [];
            window.state.bonusInventorySlots = parsed.bonusInventorySlots ?? 0;
            window.state.inventory = parsed.inventory ?? (window.state.inventory || {});
            window.state.fruits = parsed.fruits ?? (window.state.fruits || {});
            window.state.tears = parsed.tears ?? 0;
            window.state.potionInventory = parsed.potionInventory ?? [];
        }
    } catch (e) { console.warn('load failed', e) }
    updateUI();
    renderBrewableFruits();
}

// saveState() is now provided by index.js with hash integrity

// Update UI
function updateUI() {
    if(coinsEl){ coinsEl.textContent = window.state.coins; }
    if(tearsDisplayEl){ tearsDisplayEl.textContent = Math.floor(window.state.tears || 0); }
    
    // Update luck multiplier
    if(luckMultiplierEl){
        const isActive = window.state.potionActive && window.state.potionEndsAt > Date.now();
        const cappedStacks = Math.min(window.state.luckStacks, 100);
        luckMultiplierEl.textContent = isActive ? `${1 + cappedStacks * 2}x` : "1x";
    }
    // Benny UI
    if(bennyTimerEl){
        const bActive = window.state.bennyActive && window.state.bennyEndsAt > Date.now();
        buyBennyBtn.disabled = window.state.coins < BENNY_COST || bActive;
        if(bActive){
            const remaining = Math.ceil((window.state.bennyEndsAt - Date.now())/1000);
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
        const blActive = window.state.blessingActive && window.state.blessingEndsAt > Date.now();
        if(buyBlessingBtn) buyBlessingBtn.disabled = window.state.coins < BLESSING_COST || blActive;
        if(blActive){
            const remaining = Math.ceil((window.state.blessingEndsAt - Date.now())/1000);
            const minutes = Math.floor(remaining/60);
            const seconds = remaining%60;
            blessingTimerEl.textContent = `${minutes}:${seconds.toString().padStart(2,'0')} remaining`;
            blessingTimerEl.style.display = 'inline';
        } else {
            blessingTimerEl.style.display = 'none';
        }
    }
    
    // Christmas UI
    if(christmasTimerEl){
        const chrActive = window.state.christmasActive && window.state.christmasEndsAt > Date.now();
        if(buyChristmasBtn) buyChristmasBtn.disabled = window.state.coins < CHRISTMAS_COST || chrActive;
        if(chrActive){
            const remaining = Math.ceil((window.state.christmasEndsAt - Date.now())/1000);
            const minutes = Math.floor(remaining/60);
            const seconds = remaining%60;
            christmasTimerEl.textContent = `${minutes}:${seconds.toString().padStart(2,'0')} remaining`;
            christmasTimerEl.style.display = 'inline';
        } else {
            christmasTimerEl.style.display = 'none';
        }
    }
    
    // Allow buying potions even when active (for stacking)
    buyBtn.disabled = window.state.coins < POTION_COST;
    
    if (window.state.potionActive) {
        const remaining = Math.ceil((window.state.potionEndsAt - Date.now()) / 1000);
        if (remaining <= 0) {
            window.state.potionActive = false;
            window.state.potionEndsAt = 0;
            window.state.luckStacks = 0;
            if(typeof window.saveState === 'function') window.saveState();
            timerEl.style.display = 'none';
            buyBtn.disabled = window.state.coins < POTION_COST;
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
        const purchased = (window.state.bonusInventorySlots || 0) >= SLOT_MACHINE_BONUS;
        buySlotMachineBtn.disabled = (window.state.coins < SLOT_MACHINE_COST) || purchased;
        buySlotMachineBtn.textContent = purchased ? 'Purchased' : 'Buy Slot Machine';
    }
    if(slotsPurchasedEl){
        const base = 20;
        const totalSlots = base + (window.state.bonusInventorySlots || 0);
        const purchased = (window.state.bonusInventorySlots || 0) >= SLOT_MACHINE_BONUS;
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
    const entries = Object.entries(window.state.fruits||{}).filter(([,cnt])=>cnt>0);
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
    const canAfford = (window.state.tears||0) >= cost;
    const haveAll = selectedFruits.every(fid => (window.state.fruits[fid]||0) > 0);
    brewPotionBtn.disabled = !(canAfford && haveAll);
    brewPotionBtn.onclick = ()=>brewPotion(potency, cost);
}

async function brewPotion(potency, cost){
    console.log('brewPotion called', {potency, cost, currentInventory: window.state.potionInventory});
    // consume fruits
    selectedFruits.forEach(fid=>{ if(window.state.fruits[fid]>0){ window.state.fruits[fid] -= 1; if(window.state.fruits[fid]===0) delete window.state.fruits[fid]; } });
    // consume tears
    window.state.tears = Math.max(0, (window.state.tears||0) - cost);
    
    // Determine potion name based on potency
    let potionName = 'Luck Potion';
    if (potency <= 3) {
        potionName = 'Buns Luck Potion';
    } else if (potency <= 8) {
        potionName = 'Weak Luck Potion';
    } else if (potency <= 15) {
        potionName = 'Basic Luck Potion';
    } else if (potency <= 25) {
        potionName = 'Better Luck Potion';
    } else if (potency <= 40) {
        potionName = 'Superior Luck Potion';
    } else if (potency <= 60) {
        potionName = 'Mega Superior Luck Potion';
    } else if (potency <= 80) {
        potionName = 'Mega Mega Superior Luck Potion';
    } else {
        potionName = 'Godly Luck Potion';
    }
    
    // add potion to inventory
    if(!Array.isArray(window.state.potionInventory)) window.state.potionInventory = [];
    window.state.potionInventory.push({ type:'luck', name: potionName, potency, durationMs: BREW_DURATION, createdAt: Date.now() });
    console.log('After push', {newInventory: window.state.potionInventory, stateKeys: Object.keys(window.state)});
    // reset selection
    selectedFruits = [];
    if(typeof window.saveState === 'function') window.saveState();
    console.log('After saveState');
    updateUI();
    renderBrewableFruits();
    if(typeof showAlert === 'function'){
        await showAlert(`${potionName} brewed successfully! Check your Inventory to use it.`);
    } else {
        alert(`${potionName} brewed! Check your Inventory to use it.`);
    }
}



// Buy potion (stackable - extends duration)
buyBtn.addEventListener('click', () => {
    if (window.state.coins >= POTION_COST) {
        window.state.coins -= POTION_COST;
        if (window.state.potionActive && window.state.potionEndsAt > Date.now()) {
            // Already active: increment stacks (max 100), reset timer
            window.state.luckStacks = Math.min(window.state.luckStacks + 1, 100);
            window.state.potionEndsAt = Date.now() + POTION_DURATION;
        } else {
            // Not active or expired: start new effect
            window.state.potionActive = true;
            window.state.luckStacks = 1;
            window.state.potionEndsAt = Date.now() + POTION_DURATION;
        }
        // Add to purchased items if not already there
        if (!window.state.purchasedItems.some(item => item.name === 'Potion of Luck')) {
            window.state.purchasedItems.push({
                name: 'Potion of Luck',
                icon: '',
                description: 'Makes all items 3x more common for 5 minutes'
            });
        }
        if(typeof window.saveState === 'function') window.saveState();
        updateUI();
    }
});

// Buy Benny Boost
if(buyBennyBtn){
    buyBennyBtn.addEventListener('click', ()=>{
        if(window.state.coins >= BENNY_COST && !window.state.bennyActive){
            window.state.coins -= BENNY_COST;
            window.state.bennyActive = true;
            window.state.bennyEndsAt = Date.now() + BENNY_DURATION;
            if(!window.state.purchasedItems.some(i=>i.name==='Benny Boost')){
                window.state.purchasedItems.push({ name: 'Happy Powder', icon: '😃', description: '+10% CPS for 5 minutes' });
            }
            if(typeof window.saveState === 'function') window.saveState();
            updateUI();
        }
    });
}

// Buy Blessing of the Pumpkin
if(buyBlessingBtn){
    buyBlessingBtn.addEventListener('click', ()=>{
        if(window.state.coins >= BLESSING_COST && !window.state.blessingActive){
            window.state.coins -= BLESSING_COST;
            window.state.blessingActive = true;
            window.state.blessingEndsAt = Date.now() + BLESSING_DURATION;
            if(!window.state.purchasedItems.some(i=>i.name==='Blessing of the Pumpkin')){
                window.state.purchasedItems.push({ name: 'Blessing of the Pumpkin', icon: '🎃', description: 'Makes spooky items 2/3 as rare for 5 minutes' });
            }
            if(typeof window.saveState === 'function') window.saveState();
            updateUI();
        }
    });
}

// Buy Christmas Spirit Potion
if(buyChristmasBtn){
    buyChristmasBtn.addEventListener('click', ()=>{
        if(window.state.coins >= CHRISTMAS_COST){
            window.state.coins -= CHRISTMAS_COST;
            window.state.christmasActive = true;
            window.state.christmasEndsAt = Date.now() + CHRISTMAS_DURATION;
            
            // Properly manage luck stacks with the potion system
            if (window.state.potionActive && window.state.potionEndsAt > Date.now()) {
                // Already active: add 2 stacks (max 100), reset timer
                window.state.luckStacks = Math.min((window.state.luckStacks || 0) + 2, 100);
                window.state.potionEndsAt = Date.now() + CHRISTMAS_DURATION;
            } else {
                // Not active or expired: start new effect with 2 stacks
                window.state.potionActive = true;
                window.state.luckStacks += 2;
                window.state.potionEndsAt = Date.now() + CHRISTMAS_DURATION;
            }
            
            if(typeof window.saveState === 'function') window.saveState();
            updateUI();
            if(typeof showAlert === 'function'){
                showAlert('🎄 Christmas Spirit Potion activated! +2x luck for 5 minutes!');
            } else {
                alert('🎄 Christmas Spirit Potion activated! +2x luck for 5 minutes!');
            }
        } else {
            if(typeof showAlert === 'function'){
                showAlert('Not enough coins!');
            } else {
                alert('Not enough coins!');
            }
        }
    });
}

// Buy Slot Machine
if(buySlotMachineBtn){
    buySlotMachineBtn.addEventListener('click', ()=>{
        const alreadyBought = (window.state.bonusInventorySlots || 0) >= SLOT_MACHINE_BONUS;
        if(alreadyBought){
            if(typeof showAlert === 'function'){
                showAlert('You already own the Slot Machine.');
            } else {
                alert('You already own the Slot Machine.');
            }
            return;
        }
        if(window.state.coins >= SLOT_MACHINE_COST){
            window.state.coins -= SLOT_MACHINE_COST;
            window.state.bonusInventorySlots = SLOT_MACHINE_BONUS; // one-time purchase
            if(!window.state.purchasedItems.some(i=>i.name==='Slot Machine')){
                window.state.purchasedItems.push({ name: 'Slot Machine', icon: '🎰', description: `Adds +5 pet inventory slots permanently` });
            }
            if(typeof window.saveState === 'function') window.saveState();
            updateUI();
            if(typeof showAlert === 'function'){
                showAlert(`Purchased! Your pet inventory capacity is now ${20 + window.state.bonusInventorySlots} slots.`);
            } else {
                alert(`Purchased! Your pet inventory capacity is now ${20 + window.state.bonusInventorySlots} slots.`);
            }
        }
    });
}


if(buyThanksgivingPotion){
    buyThanksgivingPotion.addEventListener('click', ()=>{
        if(window.state.coins >= THANKSGIVING_POTION_COST && !window.state.thanksgivingPotionActive){
            window.state.coins -= THANKSGIVING_POTION_COST;
            window.state.thanksgivingPotionActive = true;
            window.state.thanksgivingPotionEndsAt = Date.now() + THANKSGIVING_POTION_DURATION;
            if(!window.state.purchasedItems.some(i=>i.name==='Potion of Thanksgiving')){
                window.state.purchasedItems.push({ name: 'Potion of Thanksgiving', icon: '🦃', description: 'All shop items 50% off for 5 minutes' });
            }
            if(typeof window.saveState === 'function') window.saveState();
            updateUI();
        }
    });
} 

// Christmas Gift Claim handler
const claimChristmasGiftBtn = document.getElementById('claimChristmasGift');
if(claimChristmasGiftBtn){
    // Disable button immediately if already claimed (on page load)
    (function(){
        const GIFT_FLAG_KEY = 'btf_gift_christmas2025_claimed';
        const alreadyClaimed = localStorage.getItem(GIFT_FLAG_KEY) === '1' || (window.state && window.state.gifts && window.state.gifts.christmas2025);
        if(alreadyClaimed){
            claimChristmasGiftBtn.disabled = true;
            claimChristmasGiftBtn.textContent = 'Already Claimed';
        }
    })();

    claimChristmasGiftBtn.addEventListener('click', ()=>{
        const petId = 'pet_f_1';
        const GIFT_FLAG_KEY = 'btf_gift_christmas2025_claimed';
        const alreadyClaimed = localStorage.getItem(GIFT_FLAG_KEY) === '1' || (window.state && window.state.gifts && window.state.gifts.christmas2025);
        if(alreadyClaimed){
            claimChristmasGiftBtn.disabled = true;
            claimChristmasGiftBtn.textContent = 'Already Claimed';
            if(typeof showAlert === 'function'){
                showAlert('Already claimed. Enjoy your Festive Reindeer!');
            } else {
                alert('Already claimed. Enjoy your Festive Reindeer!');
            }
            return;
        }
        
        // Use window.state explicitly (set by index.js)
        if(!window.state || !window.state.inventory){
            // Initialize minimal structures to allow claim to proceed
            window.state = window.state || {};
            window.state.inventory = window.state.inventory || {};
            window.state.bonusInventorySlots = window.state.bonusInventorySlots || 0;
        }
        
        // Check inventory capacity
        const maxSlots = 20 + (window.state.bonusInventorySlots || 0);
        const currentCount = Object.values(window.state.inventory).reduce((s,v)=>s+v,0);
        if(currentCount >= maxSlots){
            if(typeof showAlert === 'function'){
                showAlert(`Your pet inventory is full (${maxSlots} slots). Sell pets first.`);
            } else {
                alert(`Your pet inventory is full (${maxSlots} slots). Sell pets first.`);
            }
            return;
        }
        
        // Grant the pet via global helper if available
        let granted = false;
        if(typeof window.grantPet === 'function'){
            granted = !!window.grantPet(petId, 1);
        }
        if(!granted){
            // Fallback: direct mutation guarded
            window.state.inventory[petId] = (window.state.inventory[petId] || 0) + 1;
            if(typeof window.saveState === 'function') window.saveState();
            if(typeof window.updateUI === 'function') window.updateUI();
        }

        // Persist one-time claim in both state and localStorage
        window.state.gifts = window.state.gifts || {};
        window.state.gifts.christmas2025 = true;
        try { localStorage.setItem(GIFT_FLAG_KEY, '1'); } catch(_) {}
        if(typeof window.saveState === 'function') window.saveState();

        // Update UI and notify
        claimChristmasGiftBtn.disabled = true;
        claimChristmasGiftBtn.textContent = 'Already Claimed';
        if(typeof showAlert === 'function'){
            showAlert('🎁 Christmas gift claimed successfully! Merry Christmas!');
        } else {
            alert('🎁 Christmas gift claimed successfully! Merry Christmas!');
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

}); // End DOMContentLoaded
} // End shop page guard