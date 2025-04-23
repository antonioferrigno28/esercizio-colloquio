const { useState, useEffect } = React;

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isDiscounted, setDiscounted] = useState(false);
  const [orderData, setOrderData] = useState({ cart: [], total: 0 });

  // Al caricamento della pagina prendi i prodotti
  useEffect(() => {
    fetch("get-products.php")
      .then((response) => response.json())
      .then((data) => {
        // Aggiungi initialQuantity basato su quantity
        //Per avere la quantità iniziale dei prodotti
        const productsWithInitialQuantity = data.map((product) => ({
          ...product,
          initialQuantity: product.quantity,
        }));
        setProducts(productsWithInitialQuantity);
      })
      .catch((err) => console.error("Errore nel caricamento prodotti:", err));
  }, []);

  // All'aggiornamento del carrello aggiorna il totale e controlla se è maggiore di 100 per scontarlo
  useEffect(() => {
    // prende prodotto per prodotto e ne accumula i vari prezzi
    const total = cart.reduce(
      (acc, product) => acc + product.price * product.quantity,
      0
    );
    // se totale maggiore di 100 allora abilita lo sconto rendendolo true
    if (total > 100) {
      setDiscounted(true);
      // console.log(cart);
      // console.log(total);
      setOrderData({ cart, total });
      console.log(orderData);
    } else {
      setDiscounted(false);

      // console.log(cart);
      // console.log(total);
      setOrderData({ cart, total });
      console.log(orderData);
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
  // Gestione aggiunta al carrello, prende come parametri il prodotto e la quantità (1)
  const addToCart = (product, quantity) => {
    // Blocca se la quantità è <= 0
    if (product.quantity < 1) {
      alert("Prodotto esaurito.");
      return;
    }

    const existing = cart.find((item) => item.id === product.id);
    const currentQuantity = existing ? existing.quantity : 0;

    if (currentQuantity + quantity > product.initialQuantity) {
      alert("Quantità non disponibile.");
      return;
    }

    // Aggiorna il carrello
    setCart((prev) => {
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prev, { ...product, quantity }];
      }
    });

    // Aggiorna la disponibilità visibile (ma non usarla per i controlli)
    setProducts((prev) =>
      prev.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity - quantity }
          : item
      )
    );
  };

  //invio dell'ordine al backend
  const handleOrder = () => {
    fetch("save-order.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })
      .then((response) => response.text())
      .then((data) => {
        console.log("Risposta dal server:", data);
        try {
          const jsonData = JSON.parse(data);
          if (jsonData.success) {
            alert("Ordine effettuato con successo!");
            // PRIMA svuota il carrello
            setCart([]);
            // POI ricarica i prodotti per ripristinare le quantità
            reloadProducts();
          } else {
            alert("Errore nell'effettuare l'ordine.");
          }
        } catch (err) {
          console.error("Errore nel parsing del JSON:", err);
        }
      })
      .catch((err) => {
        console.error("Errore nell'invio dell'ordine:", err);
        alert("Si è verificato un errore durante l'ordine.");
      });
  };

  const reloadProducts = () => {
    fetch("get-products.php")
      .then((response) => response.json())
      .then((data) => {
        // Aggiungi initialQuantity basato su quantity
        //Per avere la quantità iniziale dei prodotti
        const productsWithInitialQuantity = data.map((product) => ({
          ...product,
          initialQuantity: product.quantity,
        }));
        setProducts(productsWithInitialQuantity);
      })
      .catch((err) => console.error("Errore nel caricamento prodotti:", err));
  };

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
        <button className="btn btn-success" onClick={handleOrder}>
          Conferma ordine
        </button>
        <button
          className="btn btn-danger"
          onClick={() => {
            setCart([]);
            reloadProducts();
          }}
        >
          Svuota carrello
        </button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
