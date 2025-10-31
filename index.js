
// Mini Gacha Game

// Enchantment definitions for modal display
const ENCHANTMENTS = [
	{ id: 'swift_1', name: 'Swift I', tier: 1, description: '+2% Coins per Second' },
	{ id: 'lucky_1', name: 'Lucky I', tier: 1, description: '3% chance to double coins on sells' },
	{ id: 'strong_1', name: 'Strong I', tier: 1, description: 'Sell Pets +5% coins' },
	{ id: 'resilient_1', name: 'Resilient I', tier: 1, description: 'Sell Fruits +5% coins' },
	{ id: 'wealthy_1', name: 'Wealthy I', tier: 1, description: '+10% to all coin gains' },
	{ id: 'scavenger_1', name: 'Scavenger I', tier: 1, description: 'Capsule price -5%' },
	{ id: 'efficient_1', name: 'Efficient I', tier: 1, description: 'Pet roll price -5%' },
	{ id: 'durable_1', name: 'Durable I', tier: 1, description: '+10% Coins per Second' },
	{ id: 'swift_2', name: 'Swift II', tier: 2, description: '+5% Coins per Second' },
	{ id: 'lucky_2', name: 'Lucky II', tier: 2, description: '8% chance to double coins on sells' },
	{ id: 'strong_2', name: 'Strong II', tier: 2, description: 'Sell Pets +12% coins' },
	{ id: 'resilient_2', name: 'Resilient II', tier: 2, description: 'Sell Fruits +12% coins' },
	{ id: 'wealthy_2', name: 'Wealthy II', tier: 2, description: '+25% to all coin gains' },
	{ id: 'scavenger_2', name: 'Scavenger II', tier: 2, description: 'Capsule price -12%' },
	{ id: 'efficient_2', name: 'Efficient II', tier: 2, description: 'Pet roll price -12%' },
	{ id: 'durable_2', name: 'Durable II', tier: 2, description: '+25% Coins per Second' },
	{ id: 'critical_2', name: 'Critical II', tier: 2, description: '+10% extra double-sell chance' },
	{ id: 'vampiric_2', name: 'Vampiric II', tier: 2, description: 'Refund 5% of roll/capsule costs' },
	{ id: 'swift_3', name: 'Swift III', tier: 3, description: '+10% Coins per Second' },
	{ id: 'lucky_3', name: 'Lucky III', tier: 3, description: '15% chance to double coins on sells' },
	{ id: 'strong_3', name: 'Strong III', tier: 3, description: 'Sell Pets +25% coins' },
	{ id: 'resilient_3', name: 'Resilient III', tier: 3, description: 'Sell Fruits +25% coins' },
	{ id: 'wealthy_3', name: 'Wealthy III', tier: 3, description: '+50% to all coin gains' },
	{ id: 'scavenger_3', name: 'Scavenger III', tier: 3, description: 'Capsule price -20%' },
	{ id: 'efficient_3', name: 'Efficient III', tier: 3, description: 'Pet roll price -20%' },
	{ id: 'durable_3', name: 'Durable III', tier: 3, description: '+50% Coins per Second' },
	{ id: 'critical_3', name: 'Critical III', tier: 3, description: '+20% extra double-sell chance' },
	{ id: 'vampiric_3', name: 'Vampiric III', tier: 3, description: 'Refund 12% of roll/capsule costs' },
	{ id: 'legendary_3', name: 'Legendary III', tier: 3, description: '+10% all coin gains & CPS; -10% roll/capsule cost; +5% double-sell chance' },
	{ id: 'ultimate_3', name: 'Ultimate III', tier: 3, description: '+5% all coin gains; -5% roll/capsule cost; +5% double-sell chance' }
];

// Configure rarity of enchant tiers (relative weights). Higher means more common.
// Goal: Tier 2 and 3 should be rarer than Tier 1.
const ENCHANT_TIER_WEIGHTS = {
	1: 1.0,   // Tier 1 baseline
	2: 0.4,   // Tier 2 ~2.5x rarer than T1
	3: 0.15   // Tier 3 ~6.6x rarer than T1
};

// Annotate enchantments with a weight property based on tier so they can be used
// with the generic weightedPick() selector.
ENCHANTMENTS.forEach(e => { e.weight = ENCHANT_TIER_WEIGHTS[e.tier] ?? 1.0; });

// Helper to roll an enchantment using the tier weights above.
function rollEnchantment(){
	return weightedPick(ENCHANTMENTS);
}

