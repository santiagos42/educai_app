/* eslint-disable no-unused-vars */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});

// Lê a chave secreta das variáveis de ambiente do Firebase
const stripe = require("stripe")(functions.config().stripe.secret);

admin.initializeApp();
const db = admin.firestore();

// >>> ADICIONE ESTA FUNÇÃO DE VOLTA <<<
exports.createCheckoutSession = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const priceId = "price_1RsTgE0ng45pYbEPmKxjZ97d";
    const {userId} = req.body;

    if (!userId) {
      return res.status(400).send({error: "O ID do usuário é obrigatório."});
    }

    try {
      const origin = req.headers.origin;
      // eslint-disable-next-line max-len
      const successUrl = `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${origin}/payment-canceled`;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card", "boleto", "pix"],
        mode: "subscription",
        line_items: [{price: priceId, quantity: 1}],
        metadata: {firebaseUID: userId},
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      return res.status(200).send({id: session.id});
    } catch (error) {
      console.error("Erro ao criar sessão de checkout:", error);
      const errorMessage = "Não foi possível iniciar o pagamento.";
      return res.status(500).send({error: errorMessage});
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
