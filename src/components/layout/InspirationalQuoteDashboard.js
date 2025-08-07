import { useState, useEffect, useMemo } from 'react';

const InspirationalQuoteDashboard = () => {
  const quotes = useMemo(() => [
    { text: "A tarefa do educador moderno não é derrubar florestas, mas irrigar desertos.", author: "C.S. Lewis" },
    { text: "A educação é a arma mais poderosa que você pode usar para mudar o mundo.", author: "Nelson Mandela" },
    { text: "Ensinar não é transferir conhecimento, mas criar as possibilidades para a sua própria produção ou a sua construção.", author: "Paulo Freire" },
    { text: "Um bom professor explica. O professor superior demonstra. O grande professor inspira.", author: "William Arthur Ward" }
  ], []);

  const [currentQuote, setCurrentQuote] = useState(quotes[0]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, 7000);
    return () => clearInterval(timer);
  }, [quotes]);
  
  return (
    // Adicionamos classes CSS para estilizar o container
    <div className="inspirational-quote-container animate-fade-in">
      <p className="quote-text">"{currentQuote.text}"</p>
      <p className="quote-author">- {currentQuote.author}</p>
    </div>
  );
};

export default InspirationalQuoteDashboard;