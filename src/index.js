// Seasonal events toggle
(() => {
	try {
		const now = Date.now();
		// Christmas 2025 window (local time): Nov 27 — Dec 31
		const start = new Date(2025, 10, 27, 0, 0, 0).getTime(); // months 0-indexed
		const end = new Date(2025, 11, 31, 23, 59, 59).getTime();
		const active = now >= start && now <= end;
		if (typeof document !== 'undefined' && document.body) {
			document.body.classList.toggle('event-christmas', !!active);
		}
	} catch (_) {}
})();

// Console warning
console.log('%c CHARLES SPENCER MCGINNIS CLOSE THE CONSOLE RIGHT THIS INSTANT', 'color: #ff0000; font-size: 24px; font-weight: bold;');
console.log("%c You're not slick", 'color: #ffffffff; font-size: 12px; font-weight: bold;');

// Christmas Update Modal logic (unified, non-recursive)
(() => {
	try {
		if (typeof document === 'undefined') return;
		const modal = document.getElementById('christmasUpdateModal');
		const closeBtn = document.getElementById('closeChristmasUpdate');
		if (!modal || !closeBtn) return; // not on this page

		const STORAGE_FLAG = 'btf_seen_christmas_update';
		const now = Date.now();
		const start = new Date(2025, 10, 27, 0, 0, 0).getTime();
		const end = new Date(2025, 11, 31, 23, 59, 59).getTime();
		const active = now >= start && now <= end;
		const alreadySeen = localStorage.getItem(STORAGE_FLAG) === '1';

		function openModal() {
			modal.style.display = 'flex';
			const backdrop = modal.querySelector('.modal-backdrop');
			if (backdrop) backdrop.style.display = 'block';
			console.log('[Christmas] Modal opened');
		}
		function closeModal() {
			modal.style.display = 'none';
			const backdrop = modal.querySelector('.modal-backdrop');
			if (backdrop) backdrop.style.display = 'none';
			localStorage.setItem(STORAGE_FLAG, '1');
			console.log('[Christmas] Modal closed & flagged');
		}
		closeBtn.addEventListener('click', closeModal);
		modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
		window.showChristmasModal = openModal; // global manual trigger

		const urlParams = (typeof location !== 'undefined' && location.search) ? new URLSearchParams(location.search) : null;
		const forceShow = urlParams ? urlParams.get('show_christmas') === '1' : false;
		if (forceShow) {
			setTimeout(openModal, 200);
		} else if (active && !alreadySeen) {
			// Show shortly after load so decorations render first
			setTimeout(openModal, 400);
		} else {
			console.log('[Christmas] Modal not opened (active:', active, 'alreadySeen:', alreadySeen, ')');
		}
	} catch (e) {
		console.warn('Christmas modal init failed', e);
	}
})();

// Enchantment definitions for modal display
const ENCHANTMENTS = [
	{ id: 'swift_1', name: 'Swift I', tier: 1, cost: 50, description: '+2% Coins per Second' },
	{ id: 'lucky_1', name: 'Lucky I', tier: 1, cost: 50, description: '3% chance to double coins on sells' },
	{ id: 'strong_1', name: 'Strong I', tier: 1, cost: 50, description: 'Sell Pets +5% coins' },
	{ id: 'resilient_1', name: 'Resilient I', tier: 1, cost: 50, description: 'Sell Fruits +5% coins' },
	{ id: 'wealthy_1', name: 'Wealthy I', tier: 1, cost: 50, description: '+10% to all coin gains' },
	{ id: 'scavenger_1', name: 'Scavenger I', tier: 1, cost: 50, description: 'Capsule price -5%' },
	{ id: 'efficient_1', name: 'Efficient I', tier: 1, cost: 50, description: 'Pet roll price -5%' },
	{ id: 'durable_1', name: 'Durable I', tier: 1, cost: 50, description: '+10% Coins per Second' },
	{ id: 'critical_1', name: 'Critical I', tier: 1, cost: 50, description: '+5% extra double-sell chance' },
	{ id: 'vampiric_1', name: 'Vampiric I', tier: 1, cost: 50, description: 'Refund 2% of roll/capsule costs' },
	{ id: 'legendary_1', name: 'Legendary I', tier: 1, cost: 75, description: '+5% all coin gains & CPS; -5% roll/capsule cost; +2% double-sell chance' },
	{ id: 'ultimate_1', name: 'Ultimate I', tier: 1, cost: 75, description: '+2% all coin gains; -2% roll/capsule cost; +2% double-sell chance' },
	{ id: 'swift_2', name: 'Swift II', tier: 2, cost: 150, description: '+5% Coins per Second' },
	{ id: 'lucky_2', name: 'Lucky II', tier: 2, cost: 150, description: '8% chance to double coins on sells' },
	{ id: 'strong_2', name: 'Strong II', tier: 2, cost: 150, description: 'Sell Pets +12% coins' },
	{ id: 'resilient_2', name: 'Resilient II', tier: 2, cost: 150, description: 'Sell Fruits +12% coins' },
	{ id: 'wealthy_2', name: 'Wealthy II', tier: 2, cost: 150, description: '+25% to all coin gains' },
	{ id: 'scavenger_2', name: 'Scavenger II', tier: 2, cost: 150, description: 'Capsule price -12%' },
	{ id: 'efficient_2', name: 'Efficient II', tier: 2, cost: 150, description: 'Pet roll price -12%' },
	{ id: 'durable_2', name: 'Durable II', tier: 2, cost: 150, description: '+25% Coins per Second' },
	{ id: 'critical_2', name: 'Critical II', tier: 2, cost: 150, description: '+10% extra double-sell chance' },
	{ id: 'vampiric_2', name: 'Vampiric II', tier: 2, cost: 150, description: 'Refund 5% of roll/capsule costs' },
	{ id: 'swift_3', name: 'Swift III', tier: 3, cost: 400, description: '+10% Coins per Second' },
	{ id: 'lucky_3', name: 'Lucky III', tier: 3, cost: 400, description: '15% chance to double coins on sells' },
	{ id: 'strong_3', name: 'Strong III', tier: 3, cost: 400, description: 'Sell Pets +25% coins' },
	{ id: 'resilient_3', name: 'Resilient III', tier: 3, cost: 400, description: 'Sell Fruits +25% coins' },
	{ id: 'wealthy_3', name: 'Wealthy III', tier: 3, cost: 400, description: '+50% to all coin gains' },
	{ id: 'scavenger_3', name: 'Scavenger III', tier: 3, cost: 400, description: 'Capsule price -20%' },
	{ id: 'efficient_3', name: 'Efficient III', tier: 3, cost: 400, description: 'Pet roll price -20%' },
	{ id: 'durable_3', name: 'Durable III', tier: 3, cost: 400, description: '+50% Coins per Second' },
	{ id: 'critical_3', name: 'Critical III', tier: 3, cost: 400, description: '+20% extra double-sell chance' },
	{ id: 'vampiric_3', name: 'Vampiric III', tier: 3, cost: 400, description: 'Refund 12% of roll/capsule costs' },
	{ id: 'legendary_3', name: 'Legendary III', tier: 3, cost: 500, description: '+10% all coin gains & CPS; -10% roll/capsule cost; +5% double-sell chance' },
	{ id: 'ultimate_3', name: 'Ultimate III', tier: 3, cost: 500, description: '+5% all coin gains; -5% roll/capsule cost; +5% double-sell chance' },
	{ id: 'mage_1', name: 'Mage I', tier: 1, cost: 50, description: '+25% EP generation (Suspicious Creature only)', exclusiveTo: 'pet_sp_1' },
	{ id: 'mage_2', name: 'Mage II', tier: 2, cost: 150, description: '+50% EP generation (Suspicious Creature only)', exclusiveTo: 'pet_sp_1' },
	{ id: 'mage_3', name: 'Mage III', tier: 3, cost: 400, description: '+100% EP generation (Suspicious Creature only)', exclusiveTo: 'pet_sp_1' }
	
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
	{ id: 'pet_u_1', name: 'Singularity Phoenix', rarity: 'unique', weight: 0.005, value: 10000000 },
	{ id: 'pet_u_2', name: 'Timekeeper Dragon', rarity: 'unique', weight: 0.005, value: 10000000 },
	{ id: 'pet_sp_1', name: 'Suspicious Creature', rarity: 'special', weight: 1, value: 1000 },
	{ id: 'pet_sp_2', name: 'Weeping Spirit', rarity: 'special', weight: 1, value: 1200 },
	{ id: 'pet_l_1', name: 'Infinity Golem', rarity: 'legendary', weight: 0.5, value: 1200 },
	{ id: 'pet_s_1', name: 'Nightmare Skeleton', rarity: 'spooky', weight: 0.3, value: 2500 },
	{ id: 'pet_ch_1', name: 'Chroma Beast', rarity: 'chromatic', weight: 0.25, value: 5000 },
	{ id: 'pet_s_2', name: 'Spooky Ghost', rarity: 'spooky', weight: 0.3, value: 2200 },
	{ id: 'pet_f_1', name: 'Festive Reindeer', rarity: 'festive', weight: 0.3, value: 2800 },
	{ id: 'pet_f_2', name: 'Gingerbread Man', rarity: 'festive', weight: 0.3, value: 2500 },
	{ id: 'pet_f_3', name: 'Santa', rarity: 'festive', weight: 0.2, value: 3000 },
	{ id: 'pet_u_3', name: 'Max Verstappen', rarity: 'unique', weight: 0.005, value: 10000000 },
	{ id: 'pet_g_1', name: 'Celestial Archon', rarity: 'godly', weight: 0.0005, value: 50000000 }
];

