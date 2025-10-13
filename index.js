
// Mini Gacha Game

// Data model: pets with rarities and weights
const PETS = [
	{ id: 'pet_c_1', name: 'Bubble Pup', rarity: 'common', weight: 90, value: 20 },
	{ id: 'pet_c_2', name: 'Float Finch', rarity: 'common', weight: 90, value: 20 },
	{ id: 'pet_c_3', name: 'Shard Turtle', rarity: 'common', weight: 90, value: 25 },

	{ id: 'pet_r_1', name: 'Glimmer Fox', rarity: 'rare', weight: 9, value: 150 },
	{ id: 'pet_r_2', name: 'Aero Lynx', rarity: 'rare', weight: 9, value: 160 },

	{ id: 'pet_e_1', name: 'Nebula Kirin', rarity: 'epic', weight: 2, value: 800 },
	{ id: 'pet_l_1', name: 'Infinity Dragon', rarity: 'legendary', weight: 0.4, value: 1200 },
	{ id: 'pet_ch_1', name: 'Prismatic Wyrm', rarity: 'chromatic', weight: 0.1, value: 5000 },
];

// Prices
const PRICE_SINGLE = 100;
const PRICE_TEN = 900; // discount

// Inventory limits
const MAX_INVENTORY = 20;

// Capsule prices for fruits
const CAP_PRICE_SINGLE = 20;
const CAP_PRICE_TEN = 180;

// FRUITS: capsule pool
const FRUITS = [
	{ id: 'fruit_c_1', name: 'Tiny Apple', rarity: 'common', weight: 70, value: 5 },
	{ id: 'fruit_c_2', name: 'Small Berry', rarity: 'common', weight: 70, value: 5 },
	{ id: 'fruit_r_1', name: 'Golden Apple', rarity: 'rare', weight: 25, value: 30 },
	{ id: 'fruit_e_1', name: 'Starfruit', rarity: 'epic', weight: 6, value: 150 },
	{ id: 'fruit_l_1', name: 'Eternal Mango', rarity: 'legendary', weight: 1, value: 200 },
	{id: 'fruit_c_3', name: 'Dirtfruit', rarity: 'common', weight: 70, value: 5},
	{id: 'fruit_ch_1', name: 'Chromafruit', rarity: 'chromatic', weight: 0.2, value: 1200}
];

// State
let state = {
	coins: 2000,
	inventory: {}, // pets id -> count
	fruits: {}, // fruits id -> count
};

// DOM
const coinsEl = document.getElementById('coins');
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
const adminBtn = document.getElementById('adminAddCoins');

// Persistence
const STORAGE_KEY = 'mini_gacha_state_v1';
function loadState(){
	try{
		const raw = localStorage.getItem(STORAGE_KEY);
		if(raw){
			const parsed = JSON.parse(raw);
			// merge with defaults to ensure keys exist (older saves may miss fields)
			state = {
				coins: parsed.coins ?? 2000,
				inventory: parsed.inventory ?? {},
				fruits: parsed.fruits ?? {},
			};
		}
	}catch(e){ console.warn('load failed', e) }
}
function saveState(){
	try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){ console.warn(e) }
}

// Helpers: weighted pick
function weightedPick(items){
	const total = items.reduce((s,i)=>s+i.weight,0);
	let r = Math.random()*total;
	for(const it of items){
		if(r < it.weight) return it;
		r -= it.weight;
	}
	return items[items.length-1];
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
				const badge = document.createElement('div');
				badge.className = `badge ${p.rarity}`;
				badge.textContent = p.rarity.toUpperCase();
				const name = document.createElement('div');
				name.innerHTML = `<div style="font-weight:700">${p.name}</div><div style="color:var(--muted);font-size:12px">x${count} • Sell: ${p.value}c</div>`;

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

// Helpers: inventory counts
function getPetTotalCount(){
	return Object.values(state.inventory).reduce((s,v)=>s+v,0);
}

function showResults(items){
	resultArea.innerHTML = '';
	let discarded = 0;
	let available = MAX_INVENTORY - getPetTotalCount();
	for(const it of items){
		const card = document.createElement('div');
		card.className = `result-card rarity-${it.rarity}`;
		const ic = document.createElement('div');
		ic.style.fontSize = '28px';
		// icon mapping: chromatic > epic > legendary > rare > common
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
		resultArea.appendChild(card);
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
		alert(`Inventory full — ${discarded} item(s) were not added. Sell pets to free space.`);
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
singleBtn.addEventListener('click', ()=>{
	if(state.coins < PRICE_SINGLE){ alert('Not enough coins for a single roll.'); return; }
	// prevent rolling if inventory full
	if(getPetTotalCount() >= MAX_INVENTORY){
		alert('Your pet inventory is full (20). Sell some pets before rolling.');
		return;
	}
	state.coins -= PRICE_SINGLE;
	const r = rollOnce();
	showResults([r]);
});

tenBtn.addEventListener('click', ()=>{
	if(state.coins < PRICE_TEN){ alert('Not enough coins for a ten-roll.'); return; }
	// check available slots
	const need = 10;
	const avail = MAX_INVENTORY - getPetTotalCount();
	if(avail <= 0){
		alert('Your pet inventory is full (20). Sell some pets before rolling.');
		return;
	}
	if(avail < need){
		if(!confirm(`You only have space for ${avail} more pet(s). Rolling x10 may discard the extra ${need-avail} pet(s). Continue?`)) return;
	}
	state.coins -= PRICE_TEN;
	const rs = rollTen();
	showResults(rs);
});

capSingle.addEventListener('click', ()=>{
	if(state.coins < CAP_PRICE_SINGLE){ alert('Not enough coins for capsule roll.'); return; }
	state.coins -= CAP_PRICE_SINGLE;
	showCapsuleResults([rollFruitOnce()]);
});

capTen.addEventListener('click', ()=>{
	if(state.coins < CAP_PRICE_TEN){ alert('Not enough coins for capsule x10.'); return; }
	state.coins -= CAP_PRICE_TEN;
	showCapsuleResults(rollFruitTen());
});

clearInv.addEventListener('click', ()=>{
	if(!confirm('Clear your inventory?')) return;
	state.inventory = {};
	saveState();
	updateUI();
});

clearFruits.addEventListener('click', ()=>{
	if(!confirm('Clear fruits inventory?')) return;
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

// Admin button (temporary)
if(adminBtn){
	adminBtn.addEventListener('click', ()=>{
		state.coins = (state.coins || 0) + 100000;
		saveState();
		updateUI();
		// flash the button briefly
		adminBtn.style.transform = 'scale(1.05)';
		setTimeout(()=>{ adminBtn.style.transform = ''; }, 120);
	});
}

// Rarities & Info modal wiring
const openRarityInfo = document.getElementById('openRarityInfo');
const closeRarityInfo = document.getElementById('closeRarityInfo');
const rarityModal = document.getElementById('rarityModal');
if(openRarityInfo && rarityModal){
	const backdrop = rarityModal.querySelector('.modal-backdrop');
	function showRarityModal(){ rarityModal.style.display = 'flex'; }
	function hideRarityModal(){ rarityModal.style.display = 'none'; }
	openRarityInfo.addEventListener('click', showRarityModal);
	if(closeRarityInfo) closeRarityInfo.addEventListener('click', hideRarityModal);
	if(backdrop) backdrop.addEventListener('click', hideRarityModal);
	document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') hideRarityModal(); });
}
