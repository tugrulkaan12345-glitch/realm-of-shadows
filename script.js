/* =========================================================
   REALM OF SHADOWS
   TEMEL OYUN MOTORU
   TEMİZ / STABİL SÜRÜM
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
   SAYFA ELEMANLARI
========================================================= */

const elements = {

    playerInput:
        document.getElementById("playerInput"),

    actionButton:
        document.querySelector(".action-button"),

    saveButton:
        document.getElementById("saveButton"),

    loadButton:
        document.getElementById("loadButton"),

    characterButton:
        document.getElementById("characterButton"),

    characterModal:
        document.getElementById("characterModal"),

    closeCharacter:
        document.getElementById("closeCharacter"),

    characterInfo:
        document.getElementById("characterInfo"),

    inventoryButton:
        document.getElementById("inventoryButton"),

    inventoryPanel:
        document.getElementById("inventory"),

    nameInput:
        document.getElementById("nameInput"),

    raceInput:
        document.getElementById("raceInput"),

    classInput:
        document.getElementById("classInput"),

    backgroundInput:
        document.getElementById("backgroundInput"),

    createCharacterButton:
        document.getElementById("createCharacter")

};


/* =========================================================
   DEBUG
========================================================= */

console.log("=================================");
console.log("REALM OF SHADOWS");
console.log("SCRIPT BAŞLATILDI");
console.log("=================================");

console.log("Karakter butonu:", elements.characterButton);
console.log("Karakter modalı:", elements.characterModal);
console.log("Envanter butonu:", elements.inventoryButton);
console.log("Envanter alanı:", elements.inventoryPanel);


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
   HATA KONTROLÜ
========================================================= */

function elementExists(element, name) {

    if (!element) {

        console.warn(
            `${name} bulunamadı. HTML ID'sini kontrol et.`
        );

        return false;

    }

    return true;

}


/* =========================================================
   HİKÂYE MESAJI
========================================================= */

function addStoryMessage(text, type = "dm") {

    const story =
        document.querySelector(".story");


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
   OYUNCU EYLEMİ
========================================================= */

function playerAction() {

    if (
        !elementExists(
            elements.playerInput,
            "playerInput"
        )
    ) {

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

        text: text,

        location:
            game.world.location,

        time:
            game.world.time,

        timestamp:
            new Date().toISOString()

    });


    elements.playerInput.value = "";


    dungeonMaster(text);

}


/* =========================================================
   DUNGEON MASTER
========================================================= */

function dungeonMaster(action) {

    const lower =
        action.toLowerCase();


    let response;


    /* -----------------------------------------------------
       KUYU
    ----------------------------------------------------- */

    if (

        lower.includes("kuyu") ||

        lower.includes("aşağı") ||

        lower.includes("dinliyorum")

    ) {

        game.story.flags.well =
            true;


        response = `

            Kuyunun taş kenarına yaklaşıyorsun.

            <br><br>

            Yağmur taşların üzerinde küçük nehirler
            oluştururken aşağıdan belli belirsiz bir ses
            yükseliyor.

            <br><br>

            Önce bunun rüzgâr olduğunu düşünüyorsun.

            <br><br>

            Fakat birkaç saniye sonra aynı fısıltıyı
            tekrar duyuyorsun.

            <br><br>

            <i>"Beni bul..."</i>

        `;

    }


    /* -----------------------------------------------------
       KİLİSE
    ----------------------------------------------------- */

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

            <br><br>

            Aralıktan içeride çok zayıf bir mum ışığı
            süzülüyor.

            <br><br>

            İçeride biri varmış gibi hissediyorsun.

        `;

    }


    /* -----------------------------------------------------
       ORMAN
    ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       KÖYLÜ
    ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       GENEL
    ----------------------------------------------------- */

    else {

        response =
            randomGenericResponse();

    }


    addStoryMessage(
        response,
        "dm"
    );


    game.story.events.push({

        type: "player_action",

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
   DÜNYA ARAYÜZÜ
========================================================= */

function updateWorldUI() {

    const location =
        document.querySelector(
            ".location strong"
        );


    if (location) {

        location.textContent =
            game.world.location;

    }

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
   DÜNYAYI HAZIRLA
========================================================= */

function initializeWorld() {

    initializeNPCs();

    initializeQuests();

}


/* =========================================================
   KARAKTER SINIFLARI
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
        !elements.nameInput ||
        !elements.raceInput ||
        !elements.classInput ||
        !elements.backgroundInput
    ) {

        console.error(
            "Karakter oluşturma alanlarından biri bulunamadı."
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
            "Geçersiz ırk veya sınıf seçildi."
        );

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


    updateCharacterUI();

    updateInventoryUI();


    if (elements.characterModal) {

        elements.characterModal.classList.add(
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

        <br><br>

        Bundan sonra vereceğin kararlar
        bu karakterin hikâyesini şekillendirecek.

        `,

        "dm"

    );


    console.log(
        "Yeni karakter:",
        game.player
    );

}


