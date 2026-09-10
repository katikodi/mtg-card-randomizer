const randomBtn = document.getElementById("get-random-btn");
const cardContainer = document.getElementById("random-card-container");
const image = document.getElementById("image");
const infoContainer = document.getElementById("card-attributes-container");
const imgLoading = "src/card-image-loading.png";
const imgMissing = "src/card-image-missing.png";

// -------------------------------------------------------------------------------------
// --------------------------------Global objects---------------------------------------
// -------------------------------------------------------------------------------------

let currentCard = {
    imageUrl: "",
    scryfallUrl: "",
    name: "",
    manaCost: "",
    colorIdentity: [],
    typeLine: "",
    types: [],
    keywords: [],
    cardText: "",
    legalities: {
        standard: "",
        commander: "",
    },
}

const manaColors = {
    W: '#D6D4C2',
    U: '#0475B1',
    B: '#393335',
    R: '#BE2E2E',
    G: '#2C6E3C',
    C: 'gray'
}

const manaPastels = {
    W: '#FFFFFF',
    U: '#E3FBFF',
    B: '#E6D9EB',
    R: '#FFE3E3',
    G: '#F3FFEA',
    C: 'gray'
}

const writtenMana = {
    W: {word: 'white', amount: 0},
    U: {word: 'blue', amount: 0},
    B: {word: 'black', amount: 0},
    R: {word: 'red', amount: 0},
    G: {word: 'green', amount: 0},
    X: {word: 'X', amount: 0},
    N: {word: 'of any color', amount: 0},
    C: {word: 'colorless', amount: 0},
    S: {word: 'snow', amount: 0},
    'W/U': {word: 'white/blue', amount: 0},
    'W/B': {word: 'white/black', amount: 0},
    'B/R': {word: 'black/red', amount: 0},
    'B/G': {word: 'black/green', amount: 0},
    'U/B': {word: 'blue/black', amount: 0},
    'U/R': {word: 'blue/red', amount: 0},
    'R/G': {word: 'red/green', amount: 0},
    'R/W': {word: 'red/white', amount: 0},
    'G/W': {word: 'green/white', amount: 0},
    'G/U': {word: 'green/blue', amount: 0},
    'W/U/P': {word: 'white/blue or double that in life', amount: 0},
    'W/B/P': {word: 'white/black or double that in life', amount: 0},
    'B/R/P': {word: 'black/red or double that in life', amount: 0},
    'B/G/P': {word: 'black/green or double that in life', amount: 0},
    'U/B/P': {word: 'blue/black or double that in life', amount: 0},
    'U/R/P': {word: 'blue/red or double that in life', amount: 0},
    'R/G/P': {word: 'red/green or double that in life', amount: 0},
    'R/W/P': {word: 'red/white or double that in life', amount: 0},
    'G/W/P': {word: 'green/white or double that in life', amount: 0},
    'G/U/P': {word: 'green/blue or double that in life', amount: 0},
}
//-------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", async () => {
    await buildPage();
})

randomBtn.addEventListener('click', async () => {
    for (const manaObjectKey in writtenMana) {
        writtenMana[manaObjectKey].amount = 0;
    }

    await buildPage();
})

//-------------------------------------------------------------------------
//---------------------------------TEMP------------------------------------
//-------------------------------------------------------------------------

const queryInput = document.getElementById('query');
/*
TO DO:
    - formatCardText: når mana:{G/U/P} if (`${teksten} ` er etter "(" og før "can be paid") { ? fjern teksten helt ? }
    - counter keywords objects (snow, acorn, ticket osv.)
    - filterfunksjonalitet for å unngå kort som er illegal i standard og/eller commander
    - ENTEN query layout:normal, ELLER lag custom targeting for transform/saga/adventure
TO MAYBE DO:
    - fade 0.5s fra loading placeholder til lasta bilde
    - finn og add symboler til ting ({T} = tapsymbol, manasymbol, osv.)
    - color teksten til manaen i samme farge, da må manaInfo være i div
    - fiks color gradient rekkefølge
DONE:
    - splitt opp getdata sånn at all currentCard mappingen er i sin egen funksjon under
    - FIKS manaCostArray is null på land
    - lag complicatedMana og kanskje kondenser basicMana eller merge dem om mulig
    - fiks keywords case sensitive bullshittery og spaced keywords some first strike
*/

// HUSK å fjerne queryInput consten over ^ og fjern queryInput.value fra encoded under v

