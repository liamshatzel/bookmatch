let bookCount = 1;
var bookArray = [];
const authorMap = new Map();
const titleMap = new Map();
const subjectMap = new Map();

//TODO: STYLING
//TODO: 

//source: https://github.com/jbdunne/Erasure/blob/master/index.html
const filterWords = ['a', 'abaft', 'abeam', 'aboard', 'about', 'above', 'absent', 'across',
    'afore',
    'after',
    'against',
    'along',
    'alongside',
    'amid',
    'amidst',
    'among',
    'amongst',
    'an',
    'anenst',
    'apropos',
    'apud',
    'around',
    'as',
    'aside',
    'astride',
    'at',
    'athwart',
    'atop',
    'barring',
    'before',
    'behind',
    'below',
    'beneath',
    'beside',
    'besides',
    'between',
    'beyond',
    'but',
    'by',
    'chez',
    'circa',
    'concerning',
    'despite',
    'down',
    'during',
    'except',
    'excluding',
    'failing',
    'following',
    'for',
    'forenenst',
    'from',
    'given',
    'how',
    'in',
    'including',
    'inside',
    'into',
    'like',
    'mid',
    'midst',
    'minus',
    'modulo',
    'near',
    'next',
    'notwithstanding',
    'of',
    'off',
    'on',
    'onto',
    'opposite',
    'out',
    'outside',
    'over',
    'pace',
    'past',
    'per',
    'plus',
    'pro',
    'qua',
    'regarding',
    'round',
    'sans',
    'save',
    'since',
    'than',
    'the',
    'through, thru (informal)',
    'throughout',
    'till',
    'times',
    'to',
    'toward',
    'towards',
    'under',
    'underneath',
    'unlike',
    'until',
    'unto',
    'up',
    'upon',
    'versus',
    'via',
    'vice',
    'with',
    'within',
    'without', 'worth'];

let APIKey = "AIzaSyDctVfRehy9hBTh9BkAlZ8k4R66Nj7kJSE";
function buttonClick() {
    getRequest();
}
//want to make a seperate query for each input value to get more book matches
//first query is using all 3
//second query uses title first
//third query uses author
//final query uses subject
//shuffle each value and put them all into a new array
//iterate through array until match found (somehow)
//give them the match after ~10 swipes (or sooner?)
//to implement: book viewer card with info button

//get the volume ID from the API and return it 

function getRequest() {
    //ajax GET request
    let subject = $("#subject").val();
    let author = $("#author").val();
    let title = $("#title").val();
    let subjectQ1 = (subject ? "+subject:" + subject : "");
    let authorQ1 = (author ? "+inauthor:" + author : "");
    let titleQ1 = (title ? "+intitle:" + title : "");

    let url = "https://www.googleapis.com/books/v1/volumes?q=" + subjectQ1 + authorQ1 + titleQ1 + "&maxResults=40&printType=books&projection=full&key=" + APIKey;
    console.log(url);
    $.get(url, function (data) {
        if (data["totalItems"] == 0) {
            console.log("no items found");
        }
        const items = data["items"];
        getMoreBooks(subject, author, title, items);
    });

}

async function getMoreBooks(subject, author, title, books) {
    if (subject) {
        console.log(subject);
    }
    if (author) {
        console.log(author);
    }
    if (title) {
        console.log(title);
    }
    //need to remove books that have no images
    let titleURL = "https://www.googleapis.com/books/v1/volumes?q=" + "intitle:" + title + "&maxResults=40&printType=books&projection=full&key=" + APIKey;
    const arr1 = await queryWrapper(titleURL);

    let authorURL = "https://www.googleapis.com/books/v1/volumes?q=" + "inauthor:" + author + "&maxResults=40&printType=books&projection=full&key=" + APIKey;
    const arr2 = await queryWrapper(authorURL);

    let subjectURL = "https://www.googleapis.com/books/v1/volumes?q=" + "subject:" + subject + "&maxResults=40&printType=books&projection=full&key=" + APIKey;
    const arr3 = await queryWrapper(subjectURL);


    let arr1Shuf = shuffle(arr1.items);
    let arr2Shuf = shuffle(arr2.items);
    let arr3Shuf = shuffle(arr3.items);
    var bigBooks = [];
    if (books) {
        console.log("adding books");
        bigBooks = bigBooks.concat(books);
        console.log(books);
    }
    if (subject) {
        bigBooks = bigBooks.concat(arr1Shuf);
    }
    if (author) {

        bigBoooks = bigBooks.concat(arr2Shuf);
    }
    if (title) {
        bigBooks = bigBooks.concat(arr3Shuf);
    }

    /*remove books without thumbnails*/
    var i = 0;
    while (i < bigBooks.length) {
        let img = bigBooks[i]["volumeInfo"]["imageLinks"];
        if (img == undefined) {
            bigBooks.splice(i, 1);
        } else {
            i++;
        }
    }

    bookArray = bigBooks;
    outputBook(bigBooks[0]);
    mapBooks();
}

