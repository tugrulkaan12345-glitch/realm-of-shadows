/* =========================================================
   REALM OF SHADOWS
   TEK PARÇA OYUN MOTORU
   AI-DM HAZIRLIK SİSTEMİ
   ENVANTER + KUŞANMA + GÖREV + ZAR + SAVAŞ
   SERBEST OYUNCU EYLEMLERİ
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

        text: text,

        location:
            game.world.location,

        time:
            game.world.time,

        timestamp:
            new Date().toISOString()

    });


    game.ai.history.push({

        role: "player",

        content: text

    });


    playerInput.value = "";


    /*
       EN ÖNEMLİ KISIM:

       Eğer savaş aktifse oyuncunun mesajı
       doğrudan savaş sistemine gider.

       Böylece "saldır" tekrar genel Dungeon
       Master cevabına düşmez.
    */

    if (game.combat.active) {

        handleCombatAction(text);

        return;

    }


    dungeonMaster(text);

}


/* =========================================================
   GELİŞMİŞ METİN ANALİZİ
========================================================= */

function analyzeAction(text) {

    const lower =
        text
            .toLocaleLowerCase("tr-TR")
            .trim();


    return {

        attack:
            /saldır|saldırıyorum|saldırdım|vur|vuruyorum|vurdum|kılıçla|bıçağımla|silahımla|üzerine atıl|hamle yap/.test(lower),

        potion:
            /iksir|şifa|canımı doldur|iyileştir|iyileş/.test(lower),

        flee:
            /kaç|kaçıyorum|geri çekil|uzaklaş|koşarak kaç/.test(lower),

        torch:
            /meşale|meşaleyi yak|ışık yak/.test(lower),

        well:
            /kuyu|kuyuyu|kuyunun/.test(lower),

        church:
            /kilise|kiliseye|tapınak/.test(lower),

        forest:
            /orman|ormana|ağaçlık/.test(lower),

        npc:
            /konuş|sor|soruyorum|köylü|mara|jonas|aldric|adam|kadın/.test(lower),

        investigate:
            /araştır|incele|kontrol et|bak|gözlemle|keşfet|dinle/.test(lower),

        equip:
            /kuşan|giy|tak|silahımı hazırla/.test(lower),

        inventory:
            /envanter|çantam/.test(lower)

    };

}


/* =========================================================
   DUNGEON MASTER
========================================================= */

function dungeonMaster(action) {

    const intent =
        analyzeAction(action);


    /*
       SERBEST SALDIRI
    */

    if (intent.attack) {

        /*
           Köyde veya başka yerde saldırı yazılırsa
           düşman yoksa savaş başlatılır.
        */

        startCombat("shadow_wolf");

        return;

    }


    /*
       KUYU
    */

    if (
        intent.well ||
        intent.investigate && game.world.location === "Blackmoor Köyü"
    ) {

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

        return;

    }


    /*
       KİLİSE
    */

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


        return;

    }


    /*
       ORMAN
    */

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


    /*
       NPC
    */

    if (intent.npc) {

        talkToNPC(action);

        return;

    }


    /*
       MEŞALE
    */

    if (intent.torch) {

        const torch =
            getInventoryItem("torch");


        if (torch) {

            useTorch(torch);

        }

        return;

    }


    /*
       GENEL SERBEST EYLEM
    */

    generateDynamicDMResponse(
        action
    );

}


/* =========================================================
   DİNAMİK DM
========================================================= */

function generateDynamicDMResponse(action) {

    const lower =
        action.toLocaleLowerCase("tr-TR");


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

            Fakat uzaktaki bir pencerede
            hareket eden bir gölge fark ediyorsun.

        `;

    }

    else if (
        lower.includes("koş") ||
        lower.includes("yürü")
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
            `,

            `
            İçgüdülerin burada gözden
            kaçırdığın bir şey olduğunu
            söylüyor.
            `

        ];


        response =
            responses[
                Math.floor(
                    Math.random() *
                    responses.length
                )
            ];

    }


    addStoryMessage(
        response,
        "dm"
    );


    game.ai.lastResponse =
        response;


    game.ai.history.push({

        role: "dm",

        content: response

    });


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
   NPC KONUŞMA
========================================================= */

