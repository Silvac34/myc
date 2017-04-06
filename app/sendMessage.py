# -*- coding: utf-8 -*-
import requests

token = "EAAVynZAjdOe0BAHR0zDRsqWokHZCbRLjiReLKVJtHgzd4e4mBK4dkukc5Y9kIZBI03CpDZC7bls5csrofuLo2RGX30PlLQ8HDhXACexavuftmQjiwMSbq9872gIZBKe2FHM4nZCEUCfttAkfi2jlBSt1NZBXulabrjTEBBfatb3JAZDZD"

def sendMessage():#facebook_id):
    facebook_id = '10153917348848395'
    params = {"recipient": {"id": facebook_id},"message": {"text": "hello, world!"}}
    r = requests.post('https://graph.facebook.com/v2.6/me/messages?access_token=' + token, params=params)