// Prices
const PRICE_SINGLE = 100;
const PRICE_TEN = 900;

// Inventory limits
const BASE_INVENTORY = 20;
function getMaxInventory(){
	return BASE_INVENTORY + (state.bonusInventorySlots || 0);
}

// Gift code system: maps 16-character codes to rewards
const GIFT_CODES = { 
	"HIVIHAAN67676767": { pet: ["pet_ch_1", "pet_ch_1", "pet_ch_1", "pet_s_1", "pet_s_2"], description: "3x Chromabeasts and both spooky pets" },
	
	"OBLIVIOUS6767676": { pet: ["pet_u_3", "pet_sp_1", "pet_sp_1", "pet_sp_1", "pet_sp_2", "pet_u_3", "pet_ch_1", "pet_ch_1", "pet_ch_1", "pet_ch_1", "pet_ch_1", "pet_ch_1", "pet_u_2", "pet_u_1", "pet_s_1", "pet_1" ], description: "5,000 Tears" },

	"MYNAMEISDYLANKIM": { pet: ["pet_u_3", "pet_u_1", "pet_sp_1", "pet_sp_1", "pet_sp_1", "pet_sp_1", "pet_sp_1", "pet_sp_1", "pet_sp_1", "pet_sp_1", "pet_sp_1", "pet_sp_1", ], coins: 10000000000, description: "You're welcome Dylan Thomas Kim son of Edna and Thomas" }
};

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
const THANKSGIVING_END = (function(){ const y = new Date().getFullYear(); return new Date(y, 11, 1).getTime(); })();
const CHRISTMAS_END = (function(){ const y = new Date().getFullYear(); return new Date(y + 1, 0, 1).getTime(); })(); // Jan 1 next year

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
	,{ id: 'fruit_ch_2', name: 'Positive Potato', rarity: 'chromatic',  weight: 0.25, value: 1200 }
	,{ id: 'fruit_l_3', name: 'Negative Potato', rarity: 'legendary', weight: 0.5, value: 500 }
	,{ id: 'fruit_u_1', name: 'Aurora Berry', rarity: 'unique', weight: 0.005, value: 60000000 }
	,{ id: 'fruit_u_2', name: 'Cookiefruit', rarity: 'unique', weight: 0.005, value: 60000000 }
	,	{ id: 'fruit_s_1', name: 'Cursed Pumpkin', rarity: 'spooky', weight: 0.3, value: 800 }
	,	{ id: 'fruit_f_1', name: 'Candy Cane', rarity: 'festive', weight: 0.3, value: 850 }
	,	{ id: 'fruit_f_2', name: 'Christmas Cookie', rarity: 'festive', weight: 0.3, value: 900 }
	,{ id: 'fruit_g_1', name: 'Omnifruit', rarity: 'godly', weight: 0.0005, value: 100000000 }
	




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
	christmasActive: false,
	christmasEndsAt: 0,
	bennyActive: false,
	bennyEndsAt: 0,
	bonusInventorySlots: 0, // extra slots from Slot Machine purchases
	redeemedGiftCodes: [], // track used gift codes
	petRerollsUsed: {}, // track pet enchant rerolls { 	petId_index: count }
	tears: 0, // new currency for brewing
	potionInventory: [] // brewed potions stored for later use
};

// Rarity ranks for sell confirmations (legendary or higher triggers prompt)
const RARITY_RANK = {
	common: 1,
	rare: 2,
	epic: 3,
	special: 4,
	legendary: 5,
	festive: 6,
	spooky: 6,
	chromatic: 7,
	unique: 8,
	godly: 9
};

// DOM - these will be initialized after DOMContentLoaded
let coinsEl, tearsDisplayMainEl, cpsEl, epDisplayEl, epsEl, luckMultiplierEl;
let singleBtn, tenBtn, resultArea, inventoryList, clearInv;
let inventoryListFruits, clearFruits, capSingle, capTen, capsuleResultArea;

// Persistence
const STORAGE_KEY = 'btf_state_v1';
const STORAGE_HASH_KEY = STORAGE_KEY + '_hash';

// Build a deterministic JSON string from an object (keys sorted),
// so the same logical state yields the same string across runs.
function stableStringify(value){
	if(value === null || typeof value !== 'object'){
		return JSON.stringify(value);
	}
	if(Array.isArray(value)){
		return '[' + value.map(v => stableStringify(v)).join(',') + ']';
	}
	const keys = Object.keys(value).sort();
	const parts = keys.map(k => JSON.stringify(k) + ':' + stableStringify(value[k]));
	return '{' + parts.join(',') + '}';
}

