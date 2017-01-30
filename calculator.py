# -*- coding: utf-8 -*-
import math

class Aproximator:
    """class permettant d'approximer un prix pour obtenir par exemple : 9.95€ au lieu de 9.98€ ou alors 3.30€ au lieu de 3.32€"""
    
    def __init__(self, value):
        """Calcul qui permet d'arrondir aux 5 cents supérieurs"""
        if isinstance(value, float) == True: #vérifie que ce que l'on met dans la classe est bien un nombre, sinon ça vaut ""
            priceHundred = value * 100
            remains = priceHundred % 5
            priceHundred = priceHundred + (5 - remains)
            self.numberAproximate = priceHundred / 100
        else:
            self.numberAproximate = ""

class TransformIntoZero:
    """class permettant de transformer un string vide en 0"""
    def __init__(self, value):
        if value == "":
            self.valueTransformed = 0
        else:
            self.valueTransformed = value

class Calculator:
    """classe permettant de calculer les prix invités, cuisinier et aides qui prend en paramètre pour la méthode resolve:
        [nbRquSimpleGuests = nombre d'invités (simpleGuests), nbRquCleaners = nombre d'aides vaisselles, nbRquCooks = nombre d'aides cuisines, priceGroceries = prix total des courses]
        
        il en résulte 'result' = [hostPrice, cookPrice, cleanerPrice, simpleGuestPrice]
        """
    
    def __init__(self):
        """par défaut, les prix de chacuns sont nuls"""
        self.hostPrice = ""
        self.cookPrice = ""
        self.cleanerPrice = ""
        self.simpleGuestPrice = ""
        
        
    def resolve(self, nbRquSimpleGuests, nbRquCooks, nbRquCleaners, priceGroceries):
        """la fonction resolve effectue le calcul et return chacun des prix"""
        priceUnit = math.ceil( 100000 * priceGroceries / (1 + nbRquCleaners + nbRquCooks + nbRquSimpleGuests) ) / 100000
        
        if nbRquSimpleGuests == 0: #si le nombre d'invité est nul, le prix est le même pour tout le monde : aides comme hôte
            self.hostPrice = priceUnit
            if nbRquCooks != 0:
                self.cookPrice = priceUnit
            if nbRquCleaners != 0:
                self.cleanerPrice = priceUnit
        
        else:
            coefValorisationSimpleGuest = 0.25 #l'invité paiera coefValorisationSimpleGuest de fois en plus du prix unitaire du repas
            correlationHostHelp = 1.5 #l'hôte aura un discount de correlationHostHelp fois plus grand que l'aide
            alpha = (nbRquSimpleGuests * coefValorisationSimpleGuest) / (1 + (nbRquCleaners + nbRquCooks) / correlationHostHelp) #coef de discount de l'hôte: il aura un discount de alpha*unitPrice
            beta = alpha / correlationHostHelp
            alphaZero = (1 + nbRquCleaners + nbRquCooks) / (1 + (nbRquCleaners + nbRquCooks) / correlationHostHelp) #valeur pour laquelle on se place à la limite entre le cas général et le cas où le surplus donné par les invités paye l'hôte mais pas intégralement les aides
            
            if alpha < 1: #cas général de réduction des prix
                self.hostPrice = (1 - alpha) * priceUnit
                if nbRquCooks != 0:
                    self.cookPrice = (1 - beta) * priceUnit
                if nbRquCleaners != 0:
                    self.cleanerPrice = (1 - beta) * priceUnit
                self.simpleGuestPrice = (1 + coefValorisationSimpleGuest) * priceUnit
                
            elif alpha >= alphaZero: #cas où le surplus donné par les invités paye intégralement et l'hôte et les aides
                self.hostPrice = 0
                if nbRquCooks != 0:
                    self.cookPrice = 0
                if nbRquCleaners != 0:
                    self.cleanerPrice = 0
                self.simpleGuestPrice = math.ceil(100* priceGroceries / nbRquSimpleGuests)/100
            else: #cas où le surplus donné par les invités paye l'hôte mais pas intégralement les aides, dans ce cas, les aides payent 33% du prix unitaire et les prix invités diminuent
                self.hostPrice = 0
                if nbRquCooks != 0:
                    self.cookPrice = ( (1 - beta) - abs((1 - alpha)) / (nbRquCleaners + nbRquCooks) ) * priceUnit
                if nbRquCleaners != 0:
                    self.cleanerPrice = ( (1 - beta) - abs((1 - alpha)) / (nbRquCleaners + nbRquCooks) ) * priceUnit
                self.simpleGuestPrice = (1 + coefValorisationSimpleGuest) * priceUnit
         
        #On arrondit tout les prix au dixième
        self.hostPrice = Aproximator(self.hostPrice).numberAproximate
        self.simpleGuestPrice = Aproximator(self.simpleGuestPrice).numberAproximate
        self.cookPrice = Aproximator(self.cookPrice).numberAproximate
        self.cleanerPrice = Aproximator(self.cleanerPrice).numberAproximate
        total = TransformIntoZero(self.hostPrice).valueTransformed + TransformIntoZero(self.simpleGuestPrice).valueTransformed*nbRquSimpleGuests + TransformIntoZero(self.cookPrice).valueTransformed*nbRquCooks + TransformIntoZero(self.cleanerPrice).valueTransformed*nbRquCleaners
        return [('hostPrice',self.hostPrice),('simpleGuestPrice',self.simpleGuestPrice),('cookPrice',self.cookPrice),('cleanerPrice',self.cleanerPrice),('total',total)]

        
monCalcul = Calculator()
#[nbRquSimpleGuests, nbRquCooks, nbRquCleaners, priceGroceries]
monResultat = monCalcul.resolve(5,0,0,20)
#[hostPrice,cookPrice,cleanerPrice,simpleGuestPrice]
print(monResultat)