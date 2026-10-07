/* =========================================================
   REALM OF SHADOWS
   TAM SCRIPT.JS
   ENVANTER + KARAKTER + GÖREV + ZAR + SAVAŞ
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

        text,

        location:
            game.world.location,

        time:
            game.world.time,

        timestamp:
            new Date().toISOString()

    });


    playerInput.value = "";


    dungeonMaster(text);

}


/* =========================================================
   DUNGEON MASTER
========================================================= */

function dungeonMaster(action) {

    const lower =
        action.toLowerCase();


    let response;


    if (
        lower.includes("savaş") ||
        lower.includes("saldır") ||
        lower.includes("düşman")
    ) {

        if (!game.combat.active) {

            startCombat();

            return;

        }

        playerAttack();

        return;

    }


    if (
        lower.includes("kuyu") ||
        lower.includes("aşağı") ||
        lower.includes("dinliyorum")
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


    else if (
        lower.includes("kilise") ||
        lower.includes("kiliseye")
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


    else if (
        lower.includes("orman") ||
        lower.includes("ağaç")
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
        `;

    }


    else if (
        lower.includes("köylü") ||
        lower.includes("adam") ||
        lower.includes("kadın")
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
        `,

        `
        Hareketin çevrenin sessizliğini bozuyor.

        <br><br>

        Karanlığın içinden bir gölge geçiyor.
        `

    ];


    return responses[
        Math.floor(
            Math.random() * responses.length
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
   ENVANTER MODALINI AÇ
========================================================= */

function openInventory() {

    if (!inventoryModal) {
        return;
    }


    updateInventoryUI();


    inventoryModal.classList.remove(
        "hidden"
    );


    document.body.classList.add(
        "modal-open"
    );

}


/* =========================================================
   ENVANTER MODALINI KAPAT
========================================================= */

function closeInventoryModal() {

    if (!inventoryModal) {
        return;
    }


    inventoryModal.classList.add(
        "hidden"
    );


    document.body.classList.remove(
        "modal-open"
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


    const totalItems =
        inventory.reduce(
            (total, item) =>
                total + Number(item.quantity || 0),
            0
        );


    if (inventoryCount) {

        inventoryCount.textContent =
            totalItems;

    }


    if (inventory.length === 0) {

        inventoryPanel.innerHTML = `
            <p class="empty">
                Envanter boş.
            </p>
        `;

        return;

    }


    inventory.forEach(function(item) {

        const element =
            document.createElement("div");


        element.className =
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


        const actionText =
            getInventoryActionText(item);


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
                    ? `
                        <span>
                            Hasar: ${escapeHTML(item.damage)}
                        </span>
                    `
                    : ""
                }

                ${
                    item.heal
                    ? `
                        <span>
                            İyileştirme: ${item.heal}
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
                ${actionText}
            </button>

        `;


        const button =
            element.querySelector(
                ".inventory-use-button"
            );


        if (button) {

            button.addEventListener(
                "click",
                function() {

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
   ENVANTER BUTON METNİ
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
            `⚔️ <b>${escapeHTML(item.name)}</b> kuşandın.
             <br>
             Hasar: <b>${escapeHTML(item.damage || "1d4")}</b>`,
            "dm"
        );

    }


    updateInventoryUI();

    updateCharacterUI();

}


/* =========================================================
   ZAR HASARI
========================================================= */

function rollDiceExpression(expression) {

    const match =
        String(expression)
            .match(/^(\d+)d(\d+)$/i);


    if (!match) {
        return 1;
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
   İKSİR
========================================================= */

function usePotion(item) {

    if (game.player.hp >= game.player.maxHp) {

        addStoryMessage(
            "❤️ Canın zaten tamamen dolu.",
            "dm"
        );

        return;

    }


    const healAmount =
        Number(item.heal || 10);


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
        🧪 Şifa İksiri kullandın.

        <br><br>

        ❤️ <b>${actualHeal}</b> can yenilendi.

        <br>

        Can:
        <b>${game.player.hp} / ${game.player.maxHp}</b>
        `,
        "dm"
    );


    removeEmptyItems();


    updateAllUI();

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

        if (
            !item.quantity ||
            item.quantity <= 0
        ) {

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
            🔥 Meşaleyi yaktın.

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
                Number(item.quantity || 0) > 0
        );

}


/* =========================================================
   KARAKTER GÖSTER
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

        <hr>

        <p>
            <strong>Can:</strong>
            ${game.player.hp} / ${game.player.maxHp}
        </p>

        <p>
            <strong>Kuşanılan Silah:</strong>
            ${
                weapon
                    ? escapeHTML(weapon.name)
                    : "Yok"
            }
        </p>

        ${
            weapon
                ? `
                    <p>
                        <strong>Silah Hasarı:</strong>
                        ${escapeHTML(weapon.damage)}
                    </p>
                `
                : ""
        }

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


    characterModal.classList.remove(
        "hidden"
    );

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

        status: "active",

        createdAt:
            new Date().toISOString()

    };


    game.quests.push(quest);

    return quest;

}


/* =========================================================
   GÖREVLERİ BAŞLAT
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


    if (game.quests.length === 0) {

        questPanel.innerHTML = `
            <p class="empty">
                Aktif görev yok.
            </p>
        `;

        return;

    }


    game.quests.forEach(
        function(quest) {

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
                element
            );

        }
    );

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
            "🎉 <b>Kritik başarı!</b> D20 sonucu 20.",
            "dm"
        );

    }

    else if (result === 1) {

        addStoryMessage(
            "💀 <b>Kritik başarısızlık!</b> D20 sonucu 1.",
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
   SAVAŞ BAŞLAT
========================================================= */

function startCombat() {

    if (game.combat.active) {
        return;
    }


    const enemies = [

        {
            id: "shadow_wolf",
            name: "Gölge Kurdu",
            hp: 18,
            maxHp: 18,
            armor: 12,
            damage: "1d6",
            xp: 40,
            gold: 10
        },

        {
            id: "dark_bandit",
            name: "Karanlık Haydut",
            hp: 24,
            maxHp: 24,
            armor: 13,
            damage: "1d8",
            xp: 60,
            gold: 18
        },

        {
            id: "forest_beast",
            name: "Orman Yaratığı",
            hp: 30,
            maxHp: 30,
            armor: 14,
            damage: "1d8",
            xp: 90,
            gold: 30
        }

    ];


    const enemy =
        JSON.parse(
            JSON.stringify(
                enemies[
                    Math.floor(
                        Math.random() *
                        enemies.length
                    )
                ]
            )
        );


    game.combat.active =
        true;

    game.combat.enemy =
        enemy;

    game.combat.round =
        1;


    addStoryMessage(
        `
        ⚔️ <b>SAVAŞ BAŞLADI!</b>

        <br><br>

        Karşında:
        <b>${escapeHTML(enemy.name)}</b>

        <br>

        ❤️ Düşman Canı:
        <b>${enemy.hp}/${enemy.maxHp}</b>

        <br>

        🛡️ Savunma:
        <b>${enemy.armor}</b>

        <br><br>

        Saldırmak için
        <b>"saldır"</b> yaz.
        `,
        "dm"
    );

}


/* =========================================================
   OYUNCU SALDIRISI
========================================================= */

function playerAttack() {

    if (!game.combat.active) {

        addStoryMessage(
            "Şu anda savaşta değilsin.",
            "dm"
        );

        return;

    }


    const enemy =
        game.combat.enemy;


    const weapon =
        game.player.equippedWeapon
            ? getInventoryItem(
                game.player.equippedWeapon
            )
            : null;


    if (!weapon) {

        addStoryMessage(
            `
            ⚔️ Kuşanılmış bir silahın yok.

            <br><br>

            Önce envanterden bir silah kuşanmalısın.
            `,
            "dm"
        );

        return;

    }


    const d20 =
        Math.floor(
            Math.random() * 20
        ) + 1;


    const attackBonus =
        Math.floor(
            (game.player.stats.strength - 10) / 2
        );


    const attackTotal =
        d20 + attackBonus;


    if (d20 === 20) {

        const baseDamage =
            rollDiceExpression(
                weapon.damage
            );


        const damage =
            baseDamage * 2;


        enemy.hp =
            Math.max(
                0,
                enemy.hp - damage
            );


        addStoryMessage(
            `
            💥 <b>KRİTİK VURUŞ!</b>

            <br><br>

            ${escapeHTML(weapon.name)}
            ile düşmana
            <b>${damage}</b> hasar verdin.

            <br><br>

            ❤️ Düşman:
            <b>${enemy.hp}/${enemy.maxHp}</b>
            `,
            "dm"
        );

    }

    else if (
        d20 === 1 ||
        attackTotal < enemy.armor
    ) {

        addStoryMessage(
            `
            ❌ Saldırın ıska geçti.

            <br><br>

            🎲 Atış:
            <b>${d20}</b>

            <br>

            🛡️ Düşman savunması:
            <b>${enemy.armor}</b>
            `,
            "dm"
        );

    }

    else {

        const damage =
            rollDiceExpression(
                weapon.damage
            );


        enemy.hp =
            Math.max(
                0,
                enemy.hp - damage
            );


        addStoryMessage(
            `
            ⚔️ İsabet!

            <br><br>

            ${escapeHTML(weapon.name)}
            ile
            <b>${damage}</b>
            hasar verdin.

            <br><br>

            ❤️ Düşman:
            <b>${enemy.hp}/${enemy.maxHp}</b>
            `,
            "dm"
        );

    }


    if (enemy.hp <= 0) {

        winCombat();

        return;

    }


    enemyAttack();

}


/* =========================================================
   DÜŞMAN SALDIRISI
========================================================= */

function enemyAttack() {

    if (!game.combat.active) {
        return;
    }


    const enemy =
        game.combat.enemy;


    const roll =
        Math.floor(
            Math.random() * 20
        ) + 1;


    const defense =
        10 +
        Math.floor(
            (game.player.stats.dexterity - 10) / 2
        );


    if (roll === 1 || roll < defense) {

        addStoryMessage(
            `
            🛡️ <b>${escapeHTML(enemy.name)}</b>
            sana saldırdı ama saldırıdan kaçındın.
            `,
            "dm"
        );

    }

    else {

        const damage =
            rollDiceExpression(
                enemy.damage
            );


        game.player.hp =
            Math.max(
                0,
                game.player.hp - damage
            );


        addStoryMessage(
            `
            💥 <b>${escapeHTML(enemy.name)}</b>
            sana saldırdı.

            <br><br>

            ❤️
            <b>${damage}</b>
            hasar aldın.

            <br><br>

            Can:
            <b>${game.player.hp}/${game.player.maxHp}</b>
            `,
            "dm"
        );

    }


    game.combat.round++;


    if (game.player.hp <= 0) {

        loseCombat();

    }


    updateAllUI();

}


/* =========================================================
   SAVAŞ KAZAN
========================================================= */

function winCombat() {

    const enemy =
        game.combat.enemy;


    const xp =
        enemy.xp;


    const gold =
        enemy.gold;


    game.player.xp +=
        xp;


    game.player.gold +=
        gold;


    game.combat.active =
        false;


    game.combat.enemy =
        null;


    game.combat.round =
        0;


    checkLevelUp();


    addStoryMessage(
        `
        🏆 <b>ZAFER!</b>

        <br><br>

        ${escapeHTML(enemy.name)}
        yenildi.

        <br><br>

        ✨ XP:
        <b>+${xp}</b>

        <br>

        💰 Altın:
        <b>+${gold}</b>
        `,
        "dm"
    );


    updateAllUI();

}


/* =========================================================
   SAVAŞ KAYBET
========================================================= */

function loseCombat() {

    const enemy =
        game.combat.enemy;


    game.combat.active =
        false;


    game.combat.enemy =
        null;


    game.combat.round =
        0;


    game.player.hp =
        Math.ceil(
            game.player.maxHp * 0.5
        );


    addStoryMessage(
        `
        💀 <b>Yenildin.</b>

        <br><br>

        ${escapeHTML(enemy.name)}
        seni yere serdi.

        <br><br>

        Bir süre sonra kendine geliyorsun.

        <br><br>

        ❤️ Canın:
        <b>${game.player.hp}/${game.player.maxHp}</b>
        `,
        "dm"
    );


    updateAllUI();

}


/* =========================================================
   SEVİYE ATLAMA
========================================================= */

function checkLevelUp() {

    const requiredXP =
        game.player.level * 100;


    while (
        game.player.xp >= requiredXP
    ) {

        game.player.xp -=
            requiredXP;


        game.player.level++;


        game.player.maxHp +=
            5;


        game.player.hp =
            game.player.maxHp;


        game.player.stats.strength++;


        addStoryMessage(
            `
            ⭐ <b>SEVİYE ATLADIN!</b>

            <br><br>

            Yeni seviye:
            <b>${game.player.level}</b>

            <br><br>

            ❤️ Maksimum canın arttı.

            <br>

            ⚔️ Gücün arttı.
            `,
            "dm"
        );

    }

}


/* =========================================================
   SINIF ÖZELLİKLERİ
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
   IRK BONUSLARI
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


    const stats = {

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
        stats;

    game.player.maxHp =
        baseStats.maxHp;

    game.player.hp =
        baseStats.maxHp;

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


    if (characterModal) {

        characterModal.classList.add(
            "hidden"
        );

    }


    addStoryMessage(
        `
        ⚔️ <b>Karakter oluşturuldu.</b>

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


    updateAllUI();

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
            "📂 Kaydedilmiş oyun bulunamadı.",
            "dm"
        );

        return;

    }


    try {

        const loaded =
            JSON.parse(savedGame);


        if (loaded.player) {

            Object.assign(
                game.player,
                loaded.player
            );

        }


        if (loaded.world) {

            Object.assign(
                game.world,
                loaded.world
            );

        }


        if (loaded.story) {

            Object.assign(
                game.story,
                loaded.story
            );

        }


        game.npcs =
            loaded.npcs || [];


        game.quests =
            loaded.quests || [];


        game.factions =
            loaded.factions || [];


        game.locations =
            loaded.locations || [];


        game.combat =
            loaded.combat || {

                active: false,
                enemy: null,
                round: 0

            };


        game.ai =
            loaded.ai || {

                lastResponse: null,
                history: [],
                pendingCheck: null

            };


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
   TÜM UI
========================================================= */

function updateAllUI() {

    updateWorldUI();

    updateCharacterUI();

    updateInventoryUI();

    updateQuestUI();

}


/* =========================================================
   EVENTLER
========================================================= */


/* Oyuncu eylemi */

if (actionButton) {

    actionButton.addEventListener(
        "click",
        playerAction
    );

}


/* Enter */

if (playerInput) {

    playerInput.addEventListener(
        "keydown",
        function(event) {

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


/* Karakter aç */

if (characterButton) {

    characterButton.addEventListener(
        "click",
        function() {

            showCharacter();

        }
    );

}


/* Karakter kapat */

if (closeCharacter) {

    closeCharacter.addEventListener(
        "click",
        function() {

            characterModal.classList.add(
                "hidden"
            );

        }
    );

}


/* Karakter modal dışı */

if (characterModal) {

    characterModal.addEventListener(
        "click",
        function(event) {

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
   ENVANTER BUTONU
========================================================= */

if (inventoryButton) {

    inventoryButton.addEventListener(
        "click",
        function() {

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
        function() {

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
        function(event) {

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
   ESC İLE MODAL KAPAT
========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key !== "Escape") {
            return;
        }


        if (
            characterModal &&
            !characterModal.classList.contains("hidden")
        ) {

            characterModal.classList.add(
                "hidden"
            );

        }


        if (
            inventoryModal &&
            !inventoryModal.classList.contains("hidden")
        ) {

            closeInventoryModal();

        }

    }
);


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
    "✅ Realm of Shadows script hazır."
);