// -------------------------------------------------------------------------------------
// ---------------------------------Main functions--------------------------------------
// -------------------------------------------------------------------------------------

async function getData() {
    const encoded = encodeURIComponent("lang:en " + queryInput.value);
    // https://scryfall.com/docs/syntax
    const result = await fetch(`https://api.scryfall.com/cards/random?q=${encoded}`, {
        headers:{
            "User-Agent": "A",
            "Accept":"application/json"
        }
    });

    const data = await result.json();
    await setData(data);

    console.log("------------------------------------------------------");
    console.log(data);
}

// -------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------

async function setData(data) {

    if (data.image_uris) {
        if (data.image_uris.png) {
            currentCard.imageUrl = data.image_uris.png;
        } else if (data.image_uris.large) {
            currentCard.imageUrl = data.image_uris.large;
        } else {
            currentCard.imageUrl = data.image_uris.normal;
        }
    } else currentCard.imageUrl = imgMissing;

    currentCard.scryfallUrl = data.scryfall_uri;
    currentCard.name = data.name;
    currentCard.colorIdentity = data.color_identity;
    currentCard.manaCost = data.mana_cost ?? '';
    currentCard.typeLine = data.type_line;
    currentCard.types = currentCard.typeLine.split(' ');
    currentCard.cardText = data.oracle_text;

    data.keywords.forEach(keyword => {
        currentCard.keywords.push(keyword.toLowerCase());
    })
    console.log("---------");
    console.log(currentCard);
}

// -------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------

async function buildPage() {
    image.src = imgLoading;
    await getData();

    // ---------------------------------------------------------------
    // image half:
    // -----------
    image.src = currentCard.imageUrl;
    image.setAttribute('title', 'Click to view card on the Scryfall website');
    image.addEventListener('mousedown', (e) => {
        e.preventDefault();
        if (e.button === 2) return; // prevent opening if right-click
        window.open(currentCard.scryfallUrl);
    })
    cardContainer.append(image);

    // ---------------------------------------------------------------
    // info half:
    // -----------
    infoContainer.replaceChildren();

    const title = makeTitle();
    const manaInfo = makeManaInfo();
    const cardTypeInfo = makeCardTypeInfo();
    const cardText = makeCardText();

    const cardAttributes = document.createElement('div');
    cardAttributes.className = 'card-attributes-inner-container';
    cardAttributes.append(manaInfo, cardTypeInfo, cardText);

    infoContainer.append(title, cardAttributes);
}

// -------------------------------------------------------------------------------------
// --------------------------------Helper functions-------------------------------------
// -------------------------------------------------------------------------------------

