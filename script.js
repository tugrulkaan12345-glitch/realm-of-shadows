/* =========================================================
   REALM OF SHADOWS
   TAM OYUN MOTORU
   ENVANTER + KARAKTER + GÖREV + ZAR + SAVAŞ
   DOĞAL DİL SAVAŞ KOMUTLARI
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

        round: 0,

        defending: false

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

function addStoryMessage(text, type = "dm") {

    const story =
        document.getElementById("story");

    if (!story) return;


    const message =
        document.createElement("div");

    message.classList.add(
        "story-message",
        type
    );


    const author =
        document.createElement("div");

    author.classList.add(
        "message-author"
    );


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
   NORMALLEŞTİRME
========================================================= */

function normalizeText(text) {

    return String(text)
        .toLocaleLowerCase("tr-TR")
        .replace(/[.,!?;:"'()]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

}


/* =========================================================
   KOMUT İÇERİYOR MU?
========================================================= */

function containsAny(text, words) {

    return words.some(
        word => text.includes(word)
    );

}


/* =========================================================
   OYUNCU EYLEMİ
========================================================= */

function playerAction() {

    if (!playerInput) return;


    const text =
        playerInput.value.trim();


    if (!text) return;


    addStoryMessage(
        escapeHTML(text),
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


    if (game.combat.active) {

        handleCombatAction(text);

        return;

    }


    dungeonMaster(text);

}


/* =========================================================
   DUNGEON MASTER
========================================================= */

function dungeonMaster(action) {

    const lower =
        normalizeText(action);


    let response;


    /* =====================================================
       AÇIK SALDIRI KOMUTU
    ===================================================== */

    if (
        containsAny(lower, [

            "saldır",
            "saldir",
            "vur",
            "kılıçla saldır",
            "kilicla saldir",
            "düşmana saldır",
            "dusmana saldir",
            "yaratığa saldır",
            "yaratiga saldir"

        ])
    ) {

        startCombat("shadow_wolf");

        return;

    }


    /* =====================================================
       KUYU
    ===================================================== */

    if (
        containsAny(lower, [
            "kuyu",
            "kuyuya git",
            "kuyuyu araştır",
            "kuyuyu arastir",
            "aşağı bak",
            "asagi bak",
            "dinliyorum"
        ])
    ) {

        game.story.flags.well = true;

        completeQuestObjective(
            "blackmoor_whispers",
            "visit_well"
        );


        response = `

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

        `;

    }


    /* =====================================================
       KİLİSE
    ===================================================== */

    else if (
        containsAny(lower, [
            "kilise",
            "kiliseye git",
            "kiliseye gir"
        ])
    ) {

        game.story.flags.church = true;


        response = `

            Terk edilmiş kilisenin bulunduğu sokağa
            giriyorsun.

            <br><br>

            Kapının önündeki taş basamaklar yağmurdan
            dolayı kaygan.

            <br><br>

            Kapı tamamen kapalı değil.

            <br><br>

            İçeriden çok zayıf bir mum ışığı
            süzülüyor.

        `;

    }


    /* =====================================================
       ORMAN
    ===================================================== */

    else if (
        containsAny(lower, [
            "orman",
            "ormana git",
            "ağaç",
            "ağaçlara git",
            "agac"
        ])
    ) {

        changeLocation(
            "Blackmoor Ormanı"
        );


        response = `

            Köyün ışıkları arkanda kalıyor.

            <br><br>

            Ormana girdikçe yağmurun sesi azalıyor.

            <br><br>

            Ağaçların arasında görüş mesafesi
            giderek düşüyor.

            <br><br>

            Bir süre sonra arkandan gelen
            ayak seslerini fark ediyorsun.

            <br><br>

            Karanlığın içinden bir çift sarı göz
            beliriyor.

            <br><br>

            <b>Gölge Kurdu</b> ortaya çıkıyor!

        `;


        addStoryMessage(
            response,
            "dm"
        );


        startCombat(
            "shadow_wolf",
            true
        );


        return;

    }


    /* =====================================================
       KÖYLÜ
    ===================================================== */

    else if (
        containsAny(lower, [
            "köylü",
            "koylu",
            "adam",
            "kadın",
            "kadin",
            "mara",
            "jonas",
            "aldric"
        ])
    ) {

        response = `

            Yakındaki köylülerden biri sana
            dikkatlice bakıyor.

            <br><br>

            Sonra yaklaşarak sesini alçaltıyor.

            <br><br>

            <i>"Bu gece burada fazla dolaşma."</i>

        `;

    }


    /* =====================================================
       GENEL
    ===================================================== */

    else {

        response =
            randomGenericResponse();

    }


    addStoryMessage(
        response,
        "dm"
    );


    game.story.events.push({

        action,

        response,

        location:
            game.world.location,

        timestamp:
            new Date().toISOString()

    });


    updateAllUI();

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
        Hamlen beklediğinden farklı bir etki yaratıyor.

        <br><br>

        Çevredeki insanların davranışlarında küçük
        bir değişiklik fark ediyorsun.
        `,

        `
        Birkaç saniye boyunca hiçbir şey olmuyor.

        <br><br>

        Sonra uzaktan metalik bir ses duyuluyor.
        `,

        `
        İçgüdülerin sana burada gözden kaçırdığın
        bir şey olduğunu söylüyor.

        <br><br>

        Karanlığın içinde bir hareket var.
        `,

        `
        Hareketin çevrenin sessizliğini bozuyor.

        <br><br>

        Karanlığın içinden bir gölge geçiyor.
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
        document.getElementById("location");


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

    if (!inventoryPanel) return;


    inventoryPanel.innerHTML = "";


    const inventory =
        game.player.inventory || [];


    if (inventoryCount) {

        inventoryCount.textContent =
            inventory.reduce(
                (total, item) =>
                    total + (item.quantity || 0),
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

        const itemElement =
            document.createElement("div");


        itemElement.className =
            "inventory-item";


        let icon = "📦";


        if (item.type === "weapon") {

            icon = "⚔️";

        }

        else if (item.type === "consumable") {

            icon = "🧪";

        }

        else if (item.type === "utility") {

            icon = "🔥";

        }


        itemElement.innerHTML = `

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
                data-item-id="${escapeHTML(item.id)}"
            >
                ${getInventoryActionText(item)}
            </button>

        `;


        const button =
            itemElement.querySelector(
                ".inventory-use-button"
            );


        if (button) {

            button.addEventListener(
                "click",
                () => useInventoryItem(item.id)
            );

        }


        inventoryPanel.appendChild(
            itemElement
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
   EŞYA KULLAN
========================================================= */

function useInventoryItem(id) {

    const item =
        getInventoryItem(id);


    if (!item) return;


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


    updateInventoryUI();

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


    const healAmount =
        item.heal || 10;


    const oldHP =
        game.player.hp;


    game.player.hp =
        Math.min(
            game.player.maxHp,
            game.player.hp + healAmount
        );


    const actualHeal =
        game.player.hp - oldHP;


    item.quantity--;


    addStoryMessage(

        `

        🧪 <b>Şifa İksiri kullandın.</b>

        <br><br>

        ❤️ <b>${actualHeal}</b> can yenilendi.

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

    }

    else {

        if (!item || item.quantity <= 0) {

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

            `

            🔥 <b>Meşaleyi yaktın.</b>

            <br><br>

            Karanlık çevre artık daha görünür.

            `,

            "dm"

        );


        removeEmptyItems();

    }


    updateInventoryUI();

}


/* =========================================================
   BOŞ EŞYALARI TEMİZLE
========================================================= */

function removeEmptyItems() {

    game.player.inventory =
        game.player.inventory.filter(
            item =>
                item.quantity > 0
        );

}


/* =========================================================
   KARAKTER
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


    if (characterModal) {

        characterModal.classList.remove(
            "hidden"
        );

    }

}


/* =========================================================
   KARAKTER UI
========================================================= */

function updateCharacterUI() {

    const nameElement =
        document.getElementById(
            "characterName"
        );

    const classElement =
        document.getElementById(
            "characterClass"
        );

    const hpElement =
        document.getElementById("hp");

    const levelElement =
        document.getElementById("level");

    const xpElement =
        document.getElementById("xp");

    const goldElement =
        document.getElementById("gold");


    if (nameElement) {

        nameElement.textContent =
            game.player.name;

    }


    if (classElement) {

        classElement.textContent =
            `${game.player.race} ${game.player.className}`;

    }


    if (hpElement) {

        hpElement.textContent =
            `${game.player.hp} / ${game.player.maxHp}`;

    }


    if (levelElement) {

        levelElement.textContent =
            game.player.level;

    }


    if (xpElement) {

        xpElement.textContent =
            game.player.xp;

    }


    if (goldElement) {

        goldElement.textContent =
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


    if (existing) return existing;


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


    if (existing) return existing;


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

        status: "active",

        createdAt:
            new Date().toISOString()

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


/* =========================================================
   GÖREV UI
========================================================= */

function updateQuestUI() {

    if (!questPanel) return;


    questPanel.innerHTML = "";


    if (questCount) {

        questCount.textContent =
            game.quests.filter(
                quest =>
                    quest.status === "active"
            ).length;

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

        const questElement =
            document.createElement("div");


        questElement.className =
            "quest-item";


        const completed =
            quest.objectives.filter(
                objective =>
                    objective.completed
            ).length;


        questElement.innerHTML = `

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

                ${
                    quest.objectives
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
                Ödül: ${quest.reward} altın
            </small>

        `;


        questPanel.appendChild(
            questElement
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

            💰 ${quest.reward} altın kazandın.

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
        Math.floor(
            Math.random() * 20
        ) + 1;


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
        String(notation).match(
            /^(\d+)d(\d+)$/
        );


    if (!match) return 0;


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
        (stat - 10) / 2
    );

}


/* =========================================================
   SAVAŞ BAŞLAT
========================================================= */

function startCombat(
    enemyId = "shadow_wolf",
    alreadyDescribed = false
) {

    const template =
        enemies[enemyId];


    if (!template) return;


    if (game.combat.active) {

        addStoryMessage(
            "⚔️ Zaten savaş halindesin!",
            "dm"
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

        description: template.description

    };


    addStoryMessage(

        `

        ⚔️ <b>SAVAŞ BAŞLADI!</b>

        <br><br>

        ${
            alreadyDescribed
            ? ""
            : escapeHTML(
                game.combat.enemy.description
            )
        }

        <br><br>

        👹
        <b>
            ${escapeHTML(
                game.combat.enemy.name
            )}
        </b>

        <br>

        ❤️ Can:
        <b>
            ${game.combat.enemy.hp}/${game.combat.enemy.maxHp}
        </b>

        <br>

        🛡️ Zırh:
        <b>
            ${game.combat.enemy.armor}
        </b>

        <br><br>

        ⚔️ Saldırmak için:
        <b>"saldır"</b>

        <br>

        🧪 İksir için:
        <b>"iksir kullan"</b>

        <br>

        🏃 Kaçmak için:
        <b>"kaç"</b>

        <br>

        🛡️ Savunmak için:
        <b>"savun"</b>

        `,

        "dm"

    );


    updateCombatUI();

}


/* =========================================================
   SAVAŞ EYLEMİ
========================================================= */

function handleCombatAction(action) {

    if (!game.combat.active) return;


    const lower =
        normalizeText(action);


    /* =====================================================
       İKSİR
    ===================================================== */

    if (
        containsAny(lower, [

            "iksir",
            "şifa",
            "sifa",
            "can doldur",
            "iyileştir",
            "iyilestir",
            "ilaç",
            "ilac"

        ])
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


        if (used && game.combat.active) {

            game.combat.defending =
                false;

            enemyTurn();

        }


        return;

    }


    /* =====================================================
       KAÇ
    ===================================================== */

    if (
        containsAny(lower, [

            "kaç",
            "kaçıyorum",
            "kaçiyorum",
            "geri çekil",
            "geri cekil",
            "uzaklaş",
            "uzaklas",
            "koş",
            "kos"

        ])
    ) {

        attemptFlee();

        return;

    }


    /* =====================================================
       SAVUN
    ===================================================== */

    if (
        containsAny(lower, [

            "savun",
            "savunma",
            "bekle",
            "kalkanımı kaldır",
            "kalkanimi kaldir",
            "korun"

        ])
    ) {

        defendAction();

        return;

    }


    /* =====================================================
       SALDIR
    ===================================================== */

    if (
        containsAny(lower, [

            "saldır",
            "saldir",
            "vur",
            "vursam",
            "kılıç",
            "kilic",
            "kılıcı",
            "kilici",
            "bıçak",
            "bicak",
            "balta",
            "mızrak",
            "mizrak",
            "yumruk",
            "saldırı",
            "saldiri",
            "düşmana",
            "dusmana",
            "yaratığa",
            "yaratiga"

        ])
    ) {

        playerAttack();

        return;

    }


    /* =====================================================
       BELİRSİZ KOMUT
    ===================================================== */

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

        <b>"savun"</b>
        — Gelen saldırıya karşı savun.

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

    if (!game.combat.active) return;


    const enemy =
        game.combat.enemy;


    if (!enemy) return;


    game.combat.defending =
        false;


    const attackRoll =
        Math.floor(
            Math.random() * 20
        ) + 1;


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

        ⚔️ <b>Saldırı yaptın!</b>

        <br><br>

        🎲 D20:
        <b>${attackRoll}</b>

        <br>

        ➕ Saldırı bonusu:
        <b>${attackModifier}</b>

        <br>

        🎯 Toplam:
        <b>${totalAttack}</b>

        <br>

        🛡️ Düşman zırhı:
        <b>${enemy.armor}</b>

    `;


    /* =====================================================
       KRİTİK VURUŞ
    ===================================================== */

    if (attackRoll === 20) {

        const baseDamage =
            weapon
            ? rollDice(
                weapon.damage || "1d6"
            )
            : rollDice("1d4");


        const damage =
            baseDamage * 2 +
            strengthModifier;


        enemy.hp =
            Math.max(
                0,
                enemy.hp - damage
            );


        message += `

            <br><br>

            🎉 <b>KRİTİK VURUŞ!</b>

            <br>

            ${
                weapon
                ? `⚔️ Silah: <b>${escapeHTML(weapon.name)}</b><br>`
                : ""
            }

            💥 Hasar:
            <b>${damage}</b>

        `;

    }


    /* =====================================================
       KRİTİK BAŞARISIZ
    ===================================================== */

    else if (attackRoll === 1) {

        message += `

            <br><br>

            💀 <b>Kritik başarısızlık!</b>

            <br>

            Saldırın hedefini ıskaladı.

        `;

    }


    /* =====================================================
       NORMAL VURUŞ
    ===================================================== */

    else if (
        totalAttack >= enemy.armor
    ) {

        const baseDamage =
            weapon
            ? rollDice(
                weapon.damage || "1d6"
            )
            : rollDice("1d4");


        const finalDamage =
            Math.max(
                1,
                baseDamage +
                strengthModifier
            );


        enemy.hp =
            Math.max(
                0,
                enemy.hp - finalDamage
            );


        message += `

            <br><br>

            ⚔️ <b>VURUŞ!</b>

            <br>

            ${
                weapon
                ? `⚔️ ${escapeHTML(weapon.name)}<br>`
                : `👊 Silahsız saldırı<br>`
            }

            💥 Hasar:
            <b>${finalDamage}</b>

        `;

    }


    /* =====================================================
       ISKALAMA
    ===================================================== */

    else {

        message += `

            <br><br>

            ❌ <b>Iskaladın!</b>

        `;

    }


    message += `

        <br><br>

        👹
        ${escapeHTML(enemy.name)}
        Canı:

        <b>
            ${enemy.hp}/${enemy.maxHp}
        </b>

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

function defendAction() {

    if (!game.combat.active) return;


    game.combat.defending =
        true;


    addStoryMessage(

        `

        🛡️ <b>Savunma pozisyonu aldın.</b>

        <br><br>

        Bir sonraki düşman saldırısında
        savunman güçlenecek.

        `,

        "dm"

    );


    enemyTurn();

}


/* =========================================================
   DÜŞMAN TURU
========================================================= */

function enemyTurn() {

    if (!game.combat.active) return;


    const enemy =
        game.combat.enemy;


    if (!enemy) return;


    game.combat.round++;


    const attackRoll =
        Math.floor(
            Math.random() * 20
        ) + 1;


    let playerArmor =
        10 +
        getModifier(
            game.player.stats.dexterity
        );


    if (game.combat.defending) {

        playerArmor += 5;

    }


    const totalAttack =
        attackRoll +
        enemy.attackBonus;


    let message = `

        👹 <b>${escapeHTML(enemy.name)}</b>
        saldırıyor!

        <br><br>

        🎲 D20:
        <b>${attackRoll}</b>

        <br>

        🎯 Toplam saldırı:
        <b>${totalAttack}</b>

        <br>

        🛡️ Senin savunman:
        <b>${playerArmor}</b>

    `;


    /* =====================================================
       KRİTİK
    ===================================================== */

    if (attackRoll === 20) {

        let damage =
            rollDice(enemy.damage) * 2;


        if (game.combat.defending) {

            damage =
                Math.max(
                    1,
                    Math.floor(
                        damage / 2
                    )
                );

        }


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


    /* =====================================================
       NORMAL VURUŞ
    ===================================================== */

    else if (
        totalAttack >= playerArmor
    ) {

        let damage =
            Math.max(
                1,
                rollDice(enemy.damage)
            );


        if (game.combat.defending) {

            damage =
                Math.max(
                    1,
                    Math.floor(
                        damage / 2
                    )
                );

        }


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


        if (game.combat.defending) {

            message += `

                <br>

                🛡️ Savunman sayesinde
                hasarın azaltıldı.

            `;

        }

    }


    /* =====================================================
       ISKALAMA
    ===================================================== */

    else {

        message += `

            <br><br>

            ❌ Düşman saldırısını ıskaladı.

        `;

    }


    game.combat.defending =
        false;


    message += `

        <br><br>

        ❤️ Canın:

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


    updateCombatUI();

}


/* =========================================================
   KAÇMA
========================================================= */

function attemptFlee() {

    if (!game.combat.active) return;


    const roll =
        Math.floor(
            Math.random() * 20
        ) + 1;


    const dexterity =
        getModifier(
            game.player.stats.dexterity
        );


    const total =
        roll + dexterity;


    if (total >= 12) {

        addStoryMessage(

            `

            🏃 <b>Kaçmayı başardın!</b>

            <br><br>

            🎲 D20:
            <b>${roll}</b>

            <br>

            🏃 Çeviklik bonusu:
            <b>${dexterity}</b>

            `,

            "dm"

        );


        endCombat();

        return;

    }


    addStoryMessage(

        `

        ❌ <b>Kaçamadın!</b>

        <br><br>

        🎲 D20:
        <b>${roll}</b>

        <br><br>

        Düşman peşini bırakmıyor.

        `,

        "dm"

    );


    enemyTurn();

}


/* =========================================================
   SAVAŞ BİTİR
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


    updateCombatUI();

}


/* =========================================================
   SAVAŞ KAZAN
========================================================= */

function winCombat() {

    const enemy =
        game.combat.enemy;


    if (!enemy) return;


    const xpReward =
        enemy.xp;


    const goldReward =
        enemy.gold;


    game.player.xp +=
        xpReward;


    game.player.gold +=
        goldReward;


    addStoryMessage(

        `

        🎉 <b>ZAFER!</b>

        <br><br>

        👹
        ${escapeHTML(enemy.name)}
        yenildi.

        <br><br>

        ✨ XP:
        <b>+${xpReward}</b>

        <br>

        💰 Altın:
        <b>+${goldReward}</b>

        `,

        "dm"

    );


    endCombat();


    checkLevelUp();

    updateAllUI();

}


/* =========================================================
   SAVAŞ KAYBET
========================================================= */

function loseCombat() {

    const enemyName =
        game.combat.enemy
        ? game.combat.enemy.name
        : "Düşman";


    endCombat();


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
   LEVEL UP
========================================================= */

function checkLevelUp() {

    let leveledUp =
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
            4 +
            getModifier(
                game.player.stats.constitution
            );


        game.player.maxHp +=
            Math.max(
                1,
                hpIncrease
            );


        game.player.hp =
            game.player.maxHp;


        leveledUp =
            true;


        addStoryMessage(

            `

            🌟 <b>SEVİYE ATLADIN!</b>

            <br><br>

            ⭐ Yeni seviye:
            <b>${game.player.level}</b>

            <br><br>

            ❤️ Maksimum canın arttı.

            <br>

            Can:
            <b>${game.player.maxHp}</b>

            `,

            "dm"

        );

    }


    if (leveledUp) {

        updateCharacterUI();

    }

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
        document.getElementById("story");


    if (!story) return;


    const enemy =
        game.combat.enemy;


    if (!enemy) return;


    let combatStatus =
        document.getElementById(
            "combatStatus"
        );


    if (!combatStatus) {

        combatStatus =
            document.createElement("div");


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
            🔄 Tur:
            ${game.combat.round}
        </div>

        ${
            game.combat.defending
            ? `
                <div>
                    🛡️ Savunma aktif
                </div>
              `
            : ""
        }

    `;

}


/* =========================================================
   SAVAŞ UI SİL
========================================================= */

function removeCombatUI() {

    const combatStatus =
        document.getElementById(
            "combatStatus"
        );


    if (combatStatus) {

        combatStatus.remove();

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

    const savedGame =
        localStorage.getItem(
            "realmOfShadowsSave"
        );


    if (!savedGame) {

        addStoryMessage(
            "📂 Kaydedilmiş bir oyun bulunamadı.",
            "dm"
        );

        return;

    }


    try {

        const loadedGame =
            JSON.parse(savedGame);


        Object.assign(
            game.player,
            loadedGame.player
        );


        Object.assign(
            game.world,
            loadedGame.world
        );


        Object.assign(
            game.story,
            loadedGame.story
        );


        game.npcs =
            loadedGame.npcs || [];


        game.quests =
            loadedGame.quests || [];


        game.factions =
            loadedGame.factions || [];


        game.locations =
            loadedGame.locations || [];


        game.combat =
            loadedGame.combat || {

                active: false,

                enemy: null,

                round: 0,

                defending: false

            };


        if (
            typeof game.combat.defending !==
            "boolean"
        ) {

            game.combat.defending =
                false;

        }


        game.ai =
            loadedGame.ai || {

                lastResponse: null,

                history: [],

                pendingCheck: null

            };


        if (!game.player.inventory) {

            game.player.inventory = [];

        }


        if (!game.player.stats) {

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


        if (game.combat.active) {

            updateCombatUI();

        }


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
   KARAKTER INPUTLARI
========================================================= */

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


    const baseStats =
        classStats[className];


    const bonuses =
        raceBonuses[race];


    const newStats = {

        strength:
            baseStats.strength +
            (bonuses.strength || 0),

        dexterity:
            baseStats.dexterity +
            (bonuses.dexterity || 0),

        constitution:
            baseStats.constitution +
            (bonuses.constitution || 0),

        intelligence:
            baseStats.intelligence +
            (bonuses.intelligence || 0),

        wisdom:
            baseStats.wisdom +
            (bonuses.wisdom || 0),

        charisma:
            baseStats.charisma +
            (bonuses.charisma || 0)

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
        newStats;


    game.player.maxHp =
        baseStats.maxHp;


    game.player.hp =
        baseStats.maxHp;


    game.player.equippedWeapon =
        null;


    game.player.inventory.forEach(
        item => {

            if (item.type === "weapon") {

                item.equipped =
                    false;

            }

        }
    );


    updateAllUI();


    if (characterModal) {

        characterModal.classList.add(
            "hidden"
        );

    }


    addStoryMessage(

        `

        <b>⚔️ Karakter oluşturuldu.</b>

        <br><br>

        <b>${escapeHTML(name)}</b>,
        artık Realm of Shadows dünyasına
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

        `,

        "dm"

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
   KARAKTER BUTONU
========================================================= */

if (characterButton) {

    characterButton.addEventListener(
        "click",
        showCharacter
    );

}


/* =========================================================
   KARAKTER KAPAT
========================================================= */

if (closeCharacter) {

    closeCharacter.addEventListener(
        "click",
        () => {

            if (characterModal) {

                characterModal.classList.add(
                    "hidden"
                );

            }

        }
    );

}


/* =========================================================
   KARAKTER MODAL DIŞI
========================================================= */

if (characterModal) {

    characterModal.addEventListener(
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

}


/* =========================================================
   ENVANTER AÇ
========================================================= */

function openInventory() {

    if (!inventoryModal) return;


    updateInventoryUI();


    inventoryModal.classList.remove(
        "hidden"
    );

}


/* =========================================================
   ENVANTER KAPAT
========================================================= */

function closeInventoryModal() {

    if (!inventoryModal) return;


    inventoryModal.classList.add(
        "hidden"
    );

}


/* =========================================================
   ENVANTER BUTONU
========================================================= */

if (inventoryButton) {

    inventoryButton.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();

            openInventory();

        }
    );

}


/* =========================================================
   ENVANTER KAPAT
========================================================= */

if (closeInventory) {

    closeInventory.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();

            closeInventoryModal();

        }
    );

}


/* =========================================================
   ENVANTER MODAL DIŞI
========================================================= */

if (inventoryModal) {

    inventoryModal.addEventListener(
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

}


/* =========================================================
   ESC
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (event.key !== "Escape") return;


        if (
            characterModal &&
            !characterModal.classList.contains(
                "hidden"
            )
        ) {

            characterModal.classList.add(
                "hidden"
            );

        }


        if (
            inventoryModal &&
            !inventoryModal.classList.contains(
                "hidden"
            )
        ) {

            inventoryModal.classList.add(
                "hidden"
            );

        }

    }
);


/* =========================================================
   EYLEM BUTONU
========================================================= */

if (actionButton) {

    actionButton.addEventListener(
        "click",
        playerAction
    );

}


/* =========================================================
   ENTER
========================================================= */

if (playerInput) {

    playerInput.addEventListener(
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

}


/* =========================================================
   KAYDET
========================================================= */

if (saveButton) {

    saveButton.addEventListener(
        "click",
        saveGame
    );

}


/* =========================================================
   YÜKLE
========================================================= */

if (loadButton) {

    loadButton.addEventListener(
        "click",
        loadGame
    );

}


/* =========================================================
   ZAR
========================================================= */

if (rollButton) {

    rollButton.addEventListener(
        "click",
        rollD20
    );

}


/* =========================================================
   KARAKTER OLUŞTUR
========================================================= */

if (createCharacterButton) {

    createCharacterButton.addEventListener(
        "click",
        createCharacter
    );

}


/* =========================================================
   DÜNYA
========================================================= */

function initializeWorld() {

    initializeNPCs();

    initializeQuests();

}


/* =========================================================
   OYUN BAŞLANGICI
========================================================= */

function startGame() {

    console.log(
        "Realm of Shadows başlatıldı."
    );


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

        `,

        "dm"

    );


    updateAllUI();

}


/* =========================================================
   BAŞLAT
========================================================= */

initializeWorld();

startGame();


console.log(
    "✅ Realm of Shadows TAM SİSTEM hazır."
);

console.log(
    "⚔️ Savaş sistemi hazır."
);

console.log(
    "🎒 Envanter sistemi hazır."
);

console.log(
    "📜 Görev sistemi hazır."
);

console.log(
    "🎲 Zar sistemi hazır."
);

console.log(
    "🧠 AI entegrasyonuna hazır."
);
