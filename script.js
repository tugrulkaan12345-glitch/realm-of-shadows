/* =========================================================
   REALM OF SHADOWS
   TEK PARÇA OYUN MOTORU
========================================================= */


/* =========================================================
   1. OYUN VERİSİ
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
                quantity: 1
            },

            {
                id: "potion",
                name: "Şifa İksiri",
                type: "consumable",
                quantity: 2
            },

            {
                id: "torch",
                name: "Meşale",
                type: "utility",
                quantity: 3
            }

        ],

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
   2. SAYFA ELEMANLARI
========================================================= */

const elements = {

    playerInput:
        document.getElementById("playerInput"),

    actionButton:
        document.getElementById("actionButton"),

    saveButton:
        document.getElementById("saveButton"),

    loadButton:
        document.getElementById("loadButton"),

    characterButton:
        document.getElementById("characterButton"),

    inventoryButton:
        document.getElementById("inventoryButton"),

    characterModal:
        document.getElementById("characterModal"),

    closeCharacter:
        document.getElementById("closeCharacter"),

    characterInfo:
        document.getElementById("characterInfo"),

    inventory:
        document.getElementById("inventory"),

    inventoryCount:
        document.getElementById("inventoryCount"),

    quests:
        document.getElementById("quests"),

    questCount:
        document.getElementById("questCount"),

    diceResult:
        document.getElementById("diceResult"),

    rollButton:
        document.getElementById("rollButton"),

    story:
        document.getElementById("story"),

    location:
        document.getElementById("location"),

    characterName:
        document.getElementById("characterName"),

    characterClass:
        document.getElementById("characterClass"),

    hp:
        document.getElementById("hp"),

    level:
        document.getElementById("level"),

    xp:
        document.getElementById("xp"),

    gold:
        document.getElementById("gold"),

    strength:
        document.getElementById("strength"),

    dexterity:
        document.getElementById("dexterity"),

    constitution:
        document.getElementById("constitution"),

    intelligence:
        document.getElementById("intelligence"),

    wisdom:
        document.getElementById("wisdom"),

    charisma:
        document.getElementById("charisma"),

    nameInput:
        document.getElementById("nameInput"),

    raceInput:
        document.getElementById("raceInput"),

    classInput:
        document.getElementById("classInput"),

    backgroundInput:
        document.getElementById("backgroundInput"),

    createCharacter:
        document.getElementById("createCharacter")

};


/* =========================================================
   3. HTML GÜVENLİĞİ
========================================================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        String(text);

    return div.innerHTML;

}


/* =========================================================
   4. HİKAYE MESAJI
========================================================= */

