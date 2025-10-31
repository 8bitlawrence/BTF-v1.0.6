// Shop functionality
const STORAGE_KEY = 'mini_gacha_state_v1';
const POTION_COST = 100000;
const POTION_DURATION = 5 * 60 * 1000; // 5 minutes in ms
const BENNY_COST = 10000;
const BENNY_DURATION = 5 * 60 * 1000; // 5 minutes
const BLESSING_COST = 8000;
const BLESSING_DURATION = 5 * 60 * 1000; // 5 minutes
const SLOT_MACHINE_COST = 1000000;
const SLOT_MACHINE_BONUS = 5;

// DOM elements
const coinsEl = document.getElementById('coins');
const luckMultiplierEl = document.getElementById('luckMultiplier');
const buyBtn = document.getElementById('buyLuckPotion');
const timerEl = document.getElementById('potionTimer');
const buyBennyBtn = document.getElementById('buyBennyBoost');
const bennyTimerEl = document.getElementById('bennyTimer');
const buyBlessingBtn = document.getElementById('buyPumpkinBlessing');
const blessingTimerEl = document.getElementById('blessingTimer');
const buySlotMachineBtn = document.getElementById('buySlotMachine');
const slotsPurchasedEl = document.getElementById('slotsPurchased');

// State
let state = {
    coins: 0,
    potionActive: false,
    potionEndsAt: 0,
    luckStacks: 0,
    bennyActive: false,
    bennyEndsAt: 0,
    blessingActive: false,
    blessingEndsAt: 0,
    purchasedItems: [],
    bonusInventorySlots: 0
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
            state.luckStacks = parsed.luckStacks ?? 0;
            state.bennyActive = parsed.bennyActive ?? false;
            state.bennyEndsAt = parsed.bennyEndsAt ?? 0;
            state.blessingActive = parsed.blessingActive ?? false;
            state.blessingEndsAt = parsed.blessingEndsAt ?? 0;
            state.purchasedItems = parsed.purchasedItems ?? [];
            state.bonusInventorySlots = parsed.bonusInventorySlots ?? 0;
        }
    } catch (e) { console.warn('load failed', e) }
    updateUI();
}

// Save state
function saveState() {
    try {
        const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            ...current,
            coins: state.coins,
            potionActive: state.potionActive,
            potionEndsAt: state.potionEndsAt,
            luckStacks: state.luckStacks,
            bennyActive: state.bennyActive,
            bennyEndsAt: state.bennyEndsAt,
            blessingActive: state.blessingActive,
            blessingEndsAt: state.blessingEndsAt,
            purchasedItems: state.purchasedItems,
            bonusInventorySlots: state.bonusInventorySlots
        }));
    } catch (e) { console.warn(e) }
}

// Update UI
function updateUI() {
    coinsEl.textContent = state.coins;
    
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

// Check timer every second
setInterval(updateUI, 1000);

// Initial load
loadState();