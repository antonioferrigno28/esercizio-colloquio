const { useState, useEffect } = React;

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isDiscounted, setDiscounted] = useState(false);

  // Al caricamento della pagina prendi i prodotti
  useEffect(() => {
    fetch("get-products.php")
      .then((response) => response.json())
      // prende i dati sui prodotti e li mette nell'array "Prodotti"
      .then((data) => setProducts(data))
      .catch((err) => console.error("Errore nel caricamento prodotti:", err));
  }, []);

  // All'aggiornamento del carrello aggiorna il totale e controlla se è maggiore di 100 per scontarlo
  useEffect(() => {
    // prende prodotto per prodotto e ne accumula i vari prezzi
    const total = cart.reduce(
      (acc, product) => acc + product.price * product.quantity,
      0
    );
    // se totale maggiore di 100 allora sconta
    if (total > 100) {
      setDiscounted(true);
    } else {
      setDiscounted(false);
    }
  }, [cart]);

  // calcolo del totale
  const getTotal = () => {
    // prende prodotto per prodotto e ne accumula i vari prezzi
    let total = cart.reduce(
      (acc, product) => acc + product.price * product.quantity,
      0
    );
    // se sconto è settato su true
    if (isDiscounted) {
      // calcola il totale aggiornato
      total *= 0.9;
    }
    // ritorna il totale con due cifre dopo la virgola
    return total.toFixed(2);
  };

  // Gestione aggiunta al carrello, prende come parametri il prodotto e la quantità (1)
  const addToCart = (product, quantity) => {
    // Controlla se il prodotto è già presente nel carrello
    const existing = cart.find((item) => item.id === product.id);
    // Se esiste, prende la quantità attuale, altrimenti la considera 0
    const currentQuantity = existing ? existing.quantity : 0;

    // Se la quantità supera la disponibilità in magazzino, mostra un alert
    if (currentQuantity + quantity > product.quantity) {
      alert("Quantità non disponibile.");
      return;
    }

    // Aggiorna lo stato del carrello
    setCart((prev) => {
      // Se il prodotto è già nel carrello, ne aggiorna la quantità
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Se non è presente, lo aggiunge al carrello con la quantità specificata
        return [...prev, { ...product, quantity }];
      }
    });

    // Mostra un messaggio di conferma dell'aggiunta
    alert(`${product.name} aggiunto al carrello!`);
  };
  ``;

  return (
    <div>
      <h1 className="mb-4">Catalogo prodotti</h1>
      <div className="row">
        {products.map((product) => (
          <div key={product.id} className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text">
                  Prezzo: €{Number(product.price).toFixed(2)}
                </p>
                <p className="card-text">Disponibilità: {product.quantity}</p>
                <button
                  className="btn btn-primary mt-auto"
                  onClick={() => addToCart(product, 1)}
                >
                  Aggiungi al carrello
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h1 className="mb-4">Carrello</h1>
      <div className="row">
        {cart.map((product) => (
          <div key={product.id} className="col-md-12 mb-3">
            <div className="card">
              <div className="card-body">
                <p>
                  {product.name} x {product.quantity} - Subtotale: €
                  {(product.price * product.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h3>
        Totale ordine {isDiscounted ? "con il 10% di sconto" : ""}: €
        {getTotal()}
      </h3>
      <div className="d-flex justify-content-between mt-4">
        <button className="btn btn-success">Conferma ordine</button>
        <button className="btn btn-danger" onClick={() => setCart([])}>
          Svuota carrello
        </button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
