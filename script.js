/* =========================================================
   REALM OF SHADOWS
   SCRIPT.JS — SIFIRDAN OYUN MOTORU
========================================================= */

"use strict";

/* =========================================================
   1. DOM
========================================================= */

const $ = (id) => document.getElementById(id);

const DOM = {
    story: $("story"),
    playerInput: $("playerInput"),
    actionButton: $("actionButton"),

    characterName: $("characterName"),
    characterClass: $("characterClass"),
    hp: $("hp"),
    level: $("level"),
    xp: $("xp"),
    gold: $("gold"),

    strength: $("strength"),
    dexterity: $("dexterity"),
    constitution: $("constitution"),
    intelligence: $("intelligence"),
    wisdom: $("wisdom"),
    charisma: $("charisma"),

    location: $("location"),

    quests: $("quests"),
    questCount: $("questCount"),

    inventory: $("inventory"),
    inventoryCount: $("inventoryCount"),

    diceResult: $("diceResult"),

    characterModal: $("characterModal"),
    inventoryModal: $("inventoryModal"),
    characterInfo: $("characterInfo"),

    nameInput: $("nameInput"),
    raceInput: $("raceInput"),
    classInput: $("classInput"),
    backgroundInput: $("backgroundInput")
};


/* =========================================================
   2. OYUNCU VERİSİ
========================================================= */

const DEFAULT_PLAYER = {
    name: "Arden",
    race: "İnsan",
    className: "Savaşçı",
    background: "Gezgin",

    level: 1,
    xp: 0,

    hp: 20,
    maxHp: 20,

    gold: 25,

    stats: {
        strength: 16,
        dexterity: 12,
        constitution: 15,
        intelligence: 10,
        wisdom: 11,
        charisma: 10
    },

    inventory: [
        {
            id: "rusty_sword",
            name: "Paslı Kılıç",
            type: "weapon",
            damage: "1d8",
            quantity: 1,
            equipped: false
        },
        {
            id: "potion",
            name: "Şifa İksiri",
            type: "consumable",
            quantity: 2,
            heal: 10
        },
        {
            id: "torch",
            name: "Meşale",
            type: "utility",
            quantity: 3
        }
    ],

    equippedWeapon: null
};


/* =========================================================
   3. DÜNYA
========================================================= */

const DEFAULT_WORLD = {
    name: "Realm of Shadows",

    location: "Blackmoor Köyü",

    weather: "Yağmurlu",
    time: "Gece",
    season: "Sonbahar",

    danger: 1,

    torchActive: false,

    discoveredLocations: [
        "Blackmoor Köyü"
    ],

    flags: {}
};


/* =========================================================
   4. HİKAYE
========================================================= */

const DEFAULT_STORY = {
    chapter: 1,

    actions: [],
    events: [],

    flags: {},

    discoveredLocations: [
        "Blackmoor Köyü"
    ],

    discoveredSecrets: [],

    relationships: {}
};


/* =========================================================
   5. OYUN DURUMU
========================================================= */

const game = {

    player: structuredClone(DEFAULT_PLAYER),

    world: structuredClone(DEFAULT_WORLD),

    story: structuredClone(DEFAULT_STORY),

    npcs: [],

    quests: [],

    locations: [],

    combat: {
        active: false,
        enemy: null,
        round: 0
    },

    settings: {
        autoScroll: true
    }

};


/* =========================================================
   6. YARDIMCI FONKSİYONLAR
========================================================= */

function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = String(value);

    return div.innerHTML;
}


function random(min, max) {

    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;
}


function modifier(stat) {

    return Math.floor((Number(stat) - 10) / 2);
}


function rollDice(notation) {

    const match = String(notation)
        .trim()
        .match(/^(\d+)d(\d+)$/i);

    if (!match) {
        return 0;
    }

    const count = Number(match[1]);
    const sides = Number(match[2]);

    let total = 0;

    for (let i = 0; i < count; i++) {
        total += random(1, sides);
    }

    return total;
}


function xpRequired(level) {

    return level * 100;
}


/* =========================================================
   7. STORY MESAJI
========================================================= */

function addStoryMessage(text, type = "dm") {

    if (!DOM.story) return;

    const message = document.createElement("div");

    message.className =
        `story-message ${type}`;

    const author = document.createElement("div");

    author.className = "message-author";

    author.textContent =
        type === "player"
            ? game.player.name
            : "🎲 Dungeon Master";

    const content = document.createElement("p");

    /*
       İçerideki <b>, <br>, <i> gibi oyun biçimlendirmelerini
       kullanabilmek için textContent değil innerHTML kullanıyoruz.
    */

    content.innerHTML = text;

    message.appendChild(author);
    message.appendChild(content);

    DOM.story.appendChild(message);

    if (game.settings.autoScroll) {

        DOM.story.scrollTop =
            DOM.story.scrollHeight;

    }
}


/* =========================================================
   8. PLAYER
========================================================= */

function getInventoryItem(id) {

    return game.player.inventory.find(
        item => item.id === id
    );
}


function removeEmptyInventoryItems() {

    game.player.inventory =
        game.player.inventory.filter(
            item => Number(item.quantity) > 0
        );
}


function getEquippedWeapon() {

    if (!game.player.equippedWeapon) {
        return null;
    }

    return getInventoryItem(
        game.player.equippedWeapon
    );
}


/* =========================================================
   9. UI — KARAKTER
========================================================= */

function updateCharacterUI() {

    const p = game.player;

    DOM.characterName.textContent = p.name;

    DOM.characterClass.textContent =
        `${p.race} ${p.className}`;

    DOM.hp.textContent =
        `${p.hp} / ${p.maxHp}`;

    DOM.level.textContent =
        p.level;

    DOM.xp.textContent =
        p.xp;

    DOM.gold.textContent =
        p.gold;

    DOM.strength.textContent =
        p.stats.strength;

    DOM.dexterity.textContent =
        p.stats.dexterity;

    DOM.constitution.textContent =
        p.stats.constitution;

    DOM.intelligence.textContent =
        p.stats.intelligence;

    DOM.wisdom.textContent =
        p.stats.wisdom;

    DOM.charisma.textContent =
        p.stats.charisma;
}


