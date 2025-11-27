// cart.js
// Enkel handlekurv i localStorage.
// Viktig: alle sider inkluderer cart.js slik at samme funksjoner er tilgjengelige.

const CART_KEY = 'klaerNettCart';

// Hent kurv fra localStorage (eller tom liste)
function hentKurv() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

// Lagre kurv til localStorage
function lagreKurv(kurv) {
  localStorage.setItem(CART_KEY, JSON.stringify(kurv));
}

// Legg til et produkt i kurven (produkt er {name, price})
function leggTilIKurv(produkt) {
  const kurv = hentKurv();
  kurv.push(produkt);
  lagreKurv(kurv);
  oppdaterCartCount();
  // Vis enkel modal hvis funksjon finnes på siden
  if (typeof visModal === 'function') {
    visModal(`${produkt.name} lagt i handlekurven.`);
  } else {
    // fallback: browser alert
    console.log(produkt.name + ' lagt i handlekurven');
  }
}

// Fjern vare ved indeks (brukes i handlekurv-siden)
function fjernFraKurv(indeks) {
  const kurv = hentKurv();
  if (indeks >= 0 && indeks < kurv.length) {
    kurv.splice(indeks, 1);
    lagreKurv(kurv);
    oppdaterCartCount();
    return true;
  }
  return false;
}

// Tøm hele kurven
function tomKurv() {
  lagreKurv([]);
  oppdaterCartCount();
}

// Regn ut totalpris
function beregnTotal() {
  return hentKurv().reduce((sum, item) => sum + Number(item.price), 0);
}

// Oppdater tallet ved handlekurvikonet (henter .cart-count)
function oppdaterCartCount() {
  const el = document.querySelectorAll('.cart-count');
  const count = hentKurv().length;
  el.forEach(node => node.textContent = count);
}

// Når filen lastes, oppdater telleren
oppdaterCartCount();



