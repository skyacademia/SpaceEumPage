const observerOptions = {
    root: null, // entire viewport
    threshold: 0.98, // root의 0% 만큼 header가 보이거나(isIntersecting: true) 사라지면(isIntersecting: false) callback function을 실행
    rootMargin: "0px"	// 뷰포트에서 네비게이션 바 높이만큼 보이거나 남긴 시점을 콜백 메서드 호출시점으로 설정함
}
// const cardInformationForTest = document.querySelector("#scroll-section-3").querySelector(".row").querySelectorAll(".card")
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent); // 안드로이드 아이폰을 검사해 체크
const sectionInfo = [
    {
        // section-1
        multipleValue: 3,
        obj: document.querySelector("#scroll-section-1"),
        values: {
            message1_fadeIn_opacity: [0, 1, { start: 0, end: 0.14 }],
            message1_fadeIn_transform: [10, 0, { start: 0, end: 0.14 }],
            message1_fadeOut_opacity: [1, 0, { start: 0.18, end: 0.32 }],
            message1_fadeOut_transform: [0, -10, { start: 0.18, end: 0.32 }],
            message2_fadeIn_opacity: [0, 1, { start: 0.34, end: 0.48 }],
            message2_fadeIn_transform: [10, 0, { start: 0.34, end: 0.48 }],
            message2_fadeOut_opacity: [1, 0, { start: 0.52, end: 0.66 }],
            message2_fadeOut_transform: [0, -10, { start: 0.52, end: 0.66 }],
        }
    },
    {
        // section-2
        multipleValue: 6,
        obj: document.querySelector("#scroll-section-2"),
        values: {
            message1_fadeIn_opacity: [0, 1, { start: 0, end: 0.07 }],
            message1_fadeIn_transform: [10, 0, { start: 0, end: 0.07 }],
            message1_fadeOut_opacity: [1, 0, { start: 0.09, end: 0.16 }],
            message1_fadeOut_transform: [0, -10, { start: 0.09, end: 0.16 }],
            message2_fadeIn_opacity: [0, 1, { start: 0.18, end: 0.25 }],
            message2_fadeIn_transform: [10, 0, { start: 0.18, end: 0.25 }],
            message2_fadeOut_opacity: [1, 0, { start: 0.27, end: 0.34 }],
            message2_fadeOut_transform: [0, -10, { start: 0.27, end: 0.34 }],
            message3_fadeIn_opacity: [0, 1, { start: 0.36, end: 0.43 }],
            message3_fadeIn_transform: [10, 0, { start: 0.36, end: 0.43 }],
            message3_fadeOut_opacity: [1, 0, { start: 0.45, end: 0.52 }],
            message3_fadeOut_transform: [0, -10, { start: 0.45, end: 0.52 }],
            message4_fadeIn_opacity: [0, 1, { start: 0.54, end: 0.61 }],
            message4_fadeIn_transform: [10, 0, { start: 0.54, end: 0.61 }],
            message4_fadeOut_opacity: [1, 0, { start: 0.63, end: 0.7 }],
            message4_fadeOut_transform: [0, -10, { start: 0.63, end: 0.7 }],
        }
    },
    {
        // section-3
        multipleValue: 0,
        obj: document.querySelector("#scroll-section-3"),
    },
]
const infiniteScrollInfo = {
    id: 1,
    isfetching: true,
}
let lastScrollTop = 0;
let id = 1;
function resizeHeight() {
    for (let i = 0; i < sectionInfo.length; i++) {
        if (sectionInfo[i].multipleValue > 0) {
            sectionInfo[i].obj.style.height = `${sectionInfo[i].multipleValue * window.innerHeight}px`;
        }
    }
}
resizeHeight();
window.addEventListener("resize", resizeHeight);


async function fetchData(id) {
    try {
        const response = await fetch(`/api/centerData/${id}`);
        const json = await response.json();
        return json;
    } catch (error) {
        console.error('Failed to fetch data', error);
        return [];
    }
}

