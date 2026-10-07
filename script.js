/* =========================================================
   REALM OF SHADOWS
   TEK PARÇA OYUN MOTORU
   SAVAŞ + ENVANTER + KUŞANMA + GÖREV + KARAKTER
   + KAYDET/YÜKLE + ZAR + SEVİYE SİSTEMİ
========================================================= */


/* =========================================================
   OYUN VERİSİ
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

        discoveredLocations: [],

        discoveredSecrets: [],

        relationships: {}

    },


    combat: {

        active: false,

        enemy: null,

        round: 0

    },


    ai: {

        lastResponse: null,

        history: [],

        pendingCheck: null

    }

};


/* =========================================================
   DOM
========================================================= */

const playerInput =
    document.getElementById("playerInput");

const actionButton =
    document.getElementById("actionButton");

const saveButton =
    document.getElementById("saveButton");

const loadButton =
    document.getElementById("loadButton");

const characterButton =
    document.getElementById("characterButton");

const inventoryButton =
    document.getElementById("inventoryButton");

const characterModal =
    document.getElementById("characterModal");

const closeCharacter =
    document.getElementById("closeCharacter");

const characterInfo =
    document.getElementById("characterInfo");

const inventoryModal =
    document.getElementById("inventoryModal");

const closeInventory =
    document.getElementById("closeInventory");

const inventoryPanel =
    document.getElementById("inventory");

const inventoryCount =
    document.getElementById("inventoryCount");

const questPanel =
    document.getElementById("quests");

const questCount =
    document.getElementById("questCount");

const rollButton =
    document.getElementById("rollButton");

const diceResult =
    document.getElementById("diceResult");

const nameInput =
    document.getElementById("nameInput");

const raceInput =
    document.getElementById("raceInput");

const classInput =
    document.getElementById("classInput");

const backgroundInput =
    document.getElementById("backgroundInput");

const createCharacterButton =
    document.getElementById("createCharacter");


/* =========================================================
   HTML GÜVENLİĞİ
========================================================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        String(text);

    return div.innerHTML;

}


/* =========================================================
   HİKAYE MESAJI
========================================================= */

function addStoryMessage(
    text,
    type = "dm"
) {

    const story =
        document.getElementById("story");

    if (!story) {
        return;
    }


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

    content.innerHTML =
        text;


    message.appendChild(author);

    message.appendChild(content);

    story.appendChild(message);


    story.scrollTop =
        story.scrollHeight;

}


/* =========================================================
   OYUNCU EYLEMİ
========================================================= */

function playerAction() {

    if (!playerInput) {
        return;
    }


    const text =
        playerInput.value.trim();


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


    playerInput.value = "";


    /* =========================================
       SAVAŞ AKTİFSE
    ========================================= */

    if (game.combat.active) {

        handleCombatAction(text);

        return;

    }


    /* =========================================
       NORMAL OYUN
    ========================================= */

    dungeonMaster(text);

}


/* =========================================================
   DUNGEON MASTER
========================================================= */

