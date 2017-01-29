# -*- coding: utf-8 -*-
import math

class Aproximator:
    """class permettant d'approximer un prix pour obtenir par exemple : 9.95€ au lieu de 9.98€ ou alors 3.30€ au lieu de 3.32€"""
    
    def __init__(self, value):
        priceHundred = value * 100
        remains = priceHundred % 5
        priceHundred = priceHundred + (5 - remains)
        self.numberAproximate = priceHundred / 100



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
        priceUnit = round(priceGroceries / (1 + nbRquCleaners + nbRquCooks + nbRquSimpleGuests),5)
        
        if nbRquSimpleGuests == 0: #si le nombre d'invité est nul, le prix est le même pour tout le monde : aides comme hôte
            self.hostPrice = priceUnit
            if nbRquCooks != 0:
                self.cookPrice = priceUnit
            if nbRquCleaners != 0:
                self.cleanerPrice = priceUnit
        
        else:
            alpha = math.ceil( 100000 * 0.25 * nbRquSimpleGuests / ( (1 + 0.666666 * (nbRquCleaners + nbRquCooks) ) * priceUnit) ) / 100000 #coefficient 100000 choisit aléatoirement pour avoir une bonne approx de alpha
            
            if alpha <= 1: #cas général de réduction des prix
                self.hostPrice = priceGroceries
                if nbRquCooks != 0:
                    self.cookPrice = (1 - alpha * 0.666666) * priceUnit
                    self.hostPrice -= nbRquCooks * self.cookPrice
                if nbRquCleaners != 0:
                    self.cleanerPrice = (1 - alpha * 0.666666) * priceUnit
                    self.hostPrice -= nbRquCleaners * self.cleanerPrice
                self.simpleGuestPrice = 1.25 * priceUnit
                self.hostPrice -= nbRquSimpleGuests * self.simpleGuestPrice
                
            elif alpha >= 1.5: #cas où le surplus donné par les invités paye intégralement et l'hôte et les aides
                self.hostPrice = 0
                if nbRquCooks != 0:
                    self.cookPrice = 0
                if nbRquCleaners != 0:
                    self.cleanerPrice = 0
                self.simpleGuestPrice = 1.25 * priceUnit - (abs((1 - alpha) * priceUnit) + math.ceil(10000*(nbRquCleaners + nbRquCooks) * abs((1 - 0.666666 * alpha) * priceUnit)) / nbRquSimpleGuests) / 10000
            else: #cas où le surplus donné par les invités paye l'hôte mais pas intégralement les aides, dans ce cas, les aides payent 33% du prix unitaire et les prix invités diminuent
                self.hostPrice = 0
                if nbRquCooks != 0:
                    self.cookPrice = (1 - 0.666666 * alpha) * priceUnit
                if nbRquCleaners != 0:
                    self.cleanerPrice = (1 - 0.666666 * alpha) * priceUnit
                self.simpleGuestPrice = 1.25 * priceUnit - math.ceil(10000 * (abs((1 - alpha) * priceUnit) / nbRquSimpleGuests)) / 10000
         
        #On arrondit tous les prix au dixième
        self.hostPrice = Aproximator(self.hostPrice).numberAproximate
        self.simpleGuestPrice = Aproximator(self.simpleGuestPrice).numberAproximate
        self.cookPrice = Aproximator(self.cookPrice).numberAproximate
        self.cleanerPrice = Aproximator(self.cleanerPrice).numberAproximate
        total = self.hostPrice + self.simpleGuestPrice*nbRquSimpleGuests + self.cookPrice*nbRquCooks + self.cleanerPrice*nbRquCleaners
        return [('hostPrice',self.hostPrice),('simpleGuestPrice',self.simpleGuestPrice),('cookPrice',self.cookPrice),('cleanerPrice',self.cleanerPrice),('total',total)]

        
monCalcul = Calculator()
#[nbRquSimpleGuests, nbRquCooks, nbRquCleaners, priceGroceries]
monResultat = monCalcul.resolve(1,1,2,11.5)
#[hostPrice,cookPrice,cleanerPrice,simpleGuestPrice]
print(monResultat)