/* =========================================================
   10. ENVANTER
========================================================= */

function updateInventoryUI() {

    if (!DOM.inventory) return;

    DOM.inventory.innerHTML = "";

    const inventory = game.player.inventory;

    const totalItems =
        inventory.reduce(
            (sum, item) =>
                sum + Number(item.quantity || 0),
            0
        );

    DOM.inventoryCount.textContent =
        totalItems;

    if (!inventory.length) {

        DOM.inventory.innerHTML =
            `<p class="empty">Envanter boş.</p>`;

        return;
    }

    inventory.forEach(item => {

        const element =
            document.createElement("div");

        element.className =
            "inventory-item";

        let icon = "📦";

        if (item.type === "weapon") {
            icon = "⚔️";
        }

        if (item.type === "consumable") {
            icon = "🧪";
        }

        if (item.type === "utility") {
            icon = "🔥";
        }

        let actionText = "Kullan";

        if (item.type === "weapon") {

            actionText =
                item.equipped
                    ? "Bırak"
                    : "Kuşan";
        }

        if (item.type === "utility") {

            actionText =
                game.world.torchActive
                    ? "Söndür"
                    : "Yak";
        }

        element.innerHTML = `

            <div class="inventory-item-icon">
                ${icon}
            </div>

            <div class="inventory-item-info">

                <strong>
                    ${escapeHTML(item.name)}
                </strong>

                <span>
                    Adet: ${item.quantity}
                </span>

                ${
                    item.damage
                        ? `<span>
                            Hasar: ${escapeHTML(item.damage)}
                           </span>`
                        : ""
                }

                ${
                    item.equipped
                        ? `<span class="equipped">
                            ⚔️ Kuşanılmış
                           </span>`
                        : ""
                }

            </div>

            <button
                class="inventory-use-button"
                data-item-id="${escapeHTML(item.id)}"
            >
                ${actionText}
            </button>
        `;

        const button =
            element.querySelector(
                ".inventory-use-button"
            );

        button.addEventListener(
            "click",
            () => useInventoryItem(item.id)
        );

        DOM.inventory.appendChild(element);
    });
}


function useInventoryItem(id) {

    const item =
        getInventoryItem(id);

    if (!item) {
        return;
    }

    switch (item.type) {

        case "weapon":
            toggleWeapon(item);
            break;

        case "consumable":
            usePotion(item);
            break;

        case "utility":
            useTorch(item);
            break;

        default:
            addStoryMessage(
                "Bu eşyanın nasıl kullanılacağını bilmiyorsun."
            );
    }
}


function toggleWeapon(item) {

    if (item.equipped) {

        item.equipped = false;

        game.player.equippedWeapon = null;

        addStoryMessage(
            `⚔️ ${escapeHTML(item.name)} kuşandan çıkarıldı.`
        );

    } else {

        game.player.inventory.forEach(
            other => {

                if (other.type === "weapon") {
                    other.equipped = false;
                }
            }
        );

        item.equipped = true;

        game.player.equippedWeapon =
            item.id;

        addStoryMessage(
            `⚔️ <b>${escapeHTML(item.name)}</b> kuşandın.`
        );
    }

    updateAllUI();
}


function usePotion(item) {

    if (!item || item.quantity <= 0) {

        addStoryMessage(
            "🧪 Şifa iksirin yok."
        );

        return;
    }

    if (game.player.hp >= game.player.maxHp) {

        addStoryMessage(
            "❤️ Canın zaten tamamen dolu."
        );

        return;
    }

    const oldHp =
        game.player.hp;

    game.player.hp =
        Math.min(
            game.player.maxHp,
            game.player.hp + Number(item.heal || 10)
        );

    const healed =
        game.player.hp - oldHp;

    item.quantity--;

    removeEmptyInventoryItems();

    addStoryMessage(`
        🧪 <b>Şifa İksiri kullandın.</b>
        <br><br>
        ❤️ +${healed} can
        <br>
        Can: <b>${game.player.hp}/${game.player.maxHp}</b>
    `);

    updateAllUI();
}


function useTorch(item) {

    if (!item) {

        addStoryMessage(
            "🔥 Meşalen yok."
        );

        return;
    }

    if (game.world.torchActive) {

        game.world.torchActive = false;

        addStoryMessage(
            "🔥 Meşaleyi söndürdün."
        );

    } else {

        if (item.quantity <= 0) {

            addStoryMessage(
                "🔥 Kullanılabilir meşalen yok."
            );

            return;
        }

        item.quantity--;

        game.world.torchActive = true;

        addStoryMessage(`
            🔥 <b>Meşaleyi yaktın.</b>
            <br><br>
            Karanlık çevre artık daha görünür.
        `);

        removeEmptyInventoryItems();
    }

    updateAllUI();
}


/* =========================================================
   11. KARAKTER MODALI
========================================================= */

function showCharacter() {

    const p = game.player;

    const weapon =
        getEquippedWeapon();

    DOM.characterInfo.innerHTML = `

        <p>
            <strong>İsim:</strong>
            ${escapeHTML(p.name)}
        </p>

        <p>
            <strong>Irk:</strong>
            ${escapeHTML(p.race)}
        </p>

        <p>
            <strong>Sınıf:</strong>
            ${escapeHTML(p.className)}
        </p>

        <p>
            <strong>Geçmiş:</strong>
            ${escapeHTML(p.background)}
        </p>

        <hr>

        <p>
            <strong>Seviye:</strong>
            ${p.level}
        </p>

        <p>
            <strong>XP:</strong>
            ${p.xp}
        </p>

        <p>
            <strong>Can:</strong>
            ${p.hp}/${p.maxHp}
        </p>

        <p>
            <strong>Altın:</strong>
            ${p.gold}
        </p>

        <p>
            <strong>Silah:</strong>
            ${
                weapon
                    ? escapeHTML(weapon.name)
                    : "Yok"
            }
        </p>
    `;

    DOM.characterModal
        .classList
        .remove("hidden");
}


