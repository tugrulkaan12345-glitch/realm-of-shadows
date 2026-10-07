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

        level: 1,

        hp: 20,

        maxHp: 20,

        xp: 0

    },


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
   BAŞLAT
========================================================= */

startGame();

