const findItemIds = () =>
  new Promise((resolve) => {
    setTimeout(async () => {
      const itemElements = document.querySelectorAll(".gHqUzg");
      const itemIds = (
        await Promise.all(
          Array.from(itemElements).map((itemElement) =>
            itemElement.textContent
              .split("#")
              .slice(1)
              .map((id) => id.trim())
          )
        )
      ).flat();
      resolve(itemIds);
    }, 800);
  });

async function getData(itemId) {
  const BASE_URL = "http://localhost:1323/api/v1/products/";
  const url = `${BASE_URL}${itemId}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) {
        const favItems = JSON.parse(localStorage.getItem("favItems") || "[]");
        const updatedFavItems = favItems.filter((item) => item !== itemId);
        localStorage.setItem("favItems", JSON.stringify(updatedFavItems));

        // Fetch data again for the remaining item ids
        const newItems = await Promise.all(
          updatedFavItems.map(async (id) => await getData(id))
        );
        return newItems.data;
      } else {
        console.error(
          `Failed to fetch data: ${response.statusText} (${response.status})`
        );
      }
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
        margin:2%;
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

function createFavFilterButton() {
  const parent = document.getElementsByClassName("flex flex-row gap-x-4")[1];
  const myFav = document.createElement("button");
  if (parent.childElementCount == 2) {
    myFav.className =
      "ant-btn css-1t70z6z ant-btn-default AstButton__ButtonWrapper-sc-6rri8f-0 llGVmB py-0 shadow-none";
    myFav.innerHTML = "<span>รายการโปรด</span>";
    parent.appendChild(myFav);
  }
  return myFav;
}

function createFavButton(id) {
  const imageSources = {
    unlike:
      "https://github.com/Tnanawat666/chrome_extensions/blob/main/img/unlike.png?raw=true",
    liked:
      "https://github.com/Tnanawat666/chrome_extensions/blob/main/img/liked.png?raw=true",
  };

  // Preload images
  for (const src of Object.values(imageSources)) {
    new Image().src = src;
  }

  const favButton = document.createElement("button");
  favButton.className = "ant-btn ant-btn-default fav-button";

  const icon = document.createElement("img");
  icon.className = "fav-icon";
  icon.style.cssText = "width: 100%; height: 100%; object-fit: contain;";
  favButton.appendChild(icon);

  const buttonStyles = {
    position: "absolute",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "40px",
    height: "40px",
    top: "0",
    right: "0",
    margin: "1rem",
    borderRadius: "50%",
    fontSize: "2.5rem",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    zIndex: 1,
    boxShadow:
      "rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px",
    transition: "background-color 0.2s",
  };
  Object.assign(favButton.style, buttonStyles);

  const updateIcon = () => {
    const favItems = JSON.parse(localStorage.getItem("favItems") || "[]");
    icon.src = favItems.includes(id) ? imageSources.liked : imageSources.unlike;
  };

  const toggleFav = (event) => {
    event.stopPropagation();
    const favItems = JSON.parse(localStorage.getItem("favItems") || "[]");
    if (favItems.includes(id)) {
      favItems.splice(favItems.indexOf(id), 1);
    } else {
      favItems.push(id);
    }
    localStorage.setItem("favItems", JSON.stringify(favItems));
    updateIcon();

    const favToggleEvent = new CustomEvent("favToggle", { detail: { id } });
    window.dispatchEvent(favToggleEvent);
  };

  favButton.addEventListener("click", toggleFav);

  favButton.addEventListener("mouseover", () => {
    favButton.style.transform = "scale(1.2)";
  });

  favButton.addEventListener("mouseout", () => {
    favButton.style.transform = "scale(1)";
  });

  window.addEventListener("favToggle", (event) => {
    if (event.detail.id === id) {
      updateIcon();
    }
  });

  updateIcon();
  return favButton;
}

function createFavModal() {
  const modalContainer = document.createElement("div");
  modalContainer.id = "fav-modal";
  modalContainer.className = "modal";
  modalContainer.style.cssText = `
    display: none;
    position: fixed;
    z-index: 3;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    scrollbar-width: none;
    background-color: rgba(0, 0, 0, 0.7);
  `;

  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";
  modalContent.style.cssText = `
    background-color: #fefefe;
    position: relative;
    z-index: 4;
    padding: 5%;
    top: 3%;
    margin: auto;
    border: 1px solid #888;
    width: 80%;
    border-radius: 15px;
    overflow-y: auto;
  `;

  const closeButton = document.createElement("span");
  closeButton.className = "close";
  closeButton.innerHTML = "&times;";
  closeButton.style.cssText = `
    color: #aaaaaa;
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 28px;
    font-weight: bold;
  `;

  closeButton.addEventListener(
    "click",
    () => (modalContainer.style.display = "none")
  );
  closeButton.addEventListener("mouseover", () => {
    closeButton.style.color = "red";
    closeButton.style.cursor = "pointer";
    closeButton.style.transform = "scale(1.3)";
  });
  closeButton.addEventListener("mouseout", () => {
    closeButton.style.color = "#aaaaaa";
    closeButton.style.transform = "scale(1.0)";
  });
  modalContent.appendChild(closeButton);
  modalContent.appendChild(createModalCardsContainer());
  modalContainer.appendChild(modalContent);

  modalContainer.addEventListener("click", (event) => {
    if (event.target === modalContainer) {
      modalContainer.style.display = "none";
    }
  });

  return modalContainer;
}

function createModalCardsContainer() {
  const modalCardsContainer = document.createElement("div");
  modalCardsContainer.className = "modal_cards_container";

  modalCardsContainer.style.display = "grid";
  modalCardsContainer.style.padding = "1%";
  modalCardsContainer.style.height = "100%";
  modalCardsContainer.style.gridTemplateColumns =
    "repeat(auto-fit, minmax(225px, 1fr))";
  modalCardsContainer.style.gridAutoRows = "1fr";
  modalCardsContainer.style.gap = "4%";
  return modalCardsContainer;
}

function createModalCard() {
  const modalCard = document.createElement("div");
  modalCard.className = "modal_card";
  modalCard.style.position = "relative";
  modalCard.style.padding = "2%";
  modalCard.style.borderRadius = "15px";
  modalCard.style.boxShadow =
    "rgba(0, 0, 0, 0.3) 0px 19px 38px, rgba(0, 0, 0, 0.22) 0px 15px 12px";
  modalCard.style.zIndex = "5";
  modalCard.style.width = "100%";
  modalCard.style.maxWidth = "350px";

  const mediaQuery = window.matchMedia("(max-width: 768px)");
  mediaQuery.addListener(() => {
    if (mediaQuery.matches) {
      modalCard.style.maxWidth = "250px";
      modalCard.style.padding = "2%";
    } else {
      modalCard.style.maxWidth = "300px";
      modalCard.style.padding = "3%";
    }
  });

  return modalCard;
}

async function toggleModal() {
  const favModal = document.getElementById("fav-modal");
  const modalCardsContainer = document.getElementsByClassName(
    "modal_cards_container"
  )[0];
  modalCardsContainer.innerHTML = "";
  favModal.style.display = favModal.style.display === "none" ? "flex" : "none";
  if (favModal.style.display === "flex") {
    const itemIds = JSON.parse(localStorage.getItem("favItems") || "[]");
    const myFavItems = await Promise.all(
      itemIds.map(async (id) => await getData(id))
    );

    myFavItems.forEach((item) => {
      const card = createModalCard();
      card.onclick = () => {
        const url = `https://astronize.com/th/nft/0x7D4622363695473062Cc0068686d81964bb6e09f/${item.token_id}`;
        window.open(url);
      };
      const stat = createStatsDiv();
      const favButton = createFavButton(item.token_id);
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

      const hr = document.createElement("hr");
      hr.style.cssText = `
            width: 100%;
          `;

      card.onmouseover = () => {
        card.style.cursor = "pointer";
        card.style.border = "4px solid skyblue";
        card.style.transition = "border 0.3s ease-in-out";
        card.style.transform = "scale(1.1)";
      };

      card.onmouseout = () => {
        card.style.border = "none";
        card.style.transform = "scale(1.0)";
      };

      const cardImageContainer = createCardImageContainer(item.image);
      const cardLabel = createCardLabel(
        `${item.name} #${item.token_id}`,
        item.tsx_price
      );
      card.appendChild(cardImageContainer);
      card.appendChild(cardLabel);

      createDisplayDataStats(item.params_th_json.attributes, stat);
      const extraStat = createExtraStat(
        item.params_th_json.extra.attributes,
        stat
      );
      if (
        item.params_th_json.main_attributes.attributes &&
        item.params_th_json.sub_attributes.attributes
      ) {
        mainAttributeName.innerHTML =
          item.params_th_json.main_attributes.name_attributes;
        subAttributeName.innerHTML =
          item.params_th_json.sub_attributes.name_attributes;
        extraStat.appendChild(mainAttributeName);
        createAttributes(
          extraStat,
          item.params_th_json.main_attributes.attributes
        );
        extraStat.appendChild(hr);
        extraStat.appendChild(subAttributeName);
        createAttributes(
          extraStat,
          item.params_th_json.sub_attributes.attributes
        );
        stat.appendChild(extraStat);
      }
      card.appendChild(favButton);
      card.appendChild(stat);
      modalCardsContainer.appendChild(card);
    });
  } else {
  }
}

