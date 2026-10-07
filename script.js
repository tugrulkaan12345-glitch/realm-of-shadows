/* =========================================================
   REALM OF SHADOWS
   SCRIPT.JS
   ---------------------------------------------------------
   Temiz oyun motoru
   - Karakter
   - Envanter
   - Kuşanma
   - İksir
   - Meşale
   - NPC
   - Görev
   - Zar
   - Savaş
   - Kaçma / Savunma
   - XP / Level
   - Save / Load
   - Serbest oyuncu eylemleri
   - AI Dungeon Master
   - Render API
========================================================= */

"use strict";

/* =========================================================
   AYARLAR
========================================================= */

const CONFIG = {

    SAVE_KEY: "realmOfShadowsSave",

    /*
       Render backend'in /api/story endpoint'i varsa
       bu şekilde bırak.
    */
    AI_SERVER_URL:
        "https://realm-of-shadows-kjyu.onrender.com/api/story",

    AI_TIMEOUT: 30000

};


/* =========================================================
   OYUN DURUMU
========================================================= */

const game = {

    player: {

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

    },


    world: {

        name: "Realm of Shadows",

        location: "Blackmoor Köyü",

        weather: "Yağmurlu",

        time: "Gece",

        danger: 1,

        season: "Sonbahar",

        torchActive: false

    },


    npcs: [],

    quests: [],

    factions: [],

    locations: [],


    story: {

        chapter: 1,

        scene: "Blackmoor Köyü",

        actions: [],

        events: [],

        flags: {},

        discoveredLocations: [
            "Blackmoor Köyü"
        ],

        discoveredSecrets: [],

        relationships: {}

    },


    combat: {

        active: false,

        enemy: null,

        round: 0,

        defending: false

    },


    ai: {

        online: false,

        loading: false,

        lastResponse: null,

        history: [],

        pendingCheck: null

    }

};


/* =========================================================
   DOM
========================================================= */

const $ = id =>
    document.getElementById(id);


const playerInput =
    $("playerInput");

const actionButton =
    $("actionButton");

const saveButton =
    $("saveButton");

const loadButton =
    $("loadButton");

const characterButton =
    $("characterButton");

const inventoryButton =
    $("inventoryButton");

const characterModal =
    $("characterModal");

const closeCharacter =
    $("closeCharacter");

const characterInfo =
    $("characterInfo");

const inventoryModal =
    $("inventoryModal");

const closeInventory =
    $("closeInventory");

const inventoryPanel =
    $("inventory");

const inventoryCount =
    $("inventoryCount");

const questPanel =
    $("quests");

const questCount =
    $("questCount");

const rollButton =
    $("rollButton");

const diceResult =
    $("diceResult");

const nameInput =
    $("nameInput");

const raceInput =
    $("raceInput");

const classInput =
    $("classInput");

const backgroundInput =
    $("backgroundInput");

const createCharacterButton =
    $("createCharacter");


/* =========================================================
   GENEL YARDIMCI FONKSİYONLAR
========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        String(value ?? "");

    return div.innerHTML;

}


function normalizeText(value) {

    return String(value ?? "")
        .toLocaleLowerCase("tr-TR")
        .trim();

}


function clamp(value, min, max) {

    return Math.min(
        max,
        Math.max(min, value)
    );

}


function getModifier(stat) {

    return Math.floor(
        (Number(stat || 10) - 10) / 2
    );

}


function randomInt(min, max) {

    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;

}


/* =========================================================
   HİKAYE MESAJI
========================================================= */

function addStoryMessage(
    text,
    type = "dm"
) {

    const story =
        $("story");

    if (!story) return;


    const message =
        document.createElement("div");

    message.className =
        `story-message ${type}`;


    const author =
        document.createElement("div");

    author.className =
        "message-author";


    author.textContent =
        type === "player"
            ? game.player.name
            : "🎲 Dungeon Master";


    const content =
        document.createElement("p");


    /*
       Oyun içi DM mesajlarında kontrollü HTML
       kullanıyoruz.

       Oyuncu mesajı ise HTML olarak işlenmez.
    */

    if (type === "player") {

        content.textContent =
            text;

    }

    else {

        content.innerHTML =
            String(text);

    }


    message.appendChild(author);
    message.appendChild(content);

    story.appendChild(message);


    story.scrollTop =
        story.scrollHeight;

}


/* =========================================================
   OYUNCU EYLEM ANALİZİ
========================================================= */

function analyzeAction(text) {

    const lower =
        normalizeText(text);


    return {

        attack:
            /saldır|saldir|vur|vurdum|vuruyorum|hamle|kılıçla|kilicla|silahımla|silahimla|üzerine atıl|uzerine atil/
                .test(lower),

        potion:
            /iksir|şifa|sifa|iyileş|iyiles|canımı doldur|canimi doldur/
                .test(lower),

        flee:
            /kaç|kac|kaçıyorum|kaciyorum|geri çekil|geri cekil|uzaklaş|uzaklas/
                .test(lower),

        defend:
            /savun|korun|kalkan/
                .test(lower),

        torch:
            /meşale|mesale|ışık yak|isik yak|meşaleyi yak|mesaleyi yak/
                .test(lower),

        well:
            /kuyu|kuyuyu|kuyunun/
                .test(lower),

        church:
            /kilise|kiliseye|tapınak|tapinak/
                .test(lower),

        forest:
            /orman|ormana|ağaçlık|agaclik/
                .test(lower),

        npc:
            /konuş|konus|sor|köylü|koylu|mara|jonas|aldric|demirci|şifacı|sifaci|yaşlı|yasli/
                .test(lower),

        investigate:
            /araştır|arastir|incele|kontrol et|bak|gözlemle|gozlemle|keşfet|kesfet|dinle|ara/
                .test(lower),

        equip:
            /kuşan|kusan|kuşan|giy|tak|silahımı hazırla|silahimi hazirla/
                .test(lower),

        inventory:
            /envanter|çantam|cantam/
                .test(lower)

    };

}


/* =========================================================
   ENVANTER
========================================================= */

function getInventoryItem(id) {

    return game.player.inventory.find(
        item => item.id === id
    ) || null;

}


function removeEmptyItems() {

    game.player.inventory =
        game.player.inventory.filter(
            item =>
                Number(item.quantity || 0) > 0
        );

}


