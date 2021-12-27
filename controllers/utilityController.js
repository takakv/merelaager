const fs = require("fs");

const separator = "&amp;";

const tsSizes = ["118/128", "130/140", "142/152", "152/164", "M", "L", "XL"];

const getRandomDate = (start, end) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

const getIdCode = (gender) => {
  let idCode = gender === "M" ? "5" : "6";
  const bDay = getRandomDate(new Date(2004, 0, 1), new Date(2017, 11, 31));

  const year = bDay.getFullYear().toString().substr(-2);
  let month = bDay.getMonth() + 1;
  month = month.toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
  const day = bDay
    .getDate()
    .toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false });
  idCode += `${year}${month}${day}1234`;
  return idCode;
};

const fillerData = (data, index) => {
  return `      <ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="Thread Group ${index}" enabled="true">
        <stringProp name="ThreadGroup.on_sample_error">continue</stringProp>
        <elementProp name="ThreadGroup.main_controller" elementType="LoopController" guiclass="LoopControlPanel" testclass="LoopController" testname="Loop Controller" enabled="true">
          <boolProp name="LoopController.continue_forever">false</boolProp>
          <stringProp name="LoopController.loops">1</stringProp>
        </elementProp>
        <stringProp name="ThreadGroup.num_threads">1</stringProp>
        <stringProp name="ThreadGroup.ramp_time">1</stringProp>
        <boolProp name="ThreadGroup.scheduler">false</boolProp>
        <stringProp name="ThreadGroup.duration"></stringProp>
        <stringProp name="ThreadGroup.delay"></stringProp>
        <boolProp name="ThreadGroup.same_user_on_next_iteration">true</boolProp>
      </ThreadGroup>
      <hashTree>
        <HTTPSamplerProxy guiclass="HttpTestSampleGui" testclass="HTTPSamplerProxy" testname="HTTP Request" enabled="true">
          <boolProp name="HTTPSampler.postBodyRaw">true</boolProp>
          <elementProp name="HTTPsampler.Arguments" elementType="Arguments">
            <collectionProp name="Arguments.arguments">
              <elementProp name="" elementType="HTTPArgument">
                <boolProp name="HTTPArgument.always_encode">false</boolProp>
                <stringProp name="Argument.value">${data}</stringProp>
                <stringProp name="Argument.metadata">=</stringProp>
              </elementProp>
            </collectionProp>
          </elementProp>
          <stringProp name="HTTPSampler.domain"></stringProp>
          <stringProp name="HTTPSampler.port"></stringProp>
          <stringProp name="HTTPSampler.protocol"></stringProp>
          <stringProp name="HTTPSampler.contentEncoding"></stringProp>
          <stringProp name="HTTPSampler.path">registreerimine/register</stringProp>
          <stringProp name="HTTPSampler.method">POST</stringProp>
          <boolProp name="HTTPSampler.follow_redirects">true</boolProp>
          <boolProp name="HTTPSampler.auto_redirects">false</boolProp>
          <boolProp name="HTTPSampler.use_keepalive">true</boolProp>
          <boolProp name="HTTPSampler.DO_MULTIPART_POST">false</boolProp>
          <stringProp name="HTTPSampler.embedded_url_re"></stringProp>
          <stringProp name="HTTPSampler.connect_timeout"></stringProp>
          <stringProp name="HTTPSampler.response_timeout"></stringProp>
        </HTTPSamplerProxy>
        <hashTree>
          <HeaderManager guiclass="HeaderPanel" testclass="HeaderManager" testname="HTTP Header Manager" enabled="true">
            <collectionProp name="HeaderManager.headers">
              <elementProp name="" elementType="Header">
                <stringProp name="Header.name">Content-Type</stringProp>
                <stringProp name="Header.value">application/x-www-form-urlencoded</stringProp>
              </elementProp>
            </collectionProp>
          </HeaderManager>
          <hashTree/>
        </hashTree>
      </hashTree>
`;
};

