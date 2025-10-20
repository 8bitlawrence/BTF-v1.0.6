
// Mini Gacha Game

// Data model: pets with rarities and weights
const PETS = [
	{ id: 'pet_c_1', name: 'Dirt Pup', rarity: 'common', weight: 50, value: 20 },
	{ id: 'pet_c_2', name: 'Dirt Finch', rarity: 'common', weight: 50, value: 20 },
	{ id: 'pet_c_3', name: 'Dirt Turtle', rarity: 'common', weight: 50, value: 25 },

	{ id: 'pet_r_1', name: 'Dusk Fox', rarity: 'rare', weight: 25, value: 150 },
	{ id: 'pet_r_2', name: 'Aero Lynx', rarity: 'rare', weight: 25, value: 160 },

	{ id: 'pet_e_1', name: 'Nebula Kirin', rarity: 'epic', weight: 10, value: 800 },
	{ id: 'pet_l_1', name: 'Infinity Golem', rarity: 'legendary', weight: 0.5, value: 1200 },
	{ id: 'pet_ch_1', name: 'Chroma Beast', rarity: 'chromatic', weight: 0.25, value: 5000 },
	
];

// Prices
const PRICE_SINGLE = 100;
const PRICE_TEN = 900; // discount

// Inventory limits
const MAX_INVENTORY = 20;

// Config: show admin button and starting coins
const SHOW_ADMIN_BUTTON = false; // set to false to hide admin button
const START_WITH_MILLION = false; // if true, default starting coins = 1,000,000 when no save exists

// Capsule prices for fruits
const CAP_PRICE_SINGLE = 20;
const CAP_PRICE_TEN = 180;

// FRUITS: capsule pool
const FRUITS = [
	{ id: 'fruit_c_1', name: 'Sandfruit', rarity: 'common', weight: 50, value: 5 },
	{ id: 'fruit_c_2', name: 'Fireberry', rarity: 'common', weight: 50, value: 5 },
	{ id: 'fruit_r_1', name: 'Golden Apple', rarity: 'rare', weight: 35, value: 30 },
	{ id: 'fruit_e_1', name: 'Starfruit', rarity: 'epic', weight: 10, value: 150 },
	{ id: 'fruit_l_1', name: 'Eternal Mango', rarity: 'legendary', weight: 0.5, value: 200 },
	{id: 'fruit_c_3', name: 'Dirtfruit', rarity: 'common', weight: 50, value: 5},
	{id: 'fruit_c_4', name: 'Watermelon', rarity: 'common', weight: 50, value: 5},
	{id: 'fruit_ch_1', name: 'Chromafruit', rarity: 'chromatic', weight: 0.25, value: 1200}
	,{ id: 'fruit_r_2', name: 'Lunar Melon', rarity: 'rare', weight: 35, value: 30 }
	,{ id: 'fruit_e_2', name: 'Solar Melon', rarity: 'epic', weight: 10, value: 150 }
	,{ id: 'fruit_l_2', name: 'Mythic Pineapple', rarity: 'legendary', weight: 0.5, value: 200 }
	,{ id: 'fruit_ch_2', name: 'Positive Potato', rarity: 'chromatic', weight: 0.25, value: 1200 }
	,{ id: 'fruit_l_3', name: 'Negative Potato', rarity: 'legendary', weight: 0.5, value: 500 }
	,	




];

// State
let state = {
	coins: 2000,
	inventory: {}, // pets id -> count
	fruits: {}, // fruits id -> count
	potionActive: false,
	potionEndsAt: 0,
	bennyActive: false,
	bennyEndsAt: 0
};

// DOM
const coinsEl = document.getElementById('coins');
const cpsEl = document.getElementById('cps');
const luckMultiplierEl = document.getElementById('luckMultiplier');
const singleBtn = document.getElementById('singleRoll');
const tenBtn = document.getElementById('tenRoll');
const resultArea = document.getElementById('resultArea');
const inventoryList = document.getElementById('inventoryListPets');
const clearInv = document.getElementById('clearInv');

const inventoryListFruits = document.getElementById('inventoryListFruits');
const clearFruits = document.getElementById('clearFruits');
const capSingle = document.getElementById('capSingle');
const capTen = document.getElementById('capTen');
const capsuleResultArea = document.getElementById('capsuleResultArea');

