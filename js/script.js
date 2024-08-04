const setImmediateTimeout = (callback, delay) => {
    let timeoutId;
    const earlyExit = (useAction = true) => {
        clearTimeout(timeoutId);
        useAction && callback();
    };
    timeoutId = setTimeout(callback, delay);
    return earlyExit;
};

// 택스트 처리 부분
const containerComponent = document.querySelector(".container");
const textComponent = document.querySelector(".text");
const textWriteSpeed = 50;
let reservedTimers = [];
let currentCallback = null;

const clearTimers = () => {
    reservedTimers.forEach((timerTrigger) => timerTrigger((useAction = false)));
    reservedTimers = [];
};

const writeText = (text, callback) => {
    clearTimers();
    textComponent.dataset.text = text;
    textComponent.innerHTML = "";

    currentCallback = callback;
    const textArray = [...text];
    textArray.forEach((letter, i) => {
        reservedTimers.push(
            setImmediateTimeout(() => {
                textComponent.innerHTML += letter;
            }, textWriteSpeed * i)
        );
    });

    reservedTimers.push(
        setImmediateTimeout(() => {
            callback && callback();
            currentCallback = null;
        }, textArray.length * textWriteSpeed)
    );
};

containerComponent.addEventListener("click", () => {
    textComponent.innerHTML = textComponent.dataset.text;
    clearTimers();

    if (typeof currentCallback === "function") {
        currentCallback();
        currentCallback = null;
    }
});