function updateInventoryUI() {

    if (!inventoryPanel) return;


    inventoryPanel.innerHTML = "";


    const inventory =
        game.player.inventory;


    if (inventoryCount) {

        inventoryCount.textContent =
            inventory.reduce(
                (total, item) =>
                    total + Number(item.quantity || 0),
                0
            );

    }


    if (!inventory.length) {

        inventoryPanel.innerHTML =
            `<p class="empty">Envanter boş.</p>`;

        return;

    }


    inventory.forEach(item => {

        const element =
            document.createElement("div");

        element.className =
            "inventory-item";


        let icon = "📦";


        if (item.type === "weapon")
            icon = "⚔️";

        else if (item.type === "consumable")
            icon = "🧪";

        else if (item.type === "utility")
            icon = "🔥";


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
                            Hasar:
                            ${escapeHTML(item.damage)}
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
                type="button"
            >
                ${getInventoryActionText(item)}
            </button>
        `;


        const button =
            element.querySelector(
                ".inventory-use-button"
            );


        button?.addEventListener(
            "click",
            () => useInventoryItem(item.id)
        );


        inventoryPanel.appendChild(
            element
        );

    });

}


function getInventoryActionText(item) {

    if (item.type === "weapon") {

        return item.equipped
            ? "Bırak"
            : "Kuşan";

    }


    if (item.type === "consumable") {

        return "Kullan";

    }


    if (item.type === "utility") {

        return game.world.torchActive
            ? "Söndür"
            : "Yak";

    }


    return "Kullan";

}


/* =========================================================
   EŞYA KULLANIMI
========================================================= */

function useInventoryItem(id) {

    const item =
        getInventoryItem(id);


    if (!item) return;


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
                "Bu eşya şu anda kullanılamıyor.",
                "dm"
            );

    }

}


/* =========================================================
   SİLAH
========================================================= */

function toggleWeapon(item) {

    if (item.equipped) {

        item.equipped =
            false;

        game.player.equippedWeapon =
            null;


        addStoryMessage(
            `⚔️ ${escapeHTML(item.name)} kuşandan çıkarıldı.`,
            "dm"
        );

    }

    else {

        game.player.inventory.forEach(
            inventoryItem => {

                if (
                    inventoryItem.type === "weapon"
                ) {

                    inventoryItem.equipped =
                        false;

                }

            }
        );


        item.equipped =
            true;

        game.player.equippedWeapon =
            item.id;


        addStoryMessage(
            `⚔️ <b>${escapeHTML(item.name)}</b> kuşandın.`,
            "dm"
        );

    }


    updateAllUI();

}


/* =========================================================
   İKSİR
========================================================= */

function usePotion(item) {

    if (!item || item.quantity <= 0) {

        addStoryMessage(
            "🧪 Kullanabileceğin şifa iksiri yok.",
            "dm"
        );

        return false;

    }


    if (
        game.player.hp >=
        game.player.maxHp
    ) {

        addStoryMessage(
            "❤️ Canın zaten tamamen dolu.",
            "dm"
        );

        return false;

    }


    const oldHP =
        game.player.hp;


    const heal =
        Number(item.heal || 10);


    game.player.hp =
        clamp(
            game.player.hp + heal,
            0,
            game.player.maxHp
        );


    const actualHeal =
        game.player.hp - oldHP;


    item.quantity--;


    addStoryMessage(`

        🧪 Şifa İksiri kullandın.

        <br><br>

        ❤️ <b>+${actualHeal}</b> can yenilendi.

        <br>

        Can:
        <b>${game.player.hp}/${game.player.maxHp}</b>

    `, "dm");


    removeEmptyItems();

    updateAllUI();

    return true;

}


/* =========================================================
   MEŞALE
========================================================= */

function useTorch(item) {

    if (!item) return;


    /*
       Meşale aktifse söndürülür.
       Yakılan meşale tüketilmiştir.
    */

    if (game.world.torchActive) {

        game.world.torchActive =
            false;


        addStoryMessage(
            "🔥 Meşaleyi söndürdün.",
            "dm"
        );

        updateAllUI();

        return;

    }


    if (item.quantity <= 0) {

        addStoryMessage(
            "🔥 Kullanılabilir meşalen yok.",
            "dm"
        );

        return;

    }


    game.world.torchActive =
        true;

    item.quantity--;


    addStoryMessage(
        "🔥 Meşaleyi yaktın. Karanlık çevre artık daha görünür.",
        "dm"
    );


    removeEmptyItems();

    updateAllUI();

}


/* =========================================================
   NPC SİSTEMİ
========================================================= */

function createNPC(data) {

    const existing =
        game.npcs.find(
            npc => npc.id === data.id
        );


    if (existing) {

        return existing;

    }


    const npc = {

        id: data.id,

        name: data.name,

        role: data.role,

        personality:
            data.personality || "",

        location:
            data.location,

        trust:
            Number(data.trust || 0),

        secrets:
            [...(data.secrets || [])],

        knowledge:
            [...(data.knowledge || [])],

        relationshipHistory: []

    };


    game.npcs.push(npc);

    return npc;

}


function initializeNPCs() {

    createNPC({

        id: "elder_jonas",

        name: "Jonas",

        role: "Yaşlı Köylü",

        personality:
            "Şüpheci, korkak fakat köyünü korumaya çalışan biri.",

        location:
            "Blackmoor Köyü",

        trust: 0,

        secrets: [
            "Kuyudan gelen seslerin yeni olmadığını biliyor.",
            "Yıllar önce kuyuda bir çocuğun kaybolduğunu saklıyor."
        ],

        knowledge: [
            "Köy kuyusundan geceleri fısıltılar geliyor.",
            "Terk edilmiş kilisede bazen ışık görülüyor."
        ]

    });


    createNPC({

        id: "healer_mara",

        name: "Mara",

        role: "Şifacı",

        personality:
            "Sakin, yardımsever ve dikkatli.",

        location:
            "Blackmoor Köyü",

        trust: 5,

        secrets: [
            "Kardeşi birkaç gün önce ortadan kayboldu."
        ],

        knowledge: [
            "Kardeşinin son kez kilise yakınında görüldüğünü biliyor.",
            "Köyün eski rahibinden korkuyor."
        ]

    });


    createNPC({

        id: "blacksmith_aldric",

        name: "Aldric",

        role: "Demirci",

        personality:
            "Sert konuşan, gururlu ve çalışkan.",

        location:
            "Blackmoor Köyü",

        trust: 0,

        secrets: [
            "Köyün altında eski tüneller olduğunu biliyor."
        ],

        knowledge: [
            "Son haftalarda ormandan garip sesler geliyor."
        ]

    });

}


/* =========================================================
   NPC KONUŞMA
========================================================= */

function talkToNPC(action) {

    const lower =
        normalizeText(action);


    let npc = null;


    if (lower.includes("mara")) {

        npc =
            game.npcs.find(
                n => n.id === "healer_mara"
            );

    }

    else if (
        lower.includes("jonas") ||
        lower.includes("yaşlı") ||
        lower.includes("yasli")
    ) {

        npc =
            game.npcs.find(
                n => n.id === "elder_jonas"
            );

    }

    else if (
        lower.includes("aldric") ||
        lower.includes("demirci")
    ) {

        npc =
            game.npcs.find(
                n => n.id === "blacksmith_aldric"
            );

    }


    if (!npc) {

        npc =
            game.npcs.find(
                n =>
                    n.location ===
                    game.world.location
            );

    }


    if (!npc) {

        addStoryMessage(
            "Burada konuşabileceğin kimseyi bulamadın.",
            "dm"
        );

        return;

    }


    npc.trust++;


    npc.relationshipHistory.push({

        type: "conversation",

        timestamp:
            new Date().toISOString()

    });


    if (npc.id === "elder_jonas") {

        addStoryMessage(`

            Yaşlı Jonas sana dikkatlice bakıyor.

            <br><br>

            <i>
            "Kuyuya yaklaşacaksan dikkatli ol.
            O kuyunun hikâyesi sandığından çok daha eski."
            </i>

        `, "dm");


        game.story.flags.jonasSpoke =
            true;


        completeQuestObjective(
            "blackmoor_whispers",
            "learn_secret"
        );

    }

    else if (npc.id === "healer_mara") {

        addStoryMessage(`

            Mara sana endişeyle bakıyor.

            <br><br>

            <i>
            "Kardeşim kaybolmadan önce onu
            kilisenin yakınında görmüşler."
            </i>

        `, "dm");


        game.story.flags.maraSpoke =
            true;


        completeQuestObjective(
            "missing_person",
            "talk_healer"
        );

    }

    else {

        const knowledge =
            npc.knowledge[0] ||
            "Bu gece dikkatli ol.";


        addStoryMessage(`

            ${escapeHTML(npc.name)}
            sana dikkatlice bakıyor.

            <br><br>

            <i>
            "${escapeHTML(knowledge)}"
            </i>

        `, "dm");

    }


    updateAllUI();

}


/* =========================================================
   GÖREV SİSTEMİ
========================================================= */

function createQuest(data) {

    const existing =
        game.quests.find(
            quest => quest.id === data.id
        );


    if (existing) {

        return existing;

    }


    const quest = {

        id: data.id,

        title: data.title,

        description:
            data.description,

        objectives:
            (data.objectives || []).map(
                objective => ({

                    id: objective.id,

                    text: objective.text,

                    completed: false

                })
            ),

        reward:
            Number(data.reward || 0),

        status: "active",

        createdAt:
            new Date().toISOString(),

        completedAt: null

    };


    game.quests.push(quest);

    return quest;

}


function initializeQuests() {

    createQuest({

        id: "blackmoor_whispers",

        title: "Blackmoor'un Fısıltıları",

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


    createQuest({

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


    if (!quest) return;


    const objective =
        quest.objectives.find(
            o => o.id === objectiveId
        );


    if (
        !objective ||
        objective.completed
    ) {

        return;

    }


    objective.completed =
        true;


    const finished =
        quest.objectives.every(
            objective =>
                objective.completed
        );


    if (finished) {

        quest.status =
            "completed";

        quest.completedAt =
            new Date().toISOString();


        game.player.gold +=
            quest.reward;


        addStoryMessage(`

            🎉 <b>Görev tamamlandı!</b>

            <br><br>

            ${escapeHTML(quest.title)}

            <br>

            💰 +${quest.reward} altın

        `, "dm");

    }


    updateQuestUI();

    updateCharacterUI();

}


function updateQuestUI() {

    if (!questPanel) return;


    questPanel.innerHTML = "";


    const active =
        game.quests.filter(
            quest =>
                quest.status === "active"
        );


    if (questCount) {

        questCount.textContent =
            active.length;

    }


    if (!game.quests.length) {

        questPanel.innerHTML =
            `<p class="empty">Aktif görev yok.</p>`;

        return;

    }


    game.quests.forEach(quest => {

        const element =
            document.createElement("div");

        element.className =
            "quest-item";


        const completed =
            quest.objectives.filter(
                objective =>
                    objective.completed
            ).length;


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

                ${quest.objectives.map(
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
                ).join("")}

            </ul>

            <small>
                Ödül:
                ${quest.reward} altın
            </small>

        `;


        questPanel.appendChild(
            element
        );

    });

}


