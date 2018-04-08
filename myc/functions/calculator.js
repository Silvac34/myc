module.exports = function calculatePrice(nbRquCooks, nbRquCleaners, nbRquSimpleGuests, priceGroceries) {
  var priceUnit = Math.ceil(100000 * priceGroceries / (1 + nbRquCleaners + nbRquCooks + nbRquSimpleGuests)) / 100000;
  var hostPrice = null;
  var cookPrice = null;
  var cleanerPrice = null;
  var simpleGuestPrice = null;

  //si le nombre d'invité est nul, le prix est le même pour tout le monde : aides comme hôte
  if (nbRquSimpleGuests === 0) {
    hostPrice = priceUnit;
    if (nbRquCooks > 0) {
      cookPrice = priceUnit;
    }
    if (nbRquCleaners > 0) {
      cleanerPrice = priceUnit;
    }
  }
  else {
    // l 'invité paiera coefValorisationSimpleGuest de fois en plus du prix unitaire du repas
    var coefValorisationSimpleGuest = 0.25;
    // l 'hôte aura un discount de correlationHostHelp fois plus grand que l'aide
    var correlationHostHelp = 1.5;
    // coef de discount de l 'hôte: il aura un discount de alpha*unitPrice
    var alpha = (nbRquSimpleGuests * coefValorisationSimpleGuest) / (1 + (nbRquCleaners + nbRquCooks) / correlationHostHelp);
    var beta = alpha / correlationHostHelp;
    // valeur pour laquelle on se place à la limite entre le cas général et le cas où le surplus donné par les invités paye l 'hôte mais pas intégralement les aides
    var alphaZero = (1 + nbRquCleaners + nbRquCooks) / (1 + (nbRquCleaners + nbRquCooks) / correlationHostHelp);

    //cas général de réduction des prix
    if (alpha < 1) {
      hostPrice = (1 - alpha) * priceUnit;
      if (nbRquCooks !== 0) {
        cookPrice = (1 - beta) * priceUnit;
      }
      if (nbRquCleaners !== 0) {
        cleanerPrice = (1 - beta) * priceUnit;
        simpleGuestPrice = (1 + coefValorisationSimpleGuest) * priceUnit;
      }
    }
    //cas où le surplus donné par les invités paye intégralement et l'hôte et les aides
    else if (alpha >= alphaZero) {
      hostPrice = 0;
      if (nbRquCooks !== 0) {
        cookPrice = 0;
      }
      if (nbRquCleaners !== 0) {
        cleanerPrice = 0;
        simpleGuestPrice = Math.ceil(100 * priceGroceries / nbRquSimpleGuests) / 100;
      }
    }
    //cas où le surplus donné par les invités paye l'hôte mais pas intégralement les aides, dans ce cas, les aides payent 33% du prix unitaire et les prix invités diminuent
    else {
      hostPrice = 0;
      if (nbRquCooks !== 0) {
        cookPrice = ((1 - beta) - Math.abs((1 - alpha)) / (nbRquCleaners + nbRquCooks)) * priceUnit;
      }
      if (nbRquCleaners !== 0) {
        cleanerPrice = ((1 - beta) - Math.abs((1 - alpha)) / (nbRquCleaners + nbRquCooks)) * priceUnit;
        simpleGuestPrice = (1 + coefValorisationSimpleGuest) * priceUnit;
      }
    }
  }
  //On arrondit tout les prix au dixième
  hostPrice = aproximator(hostPrice);
  simpleGuestPrice = aproximator(simpleGuestPrice);
  cookPrice = aproximator(cookPrice);
  cleanerPrice = aproximator(cleanerPrice);
  var total = transformIntoZero(hostPrice) + transformIntoZero(simpleGuestPrice) * nbRquSimpleGuests + transformIntoZero(cookPrice) * nbRquCooks + transformIntoZero(cleanerPrice) * nbRquCleaners;
  return { "hostPrice": hostPrice, "cookPrice": cookPrice, "cleanerPrice": cleanerPrice, "simpleGuestPrice": simpleGuestPrice,"total": total };
}

//fonction permettant d'approximer un prix pour obtenir par exemple : 9.95€ au lieu de 9.98€ ou alors 3.30€ au lieu de 3.32€"""
function aproximator(value) {
  //vérifie que ce que l 'on met dans la classe est bien un nombre, sinon ça vaut ""
  if (isFloat(value)) {
    return Math.ceil(value * 10) / 10;
  }
  else if (value === 0) {
    return 0;
  }
  else {
    return "";
  }
}

//fonction permettant de transformer un string vide en 0"""
function transformIntoZero(value) {
  if (value === "") { return 0 }
  else {
    return value;
  }
}

function isFloat(n) {
  return Number(n) === n && n % 1 !== 0;
}