// Lightweight 64-bit FNV-1a hash (BigInt) -> hex string
function fnv1a64(str){
	let h = 0xcbf29ce484222325n; // FNV offset basis
	const prime = 0x100000001b3n; // FNV prime
	for(let i=0;i<str.length;i++){
		h ^= BigInt(str.charCodeAt(i) & 0xff);
		h = (h * prime) & 0xffffffffffffffffn; // keep 64-bit
	}
	let hex = h.toString(16);
	while(hex.length < 16) hex = '0' + hex;
	return hex;
}

// Extract only meaningful state to hash (avoid cosmetic/ephemeral fields)
function snapshotMeaningfulState(s){
	return {
		coins: s.coins || 0,
		enchantPoints: s.enchantPoints || 0,
		inventory: s.inventory || {},
		fruits: s.fruits || {},
		petEnchantments: s.petEnchantments || {},
		petNames: s.petNames || {},
		bonusInventorySlots: s.bonusInventorySlots || 0,
		redeemedGiftCodes: s.redeemedGiftCodes || [],
		petRerollsUsed: s.petRerollsUsed || {},
		tears: s.tears || 0,
		potionInventory: Array.isArray(s.potionInventory)? s.potionInventory.slice(0,50) : []
	};
}

function computeStateHash(s){
	const snap = snapshotMeaningfulState(s);
	const str = stableStringify(snap);
	return fnv1a64(str);
}

// Server state management
function saveStateToServer(stateData) {
	if (typeof window.gameSocket !== 'undefined' && window.isServerConnected()) {
		window.gameSocket.emit('saveState', stateData);
		console.log('[Server] State sent to server');
	} else {
		console.warn('[Server] Not connected, using localStorage fallback');
	}
}

function loadState(){
	// First, try to load from localStorage (fallback/initial)
	try{
		// Migrate from previous storage key if present
		if(!localStorage.getItem(STORAGE_KEY)){
			const OLD_KEYS = ['mini_gacha_state_v1'];
			for(const oldKey of OLD_KEYS){
				const oldRaw = localStorage.getItem(oldKey);
				if(oldRaw){
					try{ localStorage.setItem(STORAGE_KEY, oldRaw); }catch(e){ console.warn(e); }
					const oldHash = localStorage.getItem(oldKey + '_hash');
					if(oldHash){
						try{ localStorage.setItem(STORAGE_HASH_KEY, oldHash); }catch(e){ console.warn(e); }
					}
					break;
				}
			}
		}

		const raw = localStorage.getItem(STORAGE_KEY);
		const storedHash = localStorage.getItem(STORAGE_HASH_KEY);
		if(raw){
			const parsed = JSON.parse(raw);
			// Track which newer keys were absent in the persisted JSON for schema upgrade tolerance
			const hadRerollsKey = Object.prototype.hasOwnProperty.call(parsed,'petRerollsUsed');
			const hadRedeemedCodesKey = Object.prototype.hasOwnProperty.call(parsed,'redeemedGiftCodes');
			const hadTearsKey = Object.prototype.hasOwnProperty.call(parsed,'tears');
			const hadPotionInventoryKey = Object.prototype.hasOwnProperty.call(parsed,'potionInventory');
			// merge with defaults to ensure keys exist (older saves may miss fields)
			state = {
				coins: parsed.coins ?? (START_WITH_MILLION ? 1000000 : 2000),
				enchantPoints: parsed.enchantPoints ?? 0,
				inventory: parsed.inventory ?? {},
				fruits: parsed.fruits ?? {},
				petEnchantments: parsed.petEnchantments ?? {},
				petNames: parsed.petNames ?? {},
				petRerollsUsed: parsed.petRerollsUsed ?? {},
				potionActive: parsed.potionActive ?? false,
				potionEndsAt: parsed.potionEndsAt ?? 0,
				luckStacks: parsed.luckStacks ?? 0,
				christmasActive: parsed.christmasActive ?? false,
				christmasEndsAt: parsed.christmasEndsAt ?? 0,
				bennyActive: parsed.bennyActive ?? false,
				bennyEndsAt: parsed.bennyEndsAt ?? 0,
				blessingActive: parsed.blessingActive ?? false,
				blessingEndsAt: parsed.blessingEndsAt ?? 0,
				bonusInventorySlots: parsed.bonusInventorySlots ?? 0,
				redeemedGiftCodes: parsed.redeemedGiftCodes ?? [],
				tears: parsed.tears ?? 0,
				potionInventory: parsed.potionInventory ?? []
			};

			// Verify integrity if a hash exists; if not, backfill one for legacy saves
			const recalculated = computeStateHash(state);
			if(storedHash && storedHash !== recalculated){
				// If mismatch is solely due to newly introduced keys (schema evolution), upgrade silently
				if(!hadRerollsKey || !hadRedeemedCodesKey || !hadTearsKey || !hadPotionInventoryKey){
					console.info('Save hash mismatch due to schema upgrade; backfilling new fields without reset.');
					try{ localStorage.setItem(STORAGE_HASH_KEY, recalculated); }catch(e){ console.warn(e); }
				} else {
					// Tampered or corrupted — reset to safe defaults
					console.warn('Save integrity check failed. Resetting save.');
					localStorage.setItem('btf_save_tampered', '1');
					state = {
						coins: START_WITH_MILLION ? 1000000 : 2000,
						enchantPoints: 0,
						inventory: {},
						fruits: {},
						petEnchantments: {},
						petNames: {},
						petRerollsUsed: {},
						bonusInventorySlots: 0,
						redeemedGiftCodes: [],
						tears: 0,
						potionInventory: [],
						christmasActive: false,
						christmasEndsAt: 0
					};
					// Persist a clean save and hash right away
					try{
						localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
						localStorage.setItem(STORAGE_HASH_KEY, computeStateHash(state));
					}catch(e){ console.warn(e); }
				};
			} else if(!storedHash){
		// Ensure global reference points to the latest state object
		if (typeof window !== 'undefined') {
			window.state = state;
		}
				// Legacy save without hash: create one
				try{ localStorage.setItem(STORAGE_HASH_KEY, recalculated); }catch(e){ console.warn(e); }
			}
		} else {
			// No save data found, start fresh
			state = {
				coins: START_WITH_MILLION ? 1000000 : 2000,
				enchantPoints: 0,
				inventory: {},
				fruits: {},
				petEnchantments: {},
				petNames: {},
				petRerollsUsed: {},
				bonusInventorySlots: 0,
				redeemedGiftCodes: [],
				tears: 0,
				potionInventory: []
			};
		}
	}catch(e){ console.warn('load failed', e) }
}

