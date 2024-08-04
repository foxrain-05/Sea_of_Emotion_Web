class GameDataManager {
    constructor() {
        this.dataFolder = "data";
        this.dataFiles = ["눈.canvas"];
        this.data = {};
        this.history = [];
    }

    async loadData() {
        try {
            const response = await fetch(
                `${this.dataFolder}/${this.dataFiles[0]}`
            );
            this.data = await response.json();
            return this.data;
        } catch (error) {
            console.error("Failed to load data:", error);
            return null;
        }
    }

    findRootNode() {
        return this.data.nodes.find((node) => node.text === "Enrty");
    }

    findChildNodes(rootNode) {
        const childEdges = this.data.edges.filter(
            (edge) => edge.fromNode === rootNode.id
        );
        return childEdges.map((edge) =>
            this.data.nodes.find((node) => edge.toNode === node.id)
        );
    }

    findNextNodeById(id) {
        const edge = this.data.edges.find((edge) => edge.fromNode === id);
        return this.data.nodes.find((node) => edge.toNode === node.id);
    }

    findNodeById(id) {
        return this.data.nodes.find((node) => node.id === id);
    }
}

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

const dataManager = new GameDataManager();
const uiManager = new UIManager();

(async () => {
    await dataManager.loadData();

    if (dataManager.history.length === 0) {
        const rootNode = dataManager.findRootNode();
        if (rootNode) {
            dataManager.history.push(rootNode.id);
        }
    }

    const rootNode = dataManager.findNodeById(dataManager.history.at(-1));
    const childNodes = dataManager.findChildNodes(rootNode);

    const choiceClickEvent = (id, event) => {
        event.stopPropagation();
        uiManager.clearOption();
        const node = dataManager.findNextNodeById(id);
        uiManager.writeText(node.text, () => {
            uiManager.showOption();
        });
        dataManager.history.push(node.id);

        const childNodes = dataManager.findChildNodes(node);
        uiManager.loadOption(childNodes, choiceClickEvent);
    };

    uiManager.loadOption(childNodes, choiceClickEvent);
})();