// Persistence
const STORAGE_KEY = 'mini_gacha_state_v1';
function loadState(){
	try{
		const raw = localStorage.getItem(STORAGE_KEY);
		if(raw){
			const parsed = JSON.parse(raw);
			// merge with defaults to ensure keys exist (older saves may miss fields)
			state = {
				coins: parsed.coins ?? (START_WITH_MILLION ? 1000000 : 2000),
				inventory: parsed.inventory ?? {},
				fruits: parsed.fruits ?? {},
				potionActive: parsed.potionActive ?? false,
				potionEndsAt: parsed.potionEndsAt ?? 0,
				bennyActive: parsed.bennyActive ?? false,
				bennyEndsAt: parsed.bennyEndsAt ?? 0
			};
		} else {
			// No save data found, start fresh
			state = {
				coins: START_WITH_MILLION ? 1000000 : 2000,
				inventory: {},
				fruits: {}
			};
		}
	}catch(e){ console.warn('load failed', e) }
}
function saveState(){
	try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){ console.warn(e) }
}

// Helpers: weighted pick
function weightedPick(items){
	// Check if luck potion is active
	const potionActive = state.potionActive && state.potionEndsAt > Date.now();
	const multiplier = potionActive ? 3 : 1;

	// Apply luck multiplier to weights
	const total = items.reduce((s,i)=>s+(i.weight * multiplier),0);
	let r = Math.random()*total;
	for(const it of items){
		if(r < (it.weight * multiplier)) return it;
		r -= (it.weight * multiplier);
	}
	return items[items.length-1];
}

// Coins-per-second mapping by rarity
const RARITY_CPS = {
	common: 1,
	rare: 3,
	epic: 8,
	legendary: 20,
	chromatic: 80,
};

function computeTotalCPS(){
	let total = 0;
	for(const [id,count] of Object.entries(state.inventory)){
		const p = PETS.find(x=>x.id===id);
		if(!p) continue;
		const per = RARITY_CPS[p.rarity] || 0;
		total += per * count;
	}
	// Apply Benny Boost (+5% CPS) if active
	if(state.bennyActive && state.bennyEndsAt > Date.now()){
		return Math.floor(total * 1.05);
	}
	return total;
}

// Pet roll functions
function rollOnce(){ return weightedPick(PETS); }
function rollTen(){
	const results = [];
	for(let i=0;i<9;i++) results.push(rollOnce());
	const hasRareOrBetter = results.some(r=> ['rare','legendary','epic','chromatic'].includes(r.rarity));
	if(hasRareOrBetter){
		results.push(rollOnce());
	}else{
		const rarePool = PETS.filter(p=>['rare','legendary','epic','chromatic'].includes(p.rarity));
		results.push(weightedPick(rarePool));
	}
	return results;
}

// Fruit roll functions
function rollFruitOnce(){ return weightedPick(FRUITS); }
function rollFruitTen(){
	const results = [];
	for(let i=0;i<10;i++) results.push(rollFruitOnce());
	return results;
}

