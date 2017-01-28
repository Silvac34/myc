# -*- coding: utf-8 -*-
import math

class Calculator:
    """classe permettant de calculer les prix invités, cuisinier et aides qui prend en paramètre:
        - nbRquSimpleGuests = nombre d'invités (simpleGuests)
        - nbRquCleaners = nombre d'aides vaisselles
        - nbRquCooks = nombre d'aides cuisines
        - priceGroceries = prix total des courses
        
        il en ressort une liste contenue dans 'result': 
        - cookPrice
        - cleanerPrice
        - simpleGuestPrice
        """
    result = [] #variable qui sera retournée et contiendra les prix de chacuns
    
    def __init__(self):
        """par défaut, les prix de chacuns sont nuls"""
        self.hostPrice = ""
        self.cookPrice = ""
        self.cleanerPrice = ""
        self.simpleGuestPrice = ""
        
    def resolve(self, nbRquSimpleGuests, nbRquCleaners, nbRquCooks, priceGroceries):
        """la fonction resolve effectue le calcul et return chacun des prix"""
        priceUnit = priceGroceries / (1 + nbRquCleaners + nbRquCooks + nbRquSimpleGuests) #priceUnit correspond au prix unitaire par personne sans aucun discount
        
        if nbRquSimpleGuests == 0: #si le nombre d'invité est nul, le prix est le même pour tout le monde : aides comme hôte
            self.hostPrice = priceUnit
            self.cookPrice = priceUnit
            self.cleanerPrice = priceUnit
            self.simpleGuestPrice = priceUnit
        
        else:
            alpha = (0,25 * nbRquSimpleGuests) / ( (1 + (2 * (nbRquCleaners + nbRquCooks) / 3) ) * priceUnit
            if alpha <= 1: #cas général de réduction des prix
                self.hostPrice = (1 - alpha) * priceUnit
                self.cookPrice = (1 - alpha * 2 / 3) * priceUnit
                self.cleanerPrice = (1 - alpha * 2 / 3) * priceUnit
                self.simpleGuestPrice = 1,25 * priceUnit
            if alpha >= 3/2: #cas où le surplus donné par les invités paye intégralement et l'hôte et les aides
                self.hostPrice = 0
                self.cookPrice = 0
                self.cleanerPrice = 0
                self.simpleGuestPrice = 1,25 * priceUnit - (abs((1 - alpha) * priceUnit) + (nbRquCleaners + nbRquCooks) * abs((1 - 2 * alpha / 3) * priceUnit)) / nbRquSimpleGuests
            else: #cas où le surplus donné par les invités paye l'hôte mais pas intégralement les aides, dans ce cas, les aides payent 33% du prix unitaire et les prix invités diminuent
                self.hostPrice = 0
                self.cookPrice = (1 - 2 * alpha / 3) * priceUnit
                self.cleanerPrice = (1 - 2 * alpha / 3) * priceUnit
                self.simpleGuestPrice = 1,25 * priceUnit - (abs((1 - alpha) * unitPrice) / nbRquSimpleGuests)
         
        result.push(self.hostPrice)
        result.push(self.cookPrice)
        result.push(self.cleanerPrice)
        result.push(self.simpleGuestPrice)
        return result
        

        