function createElement(tagName, attributes, children) {
    const element = document.createElement(tagName);
    for (const key in attributes) {
        if (key === 'classList') {
            attributes[key].forEach(className => element.classList.add(className));
        } else if (key === 'style') {
            for (const styleKey in attributes[key]) {
                element.style[styleKey] = attributes[key][styleKey];
            }
        } else {
            element.setAttribute(key, attributes[key]);
        }
    }
    (children || []).forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else {
            element.appendChild(child);
        }
    });
    return element;
}

function createCard(info, rowTag, id) {
    // 카드 생성 로직
    const centerName = info.CenterName;
    const centerImagePath = info.CenterImagePath;
    const centerText = info.CenterText;

    const colTag = createElement('div', {
        classList: ['col-md-4', 'card-default-setting', 'animation-fadeIn-down-bounce'],
        style: { animationDelay: `${(id%3>0 ? id%3 : 3) * 0.1}s` }
    });
    const newCardTag = createElement('div', { classList: ['card', 'shadow-sm', 'mb-3'] });
    const cardImageTag = createElement('img', { src: centerImagePath, classList: ['card-img-top'], style: { width: '100%', height: '400px' } });
    const cardBodyTag = createElement('div', { classList: ['card-body'] });
    const cardTitleTag = createElement('h5', { classList: ['card-title'] }, [centerName]);
    const cardTextTag = createElement('p', { classList: ['card-text'] }, [centerText]);

    cardBodyTag.appendChild(cardTitleTag);
    cardBodyTag.appendChild(cardTextTag);
    newCardTag.appendChild(cardImageTag);
    newCardTag.appendChild(cardBodyTag);
    colTag.appendChild(newCardTag);
    rowTag.appendChild(colTag);
}

async function loadAndCreateCards(id, rowTag) {
    const json = await fetchData(id);

    // 데이터가 빈 배열이면 더이상 데이터를 가져오지 않는다.
    if (json.length === 0) {
        infiniteScrollInfo.isfetching = false;
        return;
    }

    json.forEach((info) => {
        createCard(info, rowTag, id);
    });
}

// 페이지 처음 로딩 시 이미지를 불러오기 위해 사용
async function preloadImages() {
    // id변수를 활용해서 /api/centerData/id로 데이터를 ajax 요청한다.
    if (infiniteScrollInfo.isfetching) {
        const contentArea = document.querySelector("#scroll-section-3").querySelector(".content-area");
        const rowTag = createElement('div', { classList: ['row', 'mb-md-3'] });

        // id변수를 활용해서 /data로 데이터를 ajax 요청한다.
        for (let i = 0; i < 6; i++) {
            if (infiniteScrollInfo.isfetching == false) {
                break;
            }
            await loadAndCreateCards(infiniteScrollInfo.id, rowTag);
            infiniteScrollInfo.id++;
        }
        //rowTag 내 Coltag가 1개라도 있으면 rowTag를 contentArea에 추가한다.
        if (rowTag.querySelectorAll(".col-md-4").length > 0) {
            contentArea.appendChild(rowTag);
        }
    }
}
window.addEventListener("load", () => {
    preloadImages()
})


function calculateValue(animationValues, scrollInSection, activedSectionHeight) {
    let returnValue = 0;
    const scrollRateInSection = scrollInSection / activedSectionHeight;
    if (animationValues.length == 3) {
        const animationStartPoint = activedSectionHeight * animationValues[2].start;
        const animationEndPoint = activedSectionHeight * animationValues[2].end;
        const scrollInPart = scrollInSection - animationStartPoint;
        const scrollRateInPart = scrollInPart / (animationEndPoint - animationStartPoint);

        if (scrollInSection >= animationStartPoint && scrollInSection <= animationEndPoint) {
            returnValue = scrollRateInPart * (animationValues[1] - animationValues[0]) + animationValues[0];
        }
        else if (scrollInSection < animationStartPoint) {
            returnValue = animationValues[0];
        } else if (scrollInSection > animationEndPoint) {
            returnValue = animationValues[1];
        }
    } else {
        returnValue = scrollRateInSection * (animationValues[1] - animationValues[0]) + animationValues[0];
    }
    return returnValue;
}

