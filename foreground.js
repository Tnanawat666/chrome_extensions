// Function to find item IDs
function findItemsId() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const items = document.querySelectorAll("span.gHqUzg");
      var itemIds = [];
      items.forEach((item) => {
        const [_, itemId] = item.innerHTML.split("#");
        itemIds.push(itemId.trim());
      });
      // console.log(itemIds);
      resolve(itemIds);
    }, 500);
  });
}

async function getData(itemId) {
  const BASE_URL = "http://localhost:1323/api/v1/products/";
  const url = `${BASE_URL}${itemId}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(
        `Failed to fetch data: ${response.statusText} (${response.status})`
      );
    }

    const jsonData = await response.json();

    return jsonData.data;
  } catch (error) {
    console.error(`Error fetching data for itemId ${itemId}:`, error);
    return null;
  }
}

function createStatsDiv() {
  const stat = document.createElement("div");
  stat.style.cssText = `
        background-color: blue;
        color: white;
        padding: 10px;
        text-align: center;
        box-shadow: rgba(0, 0, 0, 0.3) 0px 19px 38px, rgba(0, 0, 0, 0.22) 0px 15px 12px;
        border-radius: 10px;
      `;
  stat.innerHTML =
    "<span style='font-weight:800; text-decoration:underline;'>Stat</span>";
  return stat;
}

function createDisplayDataStats(dataStats, stat) {
  const specificStat = [
    "ธาตุ",
    "เลเวล",
    "คุณภาพ",
    "ประเภท",
    "คำอธิบาย",
    "อัพเกรด",
    "ดาว",
    "ตำแหน่งสวมใส่",
    "คุณภาพ",
    "โบนัสเซ็ท",
  ];
  for (let i = 1; i < dataStats.length; i++) {
    const displayStats = document.createElement("p");
    displayStats.style.cssText = `
      text-align: left;
      white-space: normal;
      word-wrap: break-word;
      word-spacing: 2px;
    `;
    if (specificStat.includes(dataStats[i].trait_type)) {
      displayStats.innerHTML = `${dataStats[i].trait_type}: ${dataStats[i].value}`;
    }
    stat.appendChild(displayStats);
  }
}

function createExtraStat(dataSkills, stat) {
  const extraStat = document.createElement("div");
  extraStat.className = "flex flex-col items-start gap-1";
  extraStat.style.cssText = `
          width: 100%;
          background-color: #444;
          border-radius: 10px;
          padding: 10px;
        `;
  if (dataSkills) {
    for (let i = 0; i < dataSkills.length; i++) {
      const skillContainer = document.createElement("div");
      skillContainer.className = "flex flex-row gap-2";
      skillContainer.style.cssText = `
              width: 100%;
              height: 100%;
            `;
      const imgSkill = document.createElement("img");
      imgSkill.src = dataSkills[i].image;
      imgSkill.style.cssText = `
              width: 30%;
              height: 30%;
            `;

      const skillText = document.createElement("p");
      skillText.innerHTML = `${dataSkills[i].trait_type}: ${dataSkills[i].value}`;

      skillContainer.appendChild(imgSkill);
      skillContainer.appendChild(skillText);
      extraStat.appendChild(skillContainer);
    }
    stat.appendChild(extraStat);
  }
  return extraStat;
}
function createAttributes(extraStat, attributesData) {
  for (let i = 0; i < attributesData.length; i++) {
    const attributes = document.createElement("p");
    if (attributesData[i].trait_type) {
      attributes.innerHTML = `${attributesData[i].trait_type}: ${attributesData[i].value}`;
      extraStat.appendChild(attributes);
    }
  }
}

function createFavButton() {
  const favButton = document.createElement("button");
  const icon = document.createElement("img");
  icon.src = "./img/unlike.png";
  favButton.className = "ant-btn ant-btn-default fav-button";
  favButton.style.cssText = `
    position: absolute;
    top: 0;
    right: 0;
    margin: 1rem;
    border-radius: 50%;
    font-size: 2.5rem; 
    border: 1px solid #ddd; 
    background-color: #fff; 
    z-index:999;
    box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;
    transition: background-color 0.2s;`;
  favButton.append(icon);
  favButton.addEventListener("click", () => {
    event.stopPropagation();
    favButton.innerHTML = favButton.innerHTML === "♡" ? "	❤" : "♡";
  });
  return favButton;
}

function favoriteItems(id) {}

async function createStats() {
  const head = document.getElementsByTagName("head")[0];
  head.innerHTML =
    head.innerHTML +
    '<script src="https://kit.fontawesome.com/cd0cc79b2a.js" crossorigin="anonymous"></script>';
  const itemIds = await findItemsId();
  const allData = await Promise.all(itemIds.map((id) => getData(id)));
  const parents = document.querySelectorAll(
    ".group.flex.w-full.flex-col.gap-2"
  );
  for (let index = 0; index < parents.length; index++) {
    const favButton = createFavButton();
    const parent = parents[index];
    parent.style.position = "relative";
    if (parent.childElementCount === 2) {
      const stat = createStatsDiv();

      if (allData[index]) {
        const dataStats = allData[index].params_th_json.attributes;
        createDisplayDataStats(dataStats, stat);

        const dataSkills = allData[index].params_th_json.extra.attributes;

        const extraStat = createExtraStat(dataSkills, stat);

        const mainAttributeName = document.createElement("span");
        mainAttributeName.style.cssText = `text-decoration: underline;
        color: red;
        font-weight: 800;
        font-style: italic;`;

        const subAttributeName = document.createElement("span");
        subAttributeName.style.cssText = `text-decoration: underline;
        color: skyblue;
        font-weight: 600;
        font-style: italic;`;

        const main_attributes =
          allData[index].params_th_json.main_attributes.attributes;
        const main_name =
          allData[index].params_th_json.main_attributes.name_attributes;
        const sub_attributes =
          allData[index].params_th_json.sub_attributes.attributes;
        const sub_name =
          allData[index].params_th_json.sub_attributes.name_attributes;
        if (main_attributes && sub_attributes) {
          mainAttributeName.innerHTML = main_name;
          subAttributeName.innerHTML = sub_name;
          const hr = document.createElement("hr");
          hr.style.cssText = `
            width: 100%;
          `;
          extraStat.appendChild(mainAttributeName);
          createAttributes(extraStat, main_attributes);
          extraStat.appendChild(hr);
          extraStat.appendChild(subAttributeName);
          createAttributes(extraStat, sub_attributes);
          stat.appendChild(extraStat);
        }
      }

      parent.appendChild(favButton);
      parent.appendChild(stat);
    }
  }
}

setTimeout(() => {
  createStats();
  const button = document.getElementsByClassName("css-9i6sf3").item(0);
  button.addEventListener("click", createStats);
}, 1000);