/* =========================================================
   12. NPC SİSTEMİ
========================================================= */

function initializeNPCs() {

    game.npcs = [

        {
            id: "elder_jonas",
            name: "Jonas",
            role: "Yaşlı Köylü",
            location: "Blackmoor Köyü",
            trust: 0
        },

        {
            id: "healer_mara",
            name: "Mara",
            role: "Şifacı",
            location: "Blackmoor Köyü",
            trust: 5
        },

        {
            id: "blacksmith_aldric",
            name: "Aldric",
            role: "Demirci",
            location: "Blackmoor Köyü",
            trust: 0
        }
    ];
}


function getNPC(id) {

    return game.npcs.find(
        npc => npc.id === id
    );
}


function findNPCInText(text) {

    const lower =
        text.toLowerCase();

    return game.npcs.find(
        npc =>
            lower.includes(
                npc.name.toLowerCase()
            )
    );
}


/* =========================================================
   13. QUEST SYSTEM
========================================================= */

function addQuest(data) {

    if (
        game.quests.some(
            quest => quest.id === data.id
        )
    ) {
        return;
    }

    game.quests.push({

        id: data.id,

        title: data.title,

        description:
            data.description,

        objectives:
            data.objectives.map(
                objective => ({
                    id: objective.id,
                    text: objective.text,
                    completed: false
                })
            ),

        reward:
            Number(data.reward || 0),

        status: "active"
    });
}


function initializeQuests() {

    addQuest({

        id: "blackmoor_whispers",

        title:
            "Blackmoor'un Fısıltıları",

        description:
            "Köy kuyusundan gelen gizemli seslerin kaynağını araştır.",

        objectives: [

            {
                id: "visit_well",
                text: "Köy kuyusunu araştır."
            },

            {
                id: "learn_secret",
                text: "Kuyunun sırrı hakkında bilgi edin."
            }
        ],

        reward: 100
    });


    addQuest({

        id: "missing_person",

        title: "Kayıp Köylü",

        description:
            "Blackmoor'da kaybolan kişinin izini araştır.",

        objectives: [

            {
                id: "talk_healer",
                text: "Mara ile konuş."
            },

            {
                id: "find_clue",
                text: "Kaybolan kişiye ait bir ipucu bul."
            }
        ],

        reward: 150
    });
}


function completeQuestObjective(
    questId,
    objectiveId
) {

    const quest =
        game.quests.find(
            q => q.id === questId
        );

    if (!quest) {
        return;
    }

    const objective =
        quest.objectives.find(
            o => o.id === objectiveId
        );

    if (!objective) {
        return;
    }

    if (objective.completed) {
        return;
    }

    objective.completed = true;

    addStoryMessage(`
        📜 Görev ilerlemesi:
        <b>${escapeHTML(quest.title)}</b>
        <br>
        ✅ ${escapeHTML(objective.text)}
    `);

    const finished =
        quest.objectives.every(
            objective =>
                objective.completed
        );

    if (finished) {

        quest.status = "completed";

        game.player.gold +=
            quest.reward;

        game.player.xp += 50;

        addStoryMessage(`
            🎉 <b>GÖREV TAMAMLANDI!</b>
            <br><br>
            ${escapeHTML(quest.title)}
            <br><br>
            💰 +${quest.reward} altın
            <br>
            ✨ +50 XP
        `);

        checkLevelUp();
    }

    updateAllUI();
}


function updateQuestUI() {

    DOM.quests.innerHTML = "";

    const active =
        game.quests.filter(
            quest =>
                quest.status === "active"
        );

    DOM.questCount.textContent =
        active.length;

    if (!active.length) {

        DOM.quests.innerHTML =
            `<p class="empty">Aktif görev yok.</p>`;

        return;
    }

    active.forEach(quest => {

        const completed =
            quest.objectives.filter(
                objective =>
                    objective.completed
            ).length;

        const element =
            document.createElement("div");

        element.className =
            "quest-item";

        element.innerHTML = `

            <strong>
                📜 ${escapeHTML(quest.title)}
            </strong>

            <p>
                ${escapeHTML(quest.description)}
            </p>

            <div>
                İlerleme:
                ${completed}/${quest.objectives.length}
            </div>

            <ul>

                ${quest.objectives
                    .map(
                        objective => `
                            <li>
                                ${
                                    objective.completed
                                        ? "✅"
                                        : "⬜"
                                }

                                ${escapeHTML(
                                    objective.text
                                )}
                            </li>
                        `
                    )
                    .join("")
                }

            </ul>

            <small>
                Ödül:
                ${quest.reward} altın
            </small>
        `;

        DOM.quests.appendChild(
            element
        );
    });
}


/* =========================================================
   14. DÜŞMANLAR
========================================================= */

const ENEMIES = {

    shadow_wolf: {

        name: "Gölge Kurdu",

        hp: 24,
        maxHp: 24,

        armor: 12,

        attackBonus: 4,

        damage: "1d6",

        xp: 50,
        gold: 15,

        description:
            "Karanlığın içinden çıkan, gözleri sarı parlayan vahşi bir yaratık."
    },

    goblin: {

        name: "Goblin",

        hp: 18,
        maxHp: 18,

        armor: 11,

        attackBonus: 3,

        damage: "1d6",

        xp: 40,
        gold: 10,

        description:
            "Küçük ama sinsi bir orman goblini."
    },

    skeleton: {

        name: "İskelet Savaşçı",

        hp: 30,
        maxHp: 30,

        armor: 13,

        attackBonus: 5,

        damage: "1d8",

        xp: 75,
        gold: 20,

        description:
            "Eski mezarlardan yükselen kemiklerle kaplı bir savaşçı."
    }
};


