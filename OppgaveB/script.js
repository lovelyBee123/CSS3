// script.js
// Litt generell DOM-logikk: filter i produkter.html, knapper "legg i handlekurv", og modal-funksjoner.

/* -------------------------
   Modal-funksjoner (brukes av produktsider)
   ------------------------- */
function visModal(melding) {
  // Enkel modal som vises hvis elementet finnes (id: simpleModal eller generic)
  const modal = document.getElementById('simpleModal') || document.getElementById('modal') || document.getElementById('simpleModalGeneric');
  if (!modal) {
    // ingen modal på denne siden
    alert(melding);
    return;
  }
  const txt = modal.querySelector('#modalText') || modal.querySelector('p');
  if (txt) txt.textContent = melding;
  modal.style.display = 'flex';
}

// Lukk modal (brukes av knappene i HTML)
function lukkModal() {
  const modal = document.getElementById('simpleModal') || document.getElementById('modal') || document.getElementById('simpleModalGeneric');
  if (modal) modal.style.display = 'none';
}

/* -------------------------
   Produkt-side: legg til lytter på knapper i produkter.html
   ------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  // Legg event handlers til alle "Legg i handlekurv" knapper på products-list
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const navn = btn.dataset.name;
      const pris = Number(btn.dataset.price);
      // kall cart.js funksjon (leggTilIKurv)
      leggTilIKurv({name: navn, price: pris});
    });
  });

  // Filtre: skjul/vis produktkort basert på data-cat
  document.querySelectorAll('.filter-btn').forEach(fbtn => {
    fbtn.addEventListener('click', () => {
      const cat = fbtn.dataset.cat;
      document.querySelectorAll('.product-card').forEach(card => {
        if (cat === 'all' || card.dataset.cat === cat) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Handlekurv-siden: bygg liste over varer (hvis vi er på handlekurv.html)
  const cartItemsEl = document.getElementById('cartItems');
  if (cartItemsEl) {
    const kurv = hentKurv(); // fra cart.js
    if (kurv.length === 0) {
      cartItemsEl.innerHTML = '<p>Handlekurven er tom.</p>';
    } else {
      cartItemsEl.innerHTML = ''; // tøm før bygg
      kurv.forEach((item, idx) => {
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
          <div class="cart-item-left">
            <p class="cart-name">${item.name}</p>
            <p class="cart-price">${item.price} kr</p>
          </div>
          <div class="cart-item-right">
            <button class="btn-outline remove-btn" data-idx="${idx}">Fjern</button>
          </div>
        `;
        cartItemsEl.appendChild(row);
      });

      // totalpris
      const totalEl = document.getElementById('totalPrice');
      if (totalEl) totalEl.textContent = beregnTotal();

      // legg til lyttere for fjern-knappene
      document.querySelectorAll('.remove-btn').forEach(rbtn => {
        rbtn.addEventListener('click', () => {
          const idx = Number(rbtn.dataset.idx);
          fjernFraKurv(idx);
          // reload siden for å oppdatere liste (enkelt)
          location.reload();
        });
      });

      // knappen "Tøm handlekurv"
      const clearBtn = document.getElementById('clearCartBtn');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          tomKurv();
          location.reload();
        });
      }
    }
  }

  // Lukk modal ved klikk utenfor (hvis modal finnes)
  const modal = document.querySelector('.modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) lukkModal();
    });
  }

  // Oppdater cart count i header (i tilfelle localStorage har forandret seg)
  if (typeof oppdaterCartCount === 'function') {
    oppdaterCartCount();
  }
});

// ----- Henter handlekurv fra localStorage -----
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ----- Oppdaterer handlekurv med mengde-knapper -----
function updateCartDisplay() {
    let cartContainer = document.getElementById("cart-items");
    let totalContainer = document.getElementById("cart-total");
    cartContainer.innerHTML = "";

    let totalPrice = 0;

    cart.forEach((item, index) => {
        totalPrice += item.price * item.quantity;

        cartContainer.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-img">

                <div class="item-info">
                    <h3>${item.name}</h3>
                    <p class="price">${item.price} kr</p>

                    <!-- Mengde-knapper -->
                    <div class="quantity-controls">
                        <button class="qty-btn minus" data-index="${index}">−</button>
                        <span class="qty">${item.quantity}</span>
                        <button class="qty-btn plus" data-index="${index}">+</button>
                    </div>
                </div>

                <p class="item-total">${item.price * item.quantity} kr</p>
            </div>
        `;
    });

    totalContainer.innerText = totalPrice + " kr";

    // Legg til funksjon på plus og minus etter HTML er satt inn
    attachQtyButtons();
}
function attachQtyButtons() {
    document.querySelectorAll(".plus").forEach(btn => {
        btn.addEventListener("click", function () {
            let index = this.getAttribute("data-index");
            cart[index].quantity++;
            saveCart();
            updateCartDisplay();
        });
    });

    document.querySelectorAll(".minus").forEach(btn => {
        btn.addEventListener("click", function () {
            let index = this.getAttribute("data-index");

            // Ikke la mengde gå under 1
            if (cart[index].quantity > 1) {
                cart[index].quantity--;
            } else {
                // Fjern produkt hvis det går under 1
                cart.splice(index, 1);
            }

            saveCart();
            updateCartDisplay();
        });
    });
}

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

let c = JSON.parse(localStorage.getItem("cart")) || [];



// ----- Legger til lyttere på + og - -----
function addQuantityListeners() {
    document.querySelectorAll(".plus").forEach(button => {
        button.addEventListener("click", () => {
            let index = button.dataset.index;
            cart[index].quantity++;
            saveCart();
            updateCartDisplay();
        });
    });

    document.querySelectorAll(".minus").forEach(button => {
        button.addEventListener("click", () => {
            let index = button.dataset.index;
            if (cart[index].quantity > 1) {
                cart[index].quantity--;
            } else {
                // Fjern produkt om det blir 0
                cart.splice(index, 1);
            }
            saveCart();
            updateCartDisplay();
        });
    });
}

// ----- Lagrer i localStorage -----
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(name, price, image) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Sjekk om produktet finnes i handlekurven fra før
    let existing = cart.find(item => item.name === name);

    if (existing) {
        // Hvis samme produkt finnes fra før, øk antall
        existing.quantity++;
    } else {
        // Hvis ikke, legg til nytt produkt med quantity = 1
        cart.push({
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Produkt lagt i handlekurven!");
}




// ----- Starter siden -----
updateCartDisplay();
