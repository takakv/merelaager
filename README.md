# API dokumentatsioon

## Registreerimisnimekiri

Päringud, mis on seotud nimekirjaga, võtavad eesliiteks `/reglist/`.

### Nimekirja taotlemine

GET `/reglist/fetch/`

### Nimekirja uuendamine

POST `/reglist/update/{userId}/{field}`

- `userId`: lapse *primary key*, kelle andmeid uuendada
- `field`: andmed, mida uuendada:
  - `registration`: lapse registreerimise seisundi lüliti
  - `total-paid`: summa, mis lapse eest tasutud on
  - `total-due`: kogusumma, mis lapse eest tasuda tuleb
  - `regular`: vana laagrisolija seisund lüliti