// Data model: pets with rarities and weights
const PETS = [
	{ id: 'pet_c_1', name: 'Dirt Fox', rarity: 'common', weight: 50, value: 20 },
	{ id: 'pet_c_2', name: 'Dirt Finch', rarity: 'common', weight: 50, value: 20 },
	{ id: 'pet_c_3', name: 'Dirt Turtle', rarity: 'common', weight: 50, value: 25 },

	{ id: 'pet_r_1', name: 'Dusk Fox', rarity: 'rare', weight: 25, value: 150 },
	{ id: 'pet_r_2', name: 'Aero Lynx', rarity: 'rare', weight: 25, value: 160 },

	{ id: 'pet_e_1', name: 'Nebula Kirin', rarity: 'epic', weight: 10, value: 800 },
	{ id: 'pet_u_1', name: 'Singularity Phoenix', rarity: 'unique', weight: 0.08, value: 20000 },
	{ id: 'pet_u_2', name: 'Timekeeper Dragon', rarity: 'unique', weight: 0.05, value: 30000 },
	{ id: 'pet_sp_1', name: 'Suspicious Creature', rarity: 'special', weight: 10, value: 1000 },
	{ id: 'pet_l_1', name: 'Infinity Golem', rarity: 'legendary', weight: 0.5, value: 1200 },
	{ id: 'pet_s_1', name: 'Nightmare Skeleton', rarity: 'spooky', weight: 0.3, value: 2500 },
	{ id: 'pet_ch_1', name: 'Chroma Beast', rarity: 'chromatic', weight: 0.25, value: 5000 },
	{ id: 'pet_s_2', name: 'Spooky Ghost', rarity: 'spooky', weight: 0.3, value: 2200 }
	
];

// Prices
const PRICE_SINGLE = 100;
const PRICE_TEN = 900; // discount

// Inventory limits
const BASE_INVENTORY = 20;
function getMaxInventory(){
	return BASE_INVENTORY + (state.bonusInventorySlots || 0);
}

// Config: show admin button and starting coins
const SHOW_ADMIN_BUTTON = false; // set to false to hide admin button
const START_WITH_MILLION = false; // if true, default starting coins = 1,000,000 when no save exists

// Capsule prices for fruits
const CAP_PRICE_SINGLE = 20;
const CAP_PRICE_TEN = 180;

// Enchanting/EP tuning: make enchanting effectively more expensive by slowing EP income
const EP_GAIN_SINGLE_MIN = 1;
const EP_GAIN_SINGLE_MAX = 1; // was up to 3
const EP_GAIN_TEN_MIN = 5;
const EP_GAIN_TEN_MAX = 10; // was 10-20
const EP_PER_SEC_PER_SPECIAL = 0.5; // was 1.0 per special pet per second

// Halloween window: spooky items are available until Nov 1 of the current year (exclusive)
const HALLOWEEN_END = (function(){ const y = new Date().getFullYear(); return new Date(y, 10, 1).getTime(); })();

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
	,{ id: 'fruit_u_1', name: 'Aurora Berry', rarity: 'unique', weight: 0.01, value: 60000000 }
	,{ id: 'fruit_u_2', name: 'Cookiefruit', rarity: 'unique', weight: 0.01, value: 60000000 }
	,	{ id: 'fruit_s_1', name: 'Cursed Pumpkin', rarity: 'spooky', weight: 0.3, value: 800 }




];

// State
let state = {
	coins: 2000,
	enchantPoints: 0,
	inventory: {}, // pets id -> count
	fruits: {}, // fruits id -> count
	petEnchantments: {}, // pet enchantments
	petNames: {}, // custom pet names { petId_index: 'name' }
	potionActive: false,
	potionEndsAt: 0,
	luckStacks: 0,
	bennyActive: false,
	bennyEndsAt: 0,
	bonusInventorySlots: 0 // extra slots from Slot Machine purchases
};

// Rarity ranks for sell confirmations (legendary or higher triggers prompt)
const RARITY_RANK = {
	common: 1,
	rare: 2,
	epic: 3,
	special: 4,
	legendary: 5,
	spooky: 6,
	chromatic: 7,
	unique: 8
};

