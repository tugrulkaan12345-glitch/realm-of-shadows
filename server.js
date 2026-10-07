const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

/* =========================================================
   OPENAI
========================================================= */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/* =========================================================
   ANA SAYFA
========================================================= */

app.get("/", (req, res) => {

    res.json({
        status: "online",
        game: "Realm of Shadows",
        message: "AI Dungeon Master server çalışıyor."
    });

});

/* =========================================================
   AI DUNGEON MASTER
========================================================= */

app.post("/api/story", async (req, res) => {

    try {

        const {
            playerAction,
            gameState
        } = req.body;


        if (!playerAction) {

            return res.status(400).json({

                error:
                    "Oyuncu eylemi gönderilmedi."

            });

        }


        if (!OPENAI_API_KEY) {

            return res.status(500).json({

                error:
                    "OPENAI_API_KEY Render üzerinde bulunamadı."

            });

        }


        /* =====================================================
           OYUN DURUMU
        ===================================================== */

        const player =
            gameState?.player || {};

        const world =
            gameState?.world || {};

        const combat =
            gameState?.combat || {};


        const systemPrompt = `

Sen "Realm of Shadows" adlı karanlık fantastik
bir RPG oyununun Dungeon Master'ısın.

Görevin oyuncunun yazdığı eylemi anlamak,
dünyanın durumunu dikkate almak ve kısa,
etkileyici ve tutarlı bir Dungeon Master cevabı
üretmektir.

OYUN DÜNYASI:

Realm of Shadows karanlık fantastik bir dünyadır.

Başlangıç bölgesi:
Blackmoor Köyü.

Atmosfer:
gizemli, karanlık, yağmurlu ve tehlikeli.

Oyuncunun seçimlerinin sonuçları olmalıdır.

Oyuncunun yapamayacağı fiziksel olarak imkansız
şeyleri doğrudan gerçekleştirme.

Oyuncuya her zaman başarılı sonuç verme.

Gerekirse başarısızlık, tehlike veya beklenmeyen
sonuç üret.

Oyuncunun yerine karar verme.

Oyuncunun karakterinin düşüncelerini veya
duygularını kesin olarak belirleme.

Oyuncunun eyleminin sonucunu anlat.

Savaş sırasında gerçek savaş durumuna uygun
davran.

Oyuncu "saldırıyorum", "kılıcımı savuruyorum",
"kaçıyorum", "geri çekiliyorum" gibi doğal
cümleler yazabilir.

Bunları anlayabil.

CEVAPLAR:

Türkçe yaz.

Genellikle 2-5 kısa paragraf kullan.

Atmosferik ama gereksiz uzun olmayan cevaplar ver.

Oyuncunun eylemini tekrar etmek yerine sonucunu
anlat.

Oyuncuya seçenekleri zorla dayatma.

Her cevabı "Ne yapmak istiyorsun?" ile bitirmek
zorunda değilsin.

Gerekli olduğunda NPC, yaratık, çevre veya olay
ekleyebilirsin.

Ancak mevcut oyun durumuyla çelişme.

`;

        const statePrompt = `

OYUNCU:

İsim:
${player.name || "Arden"}

Irk:
${player.race || "İnsan"}

Sınıf:
${player.className || "Savaşçı"}

Seviye:
${player.level || 1}

Can:
${player.hp || 0}/${player.maxHp || 0}

Altın:
${player.gold || 0}

Konum:
${world.location || "Blackmoor Köyü"}

Hava:
${world.weather || "Yağmurlu"}

Zaman:
${world.time || "Gece"}

SAVAŞ:

Aktif:
${combat.active ? "Evet" : "Hayır"}

Düşman:
${combat.enemy?.name || "Yok"}

Düşman Canı:
${
    combat.enemy
        ? `${combat.enemy.hp}/${combat.enemy.maxHp}`
        : "Yok"
}

OYUNCUNUN EYLEMİ:

${playerAction}

`;

        /* =====================================================
           OPENAI RESPONSES API
        ===================================================== */

        const response =
            await fetch(
                "https://api.openai.com/v1/responses",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${OPENAI_API_KEY}`

                    },

                    body: JSON.stringify({

                        model: "gpt-5-mini",

                        instructions:
                            systemPrompt,

                        input:
                            statePrompt,

                        max_output_tokens:
                            500

                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            console.error(
                "OpenAI API hatası:",
                data
            );


            return res.status(
                response.status
            ).json({

                error:
                    "AI servisi hata verdi.",

                details:
                    data?.error?.message ||
                    "Bilinmeyen OpenAI hatası."

            });

        }


        /* =====================================================
           AI CEVABINI AL
        ===================================================== */

        let aiText = "";


        if (
            Array.isArray(data.output)
        ) {

            for (
                const item
                of data.output
            ) {

                if (
                    item.type ===
                    "message"
                ) {

                    if (
                        Array.isArray(
                            item.content
                        )
                    ) {

                        for (
                            const content
                            of item.content
                        ) {

                            if (
                                content.type ===
                                "output_text"
                            ) {

                                aiText +=
                                    content.text;

                            }

                        }

                    }

                }

            }

        }


        if (!aiText) {

            aiText =
                "Karanlık dünya bir anlığına sessizleşti.";

        }


        /* =====================================================
           CEVAP
        ===================================================== */

        res.json({

            success: true,

            response:
                aiText.trim()

        });

    }

    catch (error) {

        console.error(
            "Sunucu hatası:",
            error
        );


        res.status(500).json({

            error:
                "AI Dungeon Master sunucusunda hata oluştu."

        });

    }

});

/* =========================================================
   SERVER
========================================================= */

const PORT =
    process.env.PORT || 3000;


app.listen(
    PORT,
    () => {

        console.log(
            `Realm of Shadows AI Server ${PORT} portunda çalışıyor.`
        );

    }
);
