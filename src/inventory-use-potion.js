// Potion usage functionality - shared between inventory.js and index.js
function useBrewedPotion(index){
    const inv = Array.isArray(state.potionInventory) ? state.potionInventory : [];
    const p = inv[index]; 
    if(!p) return;
    
    // apply effect but do not stack beyond 100
    if(state.potionActive && state.potionEndsAt > Date.now()){
        state.luckStacks = Math.min(100, (state.luckStacks||0) + (p.potency||0));
        state.potionEndsAt = Date.now() + (p.durationMs||0);
    } else {
        state.potionActive = true;
        state.luckStacks = Math.min(100, p.potency||0);
        state.potionEndsAt = Date.now() + (p.durationMs||0);
    }
    
    // remove from inventory
    inv.splice(index,1);
    state.potionInventory = inv;
    
    // Save state (use global saveState if available)
    if(typeof saveState === 'function'){
        saveState();
    } else {
        // fallback for inventory page
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
    
    // Update UI
    if(typeof updateUI === 'function'){
        updateUI();
    }
}
