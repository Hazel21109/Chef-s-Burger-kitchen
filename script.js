// Game State Values
let score = 0;
let timeLeft = 60;
let gameTimer = null;
let currentOrderRecipe = [];
let userCurrentPlate = [];

// Customer Patience Tracking Variables
let customerMaxTime = 15;
let customerTimeLeft = 15;
let customerTimer = null;

const ingredientDirectory = {
    "bun-bottom": "🍞 Bottom Bun",
    "patty": "🥩 Beef Patty",
    "cheese": "🧀 Cheddar Cheese",
    "lettuce": "🥬 Fresh Lettuce",
    "bun-top": "🍞 Top Bun"
};

// DOM Elements Link
const recipeDisplay = document.getElementById("recipe-display");
const burgerMesh = document.getElementById("burger-mesh");
const scoreVal = document.getElementById("score-val");
const timerVal = document.getElementById("timer-val");
const gameOverlay = document.getElementById("game-overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayMsg = document.getElementById("overlay-msg");
const startBtn = document.getElementById("start-btn");
const serveBtn = document.getElementById("serve-btn");
const trashBtn = document.getElementById("trash-btn");
const patienceBar = document.getElementById("patience-bar");
const ingredientButtons = document.querySelectorAll(".ingredient-btn");

// System Initialization Event Hookups
startBtn.addEventListener("click", startCookingGame);
trashBtn.addEventListener("click", clearPlate);
serveBtn.addEventListener("click", servePlateAssembly);

ingredientButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const selectedIngredient = btn.getAttribute("data-ingredient");
        addIngredientToPlate(selectedIngredient);
    });
});

// CORE GAME LOOPS
function startCookingGame() {
    score = 0;
    timeLeft = 60;
    scoreVal.textContent = score;
    timerVal.textContent = timeLeft;
    
    clearPlate();
    generateNewOrder();
    gameOverlay.classList.add("hidden");

    // Primary Game Countdown Clock
    clearInterval(gameTimer);
    gameTimer = setInterval(() => {
        timeLeft--;
        timerVal.textContent = timeLeft;

        if (timeLeft <= 0) {
            endCookingGame();
        }
    }, 1000);
}

// Generate unique randomized order combinations
function generateNewOrder() {
    currentOrderRecipe = [];
    currentOrderRecipe.push("bun-bottom");
    
    const randomLayersCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < randomLayersCount; i++) {
        const middleIngredients = ["patty", "cheese", "lettuce"];
        const randomMiddleItem = middleIngredients[Math.floor(Math.random() * middleIngredients.length)];
        currentOrderRecipe.push(randomMiddleItem);
    }
    currentOrderRecipe.push("bun-top");

    const labelStringArray = currentOrderRecipe.map(item => ingredientDirectory[item]);
    
    // UI Pop animation trigger
    recipeDisplay.textContent = labelStringArray.join(" ➡️ ");
    recipeDisplay.classList.remove("pop-ticket");
    void recipeDisplay.offsetWidth; 
    recipeDisplay.classList.add("pop-ticket");

    resetCustomerPatience();
}

// Track customer waiting patience
function resetCustomerPatience() {
    clearInterval(customerTimer);
    
    customerMaxTime = currentOrderRecipe.length * 3.5; 
    customerTimeLeft = customerMaxTime;

    customerTimer = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(customerTimer);
            return;
        }

        customerTimeLeft -= 0.1;
        const percentageLeft = (customerTimeLeft / customerMaxTime) * 100;
        
        patienceBar.style.width = `${percentageLeft}%`;

        if (percentageLeft > 50) {
            patienceBar.style.backgroundColor = "#2ecc71"; // Green
        } else if (percentageLeft > 25) {
            patienceBar.style.backgroundColor = "#f3be20"; // Yellow
        } else {
            patienceBar.style.backgroundColor = "#e74c3c"; // Red
        }

        // Out of time condition triggers customer walkout
        if (customerTimeLeft <= 0) {
            clearInterval(customerTimer);
            score = Math.max(0, score - 3);
            scoreVal.textContent = score;
            flashFeedback("#e74c3c");
            clearPlate();
            generateNewOrder();
        }
    }, 100);
}

// Click addition to plate
function addIngredientToPlate(itemCode) {
    if (timeLeft <= 0) return;
    userCurrentPlate.push(itemCode);

    const layerDiv = document.createElement("div");
    layerDiv.className = `visual-layer layer-${itemCode}`;
    burgerMesh.appendChild(layerDiv);
}

function clearPlate() {
    userCurrentPlate = [];
    burgerMesh.innerHTML = "";
}

// Serve button checker
function servePlateAssembly() {
    if (userCurrentPlate.length === 0 || timeLeft <= 0) return;

    const matchSuccess = (userCurrentPlate.length === currentOrderRecipe.length) && 
                         userCurrentPlate.every((element, index) => element === currentOrderRecipe[index]);

    if (matchSuccess) {
        score += 10;
        scoreVal.textContent = score;
        flashFeedback("#2ecc71");
    } else {
        score = Math.max(0, score - 5);
        scoreVal.textContent = score;
        flashFeedback("#e74c3c");
    }

    clearPlate();
    generateNewOrder();
}

function flashFeedback(colorHex) {
    document.body.style.backgroundColor = colorHex;
    setTimeout(() => {
        document.body.style.backgroundColor = "#fdf0dd";
    }, 180);
}

function endCookingGame() {
    clearInterval(gameTimer);
    clearInterval(customerTimer);
    patienceBar.style.width = "0%";
    overlayTitle.textContent = "⏱️ Time's Up, Chef!";
    overlayMsg.textContent = `You finished your shift with a total score of ${score} points! Ready to start your next restaurant rush?`;
    startBtn.textContent = "Play Again";
    gameOverlay.classList.remove("hidden");
}

// INSTANT AUTO-START INJECTOR: Starts immediately when page runs
startCookingGame();
