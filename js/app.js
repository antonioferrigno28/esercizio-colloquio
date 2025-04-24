const { useState, useEffect } = React;

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isDiscounted, setDiscounted] = useState(false);
  const [orderData, setOrderData] = useState({ cart: [], total: 0 });

  // FASE DI CARICAMENTO

  const reloadProducts = () => {
    fetch("get-products.php")
      .then((response) => response.json())
      .then((data) => {
        const productsWithInitialQuantity = data.map((product) => ({
          ...product,
          initialQuantity: product.quantity,
        }));
        setProducts(productsWithInitialQuantity);
      })
      .catch((err) => console.error("Errore nel caricamento prodotti:", err));
  };

  useEffect(() => {
    reloadProducts();
  }, []);

  //FASE DI AGGIORNAMENTO DEL CARRELLO

  useEffect(() => {
    const total = calculateTotal(cart);
    if (total > 100) {
      setDiscounted(true);
    } else {
      setDiscounted(false);
    }
    setOrderData({ cart, total });
  }, [cart]);

  const calculateTotal = (cart) => {
    return cart.reduce(
      (acc, product) => acc + product.price * product.quantity,
      0
    );
  };

  const getTotal = () => {
    let total = calculateTotal(cart);
    if (isDiscounted) {
      total *= 0.9;
    }
    return total.toFixed(2);
  };

  const addToCart = (product, quantity) => {
    const existing = cart.find((item) => item.id === product.id);

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

    setProducts((prev) =>
      prev.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity - quantity }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    const itemToRemove = cart.find((item) => item.id === productId);

    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId
          ? { ...product, quantity: product.quantity + itemToRemove.quantity }
          : product
      )
    );

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
          setCart([]);
          reloadProducts();
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
                <p className="card-text fs-6 text-dark fw-bold">
                  €{Number(product.price).toFixed(2)}
                </p>
                <span
                  className={
                    "badge bg-light mb-3 border " +
                    (product.quantity <= 0 ? "text-danger" : "text-dark")
                  }
                >
                  Disponibilità:{" "}
                  {product.quantity > 0 ? product.quantity : "Non disponibile"}
                </span>
                <button
                  className={
                    "btn mt-auto fw-semibold " +
                    (product.quantity <= 0
                      ? "btn-danger text-white"
                      : "btn-warning text-dark")
                  }
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
                  <span className="fw-bold text-dark fs-6">
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
          type="button"
          className="btn btn-success btn-animation btn-green fw-semibold"
          data-bs-toggle="modal"
          data-bs-target="#orderModal"
          disabled={cart.length === 0}
        >
          Conferma Ordine
        </button>
        <button
          className="btn btn-danger btn-animation btn-red fw-semibold"
          data-bs-toggle="modal"
          data-bs-target="#clearCartModal"
          disabled={cart.length === 0}
        >
          Svuota carrello
        </button>
      </div>

      {/* Modale di conferma ordine */}

      <div
        className="modal fade"
        id="orderModal"
        tabIndex="-1"
        aria-labelledby="orderModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-semibold" id="orderModalLabel">
                Conferma Ordine
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <p>Sei sicuro di voler confermare l'ordine?</p>
              <p className="fw-semibold">
                Totale{isDiscounted ? " con il 10% di sconto" : ""}: €
                {getTotal()}
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary btn-animation btn-grey fw-semibold"
                data-bs-dismiss="modal"
              >
                Annulla
              </button>
              <button
                className="btn btn-success btn-animation btn-green fw-semibold"
                data-bs-dismiss="modal"
                onClick={() => {
                  handleOrder();
                  // Il dato della modale sarà gestito automaticamente dal data-bs-dismiss="modal"
                }}
              >
                Conferma
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modale di conferma svuotamento carrello */}

      <div
        className="modal fade"
        id="clearCartModal"
        tabIndex="-1"
        aria-labelledby="clearCartModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-semibold">
                Conferma Svuotamento Carrello
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <p>Sei sicuro di voler svuotare il carrello?</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary btn-animation btn-grey fw-semibold"
                data-bs-dismiss="modal"
              >
                Annulla
              </button>
              <button
                className="btn btn-danger btn-animation btn-red fw-semibold"
                data-bs-dismiss="modal"
                onClick={() => {
                  setCart([]);
                  reloadProducts();
                  setDiscounted(false);
                }}
              >
                Svuota
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