/* =========================================================
   ZAR SİSTEMİ
========================================================= */

function rollDice(notation) {

    const match =
        String(notation)
            .trim()
            .match(/^(\d+)d(\d+)$/i);


    if (!match) {

        return 0;

    }


    const count =
        Number(match[1]);

    const sides =
        Number(match[2]);


    if (
        count <= 0 ||
        sides <= 0 ||
        count > 100
    ) {

        return 0;

    }


    let total = 0;


    for (
        let i = 0;
        i < count;
        i++
    ) {

        total +=
            randomInt(1, sides);

    }


    return total;

}


function rollD20() {

    const result =
        randomInt(1, 20);


    if (diceResult) {

        diceResult.textContent =
            result;

    }


    if (result === 20) {

        addStoryMessage(
            "🎉 Kritik başarı! D20 sonucu 20.",
            "dm"
        );

    }

    else if (result === 1) {

        addStoryMessage(
            "💀 Kritik başarısızlık! D20 sonucu 1.",
            "dm"
        );

    }

    else {

        addStoryMessage(
            `🎲 D20 sonucu: <b>${result}</b>`,
            "dm"
        );

    }

}


/* =========================================================
   DÜŞMANLAR
========================================================= */

const enemies = {

    shadow_wolf: {

        id: "shadow_wolf",

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

        id: "goblin",

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

        id: "skeleton",

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
   SAVAŞ
========================================================= */

function startCombat(
    enemyId = "shadow_wolf",
    alreadyDescribed = false
) {

    if (game.combat.active) {

        addStoryMessage(
            "⚔️ Zaten savaş halindesin!",
            "dm"
        );

        return;

    }


    const template =
        enemies[enemyId];


    if (!template) {

        console.error(
            "Bilinmeyen düşman:",
            enemyId
        );

        return;

    }


    game.combat.active =
        true;

    game.combat.round =
        1;

    game.combat.defending =
        false;


    game.combat.enemy = {

        id: template.id,

        name: template.name,

        hp: template.maxHp,

        maxHp: template.maxHp,

        armor: template.armor,

        attackBonus: template.attackBonus,

        damage: template.damage,

        xp: template.xp,

        gold: template.gold,

        description:
            template.description

    };


    addStoryMessage(`

        ⚔️ <b>SAVAŞ BAŞLADI!</b>

        <br><br>

        ${
            alreadyDescribed
                ? ""
                : escapeHTML(
                    template.description
                )
        }

        <br><br>

        👹 <b>
        ${escapeHTML(template.name)}
        </b>

        <br>

        ❤️ Can:
        <b>
        ${template.maxHp}/${template.maxHp}
        </b>

        <br>

        🛡️ Zırh:
        <b>
        ${template.armor}
        </b>

        <br><br>

        Saldırabilir, savunabilir,
        iksir kullanabilir veya kaçmayı
        deneyebilirsin.

    `, "dm");


    updateCombatUI();

}


/* =========================================================
   SAVAŞ EYLEMİ
========================================================= */

function handleCombatAction(action) {

    if (!game.combat.active) {

        return;

    }


    const intent =
        analyzeAction(action);


    if (intent.potion) {

        const potion =
            getInventoryItem("potion");


        if (!potion) {

            addStoryMessage(
                "🧪 Kullanabileceğin şifa iksiri yok.",
                "dm"
            );

            return;

        }


        const used =
            usePotion(potion);


        if (used) {

            enemyTurn();

        }


        return;

    }


    if (intent.flee) {

        attemptFlee();

        return;

    }


    if (intent.defend) {

        playerDefend();

        return;

    }


    if (intent.attack) {

        playerAttack();

        return;

    }


    addStoryMessage(`

        ⚔️ Savaş devam ediyor.

        <br><br>

        Kullanabileceğin eylemler:

        <br>

        <b>"saldır"</b>

        <br>

        <b>"kılıcımla saldırıyorum"</b>

        <br>

        <b>"iksir kullan"</b>

        <br>

        <b>"savun"</b>

        <br>

        <b>"kaç"</b>

    `, "dm");

}


/* =========================================================
   OYUNCU SALDIRISI
========================================================= */

function playerAttack() {

    if (!game.combat.active) return;


    const enemy =
        game.combat.enemy;


    const roll =
        randomInt(1, 20);


    const strengthModifier =
        getModifier(
            game.player.stats.strength
        );


    const weapon =
        game.player.equippedWeapon
            ? getInventoryItem(
                game.player.equippedWeapon
            )
            : null;


    const attackTotal =
        roll +
        strengthModifier;


    let message = `

        ⚔️ <b>Saldırı yaptın!</b>

        <br><br>

        🎲 D20:
        <b>${roll}</b>

        <br>

        ➕ Güç:
        <b>${strengthModifier}</b>

        <br>

        🎯 Toplam:
        <b>${attackTotal}</b>

        <br>

        🛡️ Düşman zırhı:
        <b>${enemy.armor}</b>

    `;


    if (roll === 20) {

        const baseDamage =
            weapon
                ? rollDice(
                    weapon.damage || "1d6"
                )
                : rollDice("1d4");


        const damage =
            Math.max(
                1,
                baseDamage * 2 +
                strengthModifier
            );


        enemy.hp =
            Math.max(
                0,
                enemy.hp - damage
            );


        message += `

            <br><br>

            🎉 <b>KRİTİK VURUŞ!</b>

            <br>

            💥 Hasar:
            <b>${damage}</b>

        `;

    }

    else if (roll === 1) {

        message += `

            <br><br>

            💀 <b>Kritik başarısızlık!</b>

            <br>

            Saldırın tamamen ıskaladı.

        `;

    }

    else if (attackTotal >= enemy.armor) {

        const baseDamage =
            weapon
                ? rollDice(
                    weapon.damage || "1d6"
                )
                : rollDice("1d4");


        const damage =
            Math.max(
                1,
                baseDamage +
                strengthModifier
            );


        enemy.hp =
            Math.max(
                0,
                enemy.hp - damage
            );


        message += `

            <br><br>

            ⚔️ <b>VURUŞ!</b>

            <br>

            ${
                weapon
                    ? `🗡️ ${escapeHTML(weapon.name)}`
                    : "👊 Yumruk"
            }

            <br>

            💥 Hasar:
            <b>${damage}</b>

        `;

    }

    else {

        message += `

            <br><br>

            ❌ <b>Iskaladın!</b>

        `;

    }


    message += `

        <br><br>

        👹 ${escapeHTML(enemy.name)}

        <br>

        ❤️ Can:
        <b>${enemy.hp}/${enemy.maxHp}</b>

    `;


    addStoryMessage(
        message,
        "dm"
    );


    updateCombatUI();


    if (enemy.hp <= 0) {

        winCombat();

        return;

    }


    enemyTurn();

}


/* =========================================================
   SAVUNMA
========================================================= */

function playerDefend() {

    if (!game.combat.active) return;


    game.combat.defending =
        true;


    addStoryMessage(`

        🛡️ <b>Savunma pozisyonu aldın.</b>

        <br><br>

        Bu tur savunman güçlendi.

    `, "dm");


    enemyTurn();

}


/* =========================================================
   DÜŞMAN TURU
========================================================= */

function enemyTurn() {

    if (!game.combat.active) {

        return;

    }


    const enemy =
        game.combat.enemy;


    game.combat.round++;


    const roll =
        randomInt(1, 20);


    let playerArmor =
        10 +
        getModifier(
            game.player.stats.dexterity
        );


    if (game.combat.defending) {

        playerArmor += 4;

    }


    const totalAttack =
        roll +
        enemy.attackBonus;


    let message = `

        👹 <b>
        ${escapeHTML(enemy.name)}
        </b> saldırıyor!

        <br><br>

        🎲 D20:
        <b>${roll}</b>

        <br>

        🎯 Toplam:
        <b>${totalAttack}</b>

        <br>

        🛡️ Savunman:
        <b>${playerArmor}</b>

    `;


    if (roll === 20) {

        const damage =
            Math.max(
                1,
                rollDice(enemy.damage) * 2
            );


        game.player.hp =
            Math.max(
                0,
                game.player.hp - damage
            );


        message += `

            <br><br>

            💀 <b>DÜŞMAN KRİTİK VURDU!</b>

            <br>

            💥 Hasar:
            <b>${damage}</b>

        `;

    }

    else if (totalAttack >= playerArmor) {

        const damage =
            Math.max(
                1,
                rollDice(enemy.damage)
            );


        game.player.hp =
            Math.max(
                0,
                game.player.hp - damage
            );


        message += `

            <br><br>

            🩸 <b>Vuruldun!</b>

            <br>

            💥 Hasar:
            <b>${damage}</b>

        `;

    }

    else {

        message += `

            <br><br>

            ❌ Düşman saldırını ıskaladı.

        `;

    }


    message += `

        <br><br>

        ❤️ Canın:
        <b>${game.player.hp}/${game.player.maxHp}</b>

    `;


    addStoryMessage(
        message,
        "dm"
    );


    game.combat.defending =
        false;


    updateAllUI();


    if (game.player.hp <= 0) {

        loseCombat();

    }

}


/* =========================================================
   KAÇMA
========================================================= */

function attemptFlee() {

    if (!game.combat.active) return;


    const roll =
        randomInt(1, 20);


    const dex =
        getModifier(
            game.player.stats.dexterity
        );


    const total =
        roll + dex;


    if (total >= 12) {

        addStoryMessage(`

            🏃 <b>Kaçmayı başardın!</b>

            <br><br>

            🎲 D20:
            ${roll}

            <br>

            🏃 Çeviklik:
            ${dex}

        `, "dm");


        endCombat();


        updateAllUI();

        return;

    }


    addStoryMessage(`

        ❌ <b>Kaçamadın!</b>

        <br><br>

        🎲 D20:
        ${roll}

        <br><br>

        Düşman peşini bırakmıyor.

    `, "dm");


    enemyTurn();

}


/* =========================================================
   SAVAŞI BİTİR
========================================================= */

function endCombat() {

    game.combat.active =
        false;

    game.combat.enemy =
        null;

    game.combat.round =
        0;

    game.combat.defending =
        false;

}


/* =========================================================
   SAVAŞ KAZAN
========================================================= */

function winCombat() {

    const enemy =
        game.combat.enemy;


    if (!enemy) return;


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

    `, "dm");


    endCombat();

    checkLevelUp();

    updateAllUI();

}


/* =========================================================
   SAVAŞ KAYBET
========================================================= */

function loseCombat() {

    const enemy =
        game.combat.enemy;


    const enemyName =
        enemy?.name || "Düşman";


    endCombat();


    game.player.hp =
        Math.ceil(
            game.player.maxHp * 0.5
        );


    changeLocation(
        "Blackmoor Köyü"
    );


    addStoryMessage(`

        💀 <b>YERE YIĞILDIN!</b>

        <br><br>

        ${escapeHTML(enemyName)}
        seni yendi.

        <br><br>

        Neyse ki ölüm son değil.

        <br><br>

        Blackmoor Köyü'nde gözlerini
        yeniden açıyorsun.

        <br><br>

        ❤️ Canın:
        ${game.player.hp}/${game.player.maxHp}

    `, "dm");


    updateAllUI();

}


/* =========================================================
   SEVİYE
========================================================= */

function getRequiredXP(level) {

    return Math.max(
        100,
        Number(level) * 100
    );

}


function checkLevelUp() {

    let leveled =
        false;


    while (
        game.player.xp >=
        getRequiredXP(
            game.player.level
        )
    ) {

        const required =
            getRequiredXP(
                game.player.level
            );


        game.player.xp -=
            required;


        game.player.level++;


        const hpIncrease =
            Math.max(
                1,
                4 +
                getModifier(
                    game.player.stats.constitution
                )
            );


        game.player.maxHp +=
            hpIncrease;

        game.player.hp =
            game.player.maxHp;


        leveled =
            true;


        addStoryMessage(`

            🌟 <b>SEVİYE ATLADIN!</b>

            <br><br>

            ⭐ Yeni seviye:
            <b>${game.player.level}</b>

            <br><br>

            ❤️ Maksimum canın:
            <b>${game.player.maxHp}</b>

        `, "dm");

    }


    if (leveled) {

        updateCharacterUI();

    }

}


/* =========================================================
   KONUM
========================================================= */

function changeLocation(location) {

    if (!location) return;


    const oldLocation =
        game.world.location;


    game.world.location =
        location;


    if (
        !game.story.discoveredLocations.includes(
            location
        )
    ) {

        game.story.discoveredLocations.push(
            location
        );

    }


    game.story.events.push({

        type: "location_change",

        from: oldLocation,

        to: location,

        timestamp:
            new Date().toISOString()

    });


    updateWorldUI();

}


/* =========================================================
   DÜNYA UI
========================================================= */

function updateWorldUI() {

    const location =
        $("location");


    if (location) {

        location.textContent =
            game.world.location;

    }

}


/* =========================================================
   KARAKTER UI
========================================================= */

function updateCharacterUI() {

    const name =
        $("characterName");

    const classElement =
        $("characterClass");

    const hp =
        $("hp");

    const level =
        $("level");

    const xp =
        $("xp");

    const gold =
        $("gold");


    if (name)
        name.textContent =
            game.player.name;


    if (classElement)
        classElement.textContent =
            `${game.player.race} ${game.player.className}`;


    if (hp)
        hp.textContent =
            `${game.player.hp}/${game.player.maxHp}`;


    if (level)
        level.textContent =
            game.player.level;


    if (xp)
        xp.textContent =
            game.player.xp;


    if (gold)
        gold.textContent =
            game.player.gold;


    updateStat(
        "strength",
        game.player.stats.strength
    );

    updateStat(
        "dexterity",
        game.player.stats.dexterity
    );

    updateStat(
        "constitution",
        game.player.stats.constitution
    );

    updateStat(
        "intelligence",
        game.player.stats.intelligence
    );

    updateStat(
        "wisdom",
        game.player.stats.wisdom
    );

    updateStat(
        "charisma",
        game.player.stats.charisma
    );

}


function updateStat(id, value) {

    const element =
        $(id);


    if (element) {

        element.textContent =
            value;

    }

}


/* =========================================================
   KARAKTER PENCERESİ
========================================================= */

function showCharacter() {

    if (!characterInfo) return;


    const weapon =
        game.player.equippedWeapon
            ? getInventoryItem(
                game.player.equippedWeapon
            )
            : null;


    characterInfo.innerHTML = `

        <p>
            <strong>İsim:</strong>
            ${escapeHTML(game.player.name)}
        </p>

        <p>
            <strong>Irk:</strong>
            ${escapeHTML(game.player.race)}
        </p>

        <p>
            <strong>Sınıf:</strong>
            ${escapeHTML(game.player.className)}
        </p>

        <p>
            <strong>Geçmiş:</strong>
            ${escapeHTML(game.player.background)}
        </p>

        <p>
            <strong>Seviye:</strong>
            ${game.player.level}
        </p>

        <p>
            <strong>XP:</strong>
            ${game.player.xp}
        </p>

        <hr>

        <p>
            <strong>Can:</strong>
            ${game.player.hp}/${game.player.maxHp}
        </p>

        <p>
            <strong>Silah:</strong>
            ${
                weapon
                    ? escapeHTML(weapon.name)
                    : "Yok"
            }
        </p>

        <hr>

        <p>
            <strong>Güç:</strong>
            ${game.player.stats.strength}
        </p>

        <p>
            <strong>Çeviklik:</strong>
            ${game.player.stats.dexterity}
        </p>

        <p>
            <strong>Dayanıklılık:</strong>
            ${game.player.stats.constitution}
        </p>

        <p>
            <strong>Zeka:</strong>
            ${game.player.stats.intelligence}
        </p>

        <p>
            <strong>Bilgelik:</strong>
            ${game.player.stats.wisdom}
        </p>

        <p>
            <strong>Karizma:</strong>
            ${game.player.stats.charisma}
        </p>

        <hr>

        <p>
            <strong>Altın:</strong>
            ${game.player.gold}
        </p>

    `;


    characterModal?.classList.remove(
        "hidden"
    );

}


/* =========================================================
   KARAKTER OLUŞTURMA
========================================================= */

const classStats = {

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


const raceBonuses = {

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
        nameInput?.value.trim();


    if (!name) {

        alert(
            "Önce karakterine bir isim vermelisin."
        );

        return;

    }


    const race =
        raceInput?.value ||
        "İnsan";


    const className =
        classInput?.value ||
        "Savaşçı";


    const background =
        backgroundInput?.value ||
        "Gezgin";


    const base =
        classStats[className];


    const bonus =
        raceBonuses[race];


    if (!base || !bonus) {

        alert(
            "Karakter bilgileri geçersiz."
        );

        return;

    }


    game.player.name =
        name;

    game.player.race =
        race;

    game.player.className =
        className;

    game.player.background =
        background;

    game.player.level =
        1;

    game.player.xp =
        0;


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

    game.player.gold =
        25;

    game.player.equippedWeapon =
        null;


    /*
       Yeni karakter oluşturulurken
       varsayılan envanteri sıfırdan kur.
    */

    game.player.inventory = [

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

    ];


    game.world.location =
        "Blackmoor Köyü";

    game.world.torchActive =
        false;


    game.combat =
        createEmptyCombatState();


    game.story.actions = [];
    game.story.events = [];
    game.story.flags = {};
    game.story.discoveredLocations = [
        "Blackmoor Köyü"
    ];


    characterModal?.classList.add(
        "hidden"
    );


    addStoryMessage(`

        ⚔️ <b>Karakter oluşturuldu!</b>

        <br><br>

        <b>${escapeHTML(name)}</b>
        artık Realm of Shadows dünyasında.

        <br><br>

        Irk:
        ${escapeHTML(race)}

        <br>

        Sınıf:
        ${escapeHTML(className)}

        <br>

        Geçmiş:
        ${escapeHTML(background)}

    `, "dm");


    updateAllUI();

}


/* =========================================================
   YEREL DUNGEON MASTER
========================================================= */

async function localDungeonMaster(action) {

    const intent =
        analyzeAction(action);


    if (intent.attack) {

        startCombat(
            "shadow_wolf"
        );

        return;

    }


    if (
        intent.well ||
        (
            intent.investigate &&
            game.world.location ===
                "Blackmoor Köyü"
        )
    ) {

        investigateWell();

        return;

    }


    if (intent.church) {

        game.story.flags.church =
            true;


        addStoryMessage(`

            Terk edilmiş kilisenin önüne
            geliyorsun.

            <br><br>

            Kapı tamamen kapalı değil.

            <br><br>

            İçeriden zayıf bir mum ışığı
            süzülüyor.

            <br><br>

            İçeride biri varmış gibi
            hissediyorsun.

        `, "dm");


        updateAllUI();

        return;

    }


    if (intent.forest) {

        changeLocation(
            "Blackmoor Ormanı"
        );


        addStoryMessage(`

            Köyün ışıkları arkanda kalıyor.

            <br><br>

            Ormanın içine girdikçe yağmurun
            sesi azalıyor.

            <br><br>

            Ağaçların arasından bir hırıltı
            duyuluyor.

            <br><br>

            Sarı gözler karanlığın içinde
            beliriyor.

            <br><br>

            <b>Gölge Kurdu</b> ortaya çıkıyor!

        `, "dm");


        startCombat(
            "shadow_wolf",
            true
        );

        return;

    }


    if (intent.npc) {

        talkToNPC(action);

        return;

    }


    if (intent.torch) {

        const torch =
            getInventoryItem("torch");


        if (torch) {

            useTorch(torch);

        }

        else {

            addStoryMessage(
                "🔥 Kullanılabilir meşalen yok.",
                "dm"
            );

        }

        return;

    }


    generateDynamicDMResponse(
        action
    );

}


/* =========================================================
   KUYU
========================================================= */

function investigateWell() {

    game.story.flags.well =
        true;


    completeQuestObjective(
        "blackmoor_whispers",
        "visit_well"
    );


    addStoryMessage(`

        Kuyunun taş kenarına yaklaşıyorsun.

        <br><br>

        Yağmur taşların üzerinde ince çizgiler
        oluşturuyor.

        <br><br>

        Aşağıdan çok hafif bir ses geliyor.

        <br><br>

        <i>"Beni bul..."</i>

        <br><br>

        Ses tekrar geliyor.

        <br>

        Bu kez daha yakın.

    `, "dm");


    game.story.events.push({

        type: "well",

        timestamp:
            new Date().toISOString()

    });


    updateAllUI();

}


/* =========================================================
   DİNAMİK YEREL DM
========================================================= */

function generateDynamicDMResponse(action) {

    const lower =
        normalizeText(action);


    let response;


    if (
        lower.includes("dinle") ||
        lower.includes("ses")
    ) {

        response = `

            Birkaç saniye boyunca tamamen
            hareketsiz kalıp dinliyorsun.

            <br><br>

            Yağmurun altında başka bir ses
            seçmeye çalışıyorsun.

            <br><br>

            Uzaklardan metalik bir ses geliyor.

        `;

    }

    else if (
        lower.includes("bak") ||
        lower.includes("etraf")
    ) {

        response = `

            Etrafını dikkatlice inceliyorsun.

            <br><br>

            Blackmoor'un dar sokakları yağmur
            altında sessiz.

            <br><br>

            Uzakta bir pencerede hareket eden
            bir gölge fark ediyorsun.

        `;

    }

    else if (
        lower.includes("koş") ||
        lower.includes("kos") ||
        lower.includes("yürü") ||
        lower.includes("yuru")
    ) {

        response = `

            Hareket etmeye başlıyorsun.

            <br><br>

            Adımlarının sesi taş sokaklarda
            yankılanıyor.

            <br><br>

            Bir şeylerin seni izlediğine dair
            garip bir his var.

        `;

    }

    else {

        const responses = [

            `
            Eylemini gerçekleştiriyorsun.

            <br><br>

            Çevredeki sessizlik kısa süreliğine
            bozuluyor.

            <br><br>

            Fakat karanlık sana hâlâ bazı
            sırlarını saklıyor.
            `,

            `
            Hamlen beklediğinden farklı bir
            etki yaratıyor.

            <br><br>

            Yakındaki gölgeler arasında bir
            hareket fark ediyorsun.
            `,

            `
            Birkaç saniye boyunca hiçbir şey
            olmuyor.

            <br><br>

            Sonra uzaktan metalik bir ses
            duyuluyor.
            `

        ];


        response =
            responses[
                randomInt(
                    0,
                    responses.length - 1
                )
            ];

    }


    addStoryMessage(
        response,
        "dm"
    );


    game.ai.lastResponse =
        response;


    game.story.events.push({

        type: "dynamic_action",

        action: action,

        response: response,

        location:
            game.world.location,

        timestamp:
            new Date().toISOString()

    });


    updateAllUI();

}


/* =========================================================
   AI GAME STATE
========================================================= */

function buildAIState() {

    return {

        player: {

            name: game.player.name,

            race: game.player.race,

            className:
                game.player.className,

            background:
                game.player.background,

            level:
                game.player.level,

            xp:
                game.player.xp,

            hp:
                game.player.hp,

            maxHp:
                game.player.maxHp,

            stats:
                { ...game.player.stats },

            inventory:
                game.player.inventory.map(
                    item => ({ ...item })
                ),

            equippedWeapon:
                game.player.equippedWeapon,

            gold:
                game.player.gold

        },


        world: {

            name:
                game.world.name,

            location:
                game.world.location,

            weather:
                game.world.weather,

            time:
                game.world.time,

            danger:
                game.world.danger,

            season:
                game.world.season,

            torchActive:
                game.world.torchActive

        },


        story: {

            chapter:
                game.story.chapter,

            scene:
                game.story.scene,

            actions:
                game.story.actions.slice(-10),

            events:
                game.story.events.slice(-10),

            flags:
                { ...game.story.flags },

            discoveredLocations:
                [...game.story.discoveredLocations],

            discoveredSecrets:
                [...game.story.discoveredSecrets],

            relationships:
                { ...game.story.relationships }

        },


        npcs:
            game.npcs.map(
                npc => ({
                    ...npc
                })
            ),

        quests:
            game.quests.map(
                quest => ({
                    ...quest
                })
            ),

        combat:
            game.combat.enemy
                ? {
                    ...game.combat,
                    enemy: {
                        ...game.combat.enemy
                    }
                }
                : {
                    ...game.combat
                }

    };

}


/* =========================================================
   AI REQUEST
========================================================= */

async function askAIDungeonMaster(
    playerAction
) {

    if (
        !CONFIG.AI_SERVER_URL
    ) {

        return null;

    }


    if (game.ai.loading) {

        addStoryMessage(
            "⏳ Dungeon Master hâlâ düşünüyor...",
            "dm"
        );

        return null;

    }


    game.ai.loading =
        true;


    try {

        console.log(
            "🤖 AI isteği:",
            playerAction
        );


        const controller =
            new AbortController();


        const timeout =
            setTimeout(
                () =>
                    controller.abort(),
                CONFIG.AI_TIMEOUT
            );


        const response =
            await fetch(
                CONFIG.AI_SERVER_URL,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            playerAction:
                                playerAction,

                            gameState:
                                buildAIState()

                        }),

                    signal:
                        controller.signal

                }
            );


        clearTimeout(timeout);


        if (!response.ok) {

            throw new Error(
                `AI HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        if (
            !data ||
            typeof data.response !== "string" ||
            !data.response.trim()
        ) {

            throw new Error(
                "AI geçerli bir response döndürmedi."
            );

        }


        game.ai.online =
            true;

        game.ai.lastResponse =
            data.response;


        game.ai.history.push({

            playerAction:
                playerAction,

            response:
                data.response,

            timestamp:
                new Date().toISOString()

        });


        addStoryMessage(
            data.response,
            "dm"
        );


        /*
           Backend ileride yapılandırılmış oyun
           verileri döndürürse burada uygulanabilir.
        */

        applyAIStateChanges(
            data
        );


        game.story.events.push({

            type:
                "ai_response",

            action:
                playerAction,

            response:
                data.response,

            location:
                game.world.location,

            timestamp:
                new Date().toISOString()

        });


        updateAllUI();


        console.log(
            "✅ AI cevabı alındı."
        );


        return data.response;

    }

    catch (error) {

        game.ai.online =
            false;


        console.error(
            "❌ AI bağlantı hatası:",
            error
        );


        return null;

    }

    finally {

        game.ai.loading =
            false;

    }

}


/* =========================================================
   AI'DAN GELEN OYUN DEĞİŞİKLİKLERİ
========================================================= */

function applyAIStateChanges(data) {

    if (!data) return;


    /*
       AI location döndürürse.
    */

    if (
        typeof data.location === "string" &&
        data.location.trim()
    ) {

        changeLocation(
            data.location.trim()
        );

    }


    /*
       AI event döndürürse.
    */

    if (
        Array.isArray(data.events)
    ) {

        data.events.forEach(event => {

            if (!event) return;


            game.story.events.push({

                ...event,

                source: "ai",

                timestamp:
                    event.timestamp ||
                    new Date().toISOString()

            });

        });

    }


    /*
       AI secret keşfi.
    */

    if (
        Array.isArray(
            data.discoveredSecrets
        )
    ) {

        data.discoveredSecrets
            .forEach(secret => {

                if (
                    !game.story.discoveredSecrets
                        .includes(secret)
                ) {

                    game.story.discoveredSecrets
                        .push(secret);

                }

            });

    }


    /*
       AI görev güncellemeleri.
    */

    if (
        Array.isArray(data.questUpdates)
    ) {

        data.questUpdates.forEach(update => {

            if (!update) return;


            if (
                update.questId &&
                update.objectiveId
            ) {

                completeQuestObjective(
                    update.questId,
                    update.objectiveId
                );

            }

        });

    }


    /*
       AI savaş başlatmak isterse.
    */

    if (
        data.startCombat &&
        typeof data.startCombat === "string"
    ) {

        startCombat(
            data.startCombat
        );

    }

}


/* =========================================================
   ANA DUNGEON MASTER
========================================================= */

async function dungeonMaster(
    action
) {

    /*
       Savaş varsa AI normal hikâye cevabı vermez.
       Savaş motoru kontrol eder.
    */

    if (game.combat.active) {

        handleCombatAction(
            action
        );

        return;

    }


    /*
       Önce AI.
    */

    const aiResponse =
        await askAIDungeonMaster(
            action
        );


    /*
       AI çalışmazsa yerel DM.
    */

    if (!aiResponse) {

        await localDungeonMaster(
            action
        );

    }

}


/* =========================================================
   OYUNCU EYLEMİ
========================================================= */

async function playerAction() {

    if (!playerInput) return;


    const text =
        playerInput.value.trim();


    if (!text) return;


    addStoryMessage(
        text,
        "player"
    );


    game.story.actions.push({

        text,

        location:
            game.world.location,

        time:
            game.world.time,

        timestamp:
            new Date().toISOString()

    });


    playerInput.value = "";


    /*
       Oyuncu mesajı savaş dışında AI'a,
       savaşta ise savaş motoruna gider.
    */

    await dungeonMaster(
        text
    );

}


/* =========================================================
   SAVE
========================================================= */

function saveGame() {

    try {

        const saveData = {

            version: 2,

            player:
                game.player,

            world:
                game.world,

            npcs:
                game.npcs,

            quests:
                game.quests,

            factions:
                game.factions,

            locations:
                game.locations,

            story:
                game.story,

            combat:
                game.combat,

            ai: {

                online:
                    game.ai.online,

                lastResponse:
                    game.ai.lastResponse,

                history:
                    game.ai.history.slice(-30),

                pendingCheck:
                    game.ai.pendingCheck

            }

        };


        localStorage.setItem(
            CONFIG.SAVE_KEY,
            JSON.stringify(saveData)
        );


        addStoryMessage(
            "💾 Oyun başarıyla kaydedildi.",
            "dm"
        );

    }

    catch (error) {

        console.error(
            "Save error:",
            error
        );


        addStoryMessage(
            "❌ Oyun kaydedilemedi.",
            "dm"
        );

    }

}


/* =========================================================
   LOAD
========================================================= */

function createEmptyCombatState() {

    return {

        active: false,

        enemy: null,

        round: 0,

        defending: false

    };

}


function loadGame() {

    const saved =
        localStorage.getItem(
            CONFIG.SAVE_KEY
        );


    if (!saved) {

        addStoryMessage(
            "📂 Kaydedilmiş oyun bulunamadı.",
            "dm"
        );

        return;

    }


    try {

        const loaded =
            JSON.parse(saved);


        if (
            loaded.player
        ) {

            Object.assign(
                game.player,
                loaded.player
            );

        }


        if (
            loaded.world
        ) {

            Object.assign(
                game.world,
                loaded.world
            );

        }


        game.npcs =
            Array.isArray(
                loaded.npcs
            )
                ? loaded.npcs
                : [];


        game.quests =
            Array.isArray(
                loaded.quests
            )
                ? loaded.quests
                : [];


        game.factions =
            Array.isArray(
                loaded.factions
            )
                ? loaded.factions
                : [];


        game.locations =
            Array.isArray(
                loaded.locations
            )
                ? loaded.locations
                : [];


        if (
            loaded.story
        ) {

            Object.assign(
                game.story,
                loaded.story
            );

        }


        game.combat =
            loaded.combat
                ? {
                    ...createEmptyCombatState(),
                    ...loaded.combat
                }
                : createEmptyCombatState();


        game.ai =
            loaded.ai
                ? {
                    ...game.ai,
                    ...loaded.ai,
                    loading: false
                }
                : {
                    ...game.ai,
                    loading: false
                };


        /*
           Eski kayıtlarla uyumluluk.
        */

        if (
            !Array.isArray(
                game.player.inventory
            )
        ) {

            game.player.inventory =
                [];

        }


        if (
            !game.player.stats
        ) {

            game.player.stats = {

                strength: 10,
                dexterity: 10,
                constitution: 10,
                intelligence: 10,
                wisdom: 10,
                charisma: 10

            };

        }


        updateAllUI();


        addStoryMessage(
            "📂 Macera başarıyla yüklendi.",
            "dm"
        );

    }

    catch (error) {

        console.error(
            "Load error:",
            error
        );


        addStoryMessage(
            "❌ Kayıt dosyası okunamadı.",
            "dm"
        );

    }

}


/* =========================================================
   TÜM UI
========================================================= */

function updateCombatUI() {

    let status =
        $("combatStatus");


    if (
        !game.combat.active ||
        !game.combat.enemy
    ) {

        if (status) {

            status.remove();

        }

        return;

    }


    if (!status) {

        status =
            document.createElement("div");

        status.id =
            "combatStatus";

        status.className =
            "combat-status";


        const story =
            $("story");


        if (
            story &&
            story.parentNode
        ) {

            story.parentNode.insertBefore(
                status,
                story.nextSibling
            );

        }

    }


    const enemy =
        game.combat.enemy;


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
            ❤️ ${enemy.hp}/${enemy.maxHp}
        </div>

        <div>
            🔄 Tur:
            ${game.combat.round}
        </div>

    `;

}


function updateAllUI() {

    updateWorldUI();

    updateCharacterUI();

    updateInventoryUI();

    updateQuestUI();

    updateCombatUI();

}


/* =========================================================
   MODALLAR
========================================================= */

function openInventory() {

    if (!inventoryModal) return;


    updateInventoryUI();


    inventoryModal.classList.remove(
        "hidden"
    );

}


function closeInventoryModal() {

    inventoryModal?.classList.add(
        "hidden"
    );

}


/* =========================================================
   EVENTLER
========================================================= */

characterButton?.addEventListener(
    "click",
    showCharacter
);


closeCharacter?.addEventListener(
    "click",
    () => {

        characterModal?.classList.add(
            "hidden"
        );

    }
);


characterModal?.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            characterModal
        ) {

            characterModal.classList.add(
                "hidden"
            );

        }

    }
);


inventoryButton?.addEventListener(
    "click",
    openInventory
);


closeInventory?.addEventListener(
    "click",
    closeInventoryModal
);


inventoryModal?.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            inventoryModal
        ) {

            closeInventoryModal();

        }

    }
);


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            characterModal?.classList.add(
                "hidden"
            );

            inventoryModal?.classList.add(
                "hidden"
            );

        }

    }
);


actionButton?.addEventListener(
    "click",
    playerAction
);


playerInput?.addEventListener(
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


saveButton?.addEventListener(
    "click",
    saveGame
);


loadButton?.addEventListener(
    "click",
    loadGame
);


rollButton?.addEventListener(
    "click",
    rollD20
);


createCharacterButton?.addEventListener(
    "click",
    createCharacter
);


/* =========================================================
   BAŞLANGIÇ
========================================================= */

function initializeWorld() {

    initializeNPCs();

    initializeQuests();

}


function startGame() {

    addStoryMessage(`

        Yağmur, Blackmoor Köyü'nün taş
        sokaklarını dövüyor.

        <br><br>

        Köy meydanının ortasında eski bir kuyu
        duruyor.

        <br><br>

        Terk edilmiş kilisenin kapısı ise rüzgâr
        olmamasına rağmen yavaşça hareket ediyor.

        <br><br>

        Gece daha yeni başlıyor.

        <br><br>

        <b>Ne yapmak istiyorsun?</b>

        <br><br>

        Serbestçe yazabilirsin.

        <br>

        Örneğin:

        <i>
        "Kuyunun yanına gidip aşağıdaki sesi dinliyorum."
        </i>

    `, "dm");


    updateAllUI();

}


/* =========================================================
   OYUNU BAŞLAT
========================================================= */

initializeWorld();

startGame();


console.log(
    "========================================"
);

console.log(
    "🎲 REALM OF SHADOWS"
);

console.log(
    "⚔️ Savaş sistemi aktif."
);

console.log(
    "🎒 Envanter sistemi aktif."
);

console.log(
    "📜 Görev sistemi aktif."
);

console.log(
    "👤 NPC sistemi aktif."
);

console.log(
    "💾 Save / Load aktif."
);

console.log(
    "🤖 AI Dungeon Master aktif."
);

console.log(
    "🌐 Render:",
    CONFIG.AI_SERVER_URL
);

console.log(
    "========================================"
);