// UI
function updateUI(){
	coinsEl.textContent = state.coins;
	// update CPS display if element exists
	if(cpsEl){
		const totalCps = computeTotalCPS();
		cpsEl.textContent = `(+${totalCps}/s)`;
	}
    
    // Update luck multiplier
    if(luckMultiplierEl){
        const isActive = state.potionActive && state.potionEndsAt > Date.now();
        luckMultiplierEl.textContent = isActive ? "3x" : "1x";
    }

	// Pets inventory
	inventoryList.innerHTML = '';
	const entries = Object.entries(state.inventory).sort((a,b)=>b[1]-a[1]);
	if(entries.length===0){
		inventoryList.innerHTML = '<div style="color:var(--muted)">No pets yet. Roll to get some!</div>';
	} else {
			for(const [id,count] of entries){
				const p = PETS.find(x=>x.id===id) || {name:id, rarity:'common', value:5};
				const el = document.createElement('div');
				el.className = 'inventory-item';
				// apply benny glow to pet inventory items only
				if(state.bennyActive && state.bennyEndsAt > Date.now()){
					el.classList.add('benny-glow');
				}
				const badge = document.createElement('div');
				badge.className = `badge ${p.rarity}`;
				badge.textContent = p.rarity.toUpperCase();
				const name = document.createElement('div');
				name.innerHTML = `<div style="font-weight:700">${p.name}</div><div style="color:var(--muted);font-size:12px">x${count} • Sell: ${p.value}c</div>`;
				// show CPS for this pet line
				const petCps = (RARITY_CPS[p.rarity] || 0) * count;
				const cpsLine = document.createElement('div');
				cpsLine.style.color = 'var(--muted)'; cpsLine.style.fontSize = '12px';
				cpsLine.textContent = `CPS: ${petCps}`;
				name.appendChild(cpsLine);

				// sell buttons
				const sell = document.createElement('button');
				sell.className = 'sell-btn small';
				sell.textContent = 'Sell x1';
				sell.addEventListener('click', ()=>{ sellPet(id,1); });
				const sellAll = document.createElement('button');
				sellAll.className = 'sell-btn small';
				sellAll.textContent = 'Sell All';
				sellAll.addEventListener('click', ()=>{ sellPet(id, state.inventory[id]); });
				const right = document.createElement('div');
				right.style.marginLeft = 'auto';
				right.appendChild(sell);
				right.appendChild(sellAll);

				el.appendChild(badge);
				el.appendChild(name);
				el.appendChild(right);
				inventoryList.appendChild(el);
			}
	}

	// Fruits inventory
	inventoryListFruits.innerHTML = '';
	const fentries = Object.entries(state.fruits).sort((a,b)=>b[1]-a[1]);
	if(fentries.length===0){
		inventoryListFruits.innerHTML = '<div style="color:var(--muted)">No fruits yet. Roll capsules to collect fruits.</div>';
	} else {
		for(const [id,count] of fentries){
			const f = FRUITS.find(x=>x.id===id) || {name:id, rarity:'common', value:1};
			const el = document.createElement('div');
			el.className = 'inventory-item';
			// apply benny glow to pets only
			if(state.bennyActive && state.bennyEndsAt > Date.now()){
				el.classList.add('benny-glow');
			}
			// apply benny glow if active
			if(state.bennyActive && state.bennyEndsAt > Date.now()){
				el.classList.add('benny-glow');
			}
			const badge = document.createElement('div');
			badge.className = `badge ${f.rarity}`;
			badge.textContent = f.rarity.toUpperCase();
			const name = document.createElement('div');
			name.innerHTML = `<div style="font-weight:700">${f.name}</div><div style="color:var(--muted);font-size:12px">x${count} • Sell: ${f.value}c</div>`;
			const sell = document.createElement('button');
			sell.className = 'sell-btn small';
			sell.textContent = 'Sell x1';
			sell.addEventListener('click', ()=>{ sellFruit(id,1); });
			const sellAll = document.createElement('button');
			sellAll.className = 'sell-btn small';
			sellAll.textContent = 'Sell All';
			sellAll.addEventListener('click', ()=>{ sellFruit(id, state.fruits[id]); });
			const right = document.createElement('div');
			right.style.marginLeft = 'auto';
			right.appendChild(sell);
			right.appendChild(sellAll);
			el.appendChild(badge);
			el.appendChild(name);
			el.appendChild(right);
			inventoryListFruits.appendChild(el);
		}
	}
}

