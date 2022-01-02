import fs from "fs";

const shiftData = JSON.parse(fs.readFileSync("./data/shiftdata.json", "utf-8"));

const getRegistered = (campers, shifts, regCount) => {
  if (regCount === 0) return "";

  let response = "<ul>";

  for (let i = 0; i < campers.length; ++i) {
    const camper = campers[i];

    if (!shifts.includes(camper.shiftNr)) shifts.push(camper.shiftNr);
    if (!camper.isRegistered) continue;
    response += `<li>${camper.name} (${camper.shiftNr}. vahetus)</li>`;
  }

  response += "</ul>";
  response += "<p>on registreeritud.</p>";
  return response;
};

const nonRegistered = (campers) => {
  let response = "<ul>";

  let hasNonRegistered = false;

  for (let i = 0; i < campers.length; ++i) {
    const camper = campers[i];
    if (camper.isRegistered) continue;
    hasNonRegistered = true;
    response += `<li>${camper.name} (${camper.shiftNr}. vahetus)</li>`;
  }

  if (!hasNonRegistered) return "";

  response += "</ul>";
  response +=
    "<p>on lisatud reservnimekirja. Kui põhinimekirjas koht vabaneb, võtame teiega esimesel võimalusel ühendust. " +
    "Palun võtke vahetuse juhatajaga ühendust, kui soovite registreerimise tühistada.</p>";

  return response;
};

const getStaffContacts = (shifts) => {
  let response = "";
  for (let i = 0; i < shifts.length; ++i) {
    response += `${shiftData[shifts[i]].name} (${
      shiftData[shifts[i]]["email"]
    }, tel. ${shiftData[shifts[i]].phone})`;
    if (i + 1 !== shifts.length) response += ", ";
  }
  return response;
};

const getBoilerplate = (campers, names, price, regCount) => {
  const shifts = [];
  for (let i = 0; i < campers.length; ++i) {
    campers[i].name = names[i];
  }

  const content = `<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
  <title>
  </title>
  <!--[if !mso]><!-->
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--<![endif]-->
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style type="text/css">
    #outlook a {
      padding: 0;
    }

    body {
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table,
    td {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }

    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }

    p {
      display: block;
      margin: 13px 0;
    }

  </style>
  <!--[if mso]>
        <noscript>
        <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG/>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
        </xml>
        </noscript>
        <![endif]-->
  <!--[if lte mso 11]>
        <style type="text/css">
          .mj-outlook-group-fix { width:100% !important; }
        </style>
        <![endif]-->
  <style type="text/css">
    @media only screen and (min-width:480px) {
      .mj-column-per-100 {
        width: 100% !important;
        max-width: 100%;
      }
    }

  </style>
  <style media="screen and (min-width:480px)">
    .moz-text-html .mj-column-per-100 {
      width: 100% !important;
      max-width: 100%;
    }

  </style>
  <style type="text/css">
    @media only screen and (max-width:480px) {
      table.mj-full-width-mobile {
        width: 100% !important;
      }

      td.mj-full-width-mobile {
        width: auto !important;
      }
    }

  </style>
  <style type="text/css">
  </style>
</head>

<body style="word-spacing:normal;background-color:#e8ebf3;">
  <div style="background-color:#e8ebf3;">
    <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div style="margin:0px auto;max-width:600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
              <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                  <tbody>
                    <tr>
                      <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                          <tbody>
                            <tr>
                              <td style="width:72px;">
                                <img height="auto" src="https://merelaager.ee/media/img/ml_logo_slim.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="72" />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!--[if mso | IE]></td></tr></table><![endif]-->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div style="margin:0px auto;max-width:600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:0px;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
              <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                  <tbody>
                    <tr>
                      <td style="vertical-align:top;padding:0px 10px 10px;">
                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#ffffff;" width="100%">
                          <tbody>
                            <tr>
                              <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                                <div style="font-family:Helvetica, Arial, sans-serif;font-size:15px;font-weight:300;line-height:24px;text-align:left;color:#000000;">
                                  <h3>Registreerimine õnnestus!</h3>
                                  ${getRegistered(campers, shifts, regCount)}
                                  ${nonRegistered(campers)}
                                  <p>Palume üle kanda ka koha broneerimise tasu (või kogu summa). Laagrikoht saab lõpliku kinnituse, kui makse on meile laekunud kolme päeva jooksul. Makseteatise leiate manusest.</p>
                                  <p>Tasuda: ${
                                    100 * regCount
                                  } €. Kogusumma (k.a broneerimistasu): ${price} €.</p>
                                  <p style="font-family: monospace">MTÜ Noorte Mereklubi<br />Konto: EE862200221011493003<br />SWIFT kood/BIC: HABAEE2X<br />SWEDBANK</p>
                                  <p style="font-weight: bold">Kindlasti märkige selgitusse lapse nimi ja vahetus!</p>
                                  <p>Kui broneerimistasu pole kolme päeva jooksul meile laekunud, tõstame lapse reservnimekirja.</p>
                                  <p>Parimate soovidega</p>
                                  <p>${getStaffContacts(shifts)}</p>
                                  <p style="font-size: 11px"> Tegu on automaatvastusega, palume sellele meilile mitte vastata. Küsimuste või murede korral pöörduge palun vahetuse juhataja poole.</p>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!--[if mso | IE]></td></tr></table><![endif]-->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!--[if mso | IE]></td></tr></table><![endif]-->
  </div>
</body>

</html>`;
  return content;
};