const getSingle = (name, shiftNr, gender) => {
  let res = "";

  const idCode = getIdCode(gender);
  const tsSize = tsSizes[Math.floor(Math.random() * tsSizes.length)];

  res += `name=${encodeURIComponent(name)}` + separator;
  res += `idCode=${idCode}` + separator;
  res += `isNew=${Math.round(Math.random())}` + separator;
  res += `shiftNr=${shiftNr}` + separator;
  res += `road=Merelaagri tee` + separator;
  res += `city=${encodeURIComponent("Laoküla")}` + separator;
  res += `county=Harju` + separator;
  res += `tsSize=${tsSize}` + separator;
  // res += `addendum:\n`;
  // res += `country:Eesti\n`;

  return res;
};

const getFirstName = (firstNames, gender) => {
  const count = firstNames[gender].length;
  return firstNames[gender][Math.floor(Math.random() * count)];
};

const getData = (names, simCount, lName, gender) => {
  let res = "";
  let name;

  for (let shiftNr = 1; shiftNr <= 5; ++shiftNr) {
    for (let i = 0; i < simCount; ++i) {
      name = `${getFirstName(names.first, gender)} ${lName}`;
      res += getSingle(name, shiftNr, gender);
    }
  }

  return res;
};

const getMeta = (simCount, fNames, lName) => {
  const gender = Math.round(Math.random()) === 1 ? "M" : "F";
  const fName = getFirstName(fNames, gender);

  let res = "";
  res += `contactName=${encodeURIComponent(`${fName} ${lName}`)}` + separator;
  res += `contactNumber=%2B372 xxx` + separator;
  res += `contactEmail=${encodeURIComponent(`${fName}@${lName}`)}` + separator;
  res += `childCount=${simCount * 5}` + separator;
  res += `noEmail=true`;
  return res;
};

const headerData = () => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2" properties="5.0" jmeter="5.4.3">
  <hashTree>
    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="Merelaager RegTest" enabled="true">
      <stringProp name="TestPlan.comments">300 last</stringProp>
      <boolProp name="TestPlan.functional_mode">false</boolProp>
      <boolProp name="TestPlan.tearDown_on_shutdown">true</boolProp>
      <boolProp name="TestPlan.serialize_threadgroups">false</boolProp>
      <elementProp name="TestPlan.user_defined_variables" elementType="Arguments" guiclass="ArgumentsPanel" testclass="Arguments" testname="User Defined Variables" enabled="true">
        <collectionProp name="Arguments.arguments"/>
      </elementProp>
      <stringProp name="TestPlan.user_define_classpath"></stringProp>
    </TestPlan>
    <hashTree>
`;
};

const footerData = () => {
  return `      <ConfigTestElement guiclass="HttpDefaultsGui" testclass="ConfigTestElement" testname="HTTP Request Defaults" enabled="true">
        <elementProp name="HTTPsampler.Arguments" elementType="Arguments" guiclass="HTTPArgumentsPanel" testclass="Arguments" testname="User Defined Variables" enabled="true">
          <collectionProp name="Arguments.arguments"/>
        </elementProp>
        <stringProp name="HTTPSampler.domain">localhost</stringProp>
        <stringProp name="HTTPSampler.port">3000</stringProp>
        <stringProp name="HTTPSampler.protocol"></stringProp>
        <stringProp name="HTTPSampler.contentEncoding"></stringProp>
        <stringProp name="HTTPSampler.path"></stringProp>
        <stringProp name="HTTPSampler.concurrentPool">6</stringProp>
        <stringProp name="HTTPSampler.connect_timeout"></stringProp>
        <stringProp name="HTTPSampler.response_timeout"></stringProp>
      </ConfigTestElement>
      <hashTree/>
    </hashTree>
  </hashTree>
</jmeterTestPlan>
`;
};

exports.generateData = () => {
  const names = JSON.parse(fs.readFileSync("./data/names.json", "utf-8"));
  const path = "./data/files/regTest.jmx";

  if (fs.existsSync(path)) fs.unlinkSync(path);
  const stream = fs.createWriteStream(path, { flags: "a" });

  const count = 22;

  stream.write(headerData());

  const genders = ["M", "F"];
  genders.forEach((gender) => {
    for (let i = 1; i <= count; ++i) {
      const simCount = 1; //Math.floor(300 / count / (2 * 5));
      const lastNames = names.last;
      const lName = lastNames[Math.floor(Math.random() * lastNames.length)];

      let data = getData(names, simCount, lName, gender);
      data += getMeta(simCount, names.first, lName);

      data = fillerData(data, i);
      stream.write(data);
    }
  });

  stream.write(footerData());

  stream.end();
};