function handleAnimation(message, addAnimation, removeAnimation) {
    if (message.classList.contains(removeAnimation)) {
        message.classList.remove(removeAnimation);
    }
    if(message.classList.contains(addAnimation) != true){
        message.classList.add(addAnimation);
    }
}

function playAnimation(activeSectionIndex, previousHeight) {
    const yoffset = window.scrollY;
    const sectionObj = sectionInfo[activeSectionIndex].obj;
    const sectionValues = sectionInfo[activeSectionIndex].values
    const activeSectionHeight = sectionObj.clientHeight;
    const scrollInSection = yoffset - previousHeight;
    const scrollRateInSection = scrollInSection / activeSectionHeight;
    const textArea = sectionObj.querySelector(".content-area");
    const contentList = textArea.querySelectorAll(".content");

    switch (activeSectionIndex) {
        case 0:
            {
                const message1_fadeIn_opacity_value = calculateValue(sectionValues.message1_fadeIn_opacity, scrollInSection, activeSectionHeight);
                const message1_fadeIn_transition_value = calculateValue(sectionValues.message1_fadeIn_transform, scrollInSection, activeSectionHeight);
                const message1_fadeOut_opacity_value = calculateValue(sectionValues.message1_fadeOut_opacity, scrollInSection, activeSectionHeight);
                const message1_fadeOut_transition_value = calculateValue(sectionValues.message1_fadeOut_transform, scrollInSection, activeSectionHeight);
                const message2_fadeIn_opacity_value = calculateValue(sectionValues.message2_fadeIn_opacity, scrollInSection, activeSectionHeight);
                const message2_fadeIn_transition_value = calculateValue(sectionValues.message2_fadeIn_transform, scrollInSection, activeSectionHeight);
                const message2_fadeOut_opacity_value = calculateValue(sectionValues.message2_fadeOut_opacity, scrollInSection, activeSectionHeight);
                const message2_fadeOut_transition_value = calculateValue(sectionValues.message2_fadeOut_transform, scrollInSection, activeSectionHeight);

                if (scrollRateInSection <= 0.16) {
                    contentList[0].querySelector('.message-1').style.opacity = message1_fadeIn_opacity_value;
                    contentList[0].querySelector('.message-1').style.transform = `translate(0,${message1_fadeIn_transition_value}%)`;
                } else {
                    contentList[0].querySelector('.message-1').style.opacity = message1_fadeOut_opacity_value;
                    contentList[0].querySelector('.message-1').style.transform = `translate(0,${message1_fadeOut_transition_value}%)`;
                }
                if (scrollRateInSection <= 0.50) {
                    contentList[1].querySelector('.message-2').style.opacity = message2_fadeIn_opacity_value;
                    contentList[1].querySelector('.message-2').style.transform = `translate(0,${message2_fadeIn_transition_value}%)`;
                } else {
                    contentList[1].querySelector('.message-2').style.opacity = message2_fadeOut_opacity_value;
                    contentList[1].querySelector('.message-2').style.transform = `translate(0,${message2_fadeOut_transition_value}%)`;
                }
                break;
            }
        case 1:
            {
                const message1_fadeIn_opacity_value = calculateValue(sectionValues.message1_fadeIn_opacity, scrollInSection, activeSectionHeight);
                const message1_fadeIn_transition_value = calculateValue(sectionValues.message1_fadeIn_transform, scrollInSection, activeSectionHeight);
                const message1_fadeOut_opacity_value = calculateValue(sectionValues.message1_fadeOut_opacity, scrollInSection, activeSectionHeight);
                const message1_fadeOut_transition_value = calculateValue(sectionValues.message1_fadeOut_transform, scrollInSection, activeSectionHeight);
                const message2_fadeIn_opacity_value = calculateValue(sectionValues.message2_fadeIn_opacity, scrollInSection, activeSectionHeight);
                const message2_fadeIn_transition_value = calculateValue(sectionValues.message2_fadeIn_transform, scrollInSection, activeSectionHeight);
                const message2_fadeOut_opacity_value = calculateValue(sectionValues.message2_fadeOut_opacity, scrollInSection, activeSectionHeight);
                const message2_fadeOut_transition_value = calculateValue(sectionValues.message2_fadeOut_transform, scrollInSection, activeSectionHeight);
                const message3_fadeIn_opacity_value = calculateValue(sectionValues.message3_fadeIn_opacity, scrollInSection, activeSectionHeight);
                const message3_fadeIn_transition_value = calculateValue(sectionValues.message3_fadeIn_transform, scrollInSection, activeSectionHeight);
                const message3_fadeOut_opacity_value = calculateValue(sectionValues.message3_fadeOut_opacity, scrollInSection, activeSectionHeight);
                const message3_fadeOut_transition_value = calculateValue(sectionValues.message3_fadeOut_transform, scrollInSection, activeSectionHeight);
                const message4_fadeIn_opacity_value = calculateValue(sectionValues.message4_fadeIn_opacity, scrollInSection, activeSectionHeight);
                const message4_fadeIn_transition_value = calculateValue(sectionValues.message4_fadeIn_transform, scrollInSection, activeSectionHeight);
                const message4_fadeOut_opacity_value = calculateValue(sectionValues.message4_fadeOut_opacity, scrollInSection, activeSectionHeight);
                const message4_fadeOut_transition_value = calculateValue(sectionValues.message4_fadeOut_transform, scrollInSection, activeSectionHeight);

                if (scrollRateInSection <= 0.08) {
                    contentList[0].querySelector('.message-1').style.opacity = message1_fadeIn_opacity_value;
                    contentList[0].querySelector('.message-1').style.transform = `translate(0,${message1_fadeIn_transition_value}%)`;
                } else {
                    contentList[0].querySelector('.message-1').style.opacity = message1_fadeOut_opacity_value;
                    contentList[0].querySelector('.message-1').style.transform = `translate(0,${message1_fadeOut_transition_value}%)`;
                }
                if (scrollRateInSection <= 0.26) {
                    contentList[1].querySelector('.message-2').style.opacity = message2_fadeIn_opacity_value;
                    contentList[1].querySelector('.message-2').style.transform = `translate(0,${message2_fadeIn_transition_value}%)`;
                } else {
                    contentList[1].querySelector('.message-2').style.opacity = message2_fadeOut_opacity_value;
                    contentList[1].querySelector('.message-2').style.transform = `translate(0,${message2_fadeOut_transition_value}%)`;
                }
                if (scrollRateInSection <= 0.44) {
                    contentList[2].querySelector('.message-3').style.opacity = message3_fadeIn_opacity_value;
                    contentList[2].querySelector('.message-3').style.transform = `translate(0,${message3_fadeIn_transition_value}%)`;
                } else {
                    contentList[2].querySelector('.message-3').style.opacity = message3_fadeOut_opacity_value;
                    contentList[2].querySelector('.message-3').style.transform = `translate(0,${message3_fadeOut_transition_value}%)`;
                }
                if (scrollRateInSection <= 0.62) {
                    contentList[3].querySelector('.message-4').style.opacity = message4_fadeIn_opacity_value;
                    contentList[3].querySelector('.message-4').style.transform = `translate(0,${message4_fadeIn_transition_value}%)`;
                } else {
                    contentList[3].querySelector('.message-4').style.opacity = message4_fadeOut_opacity_value;
                    contentList[3].querySelector('.message-4').style.transform = `translate(0,${message4_fadeOut_transition_value}%)`;
                }
                break;
            }
    }

}