// Load state from server (called by socket event)
window.loadServerState = function(serverState) {
	if (serverState) {
		console.log('[Server] Loading state from server');
		state = {
			coins: serverState.coins ?? (START_WITH_MILLION ? 1000000 : 2000),
			enchantPoints: serverState.enchantPoints ?? 0,
			inventory: serverState.inventory ?? {},
			fruits: serverState.fruits ?? {},
			petEnchantments: serverState.petEnchantments ?? {},
			petNames: serverState.petNames ?? {},
			petRerollsUsed: serverState.petRerollsUsed ?? {},
			potionActive: serverState.potionActive ?? false,
			potionEndsAt: serverState.potionEndsAt ?? 0,
			luckStacks: serverState.luckStacks ?? 0,
			christmasActive: serverState.christmasActive ?? false,
			christmasEndsAt: serverState.christmasEndsAt ?? 0,
			bennyActive: serverState.bennyActive ?? false,
			bennyEndsAt: serverState.bennyEndsAt ?? 0,
			blessingActive: serverState.blessingActive ?? false,
			blessingEndsAt: serverState.blessingEndsAt ?? 0,
			bonusInventorySlots: serverState.bonusInventorySlots ?? 0,
			redeemedGiftCodes: serverState.redeemedGiftCodes ?? [],
			tears: serverState.tears ?? 0,
			potionInventory: serverState.potionInventory ?? []
		};
		window.state = state; // Update global reference
		if (typeof updateUI === 'function') {
			updateUI();
		}
	} else {
		console.log('[Server] No saved state on server, using local state');
	}
};

function saveState(){
	try{
		const json = JSON.stringify(state);
		// Save to localStorage as backup
		localStorage.setItem(STORAGE_KEY, json);
		const hash = computeStateHash(state);
		localStorage.setItem(STORAGE_HASH_KEY, hash);
		
		// Also save to server
		saveStateToServer(state);
	}catch(e){ console.warn(e) }
}

// Helpers: weighted pick
function weightedPick(items){
	// Check if luck potion is active
	const potionActive = state.potionActive && state.potionEndsAt > Date.now();
	const christmasBuff = state.christmasActive && state.christmasEndsAt > Date.now();
	const cappedStacks = Math.min(state.luckStacks, 100);
	const multiplier = potionActive ? (1 + cappedStacks * 2) : 1;

	// If current date is past HALLOWEEN_END, exclude spooky items from the pick pool
	const halloweenStillOn = Date.now() < HALLOWEEN_END;
	const christmasStillOn = Date.now() < CHRISTMAS_END;
	const pool = items.filter(i => {
		if (i.rarity === 'spooky' && !halloweenStillOn) return false;
		if (i.rarity === 'festive' && !christmasStillOn) return false;
		return true;
	});
	const finalPool = pool;

	// All rarities can now be obtained multiple times (no unique filter)
	let useItems = pool;


	// Apply luck multiplier: multiply weights of rare items more than common
	// Rarity boost factors - rarer items get bigger multiplier
	const rarityBoost = {
		common: 1,
		rare: 1.003454446,
		epic: 1.008039297,
		special: 1.019653436,
		legendary: 1.025779402,
		spooky: 1.02577,
		chromatic: 1.02671028,
		unique: 1.04888665,
		godly: 1.058950408
	};
	
	const adjustedWeights = useItems.map(i => {
		// Base weight boosted by rarity when luck is active
		let w = i.weight;
		if(potionActive) {
			const boost = rarityBoost[i.rarity] || 1;
			w = i.weight * (1 + (multiplier - 1) ** boost);
		}
		// Christmas Spirit Potion: make festive items more common
		if (christmasBuff && i.rarity === 'festive') {
			w *= 3; // 3x more likely while potion is active
		}
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
	festive: 30,
	spooky: 30,
	chromatic: 80,
	unique: 120,
	godly: 200,
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
		spendRefundPercent: 0, // percent refund on roll/capsule spend
		epGenerationMult: 1  // EP generation multiplier for special pets
	};
	const ench = state.petEnchantments || {};
	// Only process enchantments for pets that still exist in inventory
	for(const [petKey, list] of Object.entries(ench)){
		// Extract pet ID from key (format: petId_index)
		const petId = petKey.split('_').slice(0, -1).join('_');
		const instanceIndex = parseInt(petKey.split('_').pop());
		// Skip if this pet type is no longer in inventory or if instance index exceeds current count
		if(!state.inventory[petId] || instanceIndex >= state.inventory[petId]) continue;
		
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

				case 'mage_1': effects.epGenerationMult *= 1.25; break;
				case 'mage_2': effects.epGenerationMult *= 1.50; break;
				case 'mage_3': effects.epGenerationMult *= 2.00; break;

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
	// Apply enchantment CPS multiplier
	const ef = computeEnchantEffects();
	total = Math.floor(total * ef.cpsMult);
	
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
	if(coinsEl) coinsEl.textContent = state.coins;
	if(tearsDisplayMainEl) tearsDisplayMainEl.textContent = Math.floor(state.tears||0);
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
		const ef = computeEnchantEffects();
		const epsVal = specialCount * EP_PER_SEC_PER_SPECIAL * ef.epGenerationMult;
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
	if(inventoryList){
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
				else if(p.rarity === 'festive') el.classList.add('festive');
				else if(p.rarity === 'unique') el.classList.add('unique');
				else if(p.rarity === 'godly') el.classList.add('godly');
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
	}

	// Fruits inventory
	if(inventoryListFruits){
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
			else if(f.rarity === 'festive') el.classList.add('festive');
			else if(f.rarity === 'unique') el.classList.add('unique');
			else if(f.rarity === 'godly') el.classList.add('godly');
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
}

// Animation helper: run a pre-roll animation then reveal items
function animateRoll(makeItemsCallback, revealCallback){
	// disable controls (only if they exist)
	if(singleBtn) singleBtn.disabled = true;
	if(tenBtn) tenBtn.disabled = true;
	if(capSingle) capSingle.disabled = true;
	if(capTen) capTen.disabled = true;
	if(singleBtn) singleBtn.classList.add('anim-pulse');
	if(tenBtn) tenBtn.classList.add('anim-pulse');
	if(resultArea) resultArea.classList.add('animating');
	if(capsuleResultArea) capsuleResultArea.classList.add('animating');

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
		if(it.rarity==='godly'){ ic.textContent='⚡'; card.classList.add('godly'); }
		else if(it.rarity==='spooky'){ ic.textContent='🎃'; card.classList.add('spooky'); }
		else if(it.rarity==='festive'){ ic.textContent='🎄'; card.classList.add('festive'); }
		else if(it.rarity==='unique'){ ic.textContent='👑'; card.classList.add('unique'); }
		else if(it.rarity==='epic'){ ic.textContent='✨'; card.classList.add('epic'); }
		else if(it.rarity==='special'){ ic.textContent='👁️'; card.classList.add('special'); }
		else if(it.rarity==='chromatic'){ ic.textContent='🌈'; card.classList.add('chromatic'); }
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
			// re-enable (only if they exist)
			if(singleBtn) singleBtn.disabled = false;
			if(tenBtn) tenBtn.disabled = false;
			if(capSingle) capSingle.disabled = false;
			if(capTen) capTen.disabled = false;
			if(singleBtn) singleBtn.classList.remove('anim-pulse');
			if(tenBtn) tenBtn.classList.remove('anim-pulse');
			if(resultArea) resultArea.classList.remove('animating');
			if(capsuleResultArea) capsuleResultArea.classList.remove('animating');
		}, items.length*revealDelay + 220);
	}, 220);
}

