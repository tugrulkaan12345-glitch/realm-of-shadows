const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        status: "online",
        game: "Realm of Shadows",
        message: "AI Dungeon Master server çalışıyor."
    });
});

app.post("/api/story", async (req, res) => {

    try {

        const { playerAction, gameState } = req.body;

        if (!playerAction) {
            return res.status(400).json({
                error: "Oyuncu eylemi gönderilmedi."
            });
        }

        /*
         * AI bağlantısını bir sonraki adımda
         * buraya ekleyeceğiz.
         */

        res.json({
            success: true,
            response:
                "AI Dungeon Master bağlantısı hazır. " +
                "Oyuncunun eylemi: " +
                playerAction
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "AI sunucusunda hata oluştu."
        });

    }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(
        `Realm of Shadows AI Server ${PORT} portunda çalışıyor.`
    );

});