function mapBooks() {
    for (let i = 0; i < bookArray.length; i++) {
        if (bookArray[i].volumeInfo.authors != undefined) {
            insertToMap(bookArray[i].volumeInfo.authors[0], authorMap);
        }
        if (bookArray[i].volumeInfo.categories) {
            let categories = bookArray[i].volumeInfo.categories;
            for (let j = 0; j < categories.length; j++) {
                insertToMap(categories[j].toLowerCase(), subjectMap);
            }
        }
        if (bookArray[i].volumeInfo.title) {
            const title = bookArray[i].volumeInfo.title.split(" ");
            for (let k = 0; k < title.length; k++) {
                if (!(filterWords.includes(title[k].toLowerCase()))) {
                    insertToMap(title[k].toLowerCase(), titleMap)
                }
            }
        }
    }

}

async function likeBook() {
    if (bookArray[bookCount].volumeInfo.authors != undefined) {
        checkCollision(bookArray[bookCount].volumeInfo.authors[0], authorMap);
    }
    if (bookArray[bookCount].volumeInfo.categories) {
        let categories = bookArray[bookCount].volumeInfo.categories;
        for (let j = 0; j < categories.length; j++) {
            checkCollision(categories[j].toLowerCase(), subjectMap);
        }
    }
    if (bookArray[bookCount].volumeInfo.title) {
        const title = bookArray[bookCount].volumeInfo.title.split(" ");
        for (let k = 0; k < title.length; k++) {
            if (!(filterWords.includes(title[k].toLowerCase()))) {
                checkCollision(title[k].toLowerCase(), titleMap)
            }
        }
    }
    bookCount++;
    outputBook(bookArray[bookCount]);
    mostLikedSubject = mostLiked(subjectMap);
    if (subjectMap.get(mostLikedSubject) > 5) {
        await matchFound();
    }
    $("#description").html("");
}

function dislikeBook() {
    $("#description").html("");
    bookCount++;
    outputBook(bookArray[bookCount]);
}
async function matchFound() {
    console.log("found match");
    $("#like-button").prop('disabled', true);
    let subjectURL = "https://www.googleapis.com/books/v1/volumes?q=" + "subject:" + mostLikedSubject + "&maxResults=40&printType=books&projection=full&key=" + APIKey;
    var matchedBooks = await queryWrapper(subjectURL);
    const newBooks = shuffle(matchedBooks.items);
    outputMatch(newBooks[0]);
    openModal();
}
async function queryWrapper(url) {
    const result = await fetch(url, {
        method: 'GET',
    }).then(
        response => {
            if (response) {
                return response.json();
            }
        },
        rejection => {
            console.error(rejection.message);
        }
    );
    return result;
}


function outputBook(book) {
    let imgLoc = book["volumeInfo"]["imageLinks"];
    var img = null;
    try {
        img = imgLoc.thumbnail;
        $("#book-img").attr("src", img);
        $("#book-title").html(book.volumeInfo.title);
    } catch {
        console.log("error");
    }
}

function outputMatch(book) {
    let imgLoc = book["volumeInfo"]["imageLinks"];
    var img = null;
    try {
        img = imgLoc.thumbnail;
        $("#match-book").attr("src", img);
    } catch {
        console.log("error");
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

//source: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

function mostLiked(map) {
    var largest = 0;
    var largestKey = "";
    for (let [key, value] of map) {
        if (value > largest) {
            largest = value;
            largestKey = key;
        }
    }
    return largestKey;
}


function insertToMap(key, curMap) {
    curMap.set(key, 0);
}

function checkCollision(key, curMap) {
    if (curMap.has(key)) {
        var curCount = curMap.get(key) + 1;
        curMap.set(key, curCount);
    } else {
        curMap.set(key, 1);
    }

}

//source inspired by: https://www.freecodecamp.org/news/how-to-build-a-modal-with-javascript/
function openModal() {
    const modal = document.querySelector(".modal");
    const overlay = document.querySelector(".overlay");
    modal.classList.remove("hidden");
    overlay.classList.remove("hidden");
}

function closeModal() {
    const modal = document.querySelector(".modal");
    const overlay = document.querySelector(".overlay");
    modal.classList.add("hidden");
    overlay.classList.add("hidden");
    location.reload();
}

function infoClick() {
    // $("#description").html(bookArray[bookCount].volumeInfo.description);

    $("#img-container").append("<p id='description'>" + bookArray[bookCount].volumeInfo.description + "</p>");
}