function findActiveSection() {
    const scrollY = window.scrollY;
    let totalSectionHeight = 0;
    let activeSectionIndex = 0;
    for (let i = 0; i < sectionInfo.length; i++) {
        totalSectionHeight += sectionInfo[i].obj.clientHeight;
        if (scrollY > totalSectionHeight) {
            activeSectionIndex++
        } else if (scrollY <= totalSectionHeight) {
            break;
        }
    }
    return activeSectionIndex;
}

function calculatePriviousHeight(activeSectionIndex) {
    let previousHeight = 0;
    for (let i = 0; i < activeSectionIndex; i++) {
        previousHeight += sectionInfo[i].obj.clientHeight;
    }
    return previousHeight;
}

function controlNavbar() {
    const navbar = document.querySelector(".navbar");
    let scrollTop = document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop) {
        navbar.style.top = `-76px`; // 스크롤을 내릴 때 nav를 숨김
    } else {
        navbar.style.top = "0"; // 스크롤을 올릴 때 nav를 보임
    }
    lastScrollTop = scrollTop;
}

document.addEventListener("scroll", () => {
    const activeSectionIndex = findActiveSection();
    const previousHeight = calculatePriviousHeight(activeSectionIndex);
    playAnimation(activeSectionIndex, previousHeight);
    controlNavbar();
});

