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
    C: '#E0E0E0'
}

const miscKeys = {
    T: {fullText: 'Tap'},
    Q: {fullText: 'Untap'},
    'PW': {fullText: 'planeswalker'},
    E: {fullText: 'energy counter(s)', amount: 0},
    A: {fullText: 'acorn counter(s)', amount: 0},
    P: {fullText: 'pawprint(s)', amount: 0},
    'TK': {fullText: 'ticket(s)', amount: 0},
    'CHAOS': {fullText: 'chaos'}
}

const writtenMana = {
    W: {fullText: 'white', amount: 0},
    U: {fullText: 'blue', amount: 0},
    B: {fullText: 'black', amount: 0},
    R: {fullText: 'red', amount: 0},
    G: {fullText: 'green', amount: 0},
    X: {fullText: 'X', amount: 0},
    C: {fullText: 'colorless', amount: 0},
    S: {fullText: 'snow mana', amount: 0},
    'W/U': {fullText: 'white/blue', amount: 0},
    'W/B': {fullText: 'white/black', amount: 0},
    'B/R': {fullText: 'black/red', amount: 0},
    'B/G': {fullText: 'black/green', amount: 0},
    'U/B': {fullText: 'blue/black', amount: 0},
    'U/R': {fullText: 'blue/red', amount: 0},
    'R/G': {fullText: 'red/green', amount: 0},
    'R/W': {fullText: 'red/white', amount: 0},
    'G/W': {fullText: 'green/white', amount: 0},
    'G/U': {fullText: 'green/blue', amount: 0},
    'C/W': {fullText: 'colorless/white', amount: 0},
    'C/U': {fullText: 'colorless/blue', amount: 0},
    'C/B': {fullText: 'colorless/black', amount: 0},
    'C/R': {fullText: 'colorless/red', amount: 0},
    'C/G': {fullText: 'colorless/green', amount: 0},
    'W/P': {fullText: 'white or pay double in life', amount: 0},
    'U/P': {fullText: 'blue or pay double in life', amount: 0},
    'B/P': {fullText: 'black or pay double in life', amount: 0},
    'R/P': {fullText: 'red or pay double in life', amount: 0},
    'G/P': {fullText: 'green or pay double in life', amount: 0},
    'C/P': {fullText: 'colorless or pay double in life', amount: 0},
    H: {fullText: 'of any color or pay double in life', amount: 0},
    'W/U/P': {fullText: 'white/blue or pay double in life', amount: 0},
    'W/B/P': {fullText: 'white/black or pay double in life', amount: 0},
    'B/R/P': {fullText: 'black/red or pay double in life', amount: 0},
    'B/G/P': {fullText: 'black/green or pay double in life', amount: 0},
    'U/B/P': {fullText: 'blue/black or pay double in life', amount: 0},
    'U/R/P': {fullText: 'blue/red or pay double in life', amount: 0},
    'R/G/P': {fullText: 'red/green or pay double in life', amount: 0},
    'R/W/P': {fullText: 'red/white or pay double in life', amount: 0},
    'G/W/P': {fullText: 'green/white or pay double in life', amount: 0},
    'G/U/P': {fullText: 'green/blue or pay double in life', amount: 0},
    '2/W': {fullText: 'white or double the mana of any colors', amount: 0},
    '2/U': {fullText: 'blue or double the mana of any colors', amount: 0},
    '2/B': {fullText: 'black or double the mana of any colors', amount: 0},
    '2/R': {fullText: 'red or double the mana of any colors', amount: 0},
    '2/G': {fullText: 'green or double the mana of any colors', amount: 0},
}
//-------------------------------------------------------------------------

let isCardMissing = false;

document.addEventListener("DOMContentLoaded", async () => {
    isCardMissing = false;
    delete currentCard.front;
    delete currentCard.back;
    await buildPage();
})

randomBtn.addEventListener('click', async () => {
    for (const manaObjectKey in writtenMana) {
        writtenMana[manaObjectKey].amount = 0;
    }

    isCardMissing = false;
    delete currentCard.front;
    delete currentCard.back;
    await buildPage();
})

//-------------------------------------------------------------------------
//---------------------------------TEMP------------------------------------
//-------------------------------------------------------------------------