// Gift code redemption function
function redeemGiftCode(code){
	// Normalize code
	const normalizedCode = code.trim().toUpperCase();
	
	// Validate length
	if(normalizedCode.length !== 16){
		return { success: false, message: "Gift code must be exactly 16 characters." };
	}
	
	// Check if code exists
	if(!GIFT_CODES[normalizedCode]){
		return { success: false, message: "Invalid gift code." };
	}
	
	// Check if already redeemed
	if(state.redeemedGiftCodes && state.redeemedGiftCodes.includes(normalizedCode)){
		return { success: false, message: "This gift code has already been redeemed." };
	}
	
	// Get reward details
	const reward = GIFT_CODES[normalizedCode];
	
	// Grant rewards
	if(reward.coins){
		state.coins = (state.coins || 0) + reward.coins;
	}
	
	if(reward.enchantPoints){
		state.enchantPoints = (state.enchantPoints || 0) + reward.enchantPoints;
	}
	
	if(reward.pet){
		// Add pet(s) to inventory - can be a single pet ID or an array
		const pets = Array.isArray(reward.pet) ? reward.pet : [reward.pet];
		pets.forEach(petId => {
			state.inventory[petId] = (state.inventory[petId] || 0) + 1;
		});
	}
	
	if(reward.item === "luck_potion"){
		// Activate luck potion
		state.potionActive = true;
		state.potionEndsAt = Date.now() + 5 * 60 * 1000; // 5 minutes
		state.luckStacks = Math.min((state.luckStacks || 0) + 1, 100);
	}
	
	// Mark code as redeemed
	if(!state.redeemedGiftCodes) state.redeemedGiftCodes = [];
	state.redeemedGiftCodes.push(normalizedCode);
	
	// Save state
	saveState();
	
	return { 
		success: true, 
		message: reward.description || "Gift code redeemed successfully!" 
	};
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
		if(it.rarity==='godly'){ ic.textContent='⚡'; card.classList.add('godly'); }
		else if(it.rarity==='chromatic'){ ic.textContent='🌈'; card.classList.add('chromatic'); }
		else if(it.rarity==='spooky'){ ic.textContent='🎃'; card.classList.add('spooky'); }
		else if(it.rarity==='festive'){ ic.textContent='🎄'; card.classList.add('festive'); }
		else if(it.rarity==='unique'){ ic.textContent='👑'; card.classList.add('unique'); }
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
		if(it.rarity==='godly'){
			ic.textContent = '⚡';
			card.classList.add('godly');
		}else if(it.rarity==='chromatic'){
			ic.textContent = '🌈';
			card.classList.add('chromatic');
		}else if(it.rarity==='spooky'){
			ic.textContent = '🎃';
			card.classList.add('spooky');

		}else if(it.rarity==='festive'){
			ic.textContent = '🎄';
			card.classList.add('festive');
		}else if(it.rarity==='unique'){
			ic.textContent = '👑';
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

// Sell pets - with instance selection for multiples
async function sellPet(id, count){
	const have = state.inventory[id] || 0;
	if(!have) return;
	
	// If selling 1 pet and have multiple, show selection modal
	if(count === 1 && have > 1){
		showSellPetSelector(id);
		return;
	}
	
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
	
	// When selling all, clean up all associated data for this pet ID
	if(state.inventory[id] === undefined || state.inventory[id] <= 0){
		// Remove all enchantments and names for this pet type
		for(let i = 0; i < have; i++){
			const petKey = `${id}_${i}`;
			delete state.petEnchantments[petKey];
			delete state.petNames[petKey];
		}
	}
	
	state.coins += gained;
	saveState();
	updateUI();
}

// Sell a specific pet instance by index
async function sellPetInstance(id, instanceIndex){
	const have = state.inventory[id] || 0;
	if(!have || instanceIndex >= have) return;
	
	const p = PETS.find(x=>x.id===id) || {value:1};
	// Confirm if legendary or higher
	const rank = RARITY_RANK[p.rarity] ?? 0;
	const threshold = RARITY_RANK.legendary;
	if(rank >= threshold){
		const petKey = `${id}_${instanceIndex}`;
		const customName = state.petNames[petKey];
		const displayName = customName || `${p.name} #${instanceIndex + 1}`;
		const ok = await showConfirm(`Sell ${displayName}? This pet is ${p.rarity.toUpperCase()}.`);
		if(!ok) return;
	}
	
	let gained = p.value || 1;
	const ef = computeEnchantEffects();
	// chance to double coins on sell
	if(Math.random() < ef.doubleSellChance){ gained *= 2; }
	// apply multipliers
	gained = Math.floor(gained * ef.sellPetMult * ef.coinGainMult);
	
	// Remove the specific instance data
	const petKey = `${id}_${instanceIndex}`;
	delete state.petEnchantments[petKey];
	delete state.petNames[petKey];
	
	// Shift down all higher-indexed instances for this pet type
	for(let i = instanceIndex + 1; i < have; i++){
		const oldKey = `${id}_${i}`;
		const newKey = `${id}_${i-1}`;
		
		if(state.petEnchantments[oldKey]){
			state.petEnchantments[newKey] = state.petEnchantments[oldKey];
			delete state.petEnchantments[oldKey];
		}
		if(state.petNames[oldKey]){
			state.petNames[newKey] = state.petNames[oldKey];
			delete state.petNames[oldKey];
		}
	}
	
	// Decrement inventory count
	state.inventory[id] = have - 1;
	if(state.inventory[id] <= 0) delete state.inventory[id];
	
	state.coins += gained;
	saveState();
	updateUI();
	
	// Close the sell modal
	const modal = document.getElementById('sellPetModal');
	if(modal) modal.style.display = 'none';
}

// Sell pet selector modal
function showSellPetSelector(petId){
	const have = state.inventory[petId] || 0;
	if(have <= 0) return;
	
	const p = PETS.find(x=>x.id===petId);
	if(!p) return;
	
	const modal = document.getElementById('sellPetModal');
	const titleEl = document.getElementById('sellPetTitle');
	const listEl = document.getElementById('sellPetList');
	
	titleEl.textContent = `Select ${p.name} to Sell`;
	listEl.innerHTML = '';
	
	for(let i = 0; i < have; i++){
		const petKey = `${petId}_${i}`;
		const customName = state.petNames[petKey];
		const enchants = state.petEnchantments[petKey] || [];
		
		const item = document.createElement('div');
		item.className = 'pet-selector-item';
		item.style.cursor = 'pointer';
		item.style.padding = '14px';
		item.style.background = 'var(--glass)';
		item.style.borderRadius = '8px';
		item.style.border = '2px solid rgba(255,255,255,0.08)';
		item.style.transition = 'all 0.2s';
		
		const displayName = customName || `${p.name} #${i + 1}`;
		const cps = RARITY_CPS[p.rarity] || 0;
		let enchantText = '';
		if(enchants.length > 0){
			const enchantNames = enchants.map(eid => {
				const ench = ENCHANTMENTS.find(e => e.id === eid);
				return ench ? ench.name : eid;
			}).join(', ');
			enchantText = `<div style="font-size:12px;color:#a855f7;margin-top:4px">💎 ${enchantNames}</div>`;
		}
		
		item.innerHTML = `
			<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:6px">
				<div style="font-weight:700;font-size:15px">${displayName}</div>
				<div class="badge ${p.rarity}" style="font-size:10px;padding:3px 8px">${p.rarity.toUpperCase()}</div>
			</div>
			<div style="font-size:13px;color:var(--muted);margin-bottom:4px">
				${enchants.length} enchantment${enchants.length !== 1 ? 's' : ''} • ${cps} CPS • Sell: ${p.value}c
			</div>
			${enchantText}
		`;
		
		item.addEventListener('mouseenter', ()=>{
			item.style.borderColor = '#ef4444';
			item.style.background = 'rgba(239, 68, 68, 0.1)';
			item.style.transform = 'translateX(4px)';
		});
		item.addEventListener('mouseleave', ()=>{
			item.style.borderColor = 'rgba(255,255,255,0.08)';
			item.style.background = 'var(--glass)';
			item.style.transform = 'translateX(0)';
		});
		
		item.addEventListener('click', ()=>{
			sellPetInstance(petId, i);
		});
		
		listEl.appendChild(item);
	}
	
	modal.style.display = 'flex';
}

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

// Modal setup function
function setupModals() {
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

	// Sell pet modal close
	const closeSellPet = document.getElementById('closeSellPet');
	const sellPetModal = document.getElementById('sellPetModal');
	if(closeSellPet && sellPetModal){
		closeSellPet.addEventListener('click', ()=>{
			sellPetModal.style.display = 'none';
		});
		sellPetModal.addEventListener('click', (e)=>{
			if(e.target === sellPetModal) sellPetModal.style.display = 'none';
		});
	}

	// Terms & Conditions button: opens terms.html in a new tab/window
	const openTermsBtn = document.getElementById('openTerms');
	if(openTermsBtn){
		openTermsBtn.addEventListener('click', ()=>{
			window.open('terms.html', '_blank');
		});
	}
}

// Init - moved to DOMContentLoaded to ensure DOM is ready
function initGame() {
	// Initialize DOM elements
	coinsEl = document.getElementById('coins');
	tearsDisplayMainEl = document.getElementById('tearsDisplayMain');
	cpsEl = document.getElementById('cps');
	epDisplayEl = document.getElementById('epDisplay');
	epsEl = document.getElementById('eps');
	luckMultiplierEl = document.getElementById('luckMultiplier');
	singleBtn = document.getElementById('singleRoll');
	tenBtn = document.getElementById('tenRoll');
	resultArea = document.getElementById('resultArea');
	inventoryList = document.getElementById('inventoryListPets');
	clearInv = document.getElementById('clearInv');
	inventoryListFruits = document.getElementById('inventoryListFruits');
	clearFruits = document.getElementById('clearFruits');
	capSingle = document.getElementById('capSingle');
	capTen = document.getElementById('capTen');
	capsuleResultArea = document.getElementById('capsuleResultArea');

	loadState();
	// ensure required objects exist (in case older saves lack them)
	state.inventory = state.inventory || {};
	state.fruits = state.fruits || {};

	updateUI();
	saveState();

	// If a tampered save was detected during load, notify the player once
	const __tamperedFlag = localStorage.getItem('btf_save_tampered');
	if(__tamperedFlag === '1'){
		localStorage.removeItem('btf_save_tampered');
		setTimeout(()=>{
			try{ showAlert('Tampering detected! Your save was reset to defaults.'); }catch(_){ /* fallback */ alert('Tampering detected! Your save was reset to defaults.'); }
		}, 0);
	}

	// Setup button event listeners (only attach if elements exist)
	setupEventListeners();

	// Setup modals after DOM is ready
	setupModals();

	// run Halloween visuals update now and every minute in case the page stays open across the event end
	updateHalloweenVisuals();
	setInterval(updateHalloweenVisuals, 60*1000);
}

// Button handlers moved to a separate function
function setupEventListeners() {
	if(singleBtn){
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
	}

	if(tenBtn){
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
	}

	if(capSingle){
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
	}

	if(capTen){
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
	}

	if(clearInv){
		clearInv.addEventListener('click', async ()=>{
			if(!await showConfirm('Clear your inventory?')) return;
			state.inventory = {};
			saveState();
			updateUI();
		});
	}

	if(clearFruits){
		clearFruits.addEventListener('click', async ()=>{
			if(!await showConfirm('Clear fruits inventory?')) return;
			state.fruits = {};
			saveState();
			updateUI();
		});
	}
}

// Initialize when DOM is ready
if (typeof document !== 'undefined') {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initGame);
	} else {
		// DOM already loaded
		initGame();
	}
}

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
	let weepingCount = 0;
	for(const [id, count] of Object.entries(state.inventory)){
		const p = PETS.find(x=>x.id===id);
		if(p && p.rarity === 'special') specialCount += count;
		if(id === 'pet_sp_2') weepingCount += count;
	}
	if(specialCount > 0){
		const ef = computeEnchantEffects();
		__epOverflow += specialCount * EP_PER_SEC_PER_SPECIAL * ef.epGenerationMult;
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
	// Generate Tears from Weeping Spirits (linear rate: 0.2 tears/sec each)
	if(weepingCount > 0){
		const tearsGained = weepingCount * 0.2;
		state.tears = (state.tears || 0) + tearsGained;
		// cap tears for sanity (optional)
		if(state.tears > 1e9) state.tears = 1e9;
		saveState();
		updateUI();
		// show Tears pop animation near the Tears display
		if(typeof tearsDisplayMainEl !== 'undefined' && tearsDisplayMainEl && tearsDisplayMainEl.parentElement){
			const tPop = document.createElement('div');
			tPop.className = 'tear-pop';
			const shown = tearsGained % 1 === 0 ? tearsGained.toString() : tearsGained.toFixed(1);
			tPop.textContent = '+' + shown;
			tearsDisplayMainEl.parentElement.style.position = 'relative';
			tearsDisplayMainEl.parentElement.appendChild(tPop);
			tPop.addEventListener('animationend', ()=> tPop.remove());
		}
	}
}, 1000);

