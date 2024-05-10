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

async function createStats() {
  const itemIds = await findItemsId();
  const allData = await Promise.all(itemIds.map((id) => getData(id)));

  const parents = document.querySelectorAll(
    ".group.flex.w-full.flex-col.gap-2"
  );

  for (let index = 0; index < parents.length; index++) {
    const parent = parents[index];
    if (parent.childElementCount === 2) {
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

      if (allData[index]) {
        const dataStats = allData[index].params_th_json.attributes;
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
          // console.log(dataStats[i].trait_type);
          if (specificStat.includes(dataStats[i].trait_type)) {
            displayStats.innerHTML = `${dataStats[i].trait_type}: ${dataStats[i].value}`;
          }
          // displayStats.innerHTML = `${dataStats[i].trait_type}: ${dataStats[i].value}`;
          stat.appendChild(displayStats);
        }

        const dataSkills = allData[index].params_th_json.extra.attributes;

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
          extraStat.appendChild(mainAttributeName);

          for (let i = 0; i < main_attributes.length; i++) {
            const attributes = document.createElement("p");
            hr.style.cssText = `
              width: 100%;
            `;
            if (main_attributes[i].trait_type) {
              attributes.innerHTML = `${main_attributes[i].trait_type}: ${main_attributes[i].value}`;
              extraStat.appendChild(attributes);
              extraStat.appendChild(hr);
            }
          }
          extraStat.appendChild(subAttributeName);

          for (let i = 0; i < sub_attributes.length; i++) {
            const attributes = document.createElement("p");
            attributes.innerHTML = `${sub_attributes[i].trait_type}: ${sub_attributes[i].value}`;
            extraStat.appendChild(attributes);
          }
          stat.appendChild(extraStat);
        }
      }

      parent.appendChild(stat);
    }
  }
}

function favoriteItems() {}

setTimeout(() => {
  createStats();
  const button = document.getElementsByClassName("css-9i6sf3").item(0);
  button.addEventListener("click", createStats);
}, 1000);