/* =========================================================
   15. COMBAT
========================================================= */

function startCombat(enemyId = "shadow_wolf") {

    if (game.combat.active) {

        addStoryMessage(
            "⚔️ Zaten savaştasın."
        );

        return;
    }

    const template =
        ENEMIES[enemyId];

    if (!template) {
        return;
    }

    game.combat.active = true;

    game.combat.round = 1;

    game.combat.enemy = {
        id: enemyId,
        ...structuredClone(template)
    };

    const enemy =
        game.combat.enemy;

    addStoryMessage(`
        ⚔️ <b>SAVAŞ BAŞLADI!</b>
        <br><br>

        👹 <b>${escapeHTML(enemy.name)}</b>
        <br>
        ${escapeHTML(enemy.description)}

        <br><br>

        ❤️ Can:
        <b>${enemy.hp}/${enemy.maxHp}</b>

        <br>

        🛡️ Zırh:
        <b>${enemy.armor}</b>

        <br><br>

        <b>saldır</b>,
        <b>iksir kullan</b>
        veya
        <b>kaç</b>
        yaz.
    `);

    updateCombatUI();
}


function playerAttack() {

    if (!game.combat.active) {
        return;
    }

    const enemy =
        game.combat.enemy;

    const d20 =
        random(1, 20);

    const strengthModifier =
        modifier(
            game.player.stats.strength
        );

    const weapon =
        getEquippedWeapon();

    const attack =
        d20 + strengthModifier;

    let damage = 0;

    let text = `
        ⚔️ <b>Saldırı!</b>

        <br><br>

        🎲 D20:
        <b>${d20}</b>

        <br>

        🎯 Saldırı:
        <b>${attack}</b>

        <br>

        🛡️ Düşman zırhı:
        <b>${enemy.armor}</b>
    `;

    if (d20 === 20) {

        damage =
            rollDice(
                weapon?.damage || "1d4"
            ) * 2;

        enemy.hp =
            Math.max(
                0,
                enemy.hp - damage
            );

        text += `
            <br><br>

            🎉 <b>KRİTİK VURUŞ!</b>

            <br>

            💥 Hasar:
            <b>${damage}</b>
        `;

    } else if (
        d20 !== 1 &&
        attack >= enemy.armor
    ) {

        damage =
            Math.max(
                1,
                rollDice(
                    weapon?.damage || "1d4"
                ) + strengthModifier
            );

        enemy.hp =
            Math.max(
                0,
                enemy.hp - damage
            );

        text += `
            <br><br>

            ⚔️ <b>VURUŞ!</b>

            <br>

            💥 Hasar:
            <b>${damage}</b>
        `;

    } else {

        text += `
            <br><br>

            ❌ <b>Iskaladın!</b>
        `;
    }

    text += `
        <br><br>

        👹 ${escapeHTML(enemy.name)}

        <br>

        ❤️ ${enemy.hp}/${enemy.maxHp}
    `;

    addStoryMessage(text);

    updateCombatUI();

    if (enemy.hp <= 0) {

        winCombat();

        return;
    }

    enemyTurn();
}


function enemyTurn() {

    if (!game.combat.active) {
        return;
    }

    const enemy =
        game.combat.enemy;

    game.combat.round++;

    const d20 =
        random(1, 20);

    const defense =
        10 +
        modifier(
            game.player.stats.dexterity
        );

    const attack =
        d20 +
        enemy.attackBonus;

    let damage = 0;

    let text = `
        👹 <b>${escapeHTML(enemy.name)}</b>
        saldırıyor!

        <br><br>

        🎲 D20:
        <b>${d20}</b>

        <br>

        🎯 Saldırı:
        <b>${attack}</b>

        <br>

        🛡️ Savunman:
        <b>${defense}</b>
    `;

    if (d20 === 20) {

        damage =
            rollDice(enemy.damage) * 2;

        game.player.hp =
            Math.max(
                0,
                game.player.hp - damage
            );

        text += `
            <br><br>

            💀 <b>KRİTİK VURUŞ!</b>

            <br>

            💥 Hasar:
            <b>${damage}</b>
        `;

    } else if (d20 !== 1 && attack >= defense) {

        damage =
            rollDice(enemy.damage);

        game.player.hp =
            Math.max(
                0,
                game.player.hp - damage
            );

        text += `
            <br><br>

            🩸 <b>Vuruldun!</b>

            <br>

            💥 Hasar:
            <b>${damage}</b>
        `;

    } else {

        text += `
            <br><br>

            ❌ Düşman ıskaladı.
        `;
    }

    text += `
        <br><br>

        ❤️ Canın:
        <b>${game.player.hp}/${game.player.maxHp}</b>
    `;

    addStoryMessage(text);

    updateAllUI();

    if (game.player.hp <= 0) {

        loseCombat();
    }
}


function attemptFlee() {

    if (!game.combat.active) {
        return;
    }

    const roll =
        random(1, 20);

    const dexterity =
        modifier(
            game.player.stats.dexterity
        );

    const total =
        roll + dexterity;

    if (total >= 12) {

        addStoryMessage(`
            🏃 <b>Kaçmayı başardın!</b>

            <br><br>

            🎲 D20:
            ${roll}
        `);

        game.combat.active = false;
        game.combat.enemy = null;
        game.combat.round = 0;

        updateAllUI();

    } else {

        addStoryMessage(`
            ❌ <b>Kaçamadın!</b>

            <br><br>

            🎲 D20:
            ${roll}
        `);

        enemyTurn();
    }
}


