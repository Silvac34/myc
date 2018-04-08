export interface User {
  "first_name": string,
  "last_name": string,
  "gender": string,
  "facebook_id": string,
  "google_id": string,
  "link": string,
  "last_connexion_from": string,
  "picture": string,
  "privateInfo": privateInfoInput,
  "reviews": reviews
}

interface privateInfoInput {
    "email": string,
    "cellphone": string,
    "user_ref": string
}

interface reviews {
  "positive": number,
  "neutral": number,
  "negative": number
}