function dungeonMaster(action) {

    const lower =
        normalizeText(action);


    /* =========================================
       SALDIRI
    ========================================= */

    if (
        lower.includes("saldir") ||
        lower.includes("savas") ||
        lower.includes("düsman") ||
        lower.includes("dusman") ||
        lower.includes("yaratik")
    ) {

        startCombat("shadow_wolf");

        return;

    }


    /* =========================================
       KUYU
    ========================================= */

    if (
        lower.includes("kuyu") ||
        lower.includes("asagi") ||
        lower.includes("dinliyorum")
    ) {

        game.story.flags.well =
            true;


        completeQuestObjective(
            "blackmoor_whispers",
            "visit_well"
        );


        addStoryMessage(

            `
            Kuyunun taş kenarına yaklaşıyorsun.

            <br><br>

            Yağmur taşların üzerinde küçük nehirler
            oluştururken aşağıdan belli belirsiz bir ses
            yükseliyor.

            <br><br>

            Birkaç saniye sonra aynı fısıltıyı tekrar
            duyuyorsun.

            <br><br>

            <i>"Beni bul..."</i>
            `,

            "dm"

        );


        return;

    }


    /* =========================================
       KİLİSE
    ========================================= */

    if (
        lower.includes("kilise")
    ) {

        game.story.flags.church =
            true;


        addStoryMessage(

            `
            Terk edilmiş kiliseye doğru ilerliyorsun.

            <br><br>

            Kapı tamamen kapalı değil.

            <br><br>

            İçeriden zayıf bir mum ışığı geliyor.

            <br><br>

            Fakat içeride kimse görünmüyor.
            `,

            "dm"

        );


        return;

    }


    /* =========================================
       ORMAN
    ========================================= */

    if (
        lower.includes("orman") ||
        lower.includes("agac")
    ) {

        changeLocation(
            "Blackmoor Ormanı"
        );


        addStoryMessage(

            `
            Köyün ışıkları arkanda kalıyor.

            <br><br>

            Ağaçların arasına girdikçe karanlık
            yoğunlaşıyor.

            <br><br>

            Arkandan bir hırıltı duyuluyor.

            <br><br>

            Karanlığın içinden sarı gözler beliriyor.

            <br><br>

            <b>Gölge Kurdu!</b>
            `,

            "dm"

        );


        startCombat(
            "shadow_wolf",
            true
        );


        return;

    }


    /* =========================================
       KÖYLÜ
    ========================================= */

    if (
        lower.includes("koylu") ||
        lower.includes("adam") ||
        lower.includes("kadin")
    ) {

        addStoryMessage(

            `
            Yakındaki köylülerden biri sana dikkatlice
            bakıyor.

            <br><br>

            Sonra sesini alçaltıyor.

            <br><br>

            <i>
            "Bu gece burada fazla dolaşma."
            </i>
            `,

            "dm"

        );


        return;

    }


    /* =========================================
       GENEL
    ========================================= */

    addStoryMessage(
        randomGenericResponse(),
        "dm"
    );

}


/* =========================================================
   NORMALİZE
========================================================= */

function normalizeText(text) {

    return String(text)
        .toLowerCase()
        .replaceAll("ı", "i")
        .replaceAll("ğ", "g")
        .replaceAll("ü", "u")
        .replaceAll("ş", "s")
        .replaceAll("ö", "o")
        .replaceAll("ç", "c");

}


/* =========================================================
   GENEL CEVAPLAR
========================================================= */

function randomGenericResponse() {

    const responses = [

        `
        Etrafındaki dünya sessiz görünse de
        tamamen hareketsiz değil.

        <br><br>

        Uzaklardan bir ses geliyor.
        `,

        `
        Hamlen çevrede küçük bir değişikliğe
        neden oluyor.

        <br><br>

        Fakat ne olduğunu henüz anlayamıyorsun.
        `,

        `
        Birkaç saniye boyunca hiçbir şey olmuyor.

        <br><br>

        Sonra uzaktan metalik bir ses duyuluyor.
        `,

        `
        İçgüdülerin burada gözden kaçırdığın
        bir şey olduğunu söylüyor.
        `,

        `
        Karanlığın içinden bir gölge geçiyor.

        <br><br>

        Fakat ne olduğunu göremiyorsun.
        `

    ];


    return responses[
        Math.floor(
            Math.random() *
            responses.length
        )
    ];

}


/* =========================================================
   KONUM
========================================================= */