function winCombat() {

    const enemy =
        game.combat.enemy;

    game.player.xp +=
        enemy.xp;

    game.player.gold +=
        enemy.gold;

    addStoryMessage(`
        🎉 <b>ZAFER!</b>

        <br><br>

        👹 ${escapeHTML(enemy.name)}
        yenildi.

        <br><br>

        ✨ XP:
        <b>+${enemy.xp}</b>

        <br>

        💰 Altın:
        <b>+${enemy.gold}</b>
    `);

    game.combat.active = false;

    game.combat.enemy = null;

    game.combat.round = 0;

    checkLevelUp();

    updateAllUI();
}


function loseCombat() {

    const enemyName =
        game.combat.enemy?.name ||
        "Düşman";

    game.combat.active = false;

    game.combat.enemy = null;

    game.combat.round = 0;

    game.player.hp =
        Math.ceil(
            game.player.maxHp * 0.5
        );

    game.world.location =
        "Blackmoor Köyü";

    addStoryMessage(`
        💀 <b>YERE YIĞILDIN!</b>

        <br><br>

        ${escapeHTML(enemyName)}
        seni yendi.

        <br><br>

        Neyse ki ölüm son değil.

        <br><br>

        Blackmoor Köyü'nde
        gözlerini yeniden açıyorsun.

        <br><br>

        ❤️ Canın:
        ${game.player.hp}/${game.player.maxHp}
    `);

    updateAllUI();
}


/* =========================================================
   16. COMBAT COMMAND
========================================================= */

function handleCombatAction(action) {

    const text =
        action.toLowerCase();

    if (
        text.includes("iksir") ||
        text.includes("şifa")
    ) {

        const potion =
            getInventoryItem("potion");

        if (potion) {

            usePotion(potion);

            if (game.combat.active) {
                enemyTurn();
            }

        } else {

            addStoryMessage(
                "🧪 Şifa iksirin yok."
            );
        }

        return;
    }


    if (
        text.includes("kaç") ||
        text.includes("geri çekil")
    ) {

        attemptFlee();

        return;
    }


    if (
        text.includes("saldır") ||
        text.includes("vur") ||
        text.includes("kes") ||
        text.includes("kılıç") ||
        text.includes("bıçak") ||
        text.includes("büyü")
    ) {

        playerAttack();

        return;
    }


    addStoryMessage(`
        ⚔️ <b>Savaş devam ediyor.</b>

        <br><br>

        "saldır"
        — Düşmana saldır.

        <br>

        "iksir kullan"
        — Can yenile.

        <br>

        "kaç"
        — Kaçmayı dene.
    `);
}


/* =========================================================
   17. LOCATION SYSTEM
========================================================= */

function moveTo(location) {

    game.world.location =
        location;

    if (
        !game.world.discoveredLocations
            .includes(location)
    ) {

        game.world.discoveredLocations
            .push(location);
    }

    if (
        !game.story.discoveredLocations
            .includes(location)
    ) {

        game.story.discoveredLocations
            .push(location);
    }

    addStoryMessage(`
        📍 <b>${escapeHTML(location)}</b>
        bölgesine geldin.
    `);

    updateAllUI();
}


/* =========================================================
   18. KUYU
========================================================= */

function inspectWell() {

    game.story.flags.wellVisited =
        true;

    completeQuestObjective(
        "blackmoor_whispers",
        "visit_well"
    );

    if (
        !game.story.flags.wellSecret
    ) {

        game.story.flags.wellSecret =
            true;

        completeQuestObjective(
            "blackmoor_whispers",
            "learn_secret"
        );

        addStoryMessage(`
            🌑 <b>Eski Kuyu</b>

            <br><br>

            Kuyunun taş kenarına
            yaklaşıyorsun.

            <br><br>

            Yağmur taşların üzerinden
            süzülüyor.

            <br><br>

            Aşağıdan bir fısıltı geliyor:

            <br><br>

            <i>"Beni bul..."</i>

            <br><br>

            Kuyunun dibinde
            soluk mavi bir ışık görüyorsun.

            <br><br>

            🕯️ Bu kesinlikle
            sıradan bir kuyu değil.
        `);

    } else {

        addStoryMessage(`
            🌑 Kuyunun içine tekrar bakıyorsun.

            <br><br>

            Mavi ışık hâlâ orada.

            <br><br>

            Fısıltı bu kez daha yakın.
        `);
    }
}


/* =========================================================
   19. KİLİSE
========================================================= */

function inspectChurch() {

    game.story.flags.churchVisited =
        true;

    moveTo(
        "Terk Edilmiş Kilise"
    );

    addStoryMessage(`
        ⛪ <b>Terk Edilmiş Kilise</b>

        <br><br>

        Kapı hafifçe açık.

        <br><br>

        İçeride birkaç mum
        hâlâ yanıyor.

        <br><br>

        Fakat burada yaşayan
        kimse olmaması gerekiyordu.

        <br><br>

        Derinlerden metalik bir ses geliyor.
    `);
}


/* =========================================================
   20. ORMAN
========================================================= */

function enterForest() {

    moveTo(
        "Blackmoor Ormanı"
    );

    addStoryMessage(`
        🌲 <b>Blackmoor Ormanı</b>

        <br><br>

        Köyün ışıkları arkanda
        kalıyor.

        <br><br>

        Ağaçların arasında
        iki sarı göz beliriyor.

        <br><br>

        👹 Bir <b>Gölge Kurdu</b>
        seni fark etti.
    `);

    startCombat(
        "shadow_wolf"
    );
}


/* =========================================================
   21. NPC KONUŞMA
========================================================= */