// Periodic check to clear expired effects
setInterval(()=>{
	let dirty = false;
	if(state.potionActive && state.potionEndsAt <= Date.now()){ state.potionActive = false; state.luckStacks = 0; dirty = true; }
	if(state.bennyActive && state.bennyEndsAt <= Date.now()){ state.bennyActive = false; dirty = true; }
	if(state.blessingActive && state.blessingEndsAt <= Date.now()){ state.blessingActive = false; dirty = true; }
	if(state.christmasActive && state.christmasEndsAt <= Date.now()){ state.christmasActive = false; dirty = true; }
	if(dirty){ saveState(); updateUI(); }
}, 1000);

// About is now a separate page (about.html); modal wiring removed

function getPetName(petId) {
	const pet = PETS.find(p => p.id === petId);
	return pet ? pet.name : "Undefined";
}

function getPetRarity(petId) {
	const pet = PETS.find(p => p.id === petId);
	return pet ? pet.rarity : "Undefined";
}

// Export ALL globals BEFORE requiring page modules so they can access them
if (typeof window !== 'undefined') {
	window.CLAIMED_CODES_KEY = 'btf_claimed_codes_v1';
	window.STORAGE_KEY = STORAGE_KEY;
	window.PETS = PETS;
	window.FRUITS = FRUITS;
	window.ENCHANTMENTS = ENCHANTMENTS;
	window.state = state;
	window.coinsEl = coinsEl;
	window.luckMultiplierEl = luckMultiplierEl;
	window.saveState = saveState;
	window.updateUI = updateUI;
	window.showAlert = showAlert;
	window.showConfirm = showConfirm;
	window.redeemGiftCode = redeemGiftCode;
	window.getPetName = getPetName;
	window.getPetRarity = getPetRarity;

	// Safe helper to grant a pet and persist
	window.grantPet = function(petId, count = 1){
		try{
			state.inventory = state.inventory || {};
			state.inventory[petId] = (state.inventory[petId] || 0) + (count||1);
			saveState();
			if(typeof updateUI === 'function') updateUI();
			return true;
		}catch(e){ console.warn('grantPet failed', e); return false; }
	};
	
	// Export useBrewedPotion function for inventory page
	window.useBrewedPotion = function(index){
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
		
		saveState();
		updateUI();
	};
}