function formatCardText(text) {
    const abilityCostGroups = text.match(/\{[^{}]*\}(?:\{[^{}]*\})*/g);

    if (abilityCostGroups) {
        let formattedGroups = []

        abilityCostGroups.forEach((costGroup, index) => {
            resetAmount();
            let formattedCosts = []

            costGroup.match(/(?<={)[^}]+(?=})/g).forEach(cost => {
                if (writtenMana[cost]) {
                    if (cost.match(/\((.*?)(?:can be paid)/gi)) {
                        console.log('canbepaid-test:')
                        console.log(cost + "canbepaid")
                        return;
                    }
                    writtenMana[cost].amount++;
                    if (writtenMana[cost].amount > 1) {
                        formattedCosts.pop();
                    }
                    console.log('this isnt supposed to run if it canbepaid');
                    formattedCosts.push(`${writtenMana[cost].amount} ${writtenMana[cost].word}`);
                }
                if (cost.match(/(\d)/g)) {
                    formattedCosts.push(`${cost} of any color`);
                }
                if (cost === 'T' || cost === 'Q') {
                    formattedCosts.push(cost === 'T' ? 'Tap' : 'Untap');    // skal byttes ut med objektsjekk lignende writtenMana
                }
            })

            const formattedGroup = formattedCosts.join(' + ');
            formattedGroups.push(formattedGroup);
            text =  text.replace(costGroup, formattedGroups[index]);
            resetAmount();
        })
    }
    return text;
}
// ---------------------------------------------------------
function resetAmount() {
    for (let outerKey in writtenMana) {
        for (let innerKey in writtenMana[outerKey]) {
            if (innerKey === 'amount') {
                writtenMana[outerKey][innerKey] = 0;
            }
        }
    }
}
// ---------------------------------------------------------
function getGradient(gradientVersion) {
    return currentCard.colorIdentity.map(identity => {
        return gradientVersion[identity];
    });
}
// ---------------------------------------------------------
function makeTitle() {
    const cardNameDiv = document.createElement('div');
    cardNameDiv.id = 'card-name-div';
    
    const borderColors = getGradient(manaColors);

    cardNameDiv.style.setProperty(
        "--mana-border",
        `linear-gradient(to right, ${borderColors.join(", ")})`
    )
    if (currentCard.colorIdentity.length <= 0) {
        cardNameDiv.classList.add('colorless');
    }

    const cardName = document.createElement('h2');
    cardName.textContent = currentCard.name;
    cardNameDiv.append(cardName);
    return cardNameDiv;
}
// ---------------------------------------------------------
function makeManaInfo() {
    const manaCostArray = currentCard.manaCost.match(/(?<={)[^}]+(?=})/g);
    let manaText = [];

    if (manaCostArray) {
        manaCostArray.forEach((manaKey) => {
            if (manaKey.match(/(\d)/g)) {
                    manaText.push(`${manaKey} of any color`);
                    return;
                }

            writtenMana[manaKey].amount++;
            if (writtenMana[manaKey].amount > 1) {
                manaText.pop();
            }

            manaText.push(`${writtenMana[manaKey].amount} ${writtenMana[manaKey].word}`);
        });
    }
    
    const manaInfo = document.createElement('p');
    manaInfo.textContent = `Cost: ${manaText.join(' + ')}`;

    return manaInfo;
}
// ---------------------------------------------------------
function makeCardTypeInfo() {
    console.log('-------------');
    console.log(currentCard.typeLine);
    console.log(currentCard.types);

    const cardTypeInfo = document.createElement('div');
    cardTypeInfo.id = "type-div";

    currentCard.types.forEach((type) => {
        if (type === '—') {
            const hyphen = document.createElement('span');
            hyphen.textContent = type;
            cardTypeInfo.append(hyphen);
        } else {
            const typeLink = document.createElement('a');
            typeLink.textContent = type;
            typeLink.href = `https://scryfall.com/search?q=type%3A${type}`;
            typeLink.target = '_blank';
            cardTypeInfo.append(typeLink);
        }
    });
    return cardTypeInfo;
}
// ---------------------------------------------------------
function makeCardText() {
    if (!currentCard.cardText) return '';

    const cardTextContainer = document.createElement('div');
    cardTextContainer.id = 'card-text-container';

    const formattedCardText = formatCardText(currentCard.cardText);

    const cardTextLines = formattedCardText.split('\n');
    
    cardTextLines.forEach((textLine) => {
        const textLineDiv = document.createElement('div');
        textLineDiv.className = 'text-line-div';

        assignLinksAndSpans(textLine, currentCard.keywords, textLineDiv);
        cardTextContainer.append(textLineDiv);

        const backgroundColors = getGradient(manaPastels);
        cardTextContainer.style.setProperty(
            "--mana-border",
            `linear-gradient(to right, ${backgroundColors.join(", ")})`
        );
    })
    return cardTextContainer;
}
// ---------------------------------------------------------
function assignLinksAndSpans(text, keywords, container) {
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
    // ^ sikrer at f.eks "double strike" prioriteres før "double"
    const cleanRegexSearch = sortedKeywords
        .map(kw => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))   // escaper spesialtegn
        .join('|'); // konverterer til string med | (regex OR) imellom keywords

    const keywordMatch = new RegExp(`(?<=^|[^a-zA-Z0-9])(${cleanRegexSearch})(?=$|[^a-zA-Z0-9])`, 'gi');
    // ^ regexen isolerer matches så f.eks "screw" i teksten ikke trigger "crew" keywordet
    container.textContent = ''; 
    const segments = text.split(keywordMatch);

    segments.forEach(segment => {
        if (!segment) return;
        const isKeyword = keywords.some(kw => kw.toLowerCase() === segment.toLowerCase());

        if (isKeyword) {
            const keywordLink = document.createElement('a');
            keywordLink.textContent = segment;
            const encodedKeyword = encodeURIComponent(segment.replace(' ', ''));
            keywordLink.href = `https://scryfall.com/search?q=kw%3A${encodedKeyword}`;
            keywordLink.target = '_blank';
            container.append(keywordLink);
        } else {
            const normalTextSpan = document.createElement('span');
            normalTextSpan.textContent = segment;
            container.append(normalTextSpan);
        }
    });
}