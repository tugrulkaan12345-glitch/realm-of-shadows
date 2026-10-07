/* =========================================================
   REALM OF SHADOWS
   TAM OYUN MOTORU
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
                description:
                    "Eski ama hâlâ kullanılabilir bir kılıç."
            },

            {
                id: "potion",
                name: "Şifa İksiri",
                type: "consumable",
                quantity: 2,
                heal: 8,
                description:
                    "Kullanıldığında 8 HP iyileştirir."
            },

            {
                id: "torch",
                name: "Meşale",
                type: "utility",
                quantity: 3,
                description:
                    "Karanlık yerleri aydınlatmak için kullanılır."
            }

        ],

        equippedWeapon: null,

        gold: 25

    },


    world: {

        name: "Realm of Shadows",

        location: "Blackmoor Köyü",

        weather: "Yağmurlu",

        time: "Gece",

        danger: 1,

        season: "Sonbahar"

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
   SAYFA ELEMANLARI
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

const characterModal =
    document.getElementById("characterModal");

const closeCharacter =
    document.getElementById("closeCharacter");

const characterInfo =
    document.getElementById("characterInfo");

const inventoryButton =
    document.getElementById("inventoryButton");

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
   MESAJ GÖSTER
========================================================= */

function addStoryMessage(text, type = "dm") {

    const story =
        document.getElementById("story");

    if (!story) {

        console.error(
            "Story alanı bulunamadı."
        );

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


    if (type === "player") {

        author.textContent =
            game.player.name;

    }

    else {

        author.textContent =
            "🎲 Dungeon Master";

    }


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
   DÜNYA ARAYÜZİ
========================================================= */

function updateWorldUI() {

    const locationElement =
        document.getElementById("location");

    if (locationElement) {

        locationElement.textContent =
            game.world.location;

    }

}


/* =========================================================
   KARAKTER ARAYÜZİ
========================================================= */

function updateCharacterUI() {

    const nameElement =
        document.getElementById("characterName");

    const classElement =
        document.getElementById("characterClass");

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
   STAT GÜNCELLE
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
   ENVANTER
========================================================= */

let inventoryOpen = false;


/* =========================================================
   ENVANTER İKON
========================================================= */

function getItemIcon(item) {

    if (item.type === "weapon") {

        return "⚔️";

    }

    if (item.type === "consumable") {

        return "🧪";

    }

    if (item.type === "utility") {

        return "🔥";

    }

    return "📦";

}


/* =========================================================
   ENVANTER SAYACI
========================================================= */

function updateInventoryCount() {

    if (!inventoryCount) {

        return;

    }


    const total =
        game.player.inventory.reduce(
            function(sum, item) {

                return sum +
                    (Number(item.quantity) || 0);

            },
            0
        );


    inventoryCount.textContent =
        total;

}


/* =========================================================
   ENVANTERİ GÖSTER
========================================================= */

function updateInventoryUI() {

    console.log(
        "📦 Envanter güncelleniyor..."
    );


    if (!inventoryPanel) {

        console.error(
            "❌ inventory elementi bulunamadı."
        );

        return;

    }


    inventoryPanel.innerHTML = "";


    const inventory =
        game.player.inventory || [];


    updateInventoryCount();


    if (inventory.length === 0) {

        inventoryPanel.innerHTML = `

            <p class="empty">
                Envanter boş.
            </p>

        `;

        return;

    }


    inventory.forEach(
        function(item) {

            if (
                !item.quantity ||
                item.quantity <= 0
            ) {

                return;

            }


            const itemElement =
                document.createElement("button");

            itemElement.type =
                "button";

            itemElement.className =
                "inventory-item";

            itemElement.dataset.itemId =
                item.id;


            const icon =
                getItemIcon(item);


            const equipped =
                game.player.equippedWeapon === item.id;


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
                        ?
                        `<span>
                            Hasar: ${escapeHTML(item.damage)}
                        </span>`
                        :
                        ""
                    }

                    ${
                        equipped
                        ?
                        `<span class="equipped">
                            ⚔️ Kuşanılmış
                        </span>`
                        :
                        ""
                    }

                </div>

            `;


            itemElement.addEventListener(
                "click",
                function() {

                    showItemDetails(
                        item.id
                    );

                }
            );


            inventoryPanel.appendChild(
                itemElement
            );

        }
    );


    console.log(
        "📦 Envanter hazır:",
        inventory
    );

}


/* =========================================================
   ENVANTER AÇ / KAPAT
========================================================= */

function toggleInventory() {

    if (!inventoryPanel) {

        return;

    }


    inventoryOpen =
        !inventoryOpen;


    if (inventoryOpen) {

        inventoryPanel.classList.add(
            "inventory-visible"
        );

        updateInventoryUI();

        console.log(
            "🎒 Envanter açıldı."
        );

    }

    else {

        inventoryPanel.classList.remove(
            "inventory-visible"
        );

        console.log(
            "🎒 Envanter kapatıldı."
        );

    }


    console.log(
        "Envanter açık mı:",
        inventoryOpen
    );

}


/* =========================================================
   EŞYA DETAY PENCERESİ
========================================================= */

function showItemDetails(itemId) {

    const item =
        game.player.inventory.find(
            function(currentItem) {

                return currentItem.id === itemId;

            }
        );


    if (!item) {

        return;

    }


    const icon =
        getItemIcon(item);


    let actionButtonHTML = "";


    if (item.type === "consumable") {

        actionButtonHTML = `

            <button
                type="button"
                id="useItemButton"
                class="inventory-action-button"
            >
                🧪 Kullan
            </button>

        `;

    }


    if (item.type === "weapon") {

        const equipped =
            game.player.equippedWeapon === item.id;


        actionButtonHTML = `

            <button
                type="button"
                id="equipItemButton"
                class="inventory-action-button"
            >
                ${
                    equipped
                    ?
                    "⚔️ Kuşanılmış"
                    :
                    "⚔️ Kuşan"
                }
            </button>

        `;

    }


    const detail =
        document.createElement("div");

    detail.className =
        "inventory-detail-overlay";


    detail.innerHTML = `

        <div class="inventory-detail">

            <button
                type="button"
                class="inventory-detail-close"
                id="closeItemDetail"
            >
                ×
            </button>

            <div class="detail-icon">
                ${icon}
            </div>

            <h2>
                ${escapeHTML(item.name)}
            </h2>

            <p>
                ${escapeHTML(
                    item.description ||
                    "Bu eşya hakkında bilgi bulunmuyor."
                )}
            </p>

            <hr>

            <p>
                <strong>Tür:</strong>
                ${escapeHTML(item.type)}
            </p>

            <p>
                <strong>Adet:</strong>
                ${item.quantity}
            </p>

            ${
                item.damage
                ?
                `
                <p>
                    <strong>Hasar:</strong>
                    ${escapeHTML(item.damage)}
                </p>
                `
                :
                ""
            }

            ${
                item.heal
                ?
                `
                <p>
                    <strong>İyileştirme:</strong>
                    ${item.heal} HP
                </p>
                `
                :
                ""
            }

            <div class="inventory-detail-actions">

                ${actionButtonHTML}

            </div>

        </div>

    `;


    document.body.appendChild(
        detail
    );


    const closeButton =
        detail.querySelector(
            "#closeItemDetail"
        );


    closeButton.addEventListener(
        "click",
        function() {

            detail.remove();

        }
    );


    detail.addEventListener(
        "click",
        function(event) {

            if (event.target === detail) {

                detail.remove();

            }

        }
    );


    const useButton =
        detail.querySelector(
            "#useItemButton"
        );


    if (useButton) {

        useButton.addEventListener(
            "click",
            function() {

                useItem(item.id);

                detail.remove();

            }
        );

    }


    const equipButton =
        detail.querySelector(
            "#equipItemButton"
        );


    if (equipButton) {

        equipButton.addEventListener(
            "click",
            function() {

                equipWeapon(item.id);

                detail.remove();

            }
        );

    }

}


/* =========================================================
   EŞYA KULLAN
========================================================= */

function useItem(itemId) {

    const item =
        game.player.inventory.find(
            function(currentItem) {

                return currentItem.id === itemId;

            }
        );


    if (!item) {

        return;

    }


    if (item.type !== "consumable") {

        addStoryMessage(
            "Bu eşya kullanılamaz.",
            "dm"
        );

        return;

    }


    if (item.quantity <= 0) {

        addStoryMessage(
            "Bu eşyadan artık kalmadı.",
            "dm"
        );

        return;

    }


    if (item.heal) {

        const oldHP =
            game.player.hp;


        game.player.hp =
            Math.min(
                game.player.maxHp,
                game.player.hp + item.heal
            );


        const healed =
            game.player.hp - oldHP;


        if (healed <= 0) {

            addStoryMessage(
                "Canın zaten tamamen dolu.",
                "dm"
            );

            return;

        }


        item.quantity--;


        addStoryMessage(

            `
            🧪 <b>${escapeHTML(item.name)}</b>
            kullandın.

            <br><br>

            ❤️ <b>${healed} HP</b> iyileştin.

            <br><br>

            Can:
            <b>${game.player.hp} / ${game.player.maxHp}</b>
            `,

            "dm"

        );


        updateCharacterUI();

        removeEmptyItems();

        updateInventoryUI();

        saveGameSilently();

    }

}


/* =========================================================
   SİLAH KUŞAN
========================================================= */

function equipWeapon(itemId) {

    const item =
        game.player.inventory.find(
            function(currentItem) {

                return currentItem.id === itemId;

            }
        );


    if (!item) {

        return;

    }


    if (item.type !== "weapon") {

        return;

    }


    if (game.player.equippedWeapon === item.id) {

        game.player.equippedWeapon =
            null;


        addStoryMessage(
            `⚔️ ${escapeHTML(item.name)} kuşanımdan çıkarıldı.`,
            "dm"
        );

    }

    else {

        game.player.equippedWeapon =
            item.id;


        addStoryMessage(
            `⚔️ <b>${escapeHTML(item.name)}</b> kuşandın.`,
            "dm"
        );

    }


    updateInventoryUI();

    saveGameSilently();

}


/* =========================================================
   BOŞ EŞYALARI TEMİZLE
========================================================= */

function removeEmptyItems() {

    game.player.inventory =
        game.player.inventory.filter(
            function(item) {

                return item.quantity > 0;

            }
        );

}


/* =========================================================
   GÖREV SİSTEMİ
========================================================= */

function createQuest(data) {

    const existing =
        game.quests.find(
            function(quest) {

                return quest.id === data.id;

            }
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
                function(objective) {

                    return {

                        id: objective.id,

                        text: objective.text,

                        completed: false

                    };

                }
            ),

        reward:
            data.reward || 0,

        status: "active",

        createdAt:
            new Date().toISOString()

    };


    game.quests.push(
        quest
    );


    return quest;

}


/* =========================================================
   GÖREVLERİ GÖSTER
========================================================= */

function updateQuestUI() {

    if (!questPanel) {

        return;

    }


    questPanel.innerHTML = "";


    const quests =
        game.quests || [];


    if (questCount) {

        questCount.textContent =
            quests.length;

    }


    if (quests.length === 0) {

        questPanel.innerHTML = `

            <p class="empty">
                Aktif görev yok.
            </p>

        `;

        return;

    }


    quests.forEach(
        function(quest) {

            const questElement =
                document.createElement("div");

            questElement.className =
                "quest-item";


            const completedCount =
                quest.objectives.filter(
                    function(objective) {

                        return objective.completed;

                    }
                ).length;


            questElement.innerHTML = `

                <strong>
                    📜 ${escapeHTML(quest.title)}
                </strong>

                <p>
                    ${escapeHTML(quest.description)}
                </p>

                <small>
                    ${completedCount}/${quest.objectives.length}
                    hedef tamamlandı
                </small>

            `;


            quest.objectives.forEach(
                function(objective) {

                    const objectiveElement =
                        document.createElement("div");

                    objectiveElement.className =
                        "quest-objective";


                    objectiveElement.innerHTML = `

                        ${
                            objective.completed
                            ?
                            "✅"
                            :
                            "⬜"
                        }

                        ${escapeHTML(objective.text)}

                    `;


                    questElement.appendChild(
                        objectiveElement
                    );

                }
            );


            questPanel.appendChild(
                questElement
            );

        }
    );

}


/* =========================================================
   GÖREV HEDEFİ TAMAMLA
========================================================= */

function completeQuestObjective(
    questId,
    objectiveId
) {

    const quest =
        game.quests.find(
            function(currentQuest) {

                return currentQuest.id === questId;

            }
        );


    if (!quest) {

        return;

    }


    const objective =
        quest.objectives.find(
            function(currentObjective) {

                return currentObjective.id === objectiveId;

            }
        );


    if (!objective) {

        return;

    }


    if (objective.completed) {

        return;

    }


    objective.completed =
        true;


    const allCompleted =
        quest.objectives.every(
            function(currentObjective) {

                return currentObjective.completed;

            }
        );


    if (allCompleted) {

        quest.status =
            "completed";


        game.player.xp +=
            quest.reward;


        addStoryMessage(

            `
            🎉 <b>Görev tamamlandı!</b>

            <br><br>

            ${escapeHTML(quest.title)}

            <br><br>

            ⭐ ${quest.reward} XP kazandın.
            `,

            "dm"

        );

    }


    updateQuestUI();

}


/* =========================================================
   NPC SİSTEMİ
========================================================= */

function createNPC(data) {

    const existing =
        game.npcs.find(
            function(npc) {

                return npc.id === data.id;

            }
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


    game.npcs.push(
        npc
    );


    return npc;

}


/* =========================================================
   NPC'LERİ BAŞLAT
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
   DÜNYAYI HAZIRLA
========================================================= */

function initializeWorld() {

    initializeNPCs();

    initializeQuests();

}


/* =========================================================
   KONUM DEĞİŞTİR
========================================================= */

function changeLocation(location) {

    const oldLocation =
        game.world.location;


    if (oldLocation === location) {

        return;

    }


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


    /* KUYU */

    if (
        lower.includes("kuyu") ||
        lower.includes("aşağı") ||
        lower.includes("dinliyorum")
    ) {

        game.story.flags.well =
            true;


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

            Önce bunun rüzgâr olduğunu düşünüyorsun.

            Fakat birkaç saniye sonra aynı fısıltıyı
            tekrar duyuyorsun.

            <br><br>

            <i>"Beni bul..."</i>

        `;

    }


    /* KİLİSE */

    else if (
        lower.includes("kilise") ||
        lower.includes("kiliseye")
    ) {

        game.story.flags.church =
            true;


        response = `

            Terk edilmiş kilisenin bulunduğu sokağa
            giriyorsun.

            <br><br>

            Kapının önündeki taş basamaklar yağmurdan
            dolayı kaygan.

            <br><br>

            Kapı tamamen kapalı değil.

            Aralıktan içeride çok zayıf bir mum ışığı
            süzülüyor.

            <br><br>

            İçeride biri varmış gibi hissediyorsun.

        `;

    }


    /* ORMAN */

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

            Ağaçların arasında görüş mesafesi giderek
            düşüyor.

            <br><br>

            Bir süre sonra arkandan gelen ayak seslerini
            fark ediyorsun.

        `;

    }


    /* KÖYLÜ */

    else if (
        lower.includes("köylü") ||
        lower.includes("adam") ||
        lower.includes("kadın")
    ) {

        response = `

            Yakındaki köylülerden biri sana dikkatlice
            bakıyor.

            <br><br>

            Birkaç saniye boyunca hiçbir şey söylemiyor.

            <br><br>

            Sonra yaklaşarak sesini alçaltıyor.

            <br><br>

            <i>"Bu gece burada fazla dolaşma."</i>

        `;

    }


    /* GENEL */

    else {

        response =
            randomGenericResponse();

    }


    addStoryMessage(
        response,
        "dm"
    );


    game.story.events.push({

        action: action,

        response: response,

        location:
            game.world.location,

        timestamp:
            new Date().toISOString()

    });


    updateWorldUI();

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


    const index =
        Math.floor(
            Math.random() *
            responses.length
        );


    return responses[index];

}


/* =========================================================
   ZAR SİSTEMİ
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


    let message;


    if (result === 20) {

        message =
            `🎲 <b>20!</b> Kritik başarı!`;

    }

    else if (result === 1) {

        message =
            `🎲 <b>1!</b> Kritik başarısızlık!`;

    }

    else {

        message =
            `🎲 Zar sonucu: <b>${result}</b>`;

    }


    addStoryMessage(
        message,
        "dm"
    );


    return result;

}


/* =========================================================
   KAYDET
========================================================= */

function saveGameSilently() {

    try {

        localStorage.setItem(
            "realmOfShadowsSave",
            JSON.stringify(game)
        );

    }

    catch (error) {

        console.error(
            "Oyun sessiz şekilde kaydedilemedi:",
            error
        );

    }

}


function saveGame() {

    saveGameSilently();


    addStoryMessage(
        "💾 Oyun kaydedildi.",
        "dm"
    );

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


        if (loadedGame.player) {

            Object.assign(
                game.player,
                loadedGame.player
            );

        }


        if (loadedGame.world) {

            Object.assign(
                game.world,
                loadedGame.world
            );

        }


        if (loadedGame.story) {

            Object.assign(
                game.story,
                loadedGame.story
            );

        }


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
                round: 0

            };


        game.ai =
            loadedGame.ai || {

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
            game.player.equippedWeapon === undefined
        ) {

            game.player.equippedWeapon =
                null;

        }


        updateCharacterUI();

        updateWorldUI();

        updateInventoryUI();

        updateQuestUI();


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
   YENİ OYUN
========================================================= */

function newGame() {

    localStorage.removeItem(
        "realmOfShadowsSave"
    );


    location.reload();

}


/* =========================================================
   KARAKTER PANELİ
========================================================= */

function showCharacter() {

    if (!characterInfo) {

        return;

    }


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

        <p>
            <strong>Silah:</strong>
            ${
                game.player.equippedWeapon
                ?
                escapeHTML(
                    (
                        game.player.inventory.find(
                            item =>
                                item.id ===
                                game.player.equippedWeapon
                        ) || {}
                    ).name || "Bilinmiyor"
                )
                :
                "Yok"
            }
        </p>

    `;


    characterModal.classList.remove(
        "hidden"
    );

}


/* =========================================================
   KARAKTER OLUŞTURMA
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


    const race =
        raceInput.value;


    const className =
        classInput.value;


    const background =
        backgroundInput.value;


    if (!name) {

        alert(
            "Önce karakterine bir isim vermelisin."
        );

        nameInput.focus();

        return;

    }


    const baseStats =
        classStats[className];


    const bonuses =
        raceBonuses[race] || {};


    if (!baseStats) {

        return;

    }


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


    updateCharacterUI();


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


    saveGameSilently();

}


/* =========================================================
   BUTONLAR
========================================================= */

if (actionButton) {

    actionButton.addEventListener(
        "click",
        playerAction
    );

}


if (saveButton) {

    saveButton.addEventListener(
        "click",
        saveGame
    );

}


if (loadButton) {

    loadButton.addEventListener(
        "click",
        loadGame
    );

}


if (characterButton) {

    characterButton.addEventListener(
        "click",
        showCharacter
    );

}


if (closeCharacter) {

    closeCharacter.addEventListener(
        "click",
        function() {

            if (characterModal) {

                characterModal.classList.add(
                    "hidden"
                );

            }

        }
    );

}


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
        toggleInventory
    );

}


/* =========================================================
   ZAR BUTONU
========================================================= */

if (rollButton) {

    rollButton.addEventListener(
        "click",
        rollD20
    );

}


/* =========================================================
   ENTER TUŞU
========================================================= */

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


/* =========================================================
   KARAKTER OLUŞTURMA BUTONU
========================================================= */

if (createCharacterButton) {

    createCharacterButton.addEventListener(
        "click",
        createCharacter
    );

}


/* =========================================================
   OYUNU BAŞLAT
========================================================= */

function startGame() {

    console.log(
        "Realm of Shadows başlatıldı."
    );


    console.log(
        game
    );


    updateCharacterUI();

    updateWorldUI();

    updateInventoryUI();

    updateQuestUI();


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

}


/* =========================================================
   BAŞLANGIÇ
========================================================= */

initializeWorld();

startGame();

console.log(
    "🎮 Realm of Shadows hazır."
);