function talkToNPC(npc) {

    if (!npc) {

        addStoryMessage(`
            🧑 Etrafına bakıyorsun.
            Konuşabileceğin belirgin
            birini bulamadın.
        `);

        return;
    }

    if (npc.id === "healer_mara") {

        npc.trust += 1;

        completeQuestObjective(
            "missing_person",
            "talk_healer"
        );

        addStoryMessage(`
            🧑‍⚕️ <b>Mara</b>
            sana dikkatlice bakıyor.

            <br><br>

            <i>
            "Kardeşim birkaç gün önce
            kayboldu. Onu en son
            kilisenin yakınında gördüler."
            </i>

            <br><br>

            Mara'nın gözlerinde
            korku var.

            <br><br>

            <i>
            "Eğer onu bulursan...
            lütfen geri getir."
            </i>
        `);

        return;
    }


    if (npc.id === "elder_jonas") {

        npc.trust += 1;

        addStoryMessage(`
            👴 <b>Jonas</b>
            bastonuna yaslanıyor.

            <br><br>

            <i>
            "Blackmoor eskiden böyle
            değildi evlat..."

            <br><br>

            "Kuyunun altında bir şey
            uyuyor. Son zamanlarda
            yeniden uyanmaya başladı."
            </i>
        `);

        return;
    }


    if (npc.id === "blacksmith_aldric") {

        npc.trust += 1;

        addStoryMessage(`
            🔨 <b>Aldric</b>
            çekicini bırakıyor.

            <br><br>

            <i>
            "Silahını iyi tut.
            Bu topraklarda geceleri
            neyin çıkacağını asla
            bilemezsin."
            </i>
        `);

        return;
    }


    addStoryMessage(`
        🧑 ${escapeHTML(npc.name)}
        seninle konuşuyor.
    `);
}


/* =========================================================
   22. KEŞİF
========================================================= */

function exploreArea() {

    const location =
        game.world.location;

    if (
        location === "Blackmoor Köyü"
    ) {

        if (
            !game.story.flags.foundFootprint
        ) {

            game.story.flags.foundFootprint =
                true;

            completeQuestObjective(
                "missing_person",
                "find_clue"
            );

            addStoryMessage(`
                🔎 <b>Çevreyi araştırıyorsun.</b>

                <br><br>

                Yağmur taşların üzerindeki
                izleri silmiş.

                <br><br>

                Fakat çamurun içinde
                sana ait olmayan ayak izleri
                buluyorsun.

                <br><br>

                İzler kiliseye doğru gidiyor.
            `);

        } else {

            addStoryMessage(`
                🔎 Çevreyi tekrar araştırıyorsun.

                <br><br>

                Daha önce gördüğün
                ayak izleri hâlâ seçilebiliyor.
            `);
        }

        return;
    }


    if (
        location === "Blackmoor Ormanı"
    ) {

        addStoryMessage(`
            🌲 Ormanı araştırıyorsun.

            <br><br>

            Islak yaprakların altında
            eski bir kemik buluyorsun.

            <br><br>

            Birkaç metre ötede
            eski bir kamp alanı var.
        `);

        return;
    }


    addStoryMessage(`
        🔎 Bölgeyi dikkatlice
        araştırıyorsun.

        <br><br>

        Henüz önemli bir şey
        bulamadın.
    `);
}


/* =========================================================
   23. DOĞAL DİL MOTORU
========================================================= */

function processNaturalLanguage(action) {

    const text =
        action.toLowerCase().trim();


    /* saldırı */

    if (
        text.includes("saldır") ||
        text.includes("vur") ||
        text.includes("kes") ||
        text.includes("öldür")
    ) {

        startCombat(
            "shadow_wolf"
        );

        return;
    }


    /* kuyu */

    if (
        text.includes("kuyu") ||
        text.includes("kuyuyu") ||
        text.includes("kuyunun")
    ) {

        inspectWell();

        return;
    }


    /* orman */

    if (
        text.includes("orman") ||
        text.includes("ağaçlık")
    ) {

        enterForest();

        return;
    }


    /* kilise */

    if (
        text.includes("kilise")
    ) {

        inspectChurch();

        return;
    }


    /* meşale */

    if (
        text.includes("meşale") ||
        text.includes("ışık yak")
    ) {

        const torch =
            getInventoryItem("torch");

        useTorch(torch);

        return;
    }


    /* iksir */

    if (
        text.includes("iksir") ||
        text.includes("şifa iç")
    ) {

        const potion =
            getInventoryItem("potion");

        usePotion(potion);

        return;
    }


    /* konuşma */

    if (
        text.includes("konuş") ||
        text.includes("sor") ||
        text.includes("seslen")
    ) {

        const npc =
            findNPCInText(text);

        talkToNPC(npc);

        return;
    }


    /* araştırma */

    if (
        text.includes("araştır") ||
        text.includes("incele") ||
        text.includes("kontrol et") ||
        text.includes("etrafa bak") ||
        text.includes("keşfet")
    ) {

        exploreArea();

        return;
    }


    /* gitme */

    if (
        text.includes("köye git") ||
        text.includes("köye dön")
    ) {

        moveTo(
            "Blackmoor Köyü"
        );

        return;
    }


    /* varsayılan hikâye */

    const responses = [

        `
        Etrafı dikkatlice
        gözlemliyorsun.

        <br><br>

        Karanlığın içinde
        henüz fark etmediğin
        bir şey olduğunu hissediyorsun.
        `,

        `
        Hamlen çevrede küçük
        bir değişikliğe neden oluyor.

        <br><br>

        Uzaklardan metalik
        bir ses duyuluyor.
        `,

        `
        Bir süre sessizlik oluyor.

        <br><br>

        Sonra yağmurun arasından
        belirsiz bir fısıltı geliyor.
        `,

        `
        İçgüdülerin burada
        daha derin bir sırrın
        olduğunu söylüyor.
        `
    ];

    addStoryMessage(
        responses[
            random(
                0,
                responses.length - 1
            )
        ]
    );
}


