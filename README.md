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

## Teams

Prefix path: `api/teams/`.

GET:

- `fetch/{shiftNr}/` - fetch all teams for the shift

POST:

- `create/` - create a team
  - `shiftNr`: integer
  - `name`: string
- `member/add/` - add member to team
  - `teamId`: integer (pk)
  - `dataId`: integer (pk)
- `member/remove/` - remove member from team
  - `dataId`: integer (pk)