const getFailed = (campers) => {
  const shifts = [];

  for (let i = 0; i < campers.length; ++i) {
    if (!shifts.includes(campers[i].shiftNr)) shifts.push(campers[i].shiftNr);
  }

  return `<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
  <title>
  </title>
  <!--[if !mso]><!-->
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--<![endif]-->
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style type="text/css">
    #outlook a {
      padding: 0;
    }

    body {
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table,
    td {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }

    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }

    p {
      display: block;
      margin: 13px 0;
    }

  </style>
  <!--[if mso]>
        <noscript>
        <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG/>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
        </xml>
        </noscript>
        <![endif]-->
  <!--[if lte mso 11]>
        <style type="text/css">
          .mj-outlook-group-fix { width:100% !important; }
        </style>
        <![endif]-->
  <style type="text/css">
    @media only screen and (min-width:480px) {
      .mj-column-per-100 {
        width: 100% !important;
        max-width: 100%;
      }
    }

  </style>
  <style media="screen and (min-width:480px)">
    .moz-text-html .mj-column-per-100 {
      width: 100% !important;
      max-width: 100%;
    }

  </style>
  <style type="text/css">
    @media only screen and (max-width:480px) {
      table.mj-full-width-mobile {
        width: 100% !important;
      }

      td.mj-full-width-mobile {
        width: auto !important;
      }
    }

  </style>
  <style type="text/css">
  </style>
</head>

<body style="word-spacing:normal;background-color:#e8ebf3;">
  <div style="background-color:#e8ebf3;">
    <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div style="margin:0px auto;max-width:600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
              <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                  <tbody>
                    <tr>
                      <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                          <tbody>
                            <tr>
                              <td style="width:72px;">
                                <img height="auto" src="https://merelaager.ee/media/img/ml_logo_slim.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="72" />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!--[if mso | IE]></td></tr></table><![endif]-->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div style="margin:0px auto;max-width:600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:0px;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
              <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                  <tbody>
                    <tr>
                      <td style="vertical-align:top;padding:0px 10px 10px;">
                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#ffffff;" width="100%">
                          <tbody>
                            <tr>
                              <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                                <div style="font-family:Helvetica, Arial, sans-serif;font-size:15px;font-weight:300;line-height:24px;text-align:left;color:#000000;">
                                  <p>Kahjuks on vahetuse kohad juba täis.</p>
                                  <p>Oleme ${
                                    campers.length > 1 ? "lapsed" : "lapse"
                                  } registreerinud reservnimekirja. Kui põhinimekirjas koht vabaneb, võtame teiega esimesel võimalusel ühendust.</p>
                                  <p>Parimate soovidega</p>
                                  <p>${getStaffContacts(shifts)}</p>
                                  <p style="font-size: 11px">Tegu on automaatvastusega, palume sellele meilile mitte vastata. Küsimuste või murede korral pöörduge palun vahetuse juhataja poole.</p>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!--[if mso | IE]></td></tr></table><![endif]-->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!--[if mso | IE]></td></tr></table><![endif]-->
  </div>
</body>

</html>`;
};

module.exports = {
  getBoilerplate,
  getFailed,
};