function changeLocation(location) {

    const oldLocation =
        game.world.location;


    game.world.location =
        location;


    if (
        !game.story.discoveredLocations
            .includes(location)
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
        document.getElementById(
            "location"
        );


    if (location) {

        location.textContent =
            game.world.location;

    }

}


/* =========================================================
   ENVANTER
========================================================= */

function getInventoryItem(id) {

    return game.player.inventory.find(
        item => item.id === id
    );

}


/* =========================================================
   ENVANTER UI
========================================================= */

function updateInventoryUI() {

    if (!inventoryPanel) {
        return;
    }


    inventoryPanel.innerHTML = "";


    const inventory =
        game.player.inventory || [];


    if (inventoryCount) {

        inventoryCount.textContent =
            inventory.reduce(
                (total, item) =>
                    total +
                    Number(item.quantity || 0),
                0
            );

    }


    if (inventory.length === 0) {

        inventoryPanel.innerHTML = `

            <p class="empty">
                Envanter boş.
            </p>

        `;

        return;

    }


    inventory.forEach(item => {

        const element =
            document.createElement("div");


        element.className =
            "inventory-item";


        let icon =
            "📦";


        if (item.type === "weapon") {
            icon = "⚔️";
        }

        if (item.type === "consumable") {
            icon = "🧪";
        }

        if (item.type === "utility") {
            icon = "🔥";
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
                    Adet:
                    ${item.quantity}
                </span>

                ${
                    item.damage
                    ? `
                        <span>
                            Hasar:
                            ${escapeHTML(item.damage)}
                        </span>
                    `
                    : ""
                }

                ${
                    item.equipped
                    ? `
                        <span class="equipped">
                            ⚔️ Kuşanılmış
                        </span>
                    `
                    : ""
                }

            </div>

            <button
                class="inventory-use-button"
                type="button"
                data-item-id="${escapeHTML(item.id)}"
            >
                ${getInventoryActionText(item)}
            </button>

        `;


        const button =
            element.querySelector(
                ".inventory-use-button"
            );


        if (button) {

            button.addEventListener(
                "click",
                () => {

                    useInventoryItem(
                        item.id
                    );

                }
            );

        }


        inventoryPanel.appendChild(
            element
        );

    });

}


/* =========================================================
   ENVANTER BUTON YAZISI
========================================================= */

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
   ENVANTER EŞYASI KULLAN
========================================================= */

function useInventoryItem(id) {

    const item =
        getInventoryItem(id);


    if (!item) {
        return;
    }


    if (item.type === "weapon") {

        toggleWeapon(item);

        return;

    }


    if (item.type === "consumable") {

        usePotion(item);

        return;

    }


    if (item.type === "utility") {

        useTorch(item);

        return;

    }

}


/* =========================================================
   SİLAH KUŞAN
========================================================= */

function toggleWeapon(item) {

    if (item.equipped) {

        item.equipped =
            false;


        game.player.equippedWeapon =
            null;


        addStoryMessage(

            `⚔️ <b>${escapeHTML(item.name)}</b> kuşandan çıkarıldı.`,

            "dm"

        );

    }

    else {

        game.player.inventory.forEach(
            inventoryItem => {

                if (
                    inventoryItem.type ===
                    "weapon"
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


    updateInventoryUI();

    updateCharacterUI();

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


    const oldHp =
        game.player.hp;


    const heal =
        Number(item.heal || 10);


    game.player.hp =
        Math.min(
            game.player.maxHp,
            game.player.hp + heal
        );


    const actualHeal =
        game.player.hp - oldHp;


    item.quantity--;


    addStoryMessage(

        `
        🧪 <b>Şifa İksiri kullandın.</b>

        <br><br>

        ❤️ +${actualHeal} can

        <br>

        Can:
        <b>
            ${game.player.hp}/${game.player.maxHp}
        </b>
        `,

        "dm"

    );


    removeEmptyItems();

    updateAllUI();

    return true;

}


/* =========================================================
   MEŞALE
========================================================= */

function useTorch(item) {

    if (game.world.torchActive) {

        game.world.torchActive =
            false;


        addStoryMessage(
            "🔥 Meşaleyi söndürdün.",
            "dm"
        );

        updateInventoryUI();

        return;

    }


    if (
        !item ||
        item.quantity <= 0
    ) {

        addStoryMessage(
            "🔥 Kullanabileceğin meşalen yok.",
            "dm"
        );

        return;

    }


    game.world.torchActive =
        true;


    item.quantity--;


    addStoryMessage(

        `
        🔥 Meşaleyi yaktın.

        <br><br>

        Karanlık çevre artık daha görünür.
        `,

        "dm"

    );


    removeEmptyItems();

    updateInventoryUI();

}


/* =========================================================
   BOŞ EŞYALARI SİL
========================================================= */

function removeEmptyItems() {

    game.player.inventory =
        game.player.inventory.filter(
            item =>
                Number(item.quantity || 0) > 0
        );

}


/* =========================================================
   KARAKTER
========================================================= */

function showCharacter() {

    if (!characterInfo) {
        return;
    }


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
   KARAKTER UI
========================================================= */

function updateCharacterUI() {

    const name =
        document.getElementById(
            "characterName"
        );

    const classElement =
        document.getElementById(
            "characterClass"
        );

    const hp =
        document.getElementById("hp");

    const level =
        document.getElementById("level");

    const xp =
        document.getElementById("xp");

    const gold =
        document.getElementById("gold");


    if (name) {

        name.textContent =
            game.player.name;

    }


    if (classElement) {

        classElement.textContent =
            `${game.player.race} ${game.player.className}`;

    }


    if (hp) {

        hp.textContent =
            `${game.player.hp} / ${game.player.maxHp}`;

    }


    if (level) {

        level.textContent =
            game.player.level;

    }


    if (xp) {

        xp.textContent =
            game.player.xp;

    }


    if (gold) {

        gold.textContent =
            game.player.gold;

    }


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


/* =========================================================
   STAT
========================================================= */

function updateStat(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


/* =========================================================
   NPC
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

        personality: data.personality,

        location: data.location,

        trust: data.trust || 0,

        secrets: data.secrets || [],

        knowledge: data.knowledge || [],

        relationshipHistory: []

    };


    game.npcs.push(npc);


    return npc;

}


/* =========================================================
   NPC BAŞLAT
========================================================= */

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
   GÖREV
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

        description: data.description,

        objectives:
            (data.objectives || []).map(
                objective => ({

                    id: objective.id,

                    text: objective.text,

                    completed: false

                })
            ),

        reward:
            data.reward || 0,

        status:
            "active",

        createdAt:
            new Date().toISOString()

    };


    game.quests.push(quest);


    return quest;

}


/* =========================================================
   GÖREVLER
========================================================= */

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


/* =========================================================
   GÖREV UI
========================================================= */

function updateQuestUI() {

    if (!questPanel) {
        return;
    }


    questPanel.innerHTML = "";


    const activeQuests =
        game.quests.filter(
            quest =>
                quest.status === "active"
        );


    if (questCount) {

        questCount.textContent =
            activeQuests.length;

    }


    if (
        !game.quests ||
        game.quests.length === 0
    ) {

        questPanel.innerHTML = `
            <p class="empty">
                Aktif görev yok.
            </p>
        `;

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

                `).join("")}

            </ul>

            <small>
                Ödül:
                ${quest.reward}
                altın
            </small>

        `;


        questPanel.appendChild(
            element
        );

    });

}


/* =========================================================
   GÖREV HEDEFİ
========================================================= */

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


    if (
        !objective ||
        objective.completed
    ) {
        return;
    }


    objective.completed =
        true;


    const allCompleted =
        quest.objectives.every(
            o => o.completed
        );


    if (allCompleted) {

        quest.status =
            "completed";


        game.player.gold +=
            quest.reward;


        addStoryMessage(

            `
            🎉 <b>Görev tamamlandı!</b>

            <br><br>

            ${escapeHTML(quest.title)}

            <br>

            💰 +${quest.reward} altın
            `,

            "dm"

        );

    }


    updateQuestUI();

    updateCharacterUI();

}


/* =========================================================
   D20
========================================================= */

function rollD20() {

    const result =
        rollDice("1d20");


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
   ZAR
========================================================= */

function rollDice(notation) {

    const match =
        String(notation)
            .toLowerCase()
            .match(
                /^(\d+)d(\d+)$/
            );


    if (!match) {
        return 0;
    }


    const count =
        Number(match[1]);


    const sides =
        Number(match[2]);


    let total = 0;


    for (
        let i = 0;
        i < count;
        i++
    ) {

        total +=
            Math.floor(
                Math.random() * sides
            ) + 1;

    }


    return total;

}


/* =========================================================
   MODIFIER
========================================================= */

function getModifier(stat) {

    return Math.floor(
        (Number(stat) - 10) / 2
    );

}


/* =========================================================
   SAVAŞ BAŞLAT
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
            "Düşman bulunamadı:",
            enemyId
        );

        return;

    }


    game.combat.active =
        true;


    game.combat.round =
        1;


    game.combat.enemy = {

        id: template.id,

        name: template.name,

        hp: template.maxHp,

        maxHp: template.maxHp,

        armor: template.armor,

        attackBonus:
            template.attackBonus,

        damage:
            template.damage,

        xp:
            template.xp,

        gold:
            template.gold,

        description:
            template.description

    };


    addStoryMessage(

        `

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

        👹
        <b>${escapeHTML(template.name)}</b>

        <br>

        ❤️ Can:
        <b>
            ${template.maxHp}/${template.maxHp}
        </b>

        <br>

        🛡️ Zırh:
        <b>${template.armor}</b>

        <br><br>

        <b>Komutlar:</b>

        <br>

        "saldır"

        <br>

        "iksir kullan"

        <br>

        "kaç"

        `,

        "dm"

    );


    updateCombatUI();

}


/* =========================================================
   SAVAŞ EYLEMİ
========================================================= */

function handleCombatAction(action) {

    if (!game.combat.active) {
        return;
    }


    const lower =
        normalizeText(action);


    /* =========================================
       İKSİR
    ========================================= */

    if (
        lower.includes("iksir") ||
        lower.includes("sifa") ||
        lower.includes("potion")
    ) {

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


        if (
            used &&
            game.combat.active
        ) {

            enemyTurn();

        }


        return;

    }


    /* =========================================
       KAÇ
    ========================================= */

    if (
        lower.includes("kac") ||
        lower.includes("geri cekil")
    ) {

        attemptFlee();

        return;

    }


    /* =========================================
       SALDIR
    ========================================= */

    if (
        lower.includes("saldir") ||
        lower.includes("vur") ||
        lower.includes("kılıc") ||
        lower.includes("kilic") ||
        lower.includes("bicak") ||
        lower.includes("buyu")
    ) {

        playerAttack();

        return;

    }


    /* =========================================
       BİLİNMEYEN KOMUT
    ========================================= */

    addStoryMessage(

        `
        ⚔️ <b>Savaş devam ediyor.</b>

        <br><br>

        Ne yapmak istiyorsun?

        <br><br>

        <b>"saldır"</b>
        — Düşmana saldır.

        <br>

        <b>"iksir kullan"</b>
        — Şifa iksiri kullan.

        <br>

        <b>"kaç"</b>
        — Kaçmayı dene.
        `,

        "dm"

    );

}


/* =========================================================
   OYUNCU SALDIRISI
========================================================= */

function playerAttack() {

    if (!game.combat.active) {
        return;
    }


    const enemy =
        game.combat.enemy;


    if (!enemy) {
        return;
    }


    const attackRoll =
        rollDice("1d20");


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


    const attackModifier =
        strengthModifier;


    const totalAttack =
        attackRoll +
        attackModifier;


    let message = `

        ⚔️ <b>Saldırdın!</b>

        <br><br>

        🎲 D20:
        <b>${attackRoll}</b>

        <br>

        💪 Güç bonusu:
        <b>
            ${attackModifier >= 0
                ? "+"
                : ""
            }${attackModifier}
        </b>

        <br>

        🎯 Toplam:
        <b>${totalAttack}</b>

        <br>

        🛡️ Düşman zırhı:
        <b>${enemy.armor}</b>

    `;


    /* =========================================
       KRİTİK VURUŞ
    ========================================= */

    if (attackRoll === 20) {

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

            ⚔️ Silah:
            ${
                weapon
                ? escapeHTML(weapon.name)
                : "Yumruk"
            }

            <br>

            💥 Hasar:
            <b>${damage}</b>

        `;

    }


    /* =========================================
       KRİTİK BAŞARISIZ
    ========================================= */

    else if (attackRoll === 1) {

        message += `

            <br><br>

            💀 <b>KRİTİK BAŞARISIZLIK!</b>

            <br>

            Saldırın tamamen ıskaladı.
        `;

    }


    /* =========================================
       NORMAL VURUŞ
    ========================================= */

    else if (
        totalAttack >= enemy.armor
    ) {

        const damageRoll =
            weapon
            ? rollDice(
                weapon.damage || "1d6"
            )
            : rollDice("1d4");


        const damage =
            Math.max(
                1,
                damageRoll +
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
                ? `⚔️ ${escapeHTML(weapon.name)}`
                : "👊 Yumruk"
            }

            <br>

            🎲 Hasar zarı:
            <b>${damageRoll}</b>

            <br>

            💥 Toplam hasar:
            <b>${damage}</b>

        `;

    }


    /* =========================================
       ISKALAMA
    ========================================= */

    else {

        message += `

            <br><br>

            ❌ <b>Iskaladın!</b>

            <br>

            Saldırın düşmanın zırhını aşamadı.
        `;

    }


    message += `

        <br><br>

        👹
        <b>${escapeHTML(enemy.name)}</b>

        <br>

        ❤️ Düşman Canı:
        <b>
            ${enemy.hp}/${enemy.maxHp}
        </b>

    `;


    addStoryMessage(
        message,
        "dm"
    );


    updateCombatUI();


    /* =========================================
       DÜŞMAN ÖLDÜ
    ========================================= */

    if (enemy.hp <= 0) {

        winCombat();

        return;

    }


    /* =========================================
       DÜŞMAN TURU
    ========================================= */

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


    if (!enemy) {
        return;
    }


    game.combat.round++;


    const attackRoll =
        rollDice("1d20");


    const dexterityModifier =
        getModifier(
            game.player.stats.dexterity
        );


    const playerArmor =
        10 +
        dexterityModifier;


    const totalAttack =
        attackRoll +
        enemy.attackBonus;


    let message = `

        👹
        <b>${escapeHTML(enemy.name)}</b>
        saldırıyor!

        <br><br>

        🎲 D20:
        <b>${attackRoll}</b>

        <br>

        🎯 Saldırı:
        <b>${totalAttack}</b>

        <br>

        🛡️ Senin savunman:
        <b>${playerArmor}</b>

    `;


    /* =========================================
       KRİTİK
    ========================================= */

    if (attackRoll === 20) {

        const damage =
            rollDice(enemy.damage) * 2;


        game.player.hp =
            Math.max(
                0,
                game.player.hp - damage
            );


        message += `

            <br><br>

            💀 <b>DÜŞMAN KRİTİK VURDU!</b>

            <br>

            💥 Aldığın hasar:
            <b>${damage}</b>
        `;

    }


    /* =========================================
       NORMAL VURUŞ
    ========================================= */

    else if (
        attackRoll !== 1 &&
        totalAttack >= playerArmor
    ) {

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

            💥 Aldığın hasar:
            <b>${damage}</b>
        `;

    }


    /* =========================================
       DÜŞMAN ISKALADI
    ========================================= */

    else {

        message += `

            <br><br>

            ❌ Düşman saldırısını ıskaladı.
        `;

    }


    message += `

        <br><br>

        ❤️ Senin Canın:
        <b>
            ${game.player.hp}/${game.player.maxHp}
        </b>

    `;


    addStoryMessage(
        message,
        "dm"
    );


    updateCharacterUI();


    if (game.player.hp <= 0) {

        loseCombat();

    }

}


/* =========================================================
   KAÇ
========================================================= */

function attemptFlee() {

    if (!game.combat.active) {
        return;
    }


    const roll =
        rollDice("1d20");


    const dexterity =
        getModifier(
            game.player.stats.dexterity
        );


    const total =
        roll +
        dexterity;


    if (total >= 12) {

        addStoryMessage(

            `
            🏃 <b>Kaçmayı başardın!</b>

            <br><br>

            🎲 D20:
            ${roll}

            <br>

            🏹 Çeviklik bonusu:
            ${dexterity}
            `,

            "dm"

        );


        game.combat.active =
            false;


        game.combat.enemy =
            null;


        game.combat.round =
            0;


        updateAllUI();

        return;

    }


    addStoryMessage(

        `
        ❌ <b>Kaçamadın!</b>

        <br><br>

        🎲 D20:
        ${roll}

        <br>

        Düşman peşini bırakmıyor.
        `,

        "dm"

    );


    enemyTurn();

}


/* =========================================================
   SAVAŞ KAZAN
========================================================= */

function winCombat() {

    const enemy =
        game.combat.enemy;


    if (!enemy) {
        return;
    }


    game.player.xp +=
        enemy.xp;


    game.player.gold +=
        enemy.gold;


    addStoryMessage(

        `
        🎉 <b>ZAFER!</b>

        <br><br>

        👹
        ${escapeHTML(enemy.name)}
        yenildi.

        <br><br>

        ✨ XP:
        <b>+${enemy.xp}</b>

        <br>

        💰 Altın:
        <b>+${enemy.gold}</b>
        `,

        "dm"

    );


    game.combat.active =
        false;


    game.combat.enemy =
        null;


    game.combat.round =
        0;


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
        enemy
        ? enemy.name
        : "Düşman";


    game.combat.active =
        false;


    game.combat.enemy =
        null;


    game.combat.round =
        0;


    addStoryMessage(

        `
        💀 <b>YERE YIĞILDIN!</b>

        <br><br>

        ${escapeHTML(enemyName)}
        seni yendi.

        <br><br>

        Neyse ki ölüm son değil.

        <br><br>

        Blackmoor Köyü'nde gözlerini
        yeniden açıyorsun.
        `,

        "dm"

    );


    game.player.hp =
        Math.ceil(
            game.player.maxHp * 0.5
        );


    changeLocation(
        "Blackmoor Köyü"
    );


    updateAllUI();

}


/* =========================================================
   XP
========================================================= */

function getRequiredXP(level) {

    return level * 100;

}


/* =========================================================
   SEVİYE
========================================================= */

function checkLevelUp() {

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
                    game.player.stats
                        .constitution
                )
            );


        game.player.maxHp +=
            hpIncrease;


        game.player.hp =
            game.player.maxHp;


        addStoryMessage(

            `
            🌟 <b>SEVİYE ATLADIN!</b>

            <br><br>

            ⭐ Yeni seviye:
            <b>${game.player.level}</b>

            <br><br>

            ❤️ Maksimum can:
            <b>${game.player.maxHp}</b>

            <br>

            Canın tamamen yenilendi.
            `,

            "dm"

        );

    }


    updateCharacterUI();

}