const queryInput = document.getElementById('query');
/*
TO DO:
    - FIKS at flere vinduer dukker opp når man trykker på kortet
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
    - formatCardText: når mana:{G/U/P} if (`${teksten} ` er etter "(" og før "can be paid") { ? fjern teksten helt ? }
    - counter keywords objects (snow, acorn, ticket osv.)
*/

// HUSK å fjerne queryInput consten over ^ og fjern queryInput.value fra encoded under v

// -------------------------------------------------------------------------------------
// ---------------------------------Main functions--------------------------------------
// -------------------------------------------------------------------------------------

async function getData() {
    const encoded = encodeURIComponent("lang:en " + "include:extras " + queryInput.value);
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
    setImage(data);
    
    if (data.layout !== 'normal') {
        setComplicatedCardData(data);
        return;
    }
    if (data.status === 404) {
        isCardMissing = true;
        currentCard.imageUrl = imgMissing;
        return;
    }


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

    if (isCardMissing) {
        const missingCardMessage = document.createElement('h2');
        missingCardMessage.textContent = 'No card found';
        infoContainer.append(missingCardMessage);
        return;
    }

    if (currentCard.front) {
        const temporary = document.createElement('p');
        temporary.textContent = 'to be fixed';
        infoContainer.append(temporary);
        return;
    }

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

function setImage(data) {
    if (data.image_uris) {
        if (data.image_uris.png) {
            currentCard.imageUrl = data.image_uris.png;
        } else if (data.image_uris.large) {
            currentCard.imageUrl = data.image_uris.large;
        } else {
            currentCard.imageUrl = data.image_uris.normal;
        }
    } else currentCard.imageUrl = imgMissing;
}
// ---------------------------------------------------------
function setComplicatedCardData(data) {
    if (data.layout === 'transform') {
        currentCard.front = data.card_faces[0];
        currentCard.back = data.card_faces[1];

        console.log(currentCard.front);
        console.log(currentCard.back);

        let currentFace = "front" || "back"
        console.log(currentFace);

        currentCard[currentFace].scryfallUrl = data.scryfall_uri;
        currentCard[currentFace].name = data.name;
        currentCard[currentFace].colorIdentity = data.color_identity;
        currentCard[currentFace].manaCost = data.mana_cost ?? '';
        currentCard[currentFace].typeLine = data.type_line;
        currentCard[currentFace].types = currentCard[currentFace].typeLine.split(' ');
        currentCard[currentFace].cardText = data.oracle_text;

        // TO DO on transformcards: (experimenting)
        //button for switching which card face is shown
        //build text for both
        //trigger this function also on toggle button to swap currentFace, or move currentFace outside maybe?
    }
}
// ---------------------------------------------------------
function formatCardText(text) {
    const abilityCostGroups = text.match(/\{[^{}]*\}(?:\{[^{}]*\})*/g);

    if (abilityCostGroups) {
        let formattedGroups = []

        abilityCostGroups.forEach((costGroup, index) => {
            resetAmount();
            let formattedCosts = []

            costGroup.match(/(?<={)[^}]+(?=})/g).forEach(cost => {  // the regex removes the { } on the symbol keys
                if (writtenMana[cost]) {
                    if (text.includes(`({${cost}} can be paid`)) {  // { } are added back when targeting
                            formattedCosts.push('the funny looking mana symbol');   // I give up on finding a better catch-all term
                            return;
                        }
                        
                    writtenMana[cost].amount++;
                    if (writtenMana[cost].amount > 1) {
                        formattedCosts.pop();
                    }
                    formattedCosts.push(`${writtenMana[cost].amount} ${writtenMana[cost].fullText}`);
                }
                if (cost.match(/(\d)/g)) {
                    formattedCosts.push(`${cost} of any color`);
                }
                if (miscKeys[cost]) {
                    if (miscKeys[cost].amount) {
                        miscKeys[cost].amount++;
                        if (miscKeys[cost].amount > 1) {
                            formattedCosts.pop();
                        }
                        formattedCosts.push(`${miscKeys[cost].amount} ${miscKeys[cost].fullText}`);
                    } else formattedCosts.push(miscKeys[cost].fullText);
                }
                // if (cost === 'T' || cost === 'Q') {
                //     formattedCosts.push(cost === 'T' ? 'Tap' : 'Untap');    // skal byttes ut med objektsjekk lignende writtenMana
                // }
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

            manaText.push(`${writtenMana[manaKey].amount} ${writtenMana[manaKey].fullText}`);
        });
    } else {
        manaText.push('none');
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