function talkToNPC(action) {

    const lower =
        action.toLocaleLowerCase("tr-TR");


    let npc = null;


    if (
        lower.includes("mara")
    ) {

        npc =
            game.npcs.find(
                n => n.id === "healer_mara"
            );

    }

    else if (
        lower.includes("jonas") ||
        lower.includes("yaşlı")
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


    npc.trust += 1;


    if (npc.id === "elder_jonas") {

        addStoryMessage(`

            Yaşlı Jonas sana dikkatlice bakıyor.

            <br><br>

            <i>
            "Kuyuya yaklaşacaksan dikkatli ol.
            O kuyunun hikâyesi sandığından çok
            daha eski."
            </i>

        `, "dm");


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


        completeQuestObjective(
            "missing_person",
            "talk_healer"
        );

    }


    else {

        addStoryMessage(`

            ${escapeHTML(npc.name)}
            sana dikkatlice bakıyor.

            <br><br>

            <i>
            "${escapeHTML(npc.knowledge[0] || "Bu gece dikkatli ol.")}"
            </i>

        `, "dm");

    }


    updateAllUI();

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

        game.story.discoveredLocations
            .push(location);

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

        const element =
            document.createElement("div");


        element.className =
            "inventory-item";


        let icon = "📦";


        if (item.type === "weapon")
            icon = "⚔️";

        if (item.type === "consumable")
            icon = "🧪";

        if (item.type === "utility")
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
                    ? `<span>Hasar: ${escapeHTML(item.damage)}</span>`
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


        button.addEventListener(
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


    updateInventoryUI();

}


/* =========================================================
   İKSİR
========================================================= */

function usePotion(item) {

    if (
        !item ||
        item.quantity <= 0
    ) {

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
        item.heal || 10;


    game.player.hp =
        Math.min(
            game.player.maxHp,
            game.player.hp + heal
        );


    const actual =
        game.player.hp - oldHP;


    item.quantity--;


    addStoryMessage(`

        🧪 Şifa İksiri kullandın.

        <br><br>

        ❤️ <b>+${actual}</b> can yenilendi.

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


    if (game.world.torchActive) {

        game.world.torchActive =
            false;


        addStoryMessage(
            "🔥 Meşaleyi söndürdün.",
            "dm"
        );

    }

    else {

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

    }


    updateAllUI();

}


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
            ${weapon ? escapeHTML(weapon.name) : "Yok"}
        </p>

        <hr>

        <p><strong>Güç:</strong> ${game.player.stats.strength}</p>
        <p><strong>Çeviklik:</strong> ${game.player.stats.dexterity}</p>
        <p><strong>Dayanıklılık:</strong> ${game.player.stats.constitution}</p>
        <p><strong>Zeka:</strong> ${game.player.stats.intelligence}</p>
        <p><strong>Bilgelik:</strong> ${game.player.stats.wisdom}</p>
        <p><strong>Karizma:</strong> ${game.player.stats.charisma}</p>

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


function updateCharacterUI() {

    const name =
        document.getElementById("characterName");

    const classElement =
        document.getElementById("characterClass");

    const hp =
        document.getElementById("hp");

    const level =
        document.getElementById("level");

    const xp =
        document.getElementById("xp");

    const gold =
        document.getElementById("gold");


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
        document.getElementById(id);


    if (element)
        element.textContent =
            value;

}


/* =========================================================
   NPC
========================================================= */

function createNPC(data) {

    if (
        game.npcs.some(
            npc => npc.id === data.id
        )
    ) {

        return game.npcs.find(
            npc => npc.id === data.id
        );

    }


    const npc = {

        id: data.id,
        name: data.name,
        role: data.role,
        personality: data.personality,
        location: data.location,

        trust: data.trust || 0,

        secrets:
            data.secrets || [],

        knowledge:
            data.knowledge || [],

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

    if (
        game.quests.some(
            q => q.id === data.id
        )
    ) {

        return game.quests.find(
            q => q.id === data.id
        );

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
    ) return;


    objective.completed =
        true;


    const completed =
        quest.objectives.every(
            o => o.completed
        );


    if (completed) {

        quest.status =
            "completed";


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
            q => q.status === "active"
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


    game.quests.forEach(
        quest => {

            const element =
                document.createElement("div");


            element.className =
                "quest-item";


            const completed =
                quest.objectives.filter(
                    o => o.completed
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
                        quest.objectives.map(
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
                        ).join("")
                    }

                </ul>

                <small>
                    Ödül:
                    ${quest.reward} altın
                </small>

            `;


            questPanel.appendChild(
                element
            );

        }
    );

}


/* =========================================================
   ZAR
========================================================= */

function rollDice(notation) {

    const match =
        String(notation)
            .match(/^(\d+)d(\d+)$/);


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


function rollD20() {

    const result =
        Math.floor(
            Math.random() * 20
        ) + 1;


    if (diceResult)
        diceResult.textContent =
            result;


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
   MODIFIER
========================================================= */

function getModifier(stat) {

    return Math.floor(
        (stat - 10) / 2
    );

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

        👹 <b>${escapeHTML(template.name)}</b>

        <br>

        ❤️ Can:
        <b>${template.maxHp}/${template.maxHp}</b>

        <br>

        🛡️ Zırh:
        <b>${template.armor}</b>

        <br><br>

        Artık istediğin şekilde saldırabilirsin.

        <br>

        Örnek:
        <b>"kılıcımı çekip saldırıyorum"</b>

    `, "dm");


    updateCombatUI();

}


/* =========================================================
   SAVAŞ EYLEMİ
========================================================= */

function handleCombatAction(action) {

    if (!game.combat.active) return;


    const intent =
        analyzeAction(action);


    /*
       İKSİR
    */

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


        if (used && game.combat.active) {

            enemyTurn();

        }


        return;

    }


    /*
       KAÇ
    */

    if (intent.flee) {

        attemptFlee();

        return;

    }


    /*
       SALDIRI
    */

    if (intent.attack) {

        playerAttack();

        return;

    }


    /*
       SAVUNMA
    */

    if (
        /savun|korun|kalkan/.test(
            action.toLocaleLowerCase("tr-TR")
        )
    ) {

        addStoryMessage(`

            🛡️ Savunma pozisyonu aldın.

            <br><br>

            Bu tur düşmanın saldırısına
            karşı daha dikkatli olacaksın.

        `, "dm");


        enemyTurn(
            true
        );

        return;

    }


    /*
       BİLİNMEYEN SAVAŞ EYLEMİ
    */

    addStoryMessage(`

        ⚔️ Savaş devam ediyor.

        <br><br>

        Düşman gözlerini senden ayırmıyor.

        <br><br>

        Şunları deneyebilirsin:

        <br>

        <b>"saldır"</b>

        <br>

        <b>"kılıcımla saldırıyorum"</b>

        <br>

        <b>"iksir kullan"</b>

        <br>

        <b>"kaç"</b>

        <br>

        <b>"savun"</b>

    `, "dm");

}


/* =========================================================
   OYUNCU SALDIRISI
========================================================= */

function playerAttack() {

    if (!game.combat.active) return;


    const enemy =
        game.combat.enemy;


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

        ➕ Güç bonusu:
        <b>${attackModifier}</b>

        <br>

        🎯 Toplam:
        <b>${totalAttack}</b>

        <br>

        🛡️ Düşman zırhı:
        <b>${enemy.armor}</b>

    `;


    /*
       KRİTİK
    */

    if (attackRoll === 20) {

        const base =
            weapon
                ? rollDice(
                    weapon.damage || "1d6"
                )
                : rollDice("1d4");


        const damage =
            base * 2 +
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

            💥 Hasar:
            <b>${damage}</b>

        `;

    }


    /*
       KRİTİK BAŞARISIZ
    */

    else if (attackRoll === 1) {

        message += `

            <br><br>

            💀 <b>Kritik başarısızlık!</b>

            <br>

            Saldırın tamamen ıskaladı.

        `;

    }


    /*
       NORMAL VURUŞ
    */

    else if (
        totalAttack >= enemy.armor
    ) {

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


    /*
       ISKALAMA
    */

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
   DÜŞMAN TURU
========================================================= */

function enemyTurn(defending = false) {

    if (!game.combat.active) return;


    const enemy =
        game.combat.enemy;


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


    if (defending) {

        playerArmor += 4;

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

        🎯 Toplam:
        <b>${totalAttack}</b>

        <br>

        🛡️ Savunman:
        <b>${playerArmor}</b>

    `;


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

            💥 Hasar:
            <b>${damage}</b>

        `;

    }


    else if (
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


    updateCharacterUI();


    if (
        game.player.hp <= 0
    ) {

        loseCombat();

    }

}


/* =========================================================
   KAÇ
========================================================= */

function attemptFlee() {

    if (!game.combat.active) return;


    const roll =
        Math.floor(
            Math.random() * 20
        ) + 1;


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


        game.combat.active =
            false;


        game.combat.enemy =
            null;


        game.combat.round =
            0;


        updateAllUI();

        return;

    }


    addStoryMessage(`

        ❌ Kaçamadın!

        <br><br>

        🎲 D20:
        ${roll}

        <br><br>

        Düşman peşini bırakmıyor.

    `, "dm");


    enemyTurn();

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

    return level * 100;

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
   SAVAŞ UI
========================================================= */

function updateCombatUI() {

    let status =
        document.getElementById(
            "combatStatus"
        );


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
            document.getElementById(
                "story"
            );


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

        console.error(error);

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

        const loaded =
            JSON.parse(saved);


        Object.assign(
            game.player,
            loaded.player || {}
        );


        Object.assign(
            game.world,
            loaded.world || {}
        );


        Object.assign(
            game.story,
            loaded.story || {}
        );


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
            "📂 Macera başarıyla yüklendi.",
            "dm"
        );

    }

    catch (error) {

        console.error(error);

        addStoryMessage(
            "❌ Kayıt dosyası okunamadı.",
            "dm"
        );

    }

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
        raceInput.value;


    const className =
        classInput.value;


    const background =
        backgroundInput.value;


    const base =
        classStats[className];


    const bonus =
        raceBonuses[race];


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
   TÜM UI
========================================================= */

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

        <b>
        Ne yapmak istiyorsun?
        </b>

        <br><br>

        Serbestçe yazabilirsin.

        <br>

        Örneğin:
        <i>"Kuyunun yanına gidip aşağıdaki sesi dinliyorum."</i>

    `, "dm");


    updateAllUI();

}


/* =========================================================
   BAŞLAT
========================================================= */

initializeWorld();

startGame();


console.log(
    "✅ Realm of Shadows başlatıldı."
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
    "🧠 Serbest eylem sistemi aktif."
);

console.log(
    "🤖 AI Dungeon Master altyapısı hazır."
);
/* =========================================================
   REALM OF SHADOWS
   AI DUNGEON MASTER - RENDER BAĞLANTISI
========================================================= */

/*
   BURAYA KENDİ RENDER ADRESİNİ YAZ.

   ÖRNEK:

   https://realm-of-shadows-xxxx.onrender.com

   Sonuna /api/story ekliyoruz.
*/

const AI_SERVER_URL =
    "https://realm-of-shadows-xxxx.onrender.com/api/story";




/* =========================================================
   AI DUNGEON MASTER
========================================================= */

async function askAIDungeonMaster(playerAction) {

    try {

        console.log(
            "🤖 AI isteği gönderiliyor:",
            playerAction
        );


        const gameState = {

            player: {

                name:
                    game.player.name,

                race:
                    game.player.race,

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
                    game.player.stats,

                inventory:
                    game.player.inventory,

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
                    game.story.flags,

                discoveredLocations:
                    game.story.discoveredLocations,

                discoveredSecrets:
                    game.story.discoveredSecrets,

                relationships:
                    game.story.relationships

            },


            npcs:
                game.npcs,

            quests:
                game.quests,

            combat:
                game.combat

        };


        const response =
            await fetch(
                AI_SERVER_URL,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            playerAction:
                                playerAction,

                            gameState:
                                gameState

                        })

                }
            );


        if (!response.ok) {

            throw new Error(
                "AI sunucusu HTTP " +
                response.status
            );

        }


        const data =
            await response.json();


        if (
            !data ||
            !data.response
        ) {

            throw new Error(
                "AI sunucusundan cevap alınamadı."
            );

        }


        /* =========================
           AI GEÇMİŞİ
        ========================= */

        if (!game.ai) {

            game.ai = {

                lastResponse:
                    null,

                history:
                    [],

                pendingCheck:
                    null

            };

        }


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


        /* =========================
           AI CEVABINI OYUNA YAZ
        ========================= */

        addStoryMessage(
            data.response,
            "dm"
        );


        /* =========================
           HİKAYE GEÇMİŞİ
        ========================= */

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

        console.error(
            "❌ AI bağlantı hatası:",
            error
        );


        addStoryMessage(

            `
            ⚠️ <b>Dungeon Master'a bağlanılamadı.</b>

            <br><br>

            Oyun yerel sistem üzerinden devam ediyor.
            `,

            "dm"

        );


        return null;

    }

}


/* =========================================================
   AI TEST FONKSİYONU
========================================================= */

async function testAIConnection() {

    console.log(
        "🤖 AI bağlantısı test ediliyor..."
    );


    const response =
        await askAIDungeonMaster(
            "Oyuncu çevresini dikkatlice araştırıyor."
        );


    if (response) {

        console.log(
            "✅ AI bağlantısı başarıyla çalışıyor."
        );

    }

}


/* =========================================================
   DUNGEON MASTER'I AI'A BAĞLA
========================================================= */

const localDungeonMaster =
    dungeonMaster;


dungeonMaster =
    async function(action) {

        /*
         * SAVAŞTA AI KULLANMIYORUZ.
         *
         * Saldırı, iksir ve kaçma mevcut
         * savaş sistemimiz tarafından yönetiliyor.
         */

        if (game.combat.active) {

            handleCombatAction(
                action
            );

            return;

        }


        /*
         * Normal oyun eylemlerini AI'a gönder.
         */

        const aiResponse =
            await askAIDungeonMaster(
                action
            );


        /*
         * AI çalışmazsa eski Dungeon Master
         * sistemine geri dön.
         */

        if (!aiResponse) {

            localDungeonMaster(
                action
            );

        }

    };


/* =========================================================
   HAZIR
========================================================= */

console.log(
    "========================================"
);

console.log(
    "🤖 AI DUNGEON MASTER HAZIR"
);

console.log(
    "🎲 Realm of Shadows"
);

console.log(
    "🌐 Render API:",
    AI_SERVER_URL
);

console.log(
    "========================================"
);