// Import all page-specific modules AFTER globals are exported (CommonJS for simple bundling)
require('./shop.js');
require('./inventory.js');
require('./enchant.js');
require('./trade.js');
require('./leaderboard.js');

// ==================== SHOP PAGE CODE ====================
// Only executes if shop page elements exist
if (document.getElementById('buyLuckPotion')) {
	const POTION_COST = 100000;
	const POTION_DURATION = 5 * 60 * 1000;
	const BENNY_COST = 10000;
	const BENNY_DURATION = 5 * 60 * 1000;
	const BLESSING_COST = 8000;
	const BLESSING_DURATION = 5 * 60 * 1000;
	const SLOT_MACHINE_COST = 1000000;
	const SLOT_MACHINE_BONUS = 5;
 
	const buyBtn = document.getElementById('buyLuckPotion');
	const timerEl = document.getElementById('potionTimer');
	const buyBennyBtn = document.getElementById('buyBennyBoost');
	const bennyTimerEl = document.getElementById('bennyTimer');
	const buyBlessingBtn = document.getElementById('buyPumpkinBlessing');
	const blessingTimerEl = document.getElementById('blessingTimer');
	const buySlotMachineBtn = document.getElementById('buySlotMachine');
	const slotsPurchasedEl = document.getElementById('slotsPurchased');
	const tearsDisplayEl = document.getElementById('tearsDisplay');
	const brewFruitListEl = document.getElementById('brewFruitList');
	const brewSelectionEl = document.getElementById('brewSelection');
	const brewPreviewEl = document.getElementById('brewPreview');
	const brewPotionBtn = document.getElementById('brewPotionBtn');

	const RARITY_POTENCY = {
		common: 1, rare: 2, epic: 4, special: 5, legendary: 6,
		spooky: 8, chromatic: 10, unique: 15, godly: 20
	};
	const RARITY_TEARS_COST = {
		common: 5, rare: 20, epic: 60, special: 80, legendary: 150,
		spooky: 200, chromatic: 300, unique: 1000, godly: 5000
	};
	const BREW_DURATION = 5 * 60 * 1000;

	function getFruitDef(fid){ return FRUITS.find(f=>f.id===fid); }
	let selectedFruits = [];

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
		selectedFruits.forEach(fid=>{ if(state.fruits[fid]>0){ state.fruits[fid] -= 1; if(state.fruits[fid]===0) delete state.fruits[fid]; } });
		state.tears = Math.max(0, (state.tears||0) - cost);
		
		let potionName = 'Luck Potion';
		if (potency <= 3) potionName = 'Buns Luck Potion';
		else if (potency <= 8) potionName = 'Weak Luck Potion';
		else if (potency <= 15) potionName = 'Basic Luck Potion';
		else if (potency <= 25) potionName = 'Better Luck Potion';
		else if (potency <= 40) potionName = 'Superior Luck Potion';
		else if (potency <= 60) potionName = 'Mega Superior Luck Potion';
		else if (potency <= 80) potionName = 'Mega Mega Superior Luck Potion';
		else potionName = 'Godly Luck Potion';
		
		if(!Array.isArray(state.potionInventory)) state.potionInventory = [];
		state.potionInventory.push({ type:'luck', name: potionName, potency, durationMs: BREW_DURATION, createdAt: Date.now() });
		selectedFruits = [];
		saveState();
		updateShopUI();
		renderBrewableFruits();
		await showAlert(` ${potionName} brewed successfully! Check your Inventory to use it.`);
	}

	function updateShopUI() {
		coinsEl.textContent = state.coins;
		if(tearsDisplayEl){ tearsDisplayEl.textContent = Math.floor(state.tears || 0); }
		
		if(luckMultiplierEl){
			const isActive = state.potionActive && state.potionEndsAt > Date.now();
			const cappedStacks = Math.min(state.luckStacks, 100);
			luckMultiplierEl.textContent = isActive ? `${1 + cappedStacks * 2}x` : "1x";
		}
		
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

	buyBtn.addEventListener('click', () => {
		if (state.coins >= POTION_COST) {
			state.coins -= POTION_COST;
			if (state.potionActive && state.potionEndsAt > Date.now()) {
				state.luckStacks = Math.min(state.luckStacks + 1, 100);
				state.potionEndsAt = Date.now() + POTION_DURATION;
			} else {
				state.potionActive = true;
				state.luckStacks = 1;
				state.potionEndsAt = Date.now() + POTION_DURATION;
			}
			if (!state.purchasedItems.some(item => item.name === 'Potion of Luck')) {
				state.purchasedItems.push({ name: 'Potion of Luck', icon: '', description: 'Makes all items 3x more common for 5 minutes' });
			}
			saveState();
			updateShopUI();
		}
	});

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
				updateShopUI();
			}
		});
	}

	if(buySlotMachineBtn){
		buySlotMachineBtn.addEventListener('click', ()=>{
			const alreadyBought = (state.bonusInventorySlots || 0) >= SLOT_MACHINE_BONUS;
			if(alreadyBought){ alert('You already own the Slot Machine.'); return; }
			if(state.coins >= SLOT_MACHINE_COST){
				state.coins -= SLOT_MACHINE_COST;
				state.bonusInventorySlots = SLOT_MACHINE_BONUS;
				if(!state.purchasedItems.some(i=>i.name==='Slot Machine')){
					state.purchasedItems.push({ name: 'Slot Machine', icon: '🎰', description: `Adds +5 pet inventory slots permanently` });
				}
				saveState();
				updateShopUI();
				alert(`Purchased! Your pet inventory capacity is now ${20 + state.bonusInventorySlots} slots.`);
			}
		});
	}

	const giftCodeInput = document.getElementById('giftCodeInput');
	const redeemGiftCodeBtn = document.getElementById('redeemGiftCode');
	if(redeemGiftCodeBtn && giftCodeInput){
		redeemGiftCodeBtn.addEventListener('click', async ()=>{
			const code = giftCodeInput.value.trim().toUpperCase();
			if(!code){ await showAlert('Please enter a gift code.'); return; }
			if(typeof redeemGiftCode === 'function'){
				const result = redeemGiftCode(code);
				if(result.success){
					updateShopUI();
					await showAlert('✅ ' + result.message);
					giftCodeInput.value = '';
				} else {
					await showAlert('❌ ' + result.message);
				}
			}
		});
		giftCodeInput.addEventListener('keypress', (e)=>{ if(e.key === 'Enter') redeemGiftCodeBtn.click(); });
	}

	setInterval(updateShopUI, 1000);
	renderBrewableFruits();
	updateBrewPreview();
}