// Animation helper: run a pre-roll animation then reveal items
function animateRoll(makeItemsCallback, revealCallback){
	// disable controls
	singleBtn.disabled = true; tenBtn.disabled = true; capSingle.disabled = true; capTen.disabled = true;
	singleBtn.classList.add('anim-pulse'); tenBtn.classList.add('anim-pulse');
	resultArea.classList.add('animating');
	capsuleResultArea.classList.add('animating');

	// small pre-roll delay
	setTimeout(()=>{
		// build items (the callback should return an array of item objects)
		const items = makeItemsCallback();
		// reveal them one by one with pop animation
		const revealDelay = 160;
		// clear current area
		if(revealCallback === showResults) resultArea.innerHTML = '';
		if(revealCallback === showCapsuleResults) capsuleResultArea.innerHTML = '';
		items.forEach((it, idx)=>{
			setTimeout(()=>{
				// create a minimal card for animation then pass to reveal callback
				const card = document.createElement('div');
				card.className = `result-card rarity-${it.rarity} pop`;
				// only apply Benny glow on pet reveals (showResults), not capsule/fruit reveals
				if(revealCallback === showResults && state.bennyActive && state.bennyEndsAt > Date.now()){
					card.classList.add('benny-glow');
				}
				const ic = document.createElement('div'); ic.style.fontSize='28px';
				// placeholder icons reused from showResults
				if(it.rarity==='chromatic'){ ic.textContent='🌈'; card.classList.add('chromatic'); }
				else if(it.rarity==='epic'){ ic.textContent='✨'; card.classList.add('epic'); }
				else if(it.rarity==='legendary'){ ic.textContent='🔱'; }
				else if(it.rarity==='rare'){ ic.textContent='⭐'; }
				else { ic.textContent='●'; }
				const nm = document.createElement('div'); nm.className='pet-name'; nm.textContent = it.name;
				card.appendChild(ic); card.appendChild(nm);
				if(revealCallback === showResults) resultArea.appendChild(card);
				if(revealCallback === showCapsuleResults) capsuleResultArea.appendChild(card);
				// small glow
				setTimeout(()=>{ card.classList.add('reveal-glow'); }, 80);
			}, idx*revealDelay);
		});

		// after all revealed, finalize: call revealCallback to add to inventory/state properly
		setTimeout(async ()=>{
			await revealCallback(items);
			// re-enable
			singleBtn.disabled = false; tenBtn.disabled = false; capSingle.disabled = false; capTen.disabled = false;
			singleBtn.classList.remove('anim-pulse'); tenBtn.classList.remove('anim-pulse');
			resultArea.classList.remove('animating'); capsuleResultArea.classList.remove('animating');
		}, items.length*revealDelay + 220);
	}, 220);
}