// DOM
const coinsEl = document.getElementById('coins');
const cpsEl = document.getElementById('cps');
const epDisplayEl = document.getElementById('epDisplay');
const epsEl = document.getElementById('eps');
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
				enchantPoints: parsed.enchantPoints ?? 0,
				inventory: parsed.inventory ?? {},
				fruits: parsed.fruits ?? {},
				petEnchantments: parsed.petEnchantments ?? {},
				petNames: parsed.petNames ?? {},
				potionActive: parsed.potionActive ?? false,
				potionEndsAt: parsed.potionEndsAt ?? 0,
				luckStacks: parsed.luckStacks ?? 0,
				bennyActive: parsed.bennyActive ?? false,
				bennyEndsAt: parsed.bennyEndsAt ?? 0,
				blessingActive: parsed.blessingActive ?? false,
				blessingEndsAt: parsed.blessingEndsAt ?? 0,
				bonusInventorySlots: parsed.bonusInventorySlots ?? 0
			};
		} else {
			// No save data found, start fresh
			state = {
				coins: START_WITH_MILLION ? 1000000 : 2000,
				enchantPoints: 0,
				inventory: {},
				fruits: {},
				petEnchantments: {},
				petNames: {}
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
	const cappedStacks = Math.min(state.luckStacks, 100);
	const multiplier = potionActive ? (1 + cappedStacks * 2) : 1;

	// If current date is past HALLOWEEN_END, exclude spooky items from the pick pool
	const halloweenStillOn = Date.now() < HALLOWEEN_END;
	const pool = items.filter(i => !(i.rarity === 'spooky' && !halloweenStillOn));

	// Exclude already-owned unique items so they cannot be obtained twice
	let filtered = pool;
	try{
		const isPets = items === PETS;
		const isFruits = items === FRUITS;
		filtered = pool.filter(i => {
			if(i.rarity !== 'unique') return true;
			if(isPets){ return (state.inventory[i.id] || 0) < 1; }
			if(isFruits){ return (state.fruits[i.id] || 0) < 1; }
			return true;
		});
	}catch(e){ filtered = pool; }

	// Prefer filtered list; if empty, prefer non-unique; else fallback to original
	let useItems = filtered.length ? filtered : pool.filter(i=>i.rarity !== 'unique');
	if(!useItems.length) useItems = items;

	// Blessing effect: when active, spooky items are 2/3 as likely (weights * 2/3)
	const blessingActive = state.blessingActive && state.blessingEndsAt > Date.now();

	// Apply luck multiplier: multiply weights of rare items more than common
	// Rarity boost factors - rarer items get bigger multiplier
	const rarityBoost = {
		common: 1,
		rare: 2,
		epic: 4,
		special: 3,
		legendary: 8,
		spooky: 6,
		chromatic: 10,
		unique: 12
	};
	
	const adjustedWeights = useItems.map(i => {
		// Base weight boosted by rarity when luck is active
		let w = i.weight;
		if(potionActive) {
			const boost = rarityBoost[i.rarity] || 1;
			w = i.weight * (1 + (multiplier - 1) * boost);
		}
		if(blessingActive && i.rarity === 'spooky') w = w * (2/3);
		return w;
	});

	const total = adjustedWeights.reduce((s,w)=>s+w, 0);
	let r = Math.random()*total;
	for(let idx=0; idx<useItems.length; idx++){
		const it = useItems[idx];
		const w = adjustedWeights[idx];
		if(r < w) return it;
		r -= w;
	}
	return useItems[useItems.length-1];
}

// Coins-per-second mapping by rarity
const RARITY_CPS = {
	common: 1,
	rare: 3,
	epic: 8,
	special: 12,
	legendary: 20,
	spooky: 30,
	chromatic: 80,
	unique: 60,
};

// Aggregate coin-related effects from pet enchantments
function computeEnchantEffects(){
	const effects = {
		coinGainMult: 1,     // applies to all coin gains
		cpsMult: 1,          // passive income multiplier
		sellPetMult: 1,      // pet sell value multiplier
		sellFruitMult: 1,    // fruit sell value multiplier
		rollDiscount: 0,     // percent off pet roll prices
		capDiscount: 0,      // percent off capsule prices
		doubleSellChance: 0, // chance to double coins on sells
		spendRefundPercent: 0 // percent refund on roll/capsule spend
	};
	const ench = state.petEnchantments || {};
	for(const list of Object.values(ench)){
		for(const id of list){
			switch(id){
				case 'wealthy_1': effects.coinGainMult *= 1.10; break;
				case 'wealthy_2': effects.coinGainMult *= 1.25; break;
				case 'wealthy_3': effects.coinGainMult *= 1.50; break;

				case 'swift_1': effects.cpsMult *= 1.02; break;
				case 'swift_2': effects.cpsMult *= 1.05; break;
				case 'swift_3': effects.cpsMult *= 1.10; break;

				case 'durable_1': effects.cpsMult *= 1.10; break;
				case 'durable_2': effects.cpsMult *= 1.25; break;
				case 'durable_3': effects.cpsMult *= 1.50; break;

				case 'strong_1': effects.sellPetMult *= 1.05; break;
				case 'strong_2': effects.sellPetMult *= 1.12; break;
				case 'strong_3': effects.sellPetMult *= 1.25; break;

				case 'resilient_1': effects.sellFruitMult *= 1.05; break;
				case 'resilient_2': effects.sellFruitMult *= 1.12; break;
				case 'resilient_3': effects.sellFruitMult *= 1.25; break;

				case 'efficient_1': effects.rollDiscount += 0.05; break;
				case 'efficient_2': effects.rollDiscount += 0.12; break;
				case 'efficient_3': effects.rollDiscount += 0.20; break;

				case 'scavenger_1': effects.capDiscount += 0.05; break;
				case 'scavenger_2': effects.capDiscount += 0.12; break;
				case 'scavenger_3': effects.capDiscount += 0.20; break;

				case 'lucky_1': effects.doubleSellChance += 0.03; break;
				case 'lucky_2': effects.doubleSellChance += 0.08; break;
				case 'lucky_3': effects.doubleSellChance += 0.15; break;

				case 'critical_2': effects.doubleSellChance += 0.10; break;
				case 'critical_3': effects.doubleSellChance += 0.20; break;

				case 'vampiric_2': effects.spendRefundPercent += 0.05; break;
				case 'vampiric_3': effects.spendRefundPercent += 0.12; break;

				case 'legendary_3':
					effects.coinGainMult *= 1.10;
					effects.cpsMult *= 1.10;
					effects.sellPetMult *= 1.10;
					effects.sellFruitMult *= 1.10;
					effects.rollDiscount += 0.10;
					effects.capDiscount += 0.10;
					effects.doubleSellChance += 0.05;
					effects.spendRefundPercent += 0.05;
					break;

				case 'ultimate_3':
					effects.coinGainMult *= 1.05;
					effects.rollDiscount += 0.05;
					effects.capDiscount += 0.05;
					effects.doubleSellChance += 0.05;
					break;
				default:
					// other combat-ish enchants are cosmetic here
			}
		}
	}
	// caps
	effects.rollDiscount = Math.min(0.5, effects.rollDiscount);
	effects.capDiscount = Math.min(0.5, effects.capDiscount);
	effects.doubleSellChance = Math.min(0.9, effects.doubleSellChance);
	return effects;
}

function getCurrentCosts(){
	const ef = computeEnchantEffects();
	return {
		priceSingle: Math.max(1, Math.ceil(PRICE_SINGLE * (1 - ef.rollDiscount))),
		priceTen: Math.max(1, Math.ceil(PRICE_TEN * (1 - ef.rollDiscount))),
		capSingle: Math.max(1, Math.ceil(CAP_PRICE_SINGLE * (1 - ef.capDiscount))),
		capTen: Math.max(1, Math.ceil(CAP_PRICE_TEN * (1 - ef.capDiscount))),
		_effects: ef
	};
}

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
		// include spooky in the guaranteed pool during Halloween window
		const spookyActive = Date.now() < HALLOWEEN_END;
		const rarePool = PETS.filter(p=>['rare','legendary','epic','special','chromatic'].concat(spookyActive?['spooky']:[]).includes(p.rarity));
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
    
    // Update EP display
    if(epDisplayEl){
        epDisplayEl.textContent = state.enchantPoints;
    }
    
	// Update EPS display (reflect tuned EP rate)
	if(epsEl){
		let specialCount = 0;
		for(const [id, count] of Object.entries(state.inventory)){
			const p = PETS.find(x=>x.id===id);
			if(p && p.rarity === 'special') specialCount += count;
		}
		const epsVal = specialCount * EP_PER_SEC_PER_SPECIAL;
		const fmt = Number.isInteger(epsVal) ? epsVal : epsVal.toFixed(1);
		epsEl.textContent = `(+${fmt}/s)`;
	}
    
    // Update luck multiplier
    if(luckMultiplierEl){
        const isActive = state.potionActive && state.potionEndsAt > Date.now();
        const cappedStacks = Math.min(state.luckStacks, 100);
        luckMultiplierEl.textContent = isActive ? `${1 + cappedStacks * 2}x` : "1x";
    }

	// Update button price labels based on enchantment discounts
	if(singleBtn && tenBtn && capSingle && capTen){
		const costs = getCurrentCosts();
		singleBtn.textContent = `Open x1 (${costs.priceSingle}c)`;
		tenBtn.textContent = `Open x10 (${costs.priceTen}c)`;
		capSingle.textContent = `Open Capsule x1 (${costs.capSingle}c)`;
		capTen.textContent = `Open Capsule x10 (${costs.capTen}c)`;
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
				el.style.cursor = 'pointer';
				// apply benny glow to pet inventory items only
				if(state.bennyActive && state.bennyEndsAt > Date.now()){
					el.classList.add('benny-glow');
				}
				// Add rarity shimmer classes
				if(p.rarity === 'chromatic') el.classList.add('chromatic');
				else if(p.rarity === 'spooky') el.classList.add('spooky');
				else if(p.rarity === 'unique') el.classList.add('unique');
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
				sell.addEventListener('click', async (e)=>{ e.stopPropagation(); await sellPet(id,1); });
				const sellAll = document.createElement('button');
				sellAll.className = 'sell-btn small';
				sellAll.textContent = 'Sell All';
				sellAll.addEventListener('click', async (e)=>{ e.stopPropagation(); await sellPet(id, state.inventory[id]); });
				const right = document.createElement('div');
				right.style.marginLeft = 'auto';
				right.appendChild(sell);
				right.appendChild(sellAll);

				el.appendChild(badge);
				el.appendChild(name);
				el.appendChild(right);
				
				// Click to select which instance to view
				el.addEventListener('click', ()=> showPetSelector(id, count));
				
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
			// Add rarity shimmer classes
			if(f.rarity === 'chromatic') el.classList.add('chromatic');
			else if(f.rarity === 'spooky') el.classList.add('spooky');
			else if(f.rarity === 'unique') el.classList.add('unique');
			const badge = document.createElement('div');
			badge.className = `badge ${f.rarity}`;
			badge.textContent = f.rarity.toUpperCase();
			const name = document.createElement('div');
			name.innerHTML = `<div style="font-weight:700">${f.name}</div><div style="color:var(--muted);font-size:12px">x${count} • Sell: ${f.value}c</div>`;
			const sell = document.createElement('button');
			sell.className = 'sell-btn small';
			sell.textContent = 'Sell x1';
			sell.addEventListener('click', async ()=>{ await sellFruit(id,1); });
			const sellAll = document.createElement('button');
			sellAll.className = 'sell-btn small';
			sellAll.textContent = 'Sell All';
			sellAll.addEventListener('click', async ()=>{ await sellFruit(id, state.fruits[id]); });
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
		else if(it.rarity==='spooky'){ ic.textContent='🎃'; card.classList.add('spooky'); }
		else if(it.rarity==='unique'){ ic.textContent='👑'; card.classList.add('unique'); }
		else if(it.rarity==='epic'){ ic.textContent='✨'; card.classList.add('epic'); }
		else if(it.rarity==='special'){ ic.textContent='👁️'; card.classList.add('special'); }
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
	let available = getMaxInventory() - getPetTotalCount();
	for(const it of items){
		const card = document.createElement('div');
		card.className = `result-card rarity-${it.rarity}`;
		const ic = document.createElement('div');
		ic.style.fontSize = '28px';
		// placeholder icons reused from showResults
		if(it.rarity==='chromatic'){ ic.textContent='🌈'; card.classList.add('chromatic'); }
		else if(it.rarity==='spooky'){ ic.textContent='🎃'; card.classList.add('spooky'); }
		else if(it.rarity==='unique'){ ic.textContent='💠'; card.classList.add('unique'); }
		else if(it.rarity==='epic'){ ic.textContent='✨'; card.classList.add('epic'); }
		else if(it.rarity==='special'){ ic.textContent='👁️'; card.classList.add('special'); }
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
		await showAlert(`Inventory full — ${discarded} item(s) were not added. Sell pets to free space or buy BTF+ for an inventory size of 50.`);
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
		}else if(it.rarity==='spooky'){
			ic.textContent = '🎃';
			card.classList.add('spooky');
		}else if(it.rarity==='unique'){
			ic.textContent = '💠';
			card.classList.add('unique');
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
async function sellFruit(id, count){
	const have = state.fruits[id] || 0;
	if(!have) return;
	const sellCount = Math.min(have, count);
	const f = FRUITS.find(x=>x.id===id) || {value:1};
	// Confirm if legendary or higher
	const rank = RARITY_RANK[f.rarity] ?? 0;
	const threshold = RARITY_RANK.legendary;
	if(rank >= threshold){
		const ok = await showConfirm(`Sell ${sellCount} ${f.name}${sellCount>1?'s':''}? This item is ${f.rarity.toUpperCase()}.`);
		if(!ok) return;
	}
	let gained = (f.value || 1) * sellCount;
	const ef = computeEnchantEffects();
	// chance to double coins on sell
	if(Math.random() < ef.doubleSellChance){ gained *= 2; }
	// apply multipliers
	gained = Math.floor(gained * ef.sellFruitMult * ef.coinGainMult);
	state.fruits[id] = have - sellCount;
	if(state.fruits[id] <= 0) delete state.fruits[id];
	state.coins += gained;
	saveState();
	updateUI();
}

// Sell pets
async function sellPet(id, count){
	const have = state.inventory[id] || 0;
	if(!have) return;
	const sellCount = Math.min(have, count);
	const p = PETS.find(x=>x.id===id) || {value:1};
	// Confirm if legendary or higher
	const rank = RARITY_RANK[p.rarity] ?? 0;
	const threshold = RARITY_RANK.legendary;
	if(rank >= threshold){
		const ok = await showConfirm(`Sell ${sellCount} ${p.name}${sellCount>1?'s':''}? This pet is ${p.rarity.toUpperCase()}.`);
		if(!ok) return;
	}
	let gained = (p.value || 1) * sellCount;
	const ef = computeEnchantEffects();
	// chance to double coins on sell
	if(Math.random() < ef.doubleSellChance){ gained *= 2; }
	// apply multipliers
	gained = Math.floor(gained * ef.sellPetMult * ef.coinGainMult);
	state.inventory[id] = have - sellCount;
	if(state.inventory[id] <= 0) delete state.inventory[id];
	state.coins += gained;
	saveState();
	updateUI();
}

// Button handlers
singleBtn.addEventListener('click', async ()=>{
	const costs = getCurrentCosts();
	if(state.coins < costs.priceSingle){ alert('Not enough coins for a single roll.'); return; }
	// prevent rolling if inventory full
	const maxInv = getMaxInventory();
	if(getPetTotalCount() >= maxInv){
		await showAlert(`Your pet inventory is full (${maxInv}). Sell some pets before rolling.`);
		return;
	}
	state.coins -= costs.priceSingle;
	// Cashback from enchants
	const ef = costs._effects;
	if(ef.spendRefundPercent > 0){
		const refund = Math.floor(costs.priceSingle * ef.spendRefundPercent * ef.coinGainMult);
		state.coins += refund;
	}
	// Grant Enchantment Points (tuned lower)
	const epGain = EP_GAIN_SINGLE_MIN + Math.floor(Math.random() * (EP_GAIN_SINGLE_MAX - EP_GAIN_SINGLE_MIN + 1));
	state.enchantPoints = (state.enchantPoints || 0) + epGain;
	// animate then reveal
	animateRoll(()=>[rollOnce()], showResults);
});

tenBtn.addEventListener('click', async ()=>{
	const costs = getCurrentCosts();
	if(state.coins < costs.priceTen){ alert('Not enough coins for a ten-roll.'); return; }
	// check available slots
	const need = 10;
	const maxInv = getMaxInventory();
	const avail = maxInv - getPetTotalCount();
	if(avail <= 0){
		await showAlert(`Your pet inventory is full (${maxInv}). Sell some pets before rolling.`);
		return;
	}
	if(avail < need){
		const cont = await showConfirm(`You only have space for ${avail} more pet(s). Rolling x10 may discard the extra ${need-avail} pet(s). Continue?`);
		if(!cont) return;
	}
	state.coins -= costs.priceTen;
	// Cashback from enchants
	const ef = costs._effects;
	if(ef.spendRefundPercent > 0){
		const refund = Math.floor(costs.priceTen * ef.spendRefundPercent * ef.coinGainMult);
		state.coins += refund;
	}
	// Grant Enchantment Points (tuned lower)
	const epGain = EP_GAIN_TEN_MIN + Math.floor(Math.random() * (EP_GAIN_TEN_MAX - EP_GAIN_TEN_MIN + 1));
	state.enchantPoints = (state.enchantPoints || 0) + epGain;
	animateRoll(()=>rollTen(), showResults);
});

capSingle.addEventListener('click', ()=>{
	const costs = getCurrentCosts();
	if(state.coins < costs.capSingle){ alert('Not enough coins for capsule roll.'); return; }
	state.coins -= costs.capSingle;
	const ef = costs._effects;
	if(ef.spendRefundPercent > 0){
		const refund = Math.floor(costs.capSingle * ef.spendRefundPercent * ef.coinGainMult);
		state.coins += refund;
	}
	animateRoll(()=>[rollFruitOnce()], showCapsuleResults);
});

capTen.addEventListener('click', ()=>{
	const costs = getCurrentCosts();
	if(state.coins < costs.capTen){ alert('Not enough coins for capsule x10.'); return; }
	state.coins -= costs.capTen;
	const ef = costs._effects;
	if(ef.spendRefundPercent > 0){
		const refund = Math.floor(costs.capTen * ef.spendRefundPercent * ef.coinGainMult);
		state.coins += refund;
	}
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

// Pet selector modal
function showPetSelector(petId, count){
	const p = PETS.find(x=>x.id===petId);
	if(!p) return;
	
	const modal = document.getElementById('petSelectorModal');
	const titleEl = document.getElementById('petSelectorTitle');
	const listEl = document.getElementById('petSelectorList');
	
	titleEl.textContent = `Select ${p.name} to View`;
	listEl.innerHTML = '';
	
	for(let i = 0; i < count; i++){
		const petKey = `${petId}_${i}`;
		const customName = state.petNames[petKey];
		const enchants = state.petEnchantments[petKey] || [];
		
		const item = document.createElement('div');
		item.className = 'pet-selector-item';
		item.style.cursor = 'pointer';
		item.style.padding = '12px';
		item.style.background = 'var(--glass)';
		item.style.borderRadius = '8px';
		item.style.border = '1px solid rgba(255,255,255,0.08)';
		item.style.transition = 'all 0.2s';
		
		const displayName = customName || `${p.name} #${i + 1}`;
		let enchantText = '';
		if(enchants.length > 0){
			const enchantNames = enchants.map(eid => {
				const ench = ENCHANTMENTS.find(e => e.id === eid);
				return ench ? ench.name : eid;
			}).join(', ');
			enchantText = `<div style="font-size:12px;color:#a855f7;margin-top:4px">💎 ${enchantNames}</div>`;
		}
		
		item.innerHTML = `
			<div style="font-weight:700;font-size:15px;margin-bottom:4px">${displayName}</div>
			<div style="font-size:13px;color:var(--muted)">${enchants.length} enchantment${enchants.length !== 1 ? 's' : ''}</div>
			${enchantText}
		`;
		
		item.addEventListener('mouseenter', ()=>{
			item.style.borderColor = 'var(--accent)';
			item.style.transform = 'translateX(4px)';
		});
		item.addEventListener('mouseleave', ()=>{
			item.style.borderColor = 'rgba(255,255,255,0.08)';
			item.style.transform = 'translateX(0)';
		});
		
		item.addEventListener('click', ()=>{
			modal.style.display = 'none';
			showPetInfo(petId, i);
		});
		
		listEl.appendChild(item);
	}
	
	modal.style.display = 'flex';
}

// Pet info modal
function showPetInfo(petId, instanceIndex){
	const p = PETS.find(x=>x.id===petId);
	if(!p) return;
	const petKey = `${petId}_${instanceIndex}`;
	const enchants = state.petEnchantments[petKey] || [];
	const customName = state.petNames[petKey];
	
	const modal = document.getElementById('petInfoModal');
	const nameEl = document.getElementById('petInfoName');
	const detailsEl = document.getElementById('petInfoDetails');
	const enchantsEl = document.getElementById('petInfoEnchants');
	const renameInput = document.getElementById('petRenameInput');
	const renameBtn = document.getElementById('petRenameBtn');
	
	const displayName = customName || `${p.name} #${instanceIndex + 1}`;
	nameEl.textContent = displayName;
	
	const cps = RARITY_CPS[p.rarity] || 0;
	detailsEl.innerHTML = `
		<div class="badge ${p.rarity}">${p.rarity.toUpperCase()}</div>
		<p style="margin:8px 0 4px 0"><strong>Coins per Second:</strong> ${cps}</p>
		<p style="margin:4px 0"><strong>Sell Value:</strong> ${p.value} coins</p>
		<p style="margin:4px 0;font-size:12px;color:var(--muted)">Instance: #${instanceIndex + 1}</p>
	`;
	
	enchantsEl.innerHTML = '';
	if(enchants.length === 0){
		enchantsEl.innerHTML = '<p style="color:var(--muted);font-size:13px">No enchantments yet. Visit the Enchanting page to add enchantments!</p>';
	} else {
		enchants.forEach(enchantId => {
			const enchant = ENCHANTMENTS.find(e => e.id === enchantId);
			if(enchant){
				const badge = document.createElement('div');
				badge.className = `enchant-badge enchant-tier-${enchant.tier}`;
				badge.innerHTML = `<div style="font-weight:700">${enchant.name}</div><div style="font-size:11px;opacity:0.9">${enchant.description}</div>`;
				enchantsEl.appendChild(badge);
			}
		});
	}
	
	// Set up rename input
	renameInput.value = customName || '';
	renameInput.placeholder = `${p.name} #${instanceIndex + 1}`;
	
	// Clear old listeners and add new one
	const newRenameBtn = renameBtn.cloneNode(true);
	renameBtn.parentNode.replaceChild(newRenameBtn, renameBtn);
	newRenameBtn.addEventListener('click', ()=>{
		const newName = renameInput.value.trim();
		if(newName){
			state.petNames[petKey] = newName;
		} else {
			delete state.petNames[petKey];
		}
		saveState();
		updateUI();
		showPetInfo(petId, instanceIndex); // Refresh modal
	});
	
	modal.style.display = 'flex';
}

// Init
loadState();
// ensure required objects exist (in case older saves lack them)
state.inventory = state.inventory || {};
state.fruits = state.fruits || {};

updateUI();
saveState();

// Toggle Halloween visuals based on HALLOWEEN_END
function updateHalloweenVisuals(){
	const h = document.querySelector('.halloween-shimmer');
	const s = document.querySelector('.subtitle');
	const active = Date.now() < HALLOWEEN_END;
	if(!h && !s) return;
	if(active){
		// ensure shimmer class exists and subtitle visible
		if(h) h.classList.add('halloween-shimmer');
		if(s) s.style.display = '';
	} else {
		// event ended: remove shimmer and hide subtitle
		if(h){ h.classList.remove('halloween-shimmer'); h.style.color = ''; }
		if(s) s.style.display = 'none';
	}
}
// run now and every minute in case the page stays open across the event end
updateHalloweenVisuals();
setInterval(updateHalloweenVisuals, 60*1000);

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

// Halloween Update modal: show on first visit (after welcome modal if both unseen)
const halloweenUpdateModal = document.getElementById('halloweenUpdateModal');
const closeHalloweenUpdate = document.getElementById('closeHalloweenUpdate');
if(halloweenUpdateModal && closeHalloweenUpdate){
    const hasSeenHalloweenUpdate = localStorage.getItem('btf_seen_halloween_update');
    const hasSeenWelcome = localStorage.getItem('btf_seen_welcome');
    
    // Show Halloween update after welcome modal is closed (or immediately if welcome was already seen)
    const showHalloweenUpdate = () => {
        if(!hasSeenHalloweenUpdate){
            halloweenUpdateModal.style.display = 'flex';
        }
    };
    
    if(!hasSeenWelcome){
        // Wait for welcome modal to close before showing Halloween update
        closeWelcome?.addEventListener('click', ()=>{
            setTimeout(showHalloweenUpdate, 300);
        });
    } else {
        // Show immediately if welcome was already seen
        showHalloweenUpdate();
    }
    
    closeHalloweenUpdate.addEventListener('click', ()=>{
        halloweenUpdateModal.style.display = 'none';
        localStorage.setItem('btf_seen_halloween_update', 'true');
    });
    halloweenUpdateModal.querySelector('.modal-backdrop')?.addEventListener('click', ()=>{
        halloweenUpdateModal.style.display = 'none';
        localStorage.setItem('btf_seen_halloween_update', 'true');
    });
}

// Pet info modal close
const closePetInfo = document.getElementById('closePetInfo');
const petInfoModal = document.getElementById('petInfoModal');
if(closePetInfo && petInfoModal){
	closePetInfo.addEventListener('click', ()=>{
		petInfoModal.style.display = 'none';
	});
	petInfoModal.addEventListener('click', (e)=>{
		if(e.target === petInfoModal) petInfoModal.style.display = 'none';
	});
}

// Pet selector modal close
const closePetSelector = document.getElementById('closePetSelector');
const petSelectorModal = document.getElementById('petSelectorModal');
if(closePetSelector && petSelectorModal){
	closePetSelector.addEventListener('click', ()=>{
		petSelectorModal.style.display = 'none';
	});
	petSelectorModal.addEventListener('click', (e)=>{
		if(e.target === petSelectorModal) petSelectorModal.style.display = 'none';
	});
}

// Passive income: add coins every second based on total CPS
let __epOverflow = 0; // fractional EP accumulator for per-second generation
setInterval(()=>{
    const base = computeTotalCPS();
    if(base > 0){
        const ef = computeEnchantEffects();
        const coinsAdd = Math.floor(base * ef.cpsMult * ef.coinGainMult);
        if(coinsAdd > 0){
            state.coins += coinsAdd;
            saveState();
            updateUI();
            // show coin pop animation
            const pop = document.createElement('div');
            pop.className = 'coin-pop';
            pop.textContent = '+' + coinsAdd;
            document.querySelector('.wallet').appendChild(pop);
            // if Benny Boost active, add purple variant
            if(state.bennyActive && state.bennyEndsAt > Date.now()){
                pop.classList.add('benny');
            }
            // remove after animation
            pop.addEventListener('animationend', ()=>pop.remove());
        }
    }
	// Generate Enchantment Points from special rarity pets (tuned rate)
	let specialCount = 0;
	for(const [id, count] of Object.entries(state.inventory)){
		const p = PETS.find(x=>x.id===id);
		if(p && p.rarity === 'special') specialCount += count;
	}
	if(specialCount > 0){
		__epOverflow += specialCount * EP_PER_SEC_PER_SPECIAL;
		const gained = Math.floor(__epOverflow);
		if(gained > 0){
			__epOverflow -= gained;
			state.enchantPoints = (state.enchantPoints || 0) + gained;
			saveState();
			updateUI();
			// show EP pop animation
			const epPop = document.createElement('div');
			epPop.className = 'ep-pop';
			epPop.textContent = '+' + gained;
			const epDisplayContainer = document.querySelector('.ep-display');
			if(epDisplayContainer){
				epDisplayContainer.appendChild(epPop);
				// remove after animation
				epPop.addEventListener('animationend', ()=>epPop.remove());
			}
		}
	}
}, 1000);

// Periodic check to clear expired effects
setInterval(()=>{
	let dirty = false;
	if(state.potionActive && state.potionEndsAt <= Date.now()){ state.potionActive = false; state.luckStacks = 0; dirty = true; }
	if(state.bennyActive && state.bennyEndsAt <= Date.now()){ state.bennyActive = false; dirty = true; }
	if(state.blessingActive && state.blessingEndsAt <= Date.now()){ state.blessingActive = false; dirty = true; }
	if(dirty){ saveState(); updateUI(); }
}, 1000);

// About is now a separate page (about.html); modal wiring removed

// Terms & Conditions button: opens terms.html in a new tab/window
const openTermsBtn = document.getElementById('openTerms');
if(openTermsBtn){
	openTermsBtn.addEventListener('click', ()=>{
		window.open('terms.html', '_blank');
	});
}
