# API dokumentatsioon

## Registreerimisnimekiri

Päringud, mis on seotud nimekirjaga, võtavad eesliiteks `/reglist/`.

### Nimekirja taotlemine

GET `/reglist/fetch/`

### Nimekirja uuendamine

POST `/reglist/update/{userId}/{field}/{value}/`

- `userId`: lapse *primary key*, kelle andmeid uuendada
- `field`: andmed, mida uuendada:
  - **\***`registration`: lapse registreerimisseisundi lüliti
  - `total-paid`: summa, mis lapse eest tasutud on
  - `total-due`: kogusumma, mis lapse eest tasuda tuleb
  - **\***`regular`: vana laagrisolija seisundi lüliti

> Märkus: *tärniga tähistatud väljad ei kasuta `{value}` parameetrit.*

## Arved

POST `/bills/{action}/{email}/`