// ==================== INVENTORY PAGE CODE ====================
// Only executes if inventory page elements exist
if (document.getElementById('brewedPotions')) {
	const activeEffectsEl = document.getElementById('activeEffects');
	const brewedPotionsEl = document.getElementById('brewedPotions');
	const purchasedItemsEl = document.getElementById('purchasedItems');
	const petDetailModal = document.getElementById('petDetailModal');
	const closePetDetail = document.getElementById('closePetDetail');
	const petDetailName = document.getElementById('petDetailName');
	const enchantList = document.getElementById('enchantList');

	function showPetDetail(petKey, petId) {
		const pet = PETS.find(p => p.id === petId);
		if (!pet) return;
		petDetailName.textContent = pet.name;
		const enchants = state.petEnchantments[petKey] || [];
		enchantList.innerHTML = '';
		if (enchants.length === 0) {
			enchantList.innerHTML = '<p style="color:var(--muted);font-size:13px">No enchantments yet. Visit the Enchanting page to add enchantments!</p>';
		} else {
			enchants.forEach(enchantId => {
				const enchant = ENCHANTMENTS.find(e => e.id === enchantId);
				if (enchant) {
					const badge = document.createElement('div');
					badge.className = `enchant-badge enchant-tier-${enchant.tier}`;
					badge.innerHTML = `<div style="font-weight:700">${enchant.name}</div><div style="font-size:11px;opacity:0.9">${enchant.description}</div>`;
					enchantList.appendChild(badge);
				}
			});
		}
		petDetailModal.classList.add('show');
	}

	function closePetDetailModal() { petDetailModal.classList.remove('show'); }
	closePetDetail.addEventListener('click', closePetDetailModal);
	petDetailModal.addEventListener('click', (e) => { if (e.target === petDetailModal) closePetDetailModal(); });

	function updateInventoryUI() {
		coinsEl.textContent = state.coins;
		if(luckMultiplierEl){
			const isActive = state.potionActive && state.potionEndsAt > Date.now();
			const cappedStacks = Math.min(state.luckStacks, 100);
			luckMultiplierEl.textContent = isActive ? `${1 + cappedStacks * 2}x` : "1x";
		}
		
		activeEffectsEl.innerHTML = '';
		if (state.potionActive && state.potionEndsAt > Date.now()) {
			const remaining = Math.ceil((state.potionEndsAt - Date.now()) / 1000);
			const minutes = Math.floor(remaining / 60);
			const seconds = remaining % 60;
			const cappedStacks = Math.min(state.luckStacks, 100);
			const effectEl = document.createElement('div');
			effectEl.className = 'item-card';
			effectEl.innerHTML = `
				<div class="item-icon">🧪</div>
				<div class="item-info">
					<h3>Luck Potion</h3>
					<p class="effect-active">Active - ${minutes}:${seconds.toString().padStart(2, '0')} remaining</p>
					<p>+${cappedStacks * 2}x luck boost (${cappedStacks} stack${cappedStacks !== 1 ? 's' : ''})</p>
				</div>
			`;
			activeEffectsEl.appendChild(effectEl);
		} else {
			activeEffectsEl.innerHTML = '<p style="color:var(--muted)">No active effects</p>';
		}

		if(brewedPotionsEl){
			brewedPotionsEl.innerHTML = '';
			const inv = Array.isArray(state.potionInventory) ? state.potionInventory : [];
			if(inv.length === 0){
				brewedPotionsEl.innerHTML = '<p style="color:var(--muted)">No brewed potions. Visit the Shop to brew potions!</p>';
			} else {
				inv.forEach((potion, idx) => {
					const potionEl = document.createElement('div');
					potionEl.className = 'item-card';
					potionEl.style.position = 'relative';
					potionEl.innerHTML = `
						<div class="item-icon">🧪</div>
						<div class="item-info">
							<h3>${potion.name}</h3>
							<p style="color:#10b981">+${potion.potency} luck stacks</p>
							<p style="font-size:12px">Duration: ${Math.round(potion.durationMs/60000)} minutes</p>
						</div>
					`;
					const useBtn = document.createElement('button');
					useBtn.className = 'buy-btn';
					useBtn.textContent = 'Use';
					useBtn.style.marginLeft = 'auto';
					useBtn.addEventListener('click', () => window.useBrewedPotion(idx));
					potionEl.appendChild(useBtn);
					brewedPotionsEl.appendChild(potionEl);
				});
			}
		}

		purchasedItemsEl.innerHTML = '';
		const petEntries = Object.entries(state.inventory || {});
		if (petEntries.length > 0) {
			petEntries.forEach(([petId, count]) => {
				const pet = PETS.find(p => p.id === petId);
				if (!pet) return;
				for (let i = 0; i < count; i++) {
					const petKey = `${petId}_${i}`;
					const enchants = state.petEnchantments[petKey] || [];
					const itemEl = document.createElement('div');
					itemEl.className = 'item-card';
					itemEl.style.cursor = 'pointer';
					itemEl.innerHTML = `
						<div class="item-icon">🐾</div>
						<div class="item-info">
							<h3>${pet.name}</h3>
							<p style="color:var(--${pet.rarity})">${pet.rarity.toUpperCase()}</p>
							<p style="font-size:11px;margin-top:4px">${enchants.length} enchantment${enchants.length !== 1 ? 's' : ''} • Click to view</p>
						</div>
					`;
					itemEl.addEventListener('click', () => showPetDetail(petKey, petId));
					purchasedItemsEl.appendChild(itemEl);
				}
			});
		}
		
		if (state.purchasedItems && state.purchasedItems.length > 0) {
			state.purchasedItems.forEach(item => {
				const itemEl = document.createElement('div');
				itemEl.className = 'item-card';
				itemEl.innerHTML = `
					<div class="item-icon">${item.icon}</div>
					<div class="item-info">
						<h3>${item.name}</h3>
						<p>${item.description}</p>
					</div>
				`;
				purchasedItemsEl.appendChild(itemEl);
			});
		}
		
		if (petEntries.length === 0 && (!state.purchasedItems || state.purchasedItems.length === 0)) {
			purchasedItemsEl.innerHTML = '<p style="color:var(--muted)">No items purchased yet</p>';
		}
	}

	setInterval(updateInventoryUI, 1000);
	updateInventoryUI();
}