function addStoryMessage(
    text,
    type = "dm"
) {

    if (!elements.story) {

        console.error(
            "❌ #story bulunamadı."
        );

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

    elements.story.appendChild(message);


    elements.story.scrollTop =
        elements.story.scrollHeight;

}


/* =========================================================
   5. KARAKTER ARAYÜZÜ
========================================================= */

function updateCharacterUI() {

    if (elements.characterName) {

        elements.characterName.textContent =
            game.player.name;

    }


    if (elements.characterClass) {

        elements.characterClass.textContent =
            `${game.player.race} ${game.player.className}`;

    }


    if (elements.hp) {

        elements.hp.textContent =
            `${game.player.hp} / ${game.player.maxHp}`;

    }


    if (elements.level) {

        elements.level.textContent =
            game.player.level;

    }


    if (elements.xp) {

        elements.xp.textContent =
            game.player.xp;

    }


    if (elements.gold) {

        elements.gold.textContent =
            game.player.gold;

    }


    updateStat(
        elements.strength,
        game.player.stats.strength
    );

    updateStat(
        elements.dexterity,
        game.player.stats.dexterity
    );

    updateStat(
        elements.constitution,
        game.player.stats.constitution
    );

    updateStat(
        elements.intelligence,
        game.player.stats.intelligence
    );

    updateStat(
        elements.wisdom,
        game.player.stats.wisdom
    );

    updateStat(
        elements.charisma,
        game.player.stats.charisma
    );

}


/* =========================================================
   6. STAT GÜNCELLE
========================================================= */

function updateStat(
    element,
    value
) {

    if (!element) {
        return;
    }

    element.textContent =
        value;

}


/* =========================================================
   7. KARAKTER PANELİ
========================================================= */

function showCharacter() {

    if (!elements.characterModal) {

        console.error(
            "❌ characterModal bulunamadı."
        );

        return;

    }


    updateCharacterInfo();


    elements.characterModal
        .classList
        .remove("hidden");

}


/* =========================================================
   8. KARAKTER BİLGİSİ
========================================================= */

function updateCharacterInfo() {

    if (!elements.characterInfo) {
        return;
    }


    const p =
        game.player;


    elements.characterInfo.innerHTML = `

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
            ${p.hp} / ${p.maxHp}
        </p>

        <hr>

        <p>
            <strong>Güç:</strong>
            ${p.stats.strength}
        </p>

        <p>
            <strong>Çeviklik:</strong>
            ${p.stats.dexterity}
        </p>

        <p>
            <strong>Dayanıklılık:</strong>
            ${p.stats.constitution}
        </p>

        <p>
            <strong>Zeka:</strong>
            ${p.stats.intelligence}
        </p>

        <p>
            <strong>Bilgelik:</strong>
            ${p.stats.wisdom}
        </p>

        <p>
            <strong>Karizma:</strong>
            ${p.stats.charisma}
        </p>

        <hr>

        <p>
            <strong>Altın:</strong>
            ${p.gold}
        </p>

    `;

}


/* =========================================================
   9. KARAKTER MODALINI KAPAT
========================================================= */

function closeCharacterModal() {

    if (!elements.characterModal) {
        return;
    }

    elements.characterModal
        .classList
        .add("hidden");

}


/* =========================================================
   10. SINIF İSTATİSTİKLERİ
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
   11. IRK BONUSLARI
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
   12. KARAKTER OLUŞTUR
========================================================= */

function createCharacter() {

    if (
        !elements.nameInput ||
        !elements.raceInput ||
        !elements.classInput ||
        !elements.backgroundInput
    ) {

        console.error(
            "❌ Karakter form elemanları eksik."
        );

        return;

    }


    const name =
        elements.nameInput.value.trim();

    const race =
        elements.raceInput.value;

    const className =
        elements.classInput.value;

    const background =
        elements.backgroundInput.value;


    if (!name) {

        alert(
            "Önce karakterine bir isim vermelisin."
        );

        elements.nameInput.focus();

        return;

    }


    const baseStats =
        classStats[className];

    const bonuses =
        raceBonuses[race];


    if (!baseStats || !bonuses) {

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


    game.player.maxHp =
        baseStats.maxHp;

    game.player.hp =
        baseStats.maxHp;


    updateCharacterUI();

    updateCharacterInfo();


    closeCharacterModal();


    addStoryMessage(

        `
        <b>⚔️ Karakter oluşturuldu.</b>

        <br><br>

        <b>${escapeHTML(name)}</b>,
        artık Realm of Shadows dünyasına
        adım atıyor.

        <br><br>

        <b>Irk:</b>
        ${escapeHTML(race)}

        <br>

        <b>Sınıf:</b>
        ${escapeHTML(className)}

        <br>

        <b>Geçmiş:</b>
        ${escapeHTML(background)}

        <br><br>

        Bundan sonra vereceğin kararlar
        karakterinin kaderini şekillendirecek.

        `,

        "dm"

    );

}


/* =========================================================
   13. ENVANTER
========================================================= */

function updateInventoryUI() {

    console.log(
        "📦 Envanter güncelleniyor..."
    );


    if (!elements.inventory) {

        console.error(
            "❌ #inventory bulunamadı."
        );

        return;

    }


    const inventory =
        Array.isArray(
            game.player.inventory
        )
            ? game.player.inventory
            : [];


    elements.inventory.innerHTML = "";


    if (elements.inventoryCount) {

        const total =
            inventory.reduce(
                function(sum, item) {

                    return sum +
                        Number(item.quantity || 1);

                },
                0
            );


        elements.inventoryCount.textContent =
            total;

    }


    if (inventory.length === 0) {

        elements.inventory.innerHTML = `

            <p class="empty">
                Envanter boş.
            </p>

        `;

        return;

    }


    inventory.forEach(
        function(item) {

            const itemElement =
                document.createElement("div");


            itemElement.className =
                "inventory-item";


            let icon =
                "📦";


            if (item.type === "weapon") {

                icon =
                    "⚔️";

            }

            else if (
                item.type === "consumable"
            ) {

                icon =
                    "🧪";

            }

            else if (
                item.type === "utility"
            ) {

                icon =
                    "🔥";

            }


            const damageHTML =
                item.damage
                    ? `
                        <span>
                            Hasar: ${escapeHTML(item.damage)}
                        </span>
                    `
                    : "";


            itemElement.innerHTML = `

                <div class="inventory-item-icon">
                    ${icon}
                </div>

                <div class="inventory-item-info">

                    <strong>
                        ${escapeHTML(item.name)}
                    </strong>

                    <span>
                        Adet:
                        ${Number(item.quantity || 1)}
                    </span>

                    ${damageHTML}

                </div>

            `;


            elements.inventory.appendChild(
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
   14. ENVANTER BUTONU
========================================================= */

function toggleInventory() {

    console.log(
        "🎒 ENVANTER BUTONUNA BASILDI"
    );


    updateInventoryUI();


    const rightPanel =
        elements.inventory
            ? elements.inventory.closest(".side-card")
            : null;


    if (rightPanel) {

        rightPanel.classList.toggle(
            "inventory-active"
        );

    }

}


/* =========================================================
   15. GÖREV SİSTEMİ
========================================================= */

function createQuest(data) {

    if (!data || !data.id) {
        return null;
    }


    const existing =
        game.quests.find(
            quest =>
                quest.id === data.id
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
            data.reward || 0,

        status:
            "active",

        createdAt:
            new Date().toISOString()

    };


    game.quests.push(
        quest
    );


    return quest;

}


/* =========================================================
   16. BAŞLANGIÇ GÖREVLERİ
========================================================= */

function initializeQuests() {

    createQuest({

        id:
            "blackmoor_whispers",

        title:
            "Blackmoor'un Fısıltıları",

        description:
            "Köy kuyusundan gelen gizemli seslerin kaynağını araştır.",

        objectives: [

            {
                id:
                    "visit_well",

                text:
                    "Köy kuyusunu araştır."

            },

            {
                id:
                    "learn_secret",

                text:
                    "Kuyunun sırrı hakkında bilgi edin."

            }

        ],

        reward:
            100

    });


    createQuest({

        id:
            "missing_person",

        title:
            "Kayıp Köylü",

        description:
            "Blackmoor'da kaybolan kişinin izini araştır.",

        objectives: [

            {
                id:
                    "talk_healer",

                text:
                    "Mara ile konuş."

            },

            {
                id:
                    "find_clue",

                text:
                    "Kaybolan kişiye ait bir ipucu bul."

            }

        ],

        reward:
            150

    });

}


/* =========================================================
   17. GÖREV ARAYÜZÜ
========================================================= */

function updateQuestUI() {

    if (!elements.quests) {

        console.error(
            "❌ #quests bulunamadı."
        );

        return;

    }


    const quests =
        Array.isArray(game.quests)
            ? game.quests
            : [];


    elements.quests.innerHTML = "";


    if (elements.questCount) {

        elements.questCount.textContent =
            quests.length;

    }


    if (quests.length === 0) {

        elements.quests.innerHTML = `

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


            const objectives =
                quest.objectives
                    .map(
                        function(objective) {

                            return `

                                <div
                                    class="
                                        quest-objective
                                        ${objective.completed
                                            ? "completed"
                                            : ""}
                                    "
                                >

                                    ${
                                        objective.completed
                                            ? "☑️"
                                            : "⬜"
                                    }

                                    ${escapeHTML(
                                        objective.text
                                    )}

                                </div>

                            `;

                        }
                    )
                    .join("");


            questElement.innerHTML = `

                <div class="quest-title">

                    📜
                    ${escapeHTML(quest.title)}

                </div>


                <div class="quest-description">

                    ${escapeHTML(
                        quest.description
                    )}

                </div>


                ${objectives}

            `;


            elements.quests.appendChild(
                questElement
            );

        }
    );

}


/* =========================================================
   18. NPC SİSTEMİ
========================================================= */

function createNPC(data) {

    if (!data || !data.id) {
        return null;
    }


    const existing =
        game.npcs.find(
            npc =>
                npc.id === data.id
        );


    if (existing) {

        return existing;

    }


    const npc = {

        id:
            data.id,

        name:
            data.name,

        role:
            data.role,

        personality:
            data.personality,

        location:
            data.location,

        trust:
            data.trust || 0,

        secrets:
            data.secrets || [],

        knowledge:
            data.knowledge || [],

        relationshipHistory:
            []

    };


    game.npcs.push(
        npc
    );


    return npc;

}


/* =========================================================
   19. NPC BAŞLANGICI
========================================================= */

function initializeNPCs() {

    createNPC({

        id:
            "elder_jonas",

        name:
            "Jonas",

        role:
            "Yaşlı Köylü",

        personality:
            "Şüpheci, korkak fakat köyünü korumaya çalışan biri.",

        location:
            "Blackmoor Köyü",

        trust:
            0,

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

        id:
            "healer_mara",

        name:
            "Mara",

        role:
            "Şifacı",

        personality:
            "Sakin, yardımsever ve dikkatli.",

        location:
            "Blackmoor Köyü",

        trust:
            5,

        secrets: [

            "Kardeşi birkaç gün önce ortadan kayboldu."

        ],

        knowledge: [

            "Kardeşinin son kez kilise yakınında görüldüğünü biliyor.",

            "Köyün eski rahibinden korkuyor."

        ]

    });


    createNPC({

        id:
            "blacksmith_aldric",

        name:
            "Aldric",

        role:
            "Demirci",

        personality:
            "Sert konuşan, gururlu ve çalışkan.",

        location:
            "Blackmoor Köyü",

        trust:
            0,

        secrets: [

            "Köyün altında eski tüneller olduğunu biliyor."

        ],

        knowledge: [

            "Son haftalarda ormandan garip sesler geliyor."

        ]

    });

}


/* =========================================================
   20. KONUM
========================================================= */

function changeLocation(
    newLocation
) {

    const oldLocation =
        game.world.location;


    if (
        oldLocation ===
        newLocation
    ) {

        return;

    }


    game.world.location =
        newLocation;


    if (
        !game.story.discoveredLocations
            .includes(newLocation)
    ) {

        game.story.discoveredLocations
            .push(newLocation);

    }


    game.story.events.push({

        type:
            "location_change",

        from:
            oldLocation,

        to:
            newLocation,

        timestamp:
            new Date().toISOString()

    });


    updateWorldUI();

}


/* =========================================================
   21. DÜNYA ARAYÜZÜ
========================================================= */

function updateWorldUI() {

    if (elements.location) {

        elements.location.textContent =
            game.world.location;

    }

}


/* =========================================================
   22. D20
========================================================= */

function rollD20() {

    const result =
        Math.floor(
            Math.random() * 20
        ) + 1;


    if (elements.diceResult) {

        elements.diceResult.textContent =
            result;

    }


    let message;


    if (result === 20) {

        message =
            "🎲 <b>KRİTİK BAŞARI!</b> Zar 20 geldi.";

    }

    else if (result === 1) {

        message =
            "🎲 <b>KRİTİK BAŞARISIZLIK!</b> Zar 1 geldi.";

    }

    else {

        message =
            `🎲 Zar atıldı: <b>${result}</b>`;

    }


    addStoryMessage(
        message,
        "dm"
    );


    game.story.events.push({

        type:
            "dice_roll",

        result:
            result,

        timestamp:
            new Date().toISOString()

    });

}


/* =========================================================
   23. OYUNCU EYLEMİ
========================================================= */

function playerAction() {

    if (!elements.playerInput) {

        console.error(
            "❌ playerInput bulunamadı."
        );

        return;

    }


    const text =
        elements.playerInput.value.trim();


    if (!text) {
        return;
    }


    addStoryMessage(
        escapeHTML(text),
        "player"
    );


    game.story.actions.push({

        text:
            text,

        location:
            game.world.location,

        time:
            game.world.time,

        timestamp:
            new Date().toISOString()

    });


    elements.playerInput.value =
        "";


    dungeonMaster(
        text
    );

}


/* =========================================================
   24. DUNGEON MASTER
========================================================= */

function dungeonMaster(
    action
) {

    const lower =
        action.toLocaleLowerCase(
            "tr-TR"
        );


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


    /* MARA */

    else if (

        lower.includes("mara") ||

        lower.includes("şifacı")

    ) {

        completeQuestObjective(
            "missing_person",
            "talk_healer"
        );


        response = `

            Şifacı Mara sana dikkatlice bakıyor.

            <br><br>

            <i>
            "Kardeşim birkaç gün önce kayboldu."
            </i>

            <br><br>

            Sesindeki korkuyu saklamaya çalışıyor.

            <br><br>

            "Onu en son kilisenin yakınında gördüler."

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

            <i>
            "Bu gece burada fazla dolaşma."
            </i>

        `;

    }


    /* ENVANTER */

    else if (

        lower.includes("envanter") ||

        lower.includes("eşyalarım") ||

        lower.includes("çantam")

    ) {

        updateInventoryUI();


        response = `

            Çantandaki eşyalara göz atıyorsun.

            <br><br>

            Envanterinde
            <b>${game.player.inventory.length}</b>
            farklı eşya bulunuyor.

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

        action:
            action,

        response:
            response,

        location:
            game.world.location,

        timestamp:
            new Date().toISOString()

    });


    updateAllUI();

}


/* =========================================================
   25. GENEL CEVAPLAR
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
            Math.random() *
            responses.length
        )
    ];

}


/* =========================================================
   26. GÖREV HEDEFİ TAMAMLA
========================================================= */

function completeQuestObjective(
    questId,
    objectiveId
) {

    const quest =
        game.quests.find(
            q =>
                q.id === questId
        );


    if (!quest) {
        return;
    }


    const objective =
        quest.objectives.find(
            o =>
                o.id === objectiveId
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
            o =>
                o.completed
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

            <b>
            ${escapeHTML(quest.title)}
            </b>

            <br><br>

            Ödül:
            <b>${quest.reward} XP</b>

            `,

            "dm"

        );

    }


    updateQuestUI();

    updateCharacterUI();

}


/* =========================================================
   27. KAYDET
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

        console.log(
            "💾 Oyun kaydedildi."
        );

    }

    catch (error) {

        console.error(
            "❌ Kayıt hatası:",
            error
        );

        addStoryMessage(
            "❌ Oyun kaydedilemedi.",
            "dm"
        );

    }

}


/* =========================================================
   28. YÜKLE
========================================================= */

function loadGame() {

    try {

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


        const loaded =
            JSON.parse(saved);


        if (loaded.player) {

            game.player =
                loaded.player;

        }


        if (loaded.world) {

            game.world =
                loaded.world;

        }


        if (loaded.npcs) {

            game.npcs =
                loaded.npcs;

        }


        if (loaded.quests) {

            game.quests =
                loaded.quests;

        }


        if (loaded.story) {

            game.story =
                loaded.story;

        }


        if (loaded.combat) {

            game.combat =
                loaded.combat;

        }


        if (loaded.ai) {

            game.ai =
                loaded.ai;

        }


        updateAllUI();


        addStoryMessage(
            "📂 Kaydedilmiş macera geri yüklendi.",
            "dm"
        );


        console.log(
            "📂 Oyun yüklendi:",
            game
        );

    }

    catch (error) {

        console.error(
            "❌ Yükleme hatası:",
            error
        );

        addStoryMessage(
            "❌ Kayıt dosyası okunamadı.",
            "dm"
        );

    }

}


/* =========================================================
   29. TÜM ARAYÜZÜ GÜNCELLE
========================================================= */

function updateAllUI() {

    updateCharacterUI();

    updateCharacterInfo();

    updateInventoryUI();

    updateQuestUI();

    updateWorldUI();

}


/* =========================================================
   30. DÜNYAYI HAZIRLA
========================================================= */

function initializeWorld() {

    initializeNPCs();

    initializeQuests();

}


/* =========================================================
   31. BAŞLANGIÇ HİKAYESİ
========================================================= */

function startGame() {

    console.log(
        "⚔️ Realm of Shadows başlatıldı."
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

        <br><br>

        <i>
        Ne yapacaksın?
        </i>

        `,

        "dm"

    );

}


/* =========================================================
   32. EVENT LISTENER'LAR
========================================================= */


/* KARAKTER */

if (elements.characterButton) {

    elements.characterButton
        .addEventListener(
            "click",
            showCharacter
        );

}


/* KARAKTER KAPAT */

if (elements.closeCharacter) {

    elements.closeCharacter
        .addEventListener(
            "click",
            closeCharacterModal
        );

}


/* MODAL DIŞINA TIKLAMA */

if (elements.characterModal) {

    elements.characterModal
        .addEventListener(
            "click",
            function(event) {

                if (
                    event.target ===
                    elements.characterModal
                ) {

                    closeCharacterModal();

                }

            }
        );

}


/* ENVANTER */

if (elements.inventoryButton) {

    elements.inventoryButton
        .addEventListener(
            "click",
            toggleInventory
        );

}


/* EYLEM */

if (elements.actionButton) {

    elements.actionButton
        .addEventListener(
            "click",
            playerAction
        );

}


/* ENTER */

if (elements.playerInput) {

    elements.playerInput
        .addEventListener(
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


/* KAYDET */

if (elements.saveButton) {

    elements.saveButton
        .addEventListener(
            "click",
            saveGame
        );

}


/* YÜKLE */

if (elements.loadButton) {

    elements.loadButton
        .addEventListener(
            "click",
            loadGame
        );

}


/* ZAR */

if (elements.rollButton) {

    elements.rollButton
        .addEventListener(
            "click",
            rollD20
        );

}


/* KARAKTER OLUŞTUR */

if (elements.createCharacter) {

    elements.createCharacter
        .addEventListener(
            "click",
            createCharacter
        );

}


/* ESC */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape" &&
            elements.characterModal &&
            !elements.characterModal
                .classList
                .contains("hidden")
        ) {

            closeCharacterModal();

        }

    }
);


/* =========================================================
   33. BAŞLANGIÇ
========================================================= */

initializeWorld();

updateAllUI();

startGame();


console.log(
    "================================="
);

console.log(
    "REALM OF SHADOWS HAZIR"
);

console.log(
    "Envanter:",
    game.player.inventory
);

console.log(
    "Görevler:",
    game.quests
);

console.log(
    "NPC:",
    game.npcs
);

console.log(
    "================================="
);