function createCardLabel(label, tsx_price) {
  const div = document.createElement("div");
  div.style.margin = "2%";
  div.className = "flex flex-col";
  const divLayout = document.createElement("div");
  divLayout.className = "flex flex-row items-start justify-between";
  const divLabel = document.createElement("div");
  divLabel.className = "AstText__TextWrapper-sc-1ydzoup-0 gHqUzg";
  divLabel.innerHTML = `<span type="normal_700_14px_20px" color="#414141">${label}</span>`;
  const divPriceContainer = document.createElement("div");
  divPriceContainer.className =
    "mt-[1px] flex flex-[0_0_auto] flex-row items-center justify-center gap-1";
  const divPrice = document.createElement("div");
  divPrice.innerHTML = `<span type="normal_700_12px_16px" color="#02D767" class="AstText__TextWrapper-sc-1ydzoup-0 bkGuAK">${tsx_price}TSX</span>`;
  divLayout.appendChild(divLabel);
  divLayout.appendChild(divPrice);
  div.appendChild(divLayout);
  return div;
}

function createCardImageContainer(imageSrc) {
  const cardImageContainer = document.createElement("div");
  cardImageContainer.style.margin = "2%";
  cardImageContainer.style.backgroundColor = "rgba(0, 0, 0, 0)";
  cardImageContainer.className =
    "relative flex h-[196px] justify-center overflow-hidden rounded-[10px] border border-solid border-ast-grey200 bg-ast-grey200";
  const cardImage = document.createElement("img");
  cardImage.src = `${imageSrc}`;
  cardImage.loading = "lazy";
  cardImage.decoding = "async";
  cardImage.sizes = "5vw";
  cardImage.style.cssText = `width: 100%; height: 100%; 
  pointer-events: none;
  object-fit: contain; 
  user-drag: none;
  -webkit-user-drag: none;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;`;
  cardImageContainer.appendChild(cardImage);
  return cardImageContainer;
}

async function createStats() {
  const itemIds = await findItemIds();
  const allData = await Promise.all(itemIds.map((id) => getData(id)));
  const parents = document.querySelectorAll(
    ".group.flex.w-full.flex-col.gap-2"
  );
  for (let index = 0; index < parents.length; index++) {
    const parent = parents[index];
    parent.style.position = "relative";
    if (parent.childElementCount === 2) {
      const stat = createStatsDiv();

      if (allData[index]) {
        const favButton = createFavButton(allData[index].token_id);
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
        parent.appendChild(favButton);
      }

      parent.appendChild(stat);
    }
  }
}

setTimeout(() => {
  document.body.append(createFavModal());
  localStorage.getItem("favItems");
  const favFilterButton = createFavFilterButton();
  favFilterButton.addEventListener("click", toggleModal);

  createStats();
  const button = document.getElementsByClassName("css-9i6sf3").item(0);
  button.addEventListener("click", createStats);
}, 1500);
