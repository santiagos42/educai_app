const functions = require("firebase-functions");
// Linha 4 corrigida: quebramos a linha para respeitar o max-len
const stripe = require("stripe")(
    functions.config().stripe.secret_key,
);
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});

admin.initializeApp();
const db = admin.firestore();

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
      const YOUR_STRIPE_PRICE_ID = "price_1RsjVd1zTGztNQWqrYGHdeAI";

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

exports.stripeWebhookHandler = functions.https.onRequest(async (req, res) => {
  // >>> VERIFICAÇÃO DE SEGURANÇA <<<
  // Vamos verificar se a chave do webhook existe antes de usá-la.
  const config = functions.config();
  if (!config.stripe || !config.stripe.webhook_secret) {
    const errorMessage = "Chave secreta do WH Stripe não está configurada.";
    console.error(errorMessage);
    // Retorna um erro 500 para indicar um problema de configuração do servidor
    return res.status(500).send(errorMessage);
  }
  const endpointSecret = config.stripe.webhook_secret;


  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error("Erro na verificação da assinatura do WH:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // A lógica do switch permanece a mesma
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const firebaseUID = session.metadata.firebaseUID;

      if (!firebaseUID) {
        console.error("Erro: firebaseUID não encontrado nos metadados.");
        break;
      }

      console.log(`✅ Pagamento bem-sucedido para o usuário: ${firebaseUID}`);

      const userRef = db.collection("users").doc(firebaseUID);
      await userRef.update({
        plan: "premium",
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
      });
      break;
    }
    case "customer.subscription.deleted": {
      // Lógica futura aqui
      break;
    }
    default:
      console.log(`Evento não tratado: ${event.type}`);
  }

  return res.status(200).send();
});