// Custom alert modal (created dynamically). Returns a Promise that resolves when the user closes it.
function showAlert(message){
	return new Promise((resolve)=>{
		// create backdrop
		const backdrop = document.createElement('div');
		backdrop.style.position = 'fixed';
		backdrop.style.left = '0'; backdrop.style.top = '0'; backdrop.style.right = '0'; backdrop.style.bottom = '0';
		backdrop.style.background = 'rgba(0,0,0,0.45)';
		backdrop.style.display = 'flex';
		backdrop.style.alignItems = 'center';
		backdrop.style.justifyContent = 'center';
		backdrop.style.zIndex = '9999';

		// modal
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

// Custom confirm modal. Returns Promise<boolean> true if OK clicked, false if cancelled/closed.
function showConfirm(message){
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
	modal.style.width = 'min(520px, 94%)';
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
		btnRow.style.gap = '8px';

	const cancel = document.createElement('button');
	cancel.textContent = 'Cancel';
	cancel.style.padding = '8px 12px';
	cancel.style.borderRadius = '8px';
	cancel.style.border = '1px solid rgba(255,255,255,0.08)';
	cancel.style.cursor = 'pointer';
	cancel.style.color = 'var(--modal-fg, #fff)';
	cancel.style.background = 'transparent';

		const ok = document.createElement('button');
		ok.textContent = 'OK';
		ok.style.padding = '8px 14px';
		ok.style.borderRadius = '8px';
		ok.style.border = 'none';
		ok.style.cursor = 'pointer';
		ok.style.background = 'var(--accent, #3b82f6)';
		ok.style.color = 'white';

		btnRow.appendChild(cancel);
		btnRow.appendChild(ok);
		modal.appendChild(msg);
		modal.appendChild(btnRow);
		backdrop.appendChild(modal);
		document.body.appendChild(backdrop);

		function close(result){
			document.body.removeChild(backdrop);
			document.removeEventListener('keydown', onKey);
			resolve(result);
		}
		function onKey(e){ if(e.key === 'Escape') close(false); }
		cancel.addEventListener('click', ()=>close(false));
		ok.addEventListener('click', ()=>close(true));
		backdrop.addEventListener('click', (e)=>{ if(e.target===backdrop) close(false); });
		document.addEventListener('keydown', onKey);
	});
}

// Helpers: inventory counts
function getPetTotalCount(){
	return Object.values(state.inventory).reduce((s,v)=>s+v,0);
}

async function showResults(items){
	resultArea.innerHTML = '';
	let discarded = 0;
	let available = MAX_INVENTORY - getPetTotalCount();
	for(const it of items){
		const card = document.createElement('div');
		card.className = `result-card rarity-${it.rarity}`;
		const ic = document.createElement('div');
		ic.style.fontSize = '28px';
		// placeholder icons reused from showResults
		if(it.rarity==='chromatic'){ ic.textContent='🌈'; card.classList.add('chromatic'); }
		else if(it.rarity==='epic'){ ic.textContent='✨'; card.classList.add('epic'); }
		else if(it.rarity==='legendary'){ ic.textContent='🔱'; }
		else if(it.rarity==='rare'){ ic.textContent='⭐'; }
		else { ic.textContent='●'; }
			const el = document.createElement('div');
			el.className = 'inventory-item';
		// add to inventory if space; otherwise mark discarded
		if(available > 0){
			state.inventory[it.id] = (state.inventory[it.id] || 0) + 1;
			available--;
		} else {
			discarded++;
		}
	}
	saveState();
	updateUI();
	if(discarded>0){
		await showAlert(`Inventory full — ${discarded} item(s) were not added. Sell pets to free space or buy BTF+ for a .`);
	}
}

function showCapsuleResults(items){
	capsuleResultArea.innerHTML = '';
	for(const it of items){
		const card = document.createElement('div');
		card.className = `result-card rarity-${it.rarity}`;
		const ic = document.createElement('div');
		ic.style.fontSize = '28px';
		// icon mapping for fruits
		if(it.rarity==='chromatic'){
			ic.textContent = '🌈';
			card.classList.add('chromatic');
		}else if(it.rarity==='epic'){
			ic.textContent = '✨';
			card.classList.add('epic');
		}else if(it.rarity==='legendary'){
			ic.textContent = '🔱';
		}else if(it.rarity==='rare'){
			ic.textContent = '⭐';
		}else{
			ic.textContent = '●';
		}
		const nm = document.createElement('div');
		nm.className = 'pet-name';
		nm.textContent = it.name;
		card.appendChild(ic);
		card.appendChild(nm);
		capsuleResultArea.appendChild(card);
		// add to fruits inventory
		state.fruits[it.id] = (state.fruits[it.id] || 0) + 1;
	}
	saveState();
	updateUI();
}

// Selling
function sellFruit(id, count){
	const have = state.fruits[id] || 0;
	if(!have) return;
	const sellCount = Math.min(have, count);
	const f = FRUITS.find(x=>x.id===id) || {value:1};
	const gained = f.value * sellCount;
	state.fruits[id] = have - sellCount;
	if(state.fruits[id] <= 0) delete state.fruits[id];
	state.coins += gained;
	saveState();
	updateUI();
}

// Sell pets
function sellPet(id, count){
	const have = state.inventory[id] || 0;
	if(!have) return;
	const sellCount = Math.min(have, count);
	const p = PETS.find(x=>x.id===id) || {value:1};
	const gained = (p.value || 1) * sellCount;
	state.inventory[id] = have - sellCount;
	if(state.inventory[id] <= 0) delete state.inventory[id];
	state.coins += gained;
	saveState();
	updateUI();
}

// Button handlers
singleBtn.addEventListener('click', async ()=>{
	if(state.coins < PRICE_SINGLE){ alert('Not enough coins for a single roll.'); return; }
	// prevent rolling if inventory full
	if(getPetTotalCount() >= MAX_INVENTORY){
		await showAlert('Your pet inventory is full (20). Sell some pets before rolling.');
		return;
	}
	state.coins -= PRICE_SINGLE;
	// animate then reveal
	animateRoll(()=>[rollOnce()], showResults);
});

tenBtn.addEventListener('click', async ()=>{
	if(state.coins < PRICE_TEN){ alert('Not enough coins for a ten-roll.'); return; }
	// check available slots
	const need = 10;
	const avail = MAX_INVENTORY - getPetTotalCount();
	if(avail <= 0){
		await showAlert('Your pet inventory is full (20). Sell some pets before rolling.');
		return;
	}
	if(avail < need){
		const cont = await showConfirm(`You only have space for ${avail} more pet(s). Rolling x10 may discard the extra ${need-avail} pet(s). Continue?`);
		if(!cont) return;
	}
	state.coins -= PRICE_TEN;
	animateRoll(()=>rollTen(), showResults);
});

capSingle.addEventListener('click', ()=>{
	if(state.coins < CAP_PRICE_SINGLE){ alert('Not enough coins for capsule roll.'); return; }
	state.coins -= CAP_PRICE_SINGLE;
	animateRoll(()=>[rollFruitOnce()], showCapsuleResults);
});

capTen.addEventListener('click', ()=>{
	if(state.coins < CAP_PRICE_TEN){ alert('Not enough coins for capsule x10.'); return; }
	state.coins -= CAP_PRICE_TEN;
	animateRoll(()=>rollFruitTen(), showCapsuleResults);
});

clearInv.addEventListener('click', async ()=>{
	if(!await showConfirm('Clear your inventory?')) return;
	state.inventory = {};
	saveState();
	updateUI();
});

clearFruits.addEventListener('click', async ()=>{
	if(!await showConfirm('Clear fruits inventory?')) return;
	state.fruits = {};
	saveState();
	updateUI();
});

// Init
loadState();
// ensure required objects exist (in case older saves lack them)
state.inventory = state.inventory || {};
state.fruits = state.fruits || {};

updateUI();
saveState();

// Welcome modal: show on first visit
const welcomeModal = document.getElementById('welcomeModal');
const closeWelcome = document.getElementById('closeWelcome');
if(welcomeModal && closeWelcome){
    const hasSeenWelcome = localStorage.getItem('btf_seen_welcome');
    if(!hasSeenWelcome){
        welcomeModal.style.display = 'flex';
        closeWelcome.addEventListener('click', ()=>{
            welcomeModal.style.display = 'none';
            localStorage.setItem('btf_seen_welcome', 'true');
        });
        welcomeModal.querySelector('.modal-backdrop')?.addEventListener('click', ()=>{
            welcomeModal.style.display = 'none';
            localStorage.setItem('btf_seen_welcome', 'true');
        });
    }
}

// Passive income: add coins every second based on total CPS
setInterval(()=>{
    const total = computeTotalCPS();
    if(total > 0){
        state.coins += total;
        saveState();
        updateUI();
        // show coin pop animation
        const pop = document.createElement('div');
		pop.className = 'coin-pop';
        pop.textContent = '+' + total;
        document.querySelector('.wallet').appendChild(pop);
		// if Benny Boost active, add purple variant
		if(state.bennyActive && state.bennyEndsAt > Date.now()){
			pop.classList.add('benny');
		}
        // remove after animation
        pop.addEventListener('animationend', ()=>pop.remove());
    }
}, 1000);

// Periodic check to clear expired effects
setInterval(()=>{
	let dirty = false;
	if(state.potionActive && state.potionEndsAt <= Date.now()){ state.potionActive = false; dirty = true; }
	if(state.bennyActive && state.bennyEndsAt <= Date.now()){ state.bennyActive = false; dirty = true; }
	if(dirty){ saveState(); updateUI(); }
}, 1000);

// Rarities & Info modal wiring
const openRarityInfo = document.getElementById('openRarityInfo');
const closeRarityInfo = document.getElementById('closeRarityInfo');
const rarityModal = document.getElementById('rarityModal');
if(openRarityInfo && rarityModal){
	const backdrop = rarityModal.querySelector('.modal-backdrop');
	function showRarityModal(e){ if(e) e.preventDefault(); rarityModal.style.display = 'flex'; }
	function hideRarityModal(){ rarityModal.style.display = 'none'; }
	openRarityInfo.addEventListener('click', showRarityModal);
	if(closeRarityInfo) closeRarityInfo.addEventListener('click', (e)=>{ e.preventDefault(); hideRarityModal(); });
	if(backdrop) backdrop.addEventListener('click', hideRarityModal);
	document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') hideRarityModal(); });
}

// Terms & Conditions button: opens terms.html in a new tab/window
const openTermsBtn = document.getElementById('openTerms');
if(openTermsBtn){
	openTermsBtn.addEventListener('click', ()=>{
		window.open('terms.html', '_blank');
	});
}
