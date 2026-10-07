/* =========================================================
   REALM OF SHADOWS
   TEMEL OYUN MOTORU
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

const playerInput =
    document.getElementById("playerInput");

const actionButton =
    document.querySelector(".action-button");

const saveButton =
    document.getElementById("saveButton");

const loadButton =
    document.getElementById("loadButton");


/* =========================================================
   MESAJ GÖSTERME
========================================================= */

function addStoryMessage(text, type) {

    const story =
        document.querySelector(".story");

    if (!story) {

        console.error("Story alanı bulunamadı.");

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

    } else {

        author.textContent =
            "🎲 Dungeon Master";

    }


    const content =
        document.createElement("p");

    content.innerHTML = text;


    message.appendChild(author);

    message.appendChild(content);

    story.appendChild(message);


    story.scrollTop =
        story.scrollHeight;

}


/* =========================================================
   HTML GÜVENLİĞİ
========================================================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


/* =========================================================
   OYUNCU EYLEMİ
========================================================= */

function playerAction() {

    if (!playerInput) {

        console.error(
            "playerInput bulunamadı."
        );

        return;

    }


    const text =
        playerInput.value.trim();


    if (!text) {

        return;

    }


    /* Oyuncunun mesajını ekrana yaz */

    addStoryMessage(
        escapeHTML(text),
        "player"
    );


    /* Hafızaya kaydet */

    game.story.actions.push({

        text: text,

        location:
            game.world.location,

        time:
            game.world.time,

        timestamp:
            new Date().toISOString()

    });


    /* Kutuyu temizle */

    playerInput.value = "";


    /* Dungeon Master */

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

        game.story.flags.well = true;


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

        game.story.flags.church = true;


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
   KONUM GÜNCELLE
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
   DÜNYA ARAYÜZİ
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
   NPC'LER
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
   KAYDET
========================================================= */

function saveGame() {

    localStorage.setItem(
        "realmOfShadowsSave",
        JSON.stringify(game)
    );


    addStoryMessage(
        "Oyun kaydedildi.",
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
            "Kaydedilmiş bir oyun bulunamadı.",
            "dm"
        );

        return;

    }


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


    updateWorldUI();


    addStoryMessage(
        "Kaydedilmiş macera geri yüklendi.",
        "dm"
    );

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
   OYUNU BAŞLAT
========================================================= */

function startGame() {

    console.log(
        "Realm of Shadows başlatıldı."
    );


    console.log(game);


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
/* =========================================================
   KARAKTER PANELİ
========================================================= */

const characterButton =
    document.getElementById("characterButton");

const characterModal =
    document.getElementById("characterModal");

const closeCharacter =
    document.getElementById("closeCharacter");

const characterInfo =
    document.getElementById("characterInfo");


function showCharacter() {

    if (!characterInfo) {
        return;
    }

    characterInfo.innerHTML = `

        <p>
            <strong>İsim:</strong>
            ${game.player.name}
        </p>

        <p>
            <strong>Irk:</strong>
            ${game.player.race}
        </p>

        <p>
            <strong>Sınıf:</strong>
            ${game.player.className}
        </p>

        <p>
            <strong>Geçmiş:</strong>
            ${game.player.background}
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


    characterModal.classList.remove("hidden");

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

            characterModal.classList.add("hidden");

        }
    );

}


if (characterModal) {

    characterModal.addEventListener(
        "click",
        function(event) {

            if (event.target === characterModal) {

                characterModal.classList.add("hidden");

            }
           

        }
    );

}
/* =========================================================
   KARAKTER OLUŞTURMA SİSTEMİ
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
   KARAKTERİ OLUŞTUR
========================================================= */

function createCharacter() {

    const name =
        nameInput.value.trim();

    const race =
        raceInput.value;

    const className =
        classInput.value;

    const background =
        backgroundInput.value;


    /* İsim kontrolü */

    if (!name) {

        alert(
            "Önce karakterine bir isim vermelisin."
        );

        nameInput.focus();

        return;

    }


    /* Sınıf özelliklerini al */

    const baseStats =
        classStats[className];


    /* Irk bonuslarını al */

    const bonuses =
        raceBonuses[race];


    /* Özellikleri oluştur */

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


    /* Oyuncuyu güncelle */

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


    /* Karakter panelini güncelle */

    updateCharacterUI();


    /* Karakter penceresini kapat */

    characterModal.classList.add(
        "hidden"
    );


    /* Oyuncuya bilgi ver */

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
   TEK STAT GÜNCELLE
========================================================= */

function updateStat(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent =
            value;

    }

}


/* =========================================================
   KARAKTER OLUŞTUR BUTONU
========================================================= */

if (createCharacterButton) {

    createCharacterButton.addEventListener(
        "click",
        createCharacter
    );

}
console.log("SCRIPT ÇALIŞIYOR");

const testCharacterButton =
    document.getElementById("characterButton");

const testCharacterModal =
    document.getElementById("characterModal");

console.log("Karakter butonu:", testCharacterButton);
console.log("Karakter modalı:", testCharacterModal);

if (testCharacterButton && testCharacterModal) {

    testCharacterButton.addEventListener("click", function () {

        console.log("KARAKTER BUTONUNA BASILDI");

        testCharacterModal.classList.remove("hidden");

    });

}
/* =========================================================
   ENVANTER SİSTEMİ
========================================================= */

const inventoryButton =
    document.getElementById("inventoryButton");

const inventoryPanel =
    document.getElementById("inventory");


/* =========================================================
   ENVANTERİ GÖSTER
========================================================= */

function updateInventoryUI() {

    if (!inventoryPanel) {
        console.error("Envanter alanı bulunamadı.");
        return;
    }


    inventoryPanel.innerHTML = "";


    if (
        !game.player.inventory ||
        game.player.inventory.length === 0
    ) {

        inventoryPanel.innerHTML = `
            <p class="empty">
                Envanter boş.
            </p>
        `;

        return;

    }


    game.player.inventory.forEach(function(item) {

        const itemElement =
            document.createElement("div");

        itemElement.classList.add(
            "inventory-item"
        );


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
                    ? `<span>Hasar: ${item.damage}</span>`
                    : ""
                }

            </div>

        `;


        inventoryPanel.appendChild(
            itemElement
        );

    });

}


/* =========================================================
   ENVANTER BUTONU
========================================================= */

if (inventoryButton) {

    inventoryButton.addEventListener(
        "click",
        function() {

            console.log(
                "ENVANTER BUTONUNA BASILDI"
            );

            updateInventoryUI();

        }
    );

}


/* =========================================================
   OYUN BAŞLANGICINDA ENVANTERİ YÜKLE
========================================================= */

updateInventoryUI();