/* =========================================================
   24. ANA EYLEM
========================================================= */

function playerAction() {

    const text =
        DOM.playerInput.value.trim();

    if (!text) {
        return;
    }

    addStoryMessage(
        escapeHTML(text),
        "player"
    );

    game.story.actions.push({

        text: text,

        location:
            game.world.location,

        timestamp:
            new Date().toISOString()
    });

    DOM.playerInput.value = "";


    if (game.combat.active) {

        handleCombatAction(
            text
        );

        return;
    }


    processNaturalLanguage(
        text
    );
}


/* =========================================================
   25. ZAR
========================================================= */

function rollD20() {

    const result =
        random(1, 20);

    DOM.diceResult.textContent =
        result;

    if (result === 20) {

        addStoryMessage(
            "🎉 <b>Kritik başarı!</b> D20 sonucu 20."
        );

        return;
    }

    if (result === 1) {

        addStoryMessage(
            "💀 <b>Kritik başarısızlık!</b> D20 sonucu 1."
        );

        return;
    }

    addStoryMessage(
        `🎲 D20 sonucu: <b>${result}</b>`
    );
}


/* =========================================================
   26. LEVEL UP
========================================================= */

function checkLevelUp() {

    while (
        game.player.xp >=
        xpRequired(game.player.level)
    ) {

        const required =
            xpRequired(
                game.player.level
            );

        game.player.xp -=
            required;

        game.player.level++;

        const constitutionBonus =
            modifier(
                game.player.stats.constitution
            );

        game.player.maxHp +=
            5 + Math.max(
                0,
                constitutionBonus
            );

        game.player.hp =
            game.player.maxHp;

        addStoryMessage(`
            🌟 <b>SEVİYE ATLADIN!</b>

            <br><br>

            ⭐ Yeni seviye:
            <b>${game.player.level}</b>

            <br><br>

            ❤️ Maksimum canın arttı.

            <br>

            Yeni Can:
            <b>${game.player.maxHp}</b>
        `);
    }

    updateCharacterUI();
}


/* =========================================================
   27. KARAKTER OLUŞTURMA
========================================================= */

const CLASS_STATS = {

    "Savaşçı": {

        strength: 16,
        dexterity: 12,
        constitution: 15,
        intelligence: 10,
        wisdom: 11,
        charisma: 10,

        maxHp: 24
    },

    "Büyücü": {

        strength: 8,
        dexterity: 12,
        constitution: 10,
        intelligence: 18,
        wisdom: 15,
        charisma: 10,

        maxHp: 16
    },

    "Hırsız": {

        strength: 11,
        dexterity: 18,
        constitution: 12,
        intelligence: 13,
        wisdom: 10,
        charisma: 14,

        maxHp: 18
    },

    "Paladin": {

        strength: 16,
        dexterity: 10,
        constitution: 16,
        intelligence: 10,
        wisdom: 13,
        charisma: 16,

        maxHp: 23
    },

    "Korucu": {

        strength: 13,
        dexterity: 17,
        constitution: 13,
        intelligence: 11,
        wisdom: 14,
        charisma: 10,

        maxHp: 20
    }
};


const RACE_BONUSES = {

    "İnsan": {

        strength: 1,
        dexterity: 1,
        constitution: 1,
        intelligence: 1,
        wisdom: 1,
        charisma: 1
    },

    "Elf": {

        dexterity: 2,
        intelligence: 2,
        wisdom: 1
    },

    "Cüce": {

        constitution: 3,
        strength: 1
    },

    "Buçukluk": {

        dexterity: 3,
        charisma: 1
    },

    "Yarı-Ork": {

        strength: 3,
        constitution: 2,
        charisma: -1
    }
};


function createCharacter() {

    const name =
        DOM.nameInput.value.trim();

    if (!name) {

        alert(
            "Önce karakterine bir isim vermelisin."
        );

        return;
    }

    const race =
        DOM.raceInput.value;

    const className =
        DOM.classInput.value;

    const background =
        DOM.backgroundInput.value;

    const base =
        CLASS_STATS[className];

    const bonus =
        RACE_BONUSES[race];


    game.player.name =
        name;

    game.player.race =
        race;

    game.player.className =
        className;

    game.player.background =
        background;


    game.player.level = 1;

    game.player.xp = 0;

    game.player.gold = 25;


    game.player.stats = {

        strength:
            base.strength +
            (bonus.strength || 0),

        dexterity:
            base.dexterity +
            (bonus.dexterity || 0),

        constitution:
            base.constitution +
            (bonus.constitution || 0),

        intelligence:
            base.intelligence +
            (bonus.intelligence || 0),

        wisdom:
            base.wisdom +
            (bonus.wisdom || 0),

        charisma:
            base.charisma +
            (bonus.charisma || 0)
    };


    game.player.maxHp =
        base.maxHp;

    game.player.hp =
        base.maxHp;


    game.player.inventory =
        structuredClone(
            DEFAULT_PLAYER.inventory
        );


    game.player.equippedWeapon =
        null;


    game.world =
        structuredClone(
            DEFAULT_WORLD
        );


    game.story =
        structuredClone(
            DEFAULT_STORY
        );


    game.combat = {

        active: false,

        enemy: null,

        round: 0
    };


    DOM.characterModal
        .classList
        .add("hidden");


    addStoryMessage(`
        ⚔️ <b>Yeni karakter oluşturuldu!</b>

        <br><br>

        <b>${escapeHTML(name)}</b>,
        Realm of Shadows dünyasına
        adım atıyor.

        <br><br>

        Irk:
        <b>${escapeHTML(race)}</b>

        <br>

        Sınıf:
        <b>${escapeHTML(className)}</b>

        <br>

        Geçmiş:
        <b>${escapeHTML(background)}</b>
    `);


    updateAllUI();
}


/* =========================================================
   28. SAVE SYSTEM
========================================================= */

