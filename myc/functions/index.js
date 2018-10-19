const functions = require('firebase-functions');
const calculatePrice = require('./calculator');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
//exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.createMeal = functions.firestore
  .document('meals/{mealId}')
  .onCreate((snap, context) => {
    // Get an object representing the document
    // e.g. {'name': 'Marie', 'age': 66}
    var meal = snap.data();
    var resources = ["cooks", "cleaners", "simpleGuests"];
    var nbResources = [0, 0, 0];
    resources.forEach( (item, index) => {
      var nbRquHelp = meal["detailedInfo"]["requiredGuests"][item]["nbRqu" + item[0].toUpperCase() + item.slice(1)];
      if (nbRquHelp > 0) {
        nbResources[index] = nbRquHelp;
      }
    });
    var nbRemainingPlaces = nbResources[0] + nbResources[1] + nbResources[2];
    var nbHosts = 1;
    var nbGuests = nbHosts + nbRemainingPlaces;
    var price = calculatePrice(nbResources[0], nbResources[1], nbResources[2], meal.price);
    meal["nbRemainingPlaces"] = nbRemainingPlaces;
    meal["nbGuests"] = nbGuests;
    meal["detailedInfo"]["requiredGuests"]["hosts"] = {"price": price["hostPrice"]};
    if(nbResources[0] > 0) {
      meal["detailedInfo"]["requiredGuests"]["cooks"]["price"] = price["cookPrice"]; 
    }
    if(nbResources[1] > 0) {
      meal["detailedInfo"]["requiredGuests"]["cleaners"]["price"] = price["cleanerPrice"]; 
    }
    if(nbResources[2] > 0) {
      meal["detailedInfo"]["requiredGuests"]["simpleGuests"]["price"] = price["simpleGuestPrice"]; 
    }
    //rajouter le modèle de donner à updater avec set
    return snap.ref.set(meal, {"merge": true});
  });
  
exports.Unsubscribe = functions.https.onCall((data, context) => {
  //rajouter la fonction qui permet de se désinscrire d'un repas --> transformer ce qu'il y a dans my-meal-dtld/modal/delete a une fonction ici
  console.log(data);
  console.log(context);
  //functions.firestore.document('meals/{'+data.mealId+'}').on
});

exports.subscribeMeal = functions.firestore
  .document('meals/{mealId}')
  .onCreate((snap, context) => {
    
  });