/* =========================================================
   KARAKTER PANELİ
========================================================= */

function showCharacter() {

    if (!elements.characterInfo) {

        console.error(
            "characterInfo bulunamadı."
        );

        return;

    }


    elements.characterInfo.innerHTML = `

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
            <strong>Anayasa:</strong>
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


    elements.characterModal?.classList.remove(
        "hidden"
    );

}


/* =========================================================
   KARAKTER ARAYÜZÜ
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
        document.getElementById(
            "hp"
        );


    const levelElement =
        document.getElementById(
            "level"
        );


    const xpElement =
        document.getElementById(
            "xp"
        );


    const goldElement =
        document.getElementById(
            "gold"
        );


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

function updateInventoryUI() {

    const inventory =
        elements.inventoryPanel;


    if (!inventory) {

        console.error(
            "❌ ENVANTER: #inventory bulunamadı."
        );

        return;

    }


    console.log(
        "📦 Envanter güncelleniyor..."
    );


    inventory.innerHTML = "";


    const items =
        Array.isArray(game.player.inventory)
            ? game.player.inventory
            : [];


    if (items.length === 0) {

        inventory.innerHTML = `

            <div class="inventory-empty">

                <div class="inventory-empty-icon">
                    🎒
                </div>

                <p>
                    Envanter boş.
                </p>

            </div>

        `;

        return;

    }


    items.forEach(function(item) {

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

        else if (item.type === "consumable") {

            icon =
                "🧪";

        }

        else if (item.type === "utility") {

            icon =
                "🔥";

        }


        const itemName =
            escapeHTML(
                item.name || "Bilinmeyen Eşya"
            );


        const quantity =
            Number(item.quantity) || 0;


        const damage =
            item.damage
                ? `<span>Hasar: ${escapeHTML(item.damage)}</span>`
                : "";


        itemElement.innerHTML = `

            <div class="inventory-item-icon">
                ${icon}
            </div>

            <div class="inventory-item-info">

                <strong>
                    ${itemName}
                </strong>

                <span>
                    Adet: ${quantity}
                </span>

                ${damage}

            </div>

        `;


        inventory.appendChild(
            itemElement
        );

    });


    console.log(
        "📦 Envanter hazır:",
        items
    );

}


/* =========================================================
   ENVANTERİ AÇ / KAPAT
========================================================= */

function toggleInventory() {

    const inventory =
        elements.inventoryPanel;


    if (!inventory) {

        console.error(
            "❌ Envanter paneli bulunamadı."
        );

        return;

    }


    console.log(
        "🎒 ENVANTER BUTONUNA BASILDI"
    );


    updateInventoryUI();


    inventory.classList.toggle(
        "hidden"
    );


    const isOpen =
        !inventory.classList.contains(
            "hidden"
        );


    console.log(
        "Envanter açık mı:",
        isOpen
    );

}


/* =========================================================
   ENVANTER KAPAT
========================================================= */

function closeInventory() {

    if (!elements.inventoryPanel) {

        return;

    }


    elements.inventoryPanel.classList.add(
        "hidden"
    );

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
            "💾 Oyun kaydedildi.",
            "dm"
        );


        console.log(
            "Oyun kaydedildi."
        );

    }

    catch (error) {

        console.error(
            "Oyun kaydedilemedi:",
            error
        );


        addStoryMessage(
            "Oyun kaydedilirken bir hata oluştu.",
            "dm"
        );

    }

}


/* =========================================================
   YÜKLE
========================================================= */

function loadGame() {

    try {

        const savedGame =
            localStorage.getItem(
                "realmOfShadowsSave"
            );


        if (!savedGame) {

            addStoryMessage(
                "Kaydedilmiş bir oyun bulunamadı.",
                "dm"
            );

            return;

        }


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


        if (loadedGame.combat) {

            Object.assign(
                game.combat,
                loadedGame.combat
            );

        }


        if (loadedGame.ai) {

            Object.assign(
                game.ai,
                loadedGame.ai
            );

        }


        updateWorldUI();

        updateCharacterUI();

        updateInventoryUI();


        addStoryMessage(
            "📂 Kaydedilmiş macera geri yüklendi.",
            "dm"
        );


        console.log(
            "Oyun yüklendi:",
            game
        );

    }

    catch (error) {

        console.error(
            "Oyun yüklenemedi:",
            error
        );


        addStoryMessage(
            "Kayıt dosyası bozuk veya okunamadı.",
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
   OYUNU BAŞLAT
========================================================= */

function startGame() {

    console.log(
        "Realm of Shadows başlatıldı."
    );


    updateWorldUI();

    updateCharacterUI();

    updateInventoryUI();


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
   EVENT LISTENERLAR
========================================================= */

function initializeEventListeners() {

    /* -----------------------------------------------------
       AKSİYON BUTONU
    ----------------------------------------------------- */

    if (elements.actionButton) {

        elements.actionButton.addEventListener(
            "click",
            playerAction
        );

    }


    /* -----------------------------------------------------
       ENTER
    ----------------------------------------------------- */

    if (elements.playerInput) {

        elements.playerInput.addEventListener(
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


    /* -----------------------------------------------------
       KAYDET
    ----------------------------------------------------- */

    if (elements.saveButton) {

        elements.saveButton.addEventListener(
            "click",
            saveGame
        );

    }


    /* -----------------------------------------------------
       YÜKLE
    ----------------------------------------------------- */

    if (elements.loadButton) {

        elements.loadButton.addEventListener(
            "click",
            loadGame
        );

    }


    /* -----------------------------------------------------
       KARAKTER BUTONU
    ----------------------------------------------------- */

    if (elements.characterButton) {

        elements.characterButton.addEventListener(
            "click",
            function() {

                console.log(
                    "⚔️ KARAKTER BUTONUNA BASILDI"
                );


                showCharacter();

            }
        );

    }


    /* -----------------------------------------------------
       KARAKTER KAPAT
    ----------------------------------------------------- */

    if (elements.closeCharacter) {

        elements.closeCharacter.addEventListener(
            "click",
            function() {

                if (elements.characterModal) {

                    elements.characterModal.classList.add(
                        "hidden"
                    );

                }

            }
        );

    }


    /* -----------------------------------------------------
       MODAL DIŞINA TIKLAYINCA KAPAT
    ----------------------------------------------------- */

    if (elements.characterModal) {

        elements.characterModal.addEventListener(
            "click",
            function(event) {

                if (
                    event.target ===
                    elements.characterModal
                ) {

                    elements.characterModal.classList.add(
                        "hidden"
                    );

                }

            }
        );

    }


    /* -----------------------------------------------------
       KARAKTER OLUŞTUR
    ----------------------------------------------------- */

    if (elements.createCharacterButton) {

        elements.createCharacterButton.addEventListener(
            "click",
            createCharacter
        );

    }


    /* -----------------------------------------------------
       ENVANTER
    ----------------------------------------------------- */

    if (elements.inventoryButton) {

        elements.inventoryButton.addEventListener(
            "click",
            toggleInventory
        );

    }

    else {

        console.error(
            "❌ inventoryButton bulunamadı!"
        );

    }


    console.log(
        "Event listenerlar hazır."
    );

}


/* =========================================================
   UYGULAMAYI BAŞLAT
========================================================= */

function initializeGame() {

    console.log(
        "🎮 Oyun hazırlanıyor..."
    );


    initializeWorld();

    initializeEventListeners();

    startGame();


    console.log(
        "🎮 OYUN HAZIR."
    );

}


/* =========================================================
   BAŞLAT
========================================================= */

initializeGame();