/* =========================================================
   SAVAŞ UI
========================================================= */

function updateCombatUI() {

    if (!game.combat.active) {

        removeCombatUI();

        return;

    }


    const story =
        document.getElementById(
            "story"
        );


    if (!story) {
        return;
    }


    const enemy =
        game.combat.enemy;


    if (!enemy) {
        return;
    }


    let combatStatus =
        document.getElementById(
            "combatStatus"
        );


    if (!combatStatus) {

        combatStatus =
            document.createElement(
                "div"
            );


        combatStatus.id =
            "combatStatus";


        combatStatus.className =
            "combat-status";


        story.parentNode.insertBefore(
            combatStatus,
            story.nextSibling
        );

    }


    combatStatus.innerHTML = `

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
            🧙
            ${game.player.hp}/${game.player.maxHp}
        </div>

        <div>
            🔄 Tur:
            ${game.combat.round}
        </div>

    `;

}


/* =========================================================
   SAVAŞ UI SİL
========================================================= */

function removeCombatUI() {

    const status =
        document.getElementById(
            "combatStatus"
        );


    if (status) {
        status.remove();
    }

}


/* =========================================================
   KAYDET
========================================================= */

function saveGame() {

    try {

        localStorage.setItem(
            "realmOfShadowsSave",
            JSON.stringify(game)
        );


        addStoryMessage(
            "💾 Oyun başarıyla kaydedildi.",
            "dm"
        );

    }

    catch (error) {

        console.error(
            "Kayıt hatası:",
            error
        );


        addStoryMessage(
            "❌ Oyun kaydedilemedi.",
            "dm"
        );

    }

}


