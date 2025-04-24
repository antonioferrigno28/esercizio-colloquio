const { useState, useEffect } = React;

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isDiscounted, setDiscounted] = useState(false);
  const [orderData, setOrderData] = useState({ cart: [], total: 0 });

  // FASE DI CARICAMENTO

  // funzione per ricaricare i prodotti
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

  // Al caricamento della pagina prendi i prodotti richiamando la funzione
  useEffect(() => {
    reloadProducts();
  }, []);

  //FASE DI AGGIORNAMENTO DEL CARRELLO

  // All'aggiornamento del carrello aggiorna il totale e controlla se è maggiore di 100 per scontarlo
  useEffect(() => {
    // richiama la funzione di calcolo del totale e lo assegna a una variabile
    const total = calculateTotal(cart);
    // se totale maggiore di 100 allora abilita lo sconto rendendolo true
    if (total > 100) {
      setDiscounted(true);
      // console.log(cart);
      // console.log(total);
      // console.log(orderData);
    } else {
      setDiscounted(false);
    }
    // console.log(cart);
    setOrderData({ cart, total });
  }, [cart]);

  //funzione per calcolare il totale del carrello
  const calculateTotal = (cart) => {
    // prende prodotto per prodotto e ne accumula i vari prezzi
    return cart.reduce(
      (acc, product) => acc + product.price * product.quantity,
      0
    );
  };

  // calcolo del totale
  const getTotal = () => {
    // richiama la funzione di calcolo del totale e lo assegna a una variabile
    let total = calculateTotal(cart);
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
    //Cerca se il prodotto è già presente nel carrello comparando gli id e assegna a una variabile
    const existing = cart.find((item) => item.id === product.id);

    //aggiorna il carrello, prende lo stato precedente del carrello
    setCart((prev) => {
      // Se il prodotto esiste già
      if (existing) {
        //ritorna il carrello aggiornato
        return prev.map((item) =>
          //compara gli id del prodotto e del prodotto nel carrello e se sono uguali ritorna l'item facendone una copia e aggiornando la quantità
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Se il prodotto non esiste, aggiungilo al carrello copiando gli elementi di prev e aggiungendo il nuovo prodotto con la quantità
        return [...prev, { ...product, quantity }];
      }
    });

    // Aggiorna la disponibilità visibile
    setProducts((prev) =>
      // Se il prodotto c'è nel catalogo aggiorna la quantità facendo una copia e sottraendo la quantità nel carrello
      prev.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity - quantity }
          : item
      )
    );
  };

  //Rimozione dal carrello dato l'id del prodotto
  const removeFromCart = (productId) => {
    // Trova l'oggetto da rimuovere comparando con quello arrivato come parametro
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

    // Rimuovi dal carrello l'oggetto
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const handleOrder = () => {
    fetch("save-order.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Ordine effettuato con successo!");
          // svuota il carrello
          setCart([]);
          // ricarica i prodotti con la nuova disponibilità
          reloadProducts();
          //resetta lo stato dello sconto
          setDiscounted(false);
        } else {
          alert("Errore nell'effettuare l'ordine.");
        }
      })
      .catch(() => alert("Errore durante l'invio dell'ordine."));
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
                  //passa alal funzione addToCart il prodotto e la quantità
                  onClick={() => addToCart(product, 1)}
                >
                  🛒 Aggiungi al carrello
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h1 className="mt-5 mb-4 text-primary-emphasis fw-bold border-bottom pb-2">
        Carrello
      </h1>
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
                      //quando cambia il valore dell'input chiama la funzione addToCart
                      //passando l'intero prodotto e la differenza tra il valore dell'input e la quantità del prodotto
                      onChange={(e) =>
                        addToCart(
                          product,
                          //es: se mettiamo 5 e la quantità è 2, il valore dell'input è 5 - 2 = 3
                          //quindi aggiungiamo 3 al carrello
                          parseInt(e.target.value) - product.quantity
                        )
                      }
                    />
                  </div>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    //passa alla funzione removeFromCart l'id del prodotto
                    //per rimuoverlo dal carrello
                    onClick={() => removeFromCart(product.id)}
                  >
                    Rimuovi
                  </button>
                </div>
              </div>

              <div className="text-end">
                <p className="text-muted fst-italic mb-1">
                  Prezzo al pezzo: €{product.price}
                </p>
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
        <span className={"text-success"}>€{getTotal()}</span>
      </h3>

      <div className="d-flex justify-content-between mt-4">
        <button
          className="btn btn-success btn-animation btn-green fw-semibold"
          onClick={handleOrder}
        >
          Conferma ordine
        </button>
        <button
          className="btn btn-danger btn-animation btn-red fw-semibold "
          onClick={() => {
            // Svuota il carrello e ripristina la disponibilità dei prodotti
            setCart([]);
            reloadProducts();
            setDiscounted(false);
          }}
        >
          Svuota carrello
        </button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
