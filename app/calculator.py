# -*- coding: utf-8 -*-
import math

def aproximator(value):
    """fonction permettant d'approximer un prix pour obtenir par exemple : 9.95€ au lieu de 9.98€ ou alors 3.30€ au lieu de 3.32€"""
    if isinstance(value, ( float, long )): #vérifie que ce que l'on met dans la classe est bien un nombre, sinon ça vaut ""
        return math.ceil(value * 10) / 10
            
    elif value == 0:
        return 0
    else:
        return ""

#if __name__ == "__main__": #test de la fonction aproximator()
#    valueTestApproximator = input("Enter a value to test the aproximate function: ")
#    inputValueApproximator = aproximator(valueTestApproximator)
#    try:
#        if isinstance(inputValueApproximator, (float,long)):
#            resultTestApproximator = (100 * inputValueApproximator) % 5
#        else:
#            resultTestApproximator = inputValueApproximator
#        assert resultTestApproximator == 0
#    except AssertionError:
#        print("You neither entered a number or a word")
            
            
def transformIntoZero(value):
    """fonction permettant de transformer un string vide en 0"""
    if value == "":
        return 0
    else:
        return value

#if __name__ == "__main__": #test de la fonction transformIntoZero()
#    try:
#        valueTestTransformIntoZero = input("")
#        inputValueTransformIntoZero = transformIntoZero(valueTestTransformIntoZero)
#        assert inputValueTransformIntoZero == 0
#    except AssertionError:
#        print("The fonction doesn't work well")
        

def resolve(nbRquSimpleGuests, nbRquCooks, nbRquCleaners, priceGroceries):
    """fonction permettant de calculer les prix invités, cuisinier et aides qui prend en paramètre pour la méthode resolve:
    [nbRquSimpleGuests = nombre d'invités (simpleGuests), nbRquCleaners = nombre d'aides vaisselles, nbRquCooks = nombre d'aides cuisines, priceGroceries = prix total des courses]
    
    il en résulte 'result' = [hostPrice, cookPrice, cleanerPrice, simpleGuestPrice]
    """
    if isinstance( nbRquSimpleGuests, ( int, long ) ) & isinstance( nbRquCooks, ( int, long ) ) & isinstance( nbRquCleaners, ( int, long ) ) & (isinstance( priceGroceries, ( float, long ) ) | isinstance( priceGroceries, ( int, long ) )):
        priceUnit = math.ceil( 100000 * priceGroceries / (1 + nbRquCleaners + nbRquCooks + nbRquSimpleGuests) ) / 100000
        hostPrice = ""
        cookPrice = ""
        cleanerPrice = ""
        simpleGuestPrice = ""
    
        if nbRquSimpleGuests == 0: #si le nombre d'invité est nul, le prix est le même pour tout le monde : aides comme hôte
            hostPrice = priceUnit
            if nbRquCooks != 0:
                cookPrice = priceUnit
            if nbRquCleaners != 0:
                cleanerPrice = priceUnit
        
        else:
            coefValorisationSimpleGuest = 0.25 #l'invité paiera coefValorisationSimpleGuest de fois en plus du prix unitaire du repas
            correlationHostHelp = 1.5 #l'hôte aura un discount de correlationHostHelp fois plus grand que l'aide
            alpha = (nbRquSimpleGuests * coefValorisationSimpleGuest) / (1 + (nbRquCleaners + nbRquCooks) / correlationHostHelp) #coef de discount de l'hôte: il aura un discount de alpha*unitPrice
            beta = alpha / correlationHostHelp
            alphaZero = (1 + nbRquCleaners + nbRquCooks) / (1 + (nbRquCleaners + nbRquCooks) / correlationHostHelp) #valeur pour laquelle on se place à la limite entre le cas général et le cas où le surplus donné par les invités paye l'hôte mais pas intégralement les aides
                
            if alpha < 1: #cas général de réduction des prix
                hostPrice = (1 - alpha) * priceUnit
                if nbRquCooks != 0:
                    cookPrice = (1 - beta) * priceUnit
                if nbRquCleaners != 0:
                    cleanerPrice = (1 - beta) * priceUnit
                simpleGuestPrice = (1 + coefValorisationSimpleGuest) * priceUnit
                    
            elif alpha >= alphaZero: #cas où le surplus donné par les invités paye intégralement et l'hôte et les aides
                hostPrice = 0
                if nbRquCooks != 0:
                    cookPrice = 0
                if nbRquCleaners != 0:
                    cleanerPrice = 0
                simpleGuestPrice = math.ceil(100* priceGroceries / nbRquSimpleGuests)/100
            else: #cas où le surplus donné par les invités paye l'hôte mais pas intégralement les aides, dans ce cas, les aides payent 33% du prix unitaire et les prix invités diminuent
                hostPrice = 0
                if nbRquCooks != 0:
                    cookPrice = ( (1 - beta) - abs((1 - alpha)) / (nbRquCleaners + nbRquCooks) ) * priceUnit
                if nbRquCleaners != 0:
                    cleanerPrice = ( (1 - beta) - abs((1 - alpha)) / (nbRquCleaners + nbRquCooks) ) * priceUnit
                simpleGuestPrice = (1 + coefValorisationSimpleGuest) * priceUnit
             
        #On arrondit tout les prix au dixième
        hostPrice = aproximator(hostPrice)
        simpleGuestPrice = aproximator(simpleGuestPrice)
        cookPrice = aproximator(cookPrice)
        cleanerPrice = aproximator(cleanerPrice)
        total = transformIntoZero(hostPrice) + transformIntoZero(simpleGuestPrice)*nbRquSimpleGuests + transformIntoZero(cookPrice)*nbRquCooks + transformIntoZero(cleanerPrice)*nbRquCleaners
        return {"hostPrice":hostPrice, "simpleGuestPrice":simpleGuestPrice, "cookPrice":cookPrice, "cleanerPrice":cleanerPrice, "total":total}
     
    else:
        return "variable error"
        
if __name__ == "__main__": #test de la fonction resolve()
    nbRquSimpleGuests = input("Enter the number of simple guests: ")
    nbRquCooks = input("Enter the number of helping cooks: ")
    nbRquCleaners = input("Enter the number of helping cleaners: ")
    priceGroceries = input("What is the price of the groceries: ")
    resultResolve = resolve(nbRquSimpleGuests, nbRquCooks, nbRquCleaners, priceGroceries)
    try:
        assert (priceGroceries - resultResolve["total"]) < 1
    except ValueError:
        print("The difference between the sum and the price of the groceries is too big")
    
    print(resultResolve['hostPrice'])
    print(resultResolve['simpleGuestPrice'])
    print(resultResolve['cookPrice'])
    print(resultResolve['cleanerPrice'])