const SAVE_KEY =
    "realmOfShadowsSave_v2";


function createSaveData() {

    return {

        player:
            structuredClone(
                game.player
            ),

        world:
            structuredClone(
                game.world
            ),

        story:
            structuredClone(
                game.story
            ),

        npcs:
            structuredClone(
                game.npcs
            ),

        quests:
            structuredClone(
                game.quests
            ),

        locations:
            structuredClone(
                game.locations
            ),

        combat:
            structuredClone(
                game.combat
            )
    };
}


function saveGame() {

    try {

        const data =
            createSaveData();

        localStorage.setItem(
            SAVE_KEY,
            JSON.stringify(data)
        );

        addStoryMessage(
            "💾 <b>Oyun kaydedildi.</b>"
        );

    } catch (error) {

        console.error(
            "Save error:",
            error
        );

        addStoryMessage(
            "❌ Oyun kaydedilemedi."
        );
    }
}


function loadGame() {

    const saved =
        localStorage.getItem(
            SAVE_KEY
        );

    if (!saved) {

        addStoryMessage(
            "📂 Kaydedilmiş oyun bulunamadı."
        );

        return;
    }

    try {

        const data =
            JSON.parse(saved);


        game.player =
            data.player ||
            structuredClone(
                DEFAULT_PLAYER
            );


        game.world =
            data.world ||
            structuredClone(
                DEFAULT_WORLD
            );


        game.story =
            data.story ||
            structuredClone(
                DEFAULT_STORY
            );


        game.npcs =
            data.npcs || [];


        game.quests =
            data.quests || [];


        game.locations =
            data.locations || [];


        game.combat =
            data.combat || {

                active: false,

                enemy: null,

                round: 0
            };


        updateAllUI();


        addStoryMessage(
            "📂 <b>Kaydedilmiş macera yüklendi.</b>"
        );

    } catch (error) {

        console.error(
            "Load error:",
            error
        );

        addStoryMessage(
            "❌ Kayıt dosyası okunamadı."
        );
    }
}


/* =========================================================
   29. COMBAT UI
========================================================= */

function updateCombatUI() {

    let status =
        $("combatStatus");


    if (!game.combat.active) {

        if (status) {
            status.remove();
        }

        return;
    }


    if (!status) {

        status =
            document.createElement(
                "div"
            );

        status.id =
            "combatStatus";

        status.className =
            "combat-status";


        DOM.story.parentNode.insertBefore(
            status,
            DOM.story.nextSibling
        );
    }


    const enemy =
        game.combat.enemy;


    if (!enemy) {
        return;
    }


    status.innerHTML = `

        <div class="combat-status-title">
            ⚔️ SAVAŞ
        </div>

        <div>
            👹
            <strong>
                ${escapeHTML(enemy.name)}
            </strong>
        </div>

        <div>
            ❤️
            ${enemy.hp}/${enemy.maxHp}
        </div>

        <div>
            🔄 Tur:
            ${game.combat.round}
        </div>
    `;
}


/* =========================================================
   30. GENEL UI
========================================================= */

function updateAllUI() {

    DOM.location.textContent =
        game.world.location;

    updateCharacterUI();

    updateInventoryUI();

    updateQuestUI();

    updateCombatUI();
}


/* =========================================================
   31. MODAL EVENTLERİ
========================================================= */

$("characterButton").onclick =
    showCharacter;


$("closeCharacter").onclick =
    () => {

        DOM.characterModal
            .classList
            .add("hidden");
    };


$("inventoryButton").onclick =
    () => {

        updateInventoryUI();

        DOM.inventoryModal
            .classList
            .remove("hidden");
    };


$("closeInventory").onclick =
    () => {

        DOM.inventoryModal
            .classList
            .add("hidden");
    };


DOM.characterModal.onclick =
    (event) => {

        if (
            event.target ===
            DOM.characterModal
        ) {

            DOM.characterModal
                .classList
                .add("hidden");
        }
    };


DOM.inventoryModal.onclick =
    (event) => {

        if (
            event.target ===
            DOM.inventoryModal
        ) {

            DOM.inventoryModal
                .classList
                .add("hidden");
        }
    };


document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {

            DOM.characterModal
                .classList
                .add("hidden");

            DOM.inventoryModal
                .classList
                .add("hidden");
        }
    }
);


/* =========================================================
   32. EVENTLER
========================================================= */

DOM.actionButton.onclick =
    playerAction;


DOM.playerInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            playerAction();
        }
    }
);


$("saveButton").onclick =
    saveGame;


$("loadButton").onclick =
    loadGame;


$("rollButton").onclick =
    rollD20;


$("createCharacter").onclick =
    createCharacter;


/* =========================================================
   33. BAŞLANGIÇ
========================================================= */

function initializeGame() {

    initializeNPCs();

    initializeQuests();

    addStoryMessage(`
        🌧️ <b>Blackmoor Köyü</b>

        <br><br>

        Yağmur, köyün taş sokaklarını
        dövüyor.

        <br><br>

        Köy meydanının ortasında
        eski bir kuyu duruyor.

        <br><br>

        Terk edilmiş kilisenin kapısı
        rüzgâr olmamasına rağmen
        yavaşça hareket ediyor.

        <br><br>

        Gece daha yeni başlıyor.

        <br><br>

        <b>
        Karakterinin ne yapacağını yaz.
        </b>

        <br><br>

        Örnekler:

        <br>

        • "Kuyuyu araştırıyorum."

        <br>

        • "Mara ile konuşuyorum."

        <br>

        • "Ormana gidiyorum."

        <br>

        • "Meşaleyi yakıyorum."

        <br>

        • "Kılıcımı çekip saldırıyorum."
    `);

    updateAllUI();

    console.log(
        "✅ Realm of Shadows Script.js hazır."
    );
}


initializeGame();
