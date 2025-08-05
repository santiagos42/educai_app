const functions = require("firebase-functions");
// Linha 4 corrigida: quebramos a linha para respeitar o max-len
const stripe = require("stripe")(
    functions.config().stripe.secret_key,
);
const cors = require("cors")({origin: true});

exports.createCheckoutSession = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send({error: "Method Not Allowed"});
    }

    try {
      console.log("Corpo da requisição recebido:", req.body);

      const {userId} = req.body;

      if (!userId) {
        console.error("userId não encontrado no corpo da requisição.");
        // Linha 24 corrigida: objeto quebrado em várias linhas
        return res.status(400).json({
          error: {
            message:
              "UID do usuário (userId) é obrigatório no corpo da requisição.",
          },
        });
      }

      // Linha 31 corrigida: URL quebrada em duas partes
      const YOUR_SUCCESS_URL =
        "https://plataformaeducai.com.br";
      const YOUR_CANCEL_URL =
        "https://plataformaeducai.com.br";
      const YOUR_STRIPE_PRICE_ID = "price_1RsTgE0ng45pYbEPmKxjZ97d";

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        success_url: YOUR_SUCCESS_URL,
        cancel_url: YOUR_CANCEL_URL,
        line_items: [
          {
            price: YOUR_STRIPE_PRICE_ID,
            quantity: 1,
          },
        ],
        metadata: {
          userId: userId,
        },
      });

      return res.status(200).json({id: session.id});
    } catch (error) {
      console.error("ERRO INTERNO NA CLOUD FUNCTION:", error);

      // Linha 60 corrigida: objeto quebrado em várias linhas
      return res.status(500).json({
        error: {
          message: error.message,
          type: error.type,
          stack: error.stack,
        },
      });
    }
  });
});
