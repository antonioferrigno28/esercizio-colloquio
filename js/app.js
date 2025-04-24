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

    // Aggiorna la disponibilità visibile
    setProducts((prev) =>
      prev.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity - quantity }
          : item
      )
    );
  };

  //Rimozione dal carrello dato l'id del prodotto
  const removeFromCart = (productId) => {
    // Trova l'oggetto da rimuovere
    const itemToRemove = cart.find((item) => item.id === productId);

    // Ripristina la quantità nel catalogo
    setProducts((prevProducts) =>
      // Se il prodotto esiste nel catalogo, ripristina la quantità
      prevProducts.map((product) =>
        product.id === productId
          ? { ...product, quantity: product.quantity + itemToRemove.quantity }
          : product
      )
    );

    // Rimuovi dal carrello
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
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
    <div className="container py-4">
      <h1 className="mb-5 text-primary-emphasis fw-bold border-bottom pb-2">
        Catalogo Prodotti
      </h1>

      <div className="row g-4">
        {products.map((product) => (
          <div key={product.id} className="col-md-4">
            <div className="card product-card h-100 border-0 shadow-sm">
              <div className="product-img-wrapper">
                <img
                  src={
                    product.image ||
                    "https://www.horizonplant.com/wp-content/uploads/2017/05/placeholder-400x400.png"
                  }
                  alt={product.name}
                  className="card-img-top product-img"
                />
              </div>
              <div className="card-body d-flex flex-column">
                <h5 className="card-title fw-semibold">{product.name}</h5>
                <p className="card-text fs-5 text-primary fw-bold">
                  €{Number(product.price).toFixed(2)}
                </p>
                <span className="badge bg-light text-dark mb-3 border">
                  Disponibilità: {product.quantity}
                </span>
                <button
                  className="btn btn-warning mt-auto text-dark fw-semibold"
                  disabled={product.quantity === 0}
                  onClick={() => addToCart(product, 1)}
                >
                  🛒 Aggiungi al carrello
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-5 mb-4 border-bottom pb-2">Carrello</h2>
      <div className="row">
        {cart.map((product) => (
          <div key={product.id} className="col-12 mb-3">
            <div className="d-flex border rounded shadow-sm p-3 align-items-center gap-3 flex-wrap">
              <img
                src={
                  product.image ||
                  "https://www.horizonplant.com/wp-content/uploads/2017/05/placeholder-400x400.png"
                }
                alt={product.name}
                className="img-thumbnail"
                style={{ width: "100px", height: "100px", objectFit: "cover" }}
              />

              <div className="flex-grow-1">
                <h5 className="mb-1 fw-semibold">{product.name}</h5>
                <p className="mb-1 text-muted small">Disponibilità immediata</p>
                <div className="d-flex align-items-center gap-3 flex-wrap">
                  <span className="fw-bold text-primary fs-5">
                    €{Number(product.price).toFixed(2)}
                  </span>
                  <div className="input-group input-group-sm w-auto">
                    <span className="input-group-text">Qty</span>
                    <input
                      type="number"
                      className="form-control"
                      value={product.quantity}
                      min={1}
                      max={product.initialQuantity}
                      onChange={(e) =>
                        addToCart(
                          product,
                          parseInt(e.target.value) - product.quantity
                        )
                      }
                    />
                  </div>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => removeFromCart(product.id)}
                  >
                    Rimuovi
                  </button>
                </div>
              </div>

              <div className="text-end">
                <p className="fw-semibold mb-0">
                  Subtotale: €{(product.price * product.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h3 className="mt-4">
        Totale ordine {isDiscounted ? "con il 10% di sconto" : ""}:{" "}
        <span className="text-success">€{getTotal()}</span>
      </h3>

      <div className="d-flex justify-content-between mt-4">
        <button className="btn btn-success fw-semibold" onClick={handleOrder}>
          ✅ Conferma ordine
        </button>
        <button
          className="btn btn-outline-danger"
          onClick={() => {
            setCart([]);
            reloadProducts();
          }}
        >
          ❌ Svuota carrello
        </button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
