export class User {
  "first_name": string;
  "last_name": string;
  "gender": string;
  "facebook_id": string;
  "google_id": string;
  "link": string;
  "last_connexion_from": string;
  "picture": string;
  "privateInfo": privateInfoInput;
  "reviews": reviews;
  "birthdate": Date;
}

export class privateInfoInput {
    "email": string;
    "cellphone": string;
    "user_ref": string;
}

export class reviews {
  "positive": number;
  "neutral": number;
  "negative": number;
}