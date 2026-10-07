/* =========================================================
   REALM OF SHADOWS
   ANA OYUN MOTORU
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
   HTML ELEMANLARI
========================================================= */

const playerInput =
    document.getElementById("playerInput");

const actionButton =
    document.getElementById("actionButton");

const saveButton =
    document.getElementById("saveButton");

const loadButton =
    document.getElementById("loadButton");


/* =========================================================
   HTML GÜVENLİĞİ
========================================================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        String(text ?? "");

    return div.innerHTML;

}


/* =========================================================
   HİKAYE MESAJI
========================================================= */

function addStoryMessage(text, type) {

    const story =
        document.getElementById("story");

    if (!story) {

        console.error(
            "❌ Story alanı bulunamadı."
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

    if (!playerInput) {

        console.error(
            "❌ playerInput bulunamadı."
        );

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


    /* ENVANTER */

    else if (
        lower.includes("envanter") ||
        lower.includes("eşyalarım") ||
        lower.includes("eşyalar")
    ) {

        openInventory();

        response = `

            Eşyalarına göz atıyorsun.

            <br><br>

            Envanterin açıldı.

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
   KONUM DEĞİŞTİR
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
   DÜNYA ARAYÜZÜ
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
   GÖREV ARAYÜZÜ
========================================================= */

function updateQuestUI() {

    const questPanel =
        document.getElementById("quests");


    const questCount =
        document.getElementById("questCount");


    if (!questPanel) {
        return;
    }


    questPanel.innerHTML = "";


    if (questCount) {

        questCount.textContent =
            game.quests.filter(
                quest => quest.status === "active"
            ).length;

    }


    if (game.quests.length === 0) {

        questPanel.innerHTML = `
            <p class="empty">
                Aktif görev yok.
            </p>
        `;

        return;

    }


    game.quests.forEach(function(quest) {

        const questElement =
            document.createElement("div");

        questElement.className =
            "quest-item";


        const objectives =
            quest.objectives.map(
                objective => `

                    <div class="quest-objective">
                        ${objective.completed ? "✅" : "⬜"}
                        ${escapeHTML(objective.text)}
                    </div>

                `
            ).join("");


        questElement.innerHTML = `

            <strong>
                📜 ${escapeHTML(quest.title)}
            </strong>

            <p>
                ${escapeHTML(quest.description)}
            </p>

            <div>
                ${objectives}
            </div>

            <small>
                Ödül: ${quest.reward} XP
            </small>

        `;


        questPanel.appendChild(
            questElement
        );

    });

}


/* =========================================================
   ENVANTER SİSTEMİ
========================================================= */

const inventoryButton =
    document.getElementById("inventoryButton");

const inventoryModal =
    document.getElementById("inventoryModal");

const closeInventory =
    document.getElementById("closeInventory");

const inventoryModalList =
    document.getElementById("inventoryModalList");

const inventoryCount =
    document.getElementById("inventoryCount");


/* =========================================================
   ENVANTERİ GÜNCELLE
========================================================= */

function updateInventoryUI() {

    if (!inventoryModalList) {

        console.error(
            "❌ inventoryModalList bulunamadı."
        );

        return;

    }


    inventoryModalList.innerHTML = "";


    const inventory =
        game.player.inventory || [];


    const totalItems =
        inventory.reduce(
            function(total, item) {

                return total +
                    (item.quantity || 0);

            },
            0
        );


    if (inventoryCount) {

        inventoryCount.textContent =
            totalItems;

    }


    if (inventory.length === 0) {

        inventoryModalList.innerHTML = `

            <div class="inventory-empty">

                🎒 Envanterin boş.

            </div>

        `;

        return;

    }


    inventory.forEach(
        function(item) {

            const itemElement =
                document.createElement("div");


            itemElement.className =
                "inventory-modal-item";


            let icon = "📦";


            if (item.type === "weapon") {

                icon = "⚔️";

            }

            else if (
                item.type === "consumable"
            ) {

                icon = "🧪";

            }

            else if (
                item.type === "utility"
            ) {

                icon = "🔥";

            }


            itemElement.innerHTML = `

                <div class="inventory-modal-icon">
                    ${icon}
                </div>

                <div class="inventory-modal-info">

                    <strong>
                        ${escapeHTML(item.name)}
                    </strong>

                    <span>
                        Adet: ${item.quantity || 1}
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

                </div>

            `;


            inventoryModalList.appendChild(
                itemElement
            );

        }
    );

}


/* =========================================================
   ENVANTERİ AÇ
========================================================= */

function openInventory() {

    console.log(
        "🎒 ENVANTER AÇILIYOR"
    );


    if (!inventoryModal) {

        console.error(
            "❌ inventoryModal bulunamadı."
        );

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
   ENVANTERİ KAPAT
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
   ENVANTER BUTONU
========================================================= */

if (inventoryButton) {

    inventoryButton.addEventListener(
        "click",
        openInventory
    );

}


/* =========================================================
   ENVANTER KAPAT
========================================================= */

if (closeInventory) {

    closeInventory.addEventListener(
        "click",
        closeInventoryModal
    );

}


/* =========================================================
   MODAL DIŞINA TIKLAMA
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
   ESC
========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Escape") {

            closeInventoryModal();

            closeCharacterModal();

        }

    }
);


/* =========================================================
   KARAKTER MODALI
========================================================= */

const characterButton =
    document.getElementById("characterButton");

const characterModal =
    document.getElementById("characterModal");

const closeCharacter =
    document.getElementById("closeCharacter");

const characterInfo =
    document.getElementById("characterInfo");


/* =========================================================
   KARAKTER BİLGİLERİ
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

    `;


    if (characterModal) {

        characterModal.classList.remove(
            "hidden"
        );

    }

}


/* =========================================================
   KARAKTER MODALINI KAPAT
========================================================= */

function closeCharacterModal() {

    if (!characterModal) {
        return;
    }


    characterModal.classList.add(
        "hidden"
    );

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


if (closeCharacter) {

    closeCharacter.addEventListener(
        "click",
        closeCharacterModal
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

                closeCharacterModal();

            }

        }
    );

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
   KARAKTER OLUŞTURMA ELEMANLARI
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
   KARAKTER OLUŞTUR
========================================================= */

function createCharacter() {

    if (
        !nameInput ||
        !raceInput ||
        !classInput ||
        !backgroundInput
    ) {

        console.error(
            "❌ Karakter oluşturma alanları eksik."
        );

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


    closeCharacterModal();


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

}


/* =========================================================
   KARAKTER ARAYÜZÜ
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
   KARAKTER OLUŞTUR BUTONU
========================================================= */

if (createCharacterButton) {

    createCharacterButton.addEventListener(
        "click",
        createCharacter
    );

}


/* =========================================================
   ZAR SİSTEMİ
========================================================= */

const rollButton =
    document.getElementById("rollButton");

const diceResult =
    document.getElementById("diceResult");


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
            "🎲 Kritik başarı! Zar 20 geldi.";

    }

    else if (result === 1) {

        message =
            "💀 Kritik başarısızlık! Zar 1 geldi.";

    }

    else {

        message =
            `🎲 D20 sonucu: <b>${result}</b>`;

    }


    addStoryMessage(
        message,
        "dm"
    );

}


if (rollButton) {

    rollButton.addEventListener(
        "click",
        rollD20
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
            "💾 Oyun başarıyla kaydedildi.",
            "dm"
        );

    }

    catch (error) {

        console.error(
            "Kaydetme hatası:",
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


        game.npcs =
            loadedGame.npcs || [];

        game.quests =
            loadedGame.quests || [];


        Object.assign(
            game.story,
            loadedGame.story
        );


        Object.assign(
            game.combat,
            loadedGame.combat || {}
        );


        updateWorldUI();

        updateCharacterUI();

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
   DÜNYAYI HAZIRLA
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


    console.log(
        game
    );


    updateWorldUI();

    updateCharacterUI();

    updateQuestUI();

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
   BAŞLAT
========================================================= */

initializeWorld();

startGame();


console.log(
    "✅ REALM OF SHADOWS SCRIPT HAZIR."
);
