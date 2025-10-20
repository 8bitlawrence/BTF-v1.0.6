// Shop functionality
const STORAGE_KEY = 'mini_gacha_state_v1';
const POTION_COST = 10000;
const POTION_DURATION = 5 * 60 * 1000; // 5 minutes in ms
const BENNY_COST = 10000;
const BENNY_DURATION = 5 * 60 * 1000; // 5 minutes

// DOM elements
const coinsEl = document.getElementById('coins');
const luckMultiplierEl = document.getElementById('luckMultiplier');
const buyBtn = document.getElementById('buyLuckPotion');
const timerEl = document.getElementById('potionTimer');
const buyBennyBtn = document.getElementById('buyBennyBoost');
const bennyTimerEl = document.getElementById('bennyTimer');

// State
let state = {
    coins: 0,
    potionActive: false,
    potionEndsAt: 0,
    bennyActive: false,
    bennyEndsAt: 0,
    purchasedItems: []
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

// Save state
function saveState() {
    try {
        const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            ...current,
            coins: state.coins,
            potionActive: state.potionActive,
            potionEndsAt: state.potionEndsAt,
            bennyActive: state.bennyActive,
            bennyEndsAt: state.bennyEndsAt,
            purchasedItems: state.purchasedItems
        }));
    } catch (e) { console.warn(e) }
}

// Update UI
function updateUI() {
    coinsEl.textContent = state.coins;
    
    // Update luck multiplier
    if(luckMultiplierEl){
        const isActive = state.potionActive && state.potionEndsAt > Date.now();
        luckMultiplierEl.textContent = isActive ? "3x" : "1x";
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
    
    buyBtn.disabled = state.coins < POTION_COST || state.potionActive;
    
    if (state.potionActive) {
        const remaining = Math.ceil((state.potionEndsAt - Date.now()) / 1000);
        if (remaining <= 0) {
            state.potionActive = false;
            state.potionEndsAt = 0;
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
}

// Buy potion
buyBtn.addEventListener('click', () => {
    if (state.coins >= POTION_COST && !state.potionActive) {
        state.coins -= POTION_COST;
        state.potionActive = true;
        state.potionEndsAt = Date.now() + POTION_DURATION;
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

// Check timer every second
setInterval(updateUI, 1000);

// Initial load
loadState();