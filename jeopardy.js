/**
 * List to store category IDs.
 */
let categoriesId = [];

/**
 * List to store category titles.
 */
let categoriesTitle = [];

/**
 * 2D array to store questions and answers.
 */
let qna = [[], [], [], [], [], []];

/**
 * Asynchronously fetches 6 random categories and stores their IDs and titles.
 * 
 */
async function getCategoryIds() {
    let res = await axios.get('https://jservice.io/api/random', {params: {count: 6}});
    let resData = res.data;
    resData.forEach(element => {
        categoriesId.push(element.category.id);
        categoriesTitle.push(element.category.title);
    });
}

/**
 * Asynchronously fetches questions for a given category ID and returns 5 random questions.
 * @param {number} catId - The ID of the category.
 * @returns {Promise<Array>} - An array of 5 random questions from the category.
 */
async function getCategory(catId) {
    let insideCat = await axios.get('https://jservice.io/api/clues', {params: { category: catId}});
    let insideCatData = insideCat.data;

    let extractCat = insideCatData.map(cats => ({
        question: cats.question,
        answer: cats.answer,
        showing: null
    }));

    const selectedIndices = new Set();
    while (selectedIndices.size < 5) {
        const randomIndex = Math.floor(Math.random() * extractCat.length);
        selectedIndices.add(randomIndex);
    }

    const randomQuestions = [...selectedIndices].map(index => extractCat[index]);
    return randomQuestions;
}

/**
 * Fills the table with category titles and empty cells for questions.
 */
const aboveTable = document.getElementById('aboveTable');
const table = document.getElementById('jeopardy');
async function fillTable() {
    let thead = document.createElement("thead");
    let headerRow = document.createElement("tr");


    categoriesTitle.forEach(title => {
        const th = document.createElement("th");
        th.innerHTML = title;
        headerRow.appendChild(th);
    })

    thead.appendChild(headerRow);
    aboveTable.appendChild(thead);

    let tbody = document.createElement("tbody");
    for (let i = 0; i < 5; i++) {
        const tr = document.createElement("tr");
        for (let j = 0; j < 6; j++) {
            const td = document.createElement("td");
            td.innerText = "?";
            td.classList.add('null');
            td.classList.add(`${i}-${j}`);



            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);



}



table.addEventListener('click', function (e) {

    const clicked = e.target;

    if (clicked.tagName === "TD") {  
        
        const positionClass = Array.from(clicked.classList).find(cls => cls.includes('-'));
        const [row, col] = positionClass.split('-');

        // const questionObject = qna[col][row];  
        
        let qnaCol = qna[col];

        const questionObject = qnaCol[row];


         if (clicked.classList.contains('null')) {

            clicked.innerHTML = questionObject.question;
            clicked.classList.remove('null');
            clicked.classList.add('question');
        } 
         else if (clicked.classList.contains('question')) {
            clicked.innerHTML = questionObject.answer;
            clicked.classList.remove('question');
            clicked.classList.add('answer');
        } 
         else if (clicked.classList.contains('answer')) {


            clicked.innerText = "?";
            clicked.classList.remove('answer');
            clicked.classList.add('null');
        }
    }
});



const startBtn = document.getElementById('startGame');
const restartGame = document.getElementById('restart');

startBtn.addEventListener('click', function() {
    document.getElementById("gameScreen").style.display = "flex";  
    setupAndStart();  
   
    document.getElementById("wholeTable").scrollIntoView({ behavior: 'smooth' });
});

restartGame.addEventListener('click', function(){
    categoriesId = [];
    categoriesTitle = [];
    qna = [[], [], [], [], [], []];
    table.innerHTML = '';
    aboveTable.innerHTML = '';
    setupAndStart();


})

/**
 * Sets up the game by fetching categories and filling the table.
 * 
 */
async function setupAndStart() {
    categoriesId = [];
    categoriesTitle = [];
    qna = [[], [], [], [], [], []];
    table.innerHTML = '';
    aboveTable.innerHTML = '';
    await getCategoryIds();

    console.log(categoriesId);
    console.log(categoriesTitle);
    

    await Promise.all(categoriesId.map(async (num, index) => {
        qna[index] = await getCategory(num);
    }));

    console.log(qna);
    fillTable();
}

