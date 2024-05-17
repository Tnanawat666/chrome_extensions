if (!window.hasRun) {
  window.hasRun = true;

  const findItemIds = () =>
    new Promise((resolve) => {
      setTimeout(async () => {
        const span = document.querySelectorAll("span");
        const itemIds = (
          await Promise.all(
            Array.from(span).map((itemElement) =>
              itemElement.textContent
                .split("#")
                .slice(1)
                .map((id) => id.trim())
            )
          )
        ).flat();
        console.log(itemIds);
        resolve(itemIds);
      }, 1200);
    });

  function transformRes(response) {
    const parseJSON = (jsonString) => {
      try {
        return JSON.parse(jsonString);
      } catch (error) {
        return {};
      }
    };
    const jsonData = {
      data: {
        id: response.data.id,
        name: response.data.name,
        image: response.data.image,
        token_id: response.data.token_id,
        tsx_price: parseFloat(response.data.price) / 1e18,
        params: response.data.params,
        params_json: parseJSON(response.data.params),
        params_th: response.data.params_th,
        params_th_json: parseJSON(response.data.params_th),
        params_en: response.data.params_en,
        params_en_json: parseJSON(response.data.params_en),
      },
    };

    return jsonData.data;
  }

  function showAlert(message) {
    const alertContainer = document.getElementById("alertContainer");
    const alertDiv = document.createElement("div");
    alertDiv.classList.add("alert");
    alertDiv.textContent = message;

    alertContainer.appendChild(alertDiv);

    setTimeout(() => {
      alertDiv.remove();
    }, 5000);
  }

  let fetchedIds = new Set();
  async function getData(itemId) {
    //Handle repeated API calls
    if (fetchedIds.has(itemId)) {
      return null;
    }

    const BASE_URL =
      "https://prod-mkp-api.astronize.com/mkp/item/nft/0x7d4622363695473062cc0068686d81964bb6e09f/";
    const url = `${BASE_URL}${itemId}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        console.error(
          `Failed to fetch data for itemId ${itemId}: ${response.statusText} (${response.status})`
        );
        return null;
      }

      const jsonData = await response.json();
      const transformedData = transformRes(jsonData);

      fetchedIds.add(itemId);

      return transformedData;
    } catch (error) {
      console.error(`Error fetching data for itemId ${itemId}:`, error);
      return null;
    }
  }
  async function getFavData(itemId) {
    const BASE_URL =
      "https://prod-mkp-api.astronize.com/mkp/item/nft/0x7d4622363695473062cc0068686d81964bb6e09f/";
    const url = `${BASE_URL}${itemId}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(
          `Failed to fetch fav data for itemId ${itemId}: ${response.statusText} (${response.status})`
        );
        return null;
      }
      const jsonData = await response.json();
      if (jsonData.data.id === 0) {
        console.warn(`Item ID ${itemId} not found. Removing from favorites.`);
        showAlert(`The item with ID #${itemId} has been sold out.`);
        const favItems = JSON.parse(localStorage.getItem("favItems") || "[]");
        const updatedFavItems = favItems.filter((item) => item !== itemId);
        localStorage.setItem("favItems", JSON.stringify(updatedFavItems));

        // Fetch data again for the remaining item ids
        const newItems = await Promise.all(
          updatedFavItems.map((id) => getData(id))
        );
        return null;
      }
      const transformedData = transformRes(jsonData);

      return transformedData;
    } catch (error) {
      console.error(`Error fetching fav data for itemId ${itemId}:`, error);
      return null;
    }
  }

  function createStatsDiv() {
    const stat = document.createElement("div");
    stat.className = "stat";
    const span = document.createElement("span");
    span.className = "stat-title";
    span.innerHTML = "Stat";
    stat.appendChild(span);
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
      displayStats.className = "display-stats";
      if (specificStat.includes(dataStats[i].trait_type)) {
        displayStats.innerHTML = `${dataStats[i].trait_type}: ${dataStats[i].value}`;
      }
      stat.appendChild(displayStats);
    }
  }

  function createExtraStat(extraAttributes, stat) {
    const extraStat = document.createElement("div");
    extraStat.className = "flex flex-col items-start gap-1 extraStat";
    if (extraAttributes) {
      for (let i = 0; i < extraAttributes.length; i++) {
        const skillContainer = document.createElement("div");
        skillContainer.className = "flex flex-row gap-2 skill-container";
        const imgSkill = document.createElement("img");
        imgSkill.src = extraAttributes[i].image;
        imgSkill.className = "w-10 h-10 skill-img";
        const skillText = document.createElement("p");
        skillText.className = "skill-text";
        skillText.innerHTML = `${extraAttributes[i].trait_type}: ${extraAttributes[i].value}`;

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
      myFav.className = "favFilter-button";
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
    favButton.appendChild(icon);

    const updateIcon = () => {
      const favItems = JSON.parse(localStorage.getItem("favItems") || "[]");
      icon.src = favItems.includes(id)
        ? imageSources.liked
        : imageSources.unlike;
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
    modalContainer.style.display = "none";

    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";

    const closeButton = document.createElement("span");
    closeButton.className = "close";
    closeButton.innerHTML = "&times;";

    closeButton.addEventListener(
      "click",
      () => (modalContainer.style.display = "none")
    );

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
    return modalCardsContainer;
  }

  function createModalCard() {
    const modalCard = document.createElement("div");
    modalCard.className = "modal_card";
    return modalCard;
  }

  async function toggleModal() {
    const favModal = document.getElementById("fav-modal");
    const modalCardsContainer = document.getElementsByClassName(
      "modal_cards_container"
    )[0];
    favModal.style.display =
      favModal.style.display === "none" ? "flex" : "none";

    if (favModal.style.display === "flex") {
      document.documentElement.style.overflow = "hidden";
      document.body.scroll = "no";

      const itemIds = JSON.parse(localStorage.getItem("favItems") || "[]");
      const myFavItems = await Promise.all(
        itemIds.map(async (id) => await getFavData(id))
      );
      myFavItems.forEach((item) => {
        if (item != null) {
          // Check if the card for the item already exists
          if (!document.getElementById(`card-${item.token_id}`)) {
            const card = createModalCard();
            card.id = `card-${item.token_id}`; // Set a unique ID for each card

            card.onclick = () => {
              const url = `https://astronize.com/th/nft/0x7D4622363695473062Cc0068686d81964bb6e09f/${item.token_id}`;
              window.open(url);
            };

            const stat = createStatsDiv();
            const favButton = createFavButton(item.token_id);
            const mainAttributeName = document.createElement("span");
            mainAttributeName.style.cssText = `text-decoration: underline; color: red; font-weight: 800; font-style: italic;`;

            const subAttributeName = document.createElement("span");
            subAttributeName.style.cssText = `text-decoration: underline; color: skyblue; font-weight: 600; font-style: italic;`;

            const hr = document.createElement("hr");
            hr.style.cssText = `width: 100%;`;

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
          }
        }
      });
    } else {
      document.documentElement.style.overflow = "scroll";
      document.body.scroll = "yes";
    }
  }

  function createCardLabel(label, tsx_price) {
    const div = document.createElement("div");
    div.style.margin = "2%";
    div.className = "flex flex-col";
    const divLayout = document.createElement("div");
    divLayout.className = "flex flex-row justify-between label-layout";
    const divLabel = document.createElement("div");
    divLabel.className = "AstText__TextWrapper-sc-1ydzoup-0 gHqUzg";
    divLabel.innerHTML = `<span type="normal_700_14px_20px">${label}</span>`;
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
    cardImageContainer.className =
      "relative flex justify-center overflow-hidden rounded-[10px] cardImg-container";
    const cardImage = document.createElement("img");
    cardImage.className = "w-full h-full object-cover";
    cardImage.src = `${imageSrc}`;
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
      if (!parent.hasListener) {
        parent.style.position = "relative";
        parent.addEventListener("click", (event) => {
          event.stopPropagation();
          window.open(
            `https://astronize.com/th/nft/0x7D4622363695473062Cc0068686d81964bb6e09f/${itemIds[index]}`
          );
        });
        parent.hasListener = true;
      }

      if (parent.childElementCount === 2) {
        const stat = createStatsDiv();

        if (allData[index]) {
          const favButton = createFavButton(allData[index].token_id);
          const dataStats = allData[index].params_th_json.attributes;
          createDisplayDataStats(dataStats, stat);

          const extraAttributes =
            allData[index].params_th_json.extra.attributes;
          const extraStat = createExtraStat(extraAttributes, stat);

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
            hr.style.cssText = `width: 100%;`;

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

  function handleScroll() {
    const favButton = document.querySelector(".favFilter-button");
    if (window.scrollY > 500) {
      favButton.classList.add("fixed-top-right");
    } else {
      favButton.classList.remove("fixed-top-right");
    }
  }

  // init script and event listeners for url change
  const initializeScript = () => {
    const currentPage = location.href;
    localStorage.setItem("URL", currentPage);
    document.body.append(createFavModal());

    const messageAlert = document.createElement("div");
    messageAlert.id = "alertContainer";
    document.body.append(messageAlert);

    const favFilterButton = createFavFilterButton();
    favFilterButton.addEventListener("click", toggleModal);
    createStats();

    window.addEventListener("scroll", handleScroll);

    const button = document.getElementsByClassName("css-9i6sf3").item(0);
    if (button && !button.hasListener) {
      button.addEventListener("click", createStats);
      button.hasListener = true;
    }
  };

  const checkUrlChange = () => {
    const currentPage = location.href;
    const previousPage = localStorage.getItem("URL");
    if (currentPage !== previousPage) {
      localStorage.setItem("URL", currentPage);
      //refresh the page or init script;
      window.location.reload();
    }
  };

  const observer = new MutationObserver(checkUrlChange);
  observer.observe(document, { subtree: true, childList: true });

  window.onload = initializeScript();

  const styles = `
  .favFilter-button{
    cursor: pointer;
    touch-action: manipulation;
    color: red;
    font-weight: bold;
    height: 40px;
    background-color: white;
    letter-spacing: 0.1em;
    border: 1px solid skyblue;
    border-radius: 20px;
    padding:0 23px;
  }

  .favFilter-button:hover {
    color: skyblue;
  }

  .stat {
    background-color: blue;
    color: white;
    padding: 10px;
    margin: 2%;
    text-align: center;
    box-shadow: rgba(0, 0, 0, 0.3) 0px 19px 38px, rgba(0, 0, 0, 0.22) 0px 15px 12px;
    border-radius: 10px;
  }
  .stat-title{
    font-weight: bold;
    text-decoration: underline;
    line-height: 2;
  }
  .display-stats {
    text-align: left;
    white-space: normal;
    word-wrap: break-word;
    word-spacing: 2px;
  }
  .extraStat{
    width: 100%;
    background-color: #444;
    border-radius: 10px;
    padding: 10px;
  }
  .skill-container{
    width: 100%;
    height: 100%;
  }
  .skill-text{
    text-align: center;
  }

  .fav-button{
    position: absolute;
    width: 35px;
    height: 35px;
    top: 10px;
    right: 10px;
    border: none;
    background-color: transparent;
    cursor: pointer;
  }
  .fav-button:hover,
  .fav-button:focus {
  transform: scale(1.1);
  }

  .fav-icon{
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .modal {
    position: fixed;
    z-index: 3;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
  }

  .modal-content {
    background-color: whitesmoke;
    position: relative;
    padding: 0 2%;
    margin: 2% auto;
    border: 1px solid #888;
    width: 90%;
    border-radius: 15px;
  }

  .close {
    color: whitesmoke;
    position: fixed;
    top: 0;
    right: 0;
    font-size: 2rem;
    font-weight: bold;
    margin:1%;
  }

  .close:hover{
    color: red;
    cursor: pointer;
    transform: scale(1.2);
  }

  .modal_cards_container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    grid-gap: 3%;
    align-items: space-around;
    height: 100%;
    overflow-y: auto;
    padding: 2%;
  }

  .modal_card {
    position: relative;
    padding: 5%;
    border-radius: 15px;
    background-color: #eeeeee;
    box-shadow: rgba(0, 0, 0, 0.3) 0px 8.5px 19px, rgba(0, 0, 0, 0.22) 0px 7.5px 6px;
    width: 100%;
    height: 100%;
  }

  .modal_card:hover {
    cursor: pointer;
    transform: scale(1.03);
  }

  .label-layout {
    background-color: white;
    padding: 2%;
    border-radius: 5px;
  }

  .cardImg-container {
    pointer-events: none;
    size: 5vw;
    width: 100%;
    height: auto;
    border-radius: 5px;
    background-color: transparent;
  }

  .fixed-top-right {
    position: fixed;
    top: 120px;
    right:50px;
    z-index: 1;
  }

#alertContainer {
  position: fixed;
  top: 20px;
  left: 20px;
  border-radius: 15px;
  z-index: 10;
}

.alert {
  position: relative;
  left: -300px; 
  margin-top: 10px;
  width: auto;
  padding: 15px;
  color: #FFFFFF;
  font-weight: bold;
  border-radius: 10px;
  background-color: rgba(255, 0, 0, 1);
  box-shadow: 5px 4px 10px rgba(255, 0, 0, 0.4);
  -webkit-animation: slideIn 0.8s forwards;
  -moz-animation: slideIn 0.8s forwards;
  animation: slideIn 0.8s forwards;
}

@keyframes slideIn {
  from {
    left: -300px;
    opacity: 0;
  }
  to {
    left: 20px;
    opacity: 1;
  }
}
`;

  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