/* =========================================================
   YÜKLE
========================================================= */

function loadGame() {

    const saved =
        localStorage.getItem(
            "realmOfShadowsSave"
        );


    if (!saved) {

        addStoryMessage(
            "📂 Kaydedilmiş oyun bulunamadı.",
            "dm"
        );

        return;

    }


    try {

        const data =
            JSON.parse(saved);


        Object.assign(
            game.player,
            data.player || {}
        );


        Object.assign(
            game.world,
            data.world || {}
        );


        Object.assign(
            game.story,
            data.story || {}
        );


        game.npcs =
            data.npcs || [];


        game.quests =
            data.quests || [];


        game.factions =
            data.factions || [];


        game.locations =
            data.locations || [];


        game.combat =
            data.combat || {

                active: false,
                enemy: null,
                round: 0

            };


        game.ai =
            data.ai || {

                lastResponse: null,
                history: [],
                pendingCheck: null

            };


        if (
            !Array.isArray(
                game.player.inventory
            )
        ) {

            game.player.inventory = [];

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
            "📂 Kaydedilmiş macera geri yüklendi.",
            "dm"
        );

    }

    catch (error) {

        console.error(
            "Yükleme hatası:",
            error
        );


        addStoryMessage(
            "❌ Kayıt dosyası okunamadı.",
            "dm"
        );

    }

}


