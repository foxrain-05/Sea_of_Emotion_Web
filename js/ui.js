function UIManager() {}

UIManager.prototype.loadOption = function (choices, clickEvent, callback) {
    const choiceComponent = document.querySelector(".choice");
    choiceComponent.style.display = "block";
    choiceComponent.innerHTML = "";

    choices.forEach((choice) => {
        const option = document.createElement("li");
        option.innerHTML = choice.text;
        option.classList.add(choice.id);
        choiceComponent.appendChild(option);

        clickEvent &&
            option.addEventListener("click", (event) => {
                clickEvent(choice.id, event);
            });
    });

    callback && callback();
};

UIManager.prototype.clearOption = function () {
    const choiceComponent = document.querySelector(".choice");
    choiceComponent.style.display = "none";
    choiceComponent.innerHTML = "";
};

UIManager.prototype.showOption = function () {
    const choiceComponent = document.querySelector(".choice");
    choiceComponent.style.display = "block";
};

UIManager.prototype.writeText = function (text, callback) {
    const textComponent = document.querySelector(".text");
    const containerComponent = document.querySelector(".container");
    const textWriteSpeed = 50;
    let reservedTimers = [];
    let currentCallback = null;

    const setImmediateTimeout = (callback, delay) => {
        let timeoutId;
        const earlyExit = (useAction = true) => {
            clearTimeout(timeoutId);
            useAction && callback();
        };
        timeoutId = setTimeout(callback, delay);
        return earlyExit;
    };

    const clearTimers = () => {
        reservedTimers.forEach((timerTrigger) =>
            timerTrigger((useAction = false))
        );
        reservedTimers = [];
    };

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

    containerComponent.addEventListener("click", () => {
        textComponent.innerHTML = textComponent.dataset.text;
        clearTimers();

        if (typeof currentCallback === "function") {
            currentCallback();
            currentCallback = null;
        }
    });
};