const intersectionObserverSection3 = new IntersectionObserver((entries, observer) => {
    const [entry] = entries;
    if (entry.isIntersecting) {
        const contentArea = entry.target.querySelector(".content-area");
        const sectionTitle = contentArea.querySelector("h2");
        const rows = contentArea.querySelectorAll(".row");
        let animationDelayTime = 0;
        handleAnimation(sectionTitle, "animation-fadeIn-noMove", "animation-fadeOut-noMove");
        
        rows.forEach((row) => {
            const cols = row.querySelectorAll(".col-md-4")
            cols.forEach((col) => {
                if (col.classList.contains("animation-fadeOut-down")) {
                    col.classList.remove("animation-fadeOut-down");
                }
                if (col.classList.contains("animation-fadeIn-down") != true) {
                    col.classList.add("animation-fadeIn-down");
                    col.style.animationDelay = `${animationDelayTime}s`;
                    animationDelayTime += 0.1;
                }
            })
        })
    }
    else if (entry.isIntersecting == false) {
        const contentArea = entry.target.querySelector(".content-area");
        const sectionTitle = contentArea.querySelector("h2");
        const rows = contentArea.querySelectorAll(".row");

        handleAnimation(sectionTitle, "animation-fadeOut-noMove", "animation-fadeIn-noMove")
        
        rows.forEach((row) => {
            const cols = row.querySelectorAll(".col-md-4")
            cols.forEach((col) => {
                handleAnimation(col, "animation-fadeOut-down", "animation-fadeIn-down")
            })
        })
    }
},)

intersectionObserverSection3.observe(document.querySelector("#scroll-section-3"));


const intersectionObserverUnlimitedScroll = new IntersectionObserver(async (entries, observer) => {
    const [entry] = entries;
    if (entry.isIntersecting && infiniteScrollInfo.isfetching) {
        const contentArea = document.querySelector("#scroll-section-3").querySelector(".content-area");
        const rowTag = createElement('div', { classList: ['row', 'mb-md-3'] });

        // id변수를 활용해서 /data로 데이터를 ajax 요청한다.
        for (let i = 0; i < 3; i++) {
            if (infiniteScrollInfo.isfetching == false) {
                break;
            }
            await loadAndCreateCards(infiniteScrollInfo.id, rowTag);
            infiniteScrollInfo.id++;
        }
        if (rowTag.querySelectorAll(".col-md-4").length > 0) {
            contentArea.appendChild(rowTag);
        }
        contentArea.appendChild(rowTag);
    }
}, { threshold: 1.0 })



intersectionObserverUnlimitedScroll.observe(document.querySelector("footer"));