/* =========================================================
   SINIFLAR
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


/* =========================================================
   IRKLAR
========================================================= */

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


/* =========================================================
   KARAKTER OLUŞTUR
========================================================= */

function createCharacter() {

    if (
        !nameInput ||
        !raceInput ||
        !classInput ||
        !backgroundInput
    ) {
        return;
    }


    const name =
        nameInput.value.trim();


    if (!name) {

        alert(
            "Önce karakterine bir isim vermelisin."
        );

        nameInput.focus();

        return;

    }


    const race =
        raceInput.value;


    const className =
        classInput.value;


    const background =
        backgroundInput.value;


    const base =
        classStats[className];


    const bonus =
        raceBonuses[race];


    const stats = {

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


    game.player.stats =
        stats;


    game.player.maxHp =
        base.maxHp;


    game.player.hp =
        base.maxHp;


    game.player.equippedWeapon =
        null;


    game.player.inventory.forEach(
        item => {

            if (
                item.type === "weapon"
            ) {

                item.equipped =
                    false;

            }

        }
    );


    updateAllUI();


    characterModal?.classList.add(
        "hidden"
    );


    addStoryMessage(

        `
        ⚔️ <b>Karakter oluşturuldu.</b>

        <br><br>

        <b>${escapeHTML(name)}</b>,
        Realm of Shadows dünyasına adım atıyor.

        <br><br>

        Irk:
        <b>${escapeHTML(race)}</b>

        <br>

        Sınıf:
        <b>${escapeHTML(className)}</b>

        <br>

        Geçmiş:
        <b>${escapeHTML(background)}</b>
        `,

        "dm"

    );

}


/* =========================================================
   ENVANTER AÇ
========================================================= */

function openInventory() {

    updateInventoryUI();

    inventoryModal?.classList.remove(
        "hidden"
    );

}


/* =========================================================
   ENVANTER KAPAT
========================================================= */

function closeInventoryModal() {

    inventoryModal?.classList.add(
        "hidden"
    );

}


/* =========================================================
   TÜM UI
========================================================= */

function updateAllUI() {

    updateWorldUI();

    updateCharacterUI();

    updateInventoryUI();

    updateQuestUI();


    if (game.combat.active) {

        updateCombatUI();

    }

    else {

        removeCombatUI();

    }

}


/* =========================================================
   EVENTLER
========================================================= */


/* KARAKTER */

characterButton?.addEventListener(
    "click",
    showCharacter
);


/* KARAKTER KAPAT */

closeCharacter?.addEventListener(
    "click",
    () => {

        characterModal?.classList.add(
            "hidden"
        );

    }
);


/* KARAKTER MODAL DIŞI */

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


/* ENVANTER */

inventoryButton?.addEventListener(
    "click",
    event => {

        event.preventDefault();

        event.stopPropagation();

        openInventory();

    }
);


/* ENVANTER KAPAT */

closeInventory?.addEventListener(
    "click",
    event => {

        event.preventDefault();

        event.stopPropagation();

        closeInventoryModal();

    }
);


/* ENVANTER DIŞI */

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


/* ESC */

document.addEventListener(
    "keydown",
    event => {

        if (event.key !== "Escape") {
            return;
        }


        characterModal?.classList.add(
            "hidden"
        );


        inventoryModal?.classList.add(
            "hidden"
        );

    }
);


/* EYLEM */

actionButton?.addEventListener(
    "click",
    playerAction
);


/* ENTER */

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


/* KAYDET */

saveButton?.addEventListener(
    "click",
    saveGame
);


/* YÜKLE */

loadButton?.addEventListener(
    "click",
    loadGame
);


/* ZAR */

rollButton?.addEventListener(
    "click",
    rollD20
);


/* KARAKTER OLUŞTUR */

createCharacterButton?.addEventListener(
    "click",
    createCharacter
);


/* =========================================================
   DÜNYA BAŞLANGICI
========================================================= */

function initializeWorld() {

    initializeNPCs();

    initializeQuests();

}


/* =========================================================
   OYUN BAŞLANGICI
========================================================= */

function startGame() {

    const story =
        document.getElementById(
            "story"
        );


    if (
        story &&
        story.children.length === 0
    ) {

        addStoryMessage(

            `
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

            <b>
            Ne yapmak istiyorsun?
            </b>
            `,

            "dm"

        );

    }


    updateAllUI();

}


/* =========================================================
   BAŞLAT
========================================================= */

initializeWorld();

startGame();


console.log(
    "===================================="
);

console.log(
    "REALM OF SHADOWS HAZIR"
);

console.log(
    "⚔️ Savaş sistemi aktif"
);

console.log(
    "🎒 Envanter sistemi aktif"
);

console.log(
    "🛡️ Kuşanma sistemi aktif"
);

console.log(
    "🧪 İksir sistemi aktif"
);

console.log(
    "🏃 Kaçış sistemi aktif"
);

console.log(
    "📜 Görev sistemi aktif"
);

console.log(
    "🎲 Zar sistemi aktif"
);

console.log(
    "💾 Kayıt/Yükleme aktif"
);

console.log(
    "===================================="
);
