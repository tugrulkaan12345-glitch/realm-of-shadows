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

        season: "Sonbahar",

        description:
            "Eski krallıkların yıkıntıları arasında karanlık güçlerin yeniden hareketlendiği bir dünya."

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


    world: {

        location: "Blackmoor Köyü",

        weather: "Yağmurlu",

        time: "Gece",

        danger: 1

    },


    story: {

        chapter: 1,

        actions: [],

        events: [],

        flags: {}

    }

};


/* =========================================================
   SAYFA ELEMANLARI
========================================================= */

const playerInput =
    document.getElementById("playerInput");


/* =========================================================
   MESAJ GÖSTERME
========================================================= */

function addStoryMessage(text, type) {

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
   OYUNCU EYLEMİ
========================================================= */

function playerAction() {

    const text =
        playerInput.value.trim();


    if (!text) {

        return;

    }


    /* Oyuncunun mesajını göster */

    addStoryMessage(
        escapeHTML(text),
        "player"
    );


    /* Geçmişe kaydet */

    game.story.actions.push({

        text: text,

        location:
            game.world.location,

        time:
            game.world.time,

        timestamp:
            new Date().toISOString()

    });


    /* Input'u temizle */

    playerInput.value = "";


    /* Dungeon Master cevabı */

    dungeonMaster(text);

}


/* =========================================================
   DUNGEON MASTER
========================================================= */

function dungeonMaster(action) {

    const lower =
        action.toLowerCase();


    let response;


    /* -----------------------------------------
       KUYU
    ----------------------------------------- */

    if (
        lower.includes("kuyu") ||
        lower.includes("aşağı") ||
        lower.includes("dinliyorum")
    ) {

        game.story.flags.well = true;


        response =
            `
            Kuyunun taş kenarına yaklaşıyorsun.
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


    /* -----------------------------------------
       KİLİSE
    ----------------------------------------- */

    else if (
        lower.includes("kilise") ||
        lower.includes("kiliseye")
    ) {

        game.story.flags.church = true;


        response =
            `
            Terk edilmiş kilisenin bulunduğu sokağa
            giriyorsun.
            <br><br>
            Kapının önündeki taş basamaklar yağmurdan
            dolayı kaygan. Kapı tamamen kapalı değil;
            aralıkta içeriden çok zayıf bir mum ışığı
            süzülüyor.
            <br><br>
            İçeride biri varmış gibi hissediyorsun.
            `;

    }


    /* -----------------------------------------
       ORMAN
    ----------------------------------------- */

    else if (
        lower.includes("orman") ||
        lower.includes("ağaç")
    ) {

        game.world.location =
            "Blackmoor Ormanı";


        response =
            `
            Köyün ışıkları arkanda kalıyor.
            <br><br>
            Ormana girdikçe yağmurun sesi azalıyor.
            Ağaçların arasında görüş mesafesi giderek
            düşüyor.
            <br><br>
            Bir süre sonra arkandan gelen ayak seslerini
            fark ediyorsun.
            `;

    }


    /* -----------------------------------------
       KÖYLÜ
    ----------------------------------------- */

    else if (
        lower.includes("köylü") ||
        lower.includes("adam") ||
        lower.includes("kadın")
    ) {

        response =
            `
            Yakındaki köylülerden biri sana dikkatlice
            bakıyor.
            <br><br>
            Birkaç saniye boyunca hiçbir şey söylemiyor.
            Sonra yaklaşarak sesini alçaltıyor.
            <br><br>
            <i>"Bu gece burada fazla dolaşma."</i>
            `;

    }


    /* -----------------------------------------
       GENEL EYLEM
    ----------------------------------------- */

    else {

        response =
            `
            ${randomGenericResponse()}
            `;

    }


    addStoryMessage(
        response,
        "dm"
    );


    /* Dünya olayını kaydet */

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
   DÜNYA ARAYÜZİNİ GÜNCELLE
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
   HTML GÜVENLİĞİ
========================================================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

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
   BUTON
========================================================= */

const actionButton =
    document.querySelector(
        ".action-button"
    );


if (actionButton) {

    actionButton.addEventListener(
        "click",
        playerAction
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
   DÜNYA HAFIZASI
========================================================= */

function rememberEvent(type, data = {}) {

    game.story.events.push({

        type: type,

        data: data,

        location: game.world.location,

        time: game.world.time,

        timestamp: new Date().toISOString()

    });

}


/* =========================================================
   NPC SİSTEMİ
========================================================= */

function createNPC({
    id,
    name,
    role,
    personality,
    location,
    trust = 0,
    secrets = [],
    knowledge = []
}) {

    const existing =
        game.npcs.find(npc => npc.id === id);

    if (existing) {

        return existing;

    }

    const npc = {

        id: id,

        name: name,

        role: role,

        personality: personality,

        location: location,

        trust: trust,

        secrets: secrets,

        knowledge: knowledge,

        relationshipHistory: []

    };

    game.npcs.push(npc);

    return npc;

}


/* =========================================================
   NPC İLİŞKİSİ
========================================================= */

function changeNPCTrust(npcId, amount, reason = "") {

    const npc =
        game.npcs.find(n => n.id === npcId);

    if (!npc) {

        console.warn(
            "NPC bulunamadı:",
            npcId
        );

        return;

    }

    npc.trust += amount;

    npc.relationshipHistory.push({

        amount: amount,

        reason: reason,

        timestamp:
            new Date().toISOString()

    });

    rememberEvent(
        "npc_relationship",
        {
            npcId: npcId,
            amount: amount,
            reason: reason
        }
    );

}


/* =========================================================
   BAŞLANGIÇ NPC'LERİ
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

function createQuest({
    id,
    title,
    description,
    objectives = [],
    reward = 0
}) {

    const existing =
        game.quests.find(
            quest => quest.id === id
        );

    if (existing) {

        return existing;

    }

    const quest = {

        id: id,

        title: title,

        description: description,

        objectives: objectives.map(
            objective => ({

                id: objective.id,

                text: objective.text,

                completed: false

            })
        ),

        reward: reward,

        status: "active",

        createdAt:
            new Date().toISOString()

    };

    game.quests.push(quest);

    return quest;

}


/* =========================================================
   BAŞLANGIÇ GÖREVLERİ
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

                text:
                    "Köy kuyusunu araştır."
            },

            {
                id: "learn_secret",

                text:
                    "Kuyunun sırrı hakkında bilgi edin."
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

                text:
                    "Mara ile konuş."
            },

            {
                id: "find_clue",

                text:
                    "Kaybolan kişiye ait bir ipucu bul."
            }

        ],

        reward: 150

    });

}


/* =========================================================
   GÖREV İLERLETME
========================================================= */

function completeObjective(
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

    if (!objective) return;

    if (objective.completed) return;

    objective.completed = true;

    rememberEvent(
        "quest_progress",
        {
            questId: questId,
            objectiveId: objectiveId
        }
    );

    checkQuestCompletion(quest);

}


function checkQuestCompletion(quest) {

    const completed =
        quest.objectives.every(
            objective =>
                objective.completed
        );

    if (!completed) return;

    if (quest.status === "completed") return;

    quest.status = "completed";

    game.player.xp += quest.reward;

    addStoryMessage(

        `
        <b>📜 Görev tamamlandı!</b>
        <br><br>
        ${quest.title}
        <br>
        <b>+${quest.reward} XP</b>
        `,

        "dm"

    );

}


/* =========================================================
   DÜNYA BAYRAKLARI
========================================================= */

function setWorldFlag(
    flag,
    value = true
) {

    game.story.flags[flag] = value;

    rememberEvent(
        "world_flag",
        {
            flag: flag,
            value: value
        }
    );

}


function getWorldFlag(flag) {

    return game.story.flags[flag] || false;

}


/* =========================================================
   KONUM DEĞİŞTİRME
========================================================= */

function changeLocation(location) {

    if (
        game.world.location === location
    ) {

        return;

    }

    const previousLocation =
        game.world.location;

    game.world.location =
        location;

    rememberEvent(
        "location_change",
        {
            from: previousLocation,
            to: location
        }
    );

    updateWorldUI();

}


/* =========================================================
   OYUNCUNUN DÜNYAYA ETKİSİ
========================================================= */

function recordPlayerAction(
    action
) {

    game.story.actions.push({

        text: action,

        location:
            game.world.location,

        time:
            game.world.time,

        worldDanger:
            game.world.danger,

        timestamp:
            new Date().toISOString()

    });

}


/* =========================================================
   DÜNYA HAFIZASINDAN SON OLAYLARI AL
========================================================= */

function getRecentEvents(limit = 10) {

    return game.story.events
        .slice(-limit);

}


/* =========================================================
   NPC HAFIZASINDAN BİLGİ AL
========================================================= */

function getNPC(npcId) {

    return game.npcs.find(
        npc => npc.id === npcId
    );

}


/* =========================================================
   OYUN DÜNYASINI HAZIRLA
========================================================= */

function initializeWorld() {

    initializeNPCs();

    initializeQuests();

}


/* =========================================================
   OYUN DÜNYASINI BAŞLAT
========================================================= */

initializeWorld();
}


/* =========================================================
   OYUN DÜNYASINI HAZIRLA
========================================================= */

function initializeWorld() {

    initializeNPCs();

    initializeQuests();

}


/* =========================================================
   OYUN DÜNYASINI BAŞLAT
========================================================= */

initializeWorld();

/* =========================================================
   BAŞLAT
========================================================= */
/* =========================================================
   OYUN DURUMU KAYDETME
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
   OYUN DURUMU YÜKLEME
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

startGame();

/* =========================================================
   BAŞLAT
========================================================= */

startGame();

