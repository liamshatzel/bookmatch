let bookCount = 1;
var bookArray = [];
const authorMap = new Map();
const titleMap = new Map();
const subjectMap = new Map();

//TOOD: Change subject to dropdown?

//filter word source: https://github.com/jbdunne/Erasure/blob/master/index.html
const filterWords = ['a', 'abaft', 'abeam', 'aboard', 'about', 'above', 'absent', 'across',
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
    'including',
    'inside',
    'into',
    'like',
    'mid',
    'midst',
    'minus',
    'save',
    'since',
    'than',
    'the'];

let APIKey = "nicetryhackers";

/*Get user input from the text boxes*/
function buttonClick() {
    let subject = $("#subject").val();
    let author = $("#author").val();
    let title = $("#title").val();
    if (!((subject != "None") || author || title)) {
        $("#error-text").html("Please enter some input");
    } else {
        $("#like-button").focus();
        $("#match-button").prop('disabled', true);
        $("#match-button").css("filter", "brightness(50%)");
        $("#loading").show();
        getRequest();
    }

}


/*make the required queries*/
function getRequest() {
    let subject = $("#subject").val().split(" ").join("+");
    let author = $("#author").val().split(" ").join("+");
    let title = $("#title").val().split(" ").join("+");
    let subjectQ1 = ((subject != "None") ? "+subject:" + subject : "");
    let authorQ1 = (author ? "+inauthor:" + author : "");
    let titleQ1 = (title ? "+intitle:" + title : "");

    let url = "https://www.googleapis.com/books/v1/volumes?q=" + subjectQ1 + authorQ1 + titleQ1 + "&maxResults=40&printType=books&projection=full&key=" + APIKey;
    console.log(url);
    $.get(url, function (data) {
        if (data["totalItems"] == 0) {
            console.log("no items found");
            $("#book-title").html("No Books Found.");
        }
        const items = data["items"];
        getMoreBooks(subject, author, title, items);
    });

}

/*take the union of the queries so that there are more book results*/
async function getMoreBooks(subject, author, title, books) {

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
    if (subject != "None") {
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
    console.log(bookArray);
    $("#loading").hide();
    outputBook(bigBooks[0]);
    mapBooks();
}

/*Map certain properties of the books into hash maps and count collisions*/
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

/*Like the book, so that the values are hashed*/
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
    if (subjectMap.get(mostLikedSubject) > 5 || bookCount >= 50) {
        await matchFound();
    }
    $("#description").html("");
}

/*Dislike and increment to the next book*/
async function dislikeBook() {
    $("#description").html("");
    bookCount++;
    if (bookCount >= 25) {
        await matchFound();
    }
    outputBook(bookArray[bookCount]);
}

/*Make a new query and choose a random book from it*/
async function matchFound() {
    console.log("found match");
    $("#like-button").prop('disabled', true);
    $("#like-button").css("filter", "brightness(50%)");
    $("#dislike-button").prop('disabled', true);
    $("#dislike-button").css("filter", "brightness(50%)");

    var mostLikedSubject = mostLiked(subjectMap).split(" ")[0];
    if (mostLikedSubject == undefined) {
        mostLikedSubject = "Science";
    }
    console.log(mostLikedSubject);
    let subjectURL = "https://www.googleapis.com/books/v1/volumes?q=" + "subject:" + mostLikedSubject + "&maxResults=40&printType=books&projection=full&key=" + APIKey;
    console.log(subjectURL);
    var matchedBooks = await queryWrapper(subjectURL);
    console.log(matchedBooks);
    var newBooks = shuffle(matchedBooks.items);
    var i = 0;
    while (i < newBooks.length) {
        let img = newBooks[i]["volumeInfo"]["imageLinks"];
        if (img == undefined) {
            newBooks.splice(i, 1);
        } else {
            i++;
        }
    }
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
    if (bookCount > bookArray.length) {
        $("#book-title").html("Out of Books :/");
        $("#img-container").clear();

    }
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
        $("#match-book-title").html(book.volumeInfo.title);
        $("#match-desc").html(book.volumeInfo.description)
    } catch {
        console.log("error");
        $("#match-book-title").html("Sorry there was a problem.");
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

/*Fisher Yates Shuffle*/
function shuffle(array) {
    if (array) {
        for (let i = 0; i < array.length - 2; i++) {
            j = Math.floor(Math.random() * i);
            [array[i], array[j]] = [array[j], array[i]];
        }


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

function openModal() {
    const modal = document.querySelector(".modal");
    const overlay = document.querySelector(".overlay");
    modal.classList.remove("hidden");
    overlay.classList.remove("hidden");
    $("#close-modal").focus();
}

function closeModal() {
    const modal = document.querySelector(".modal");
    const overlay = document.querySelector(".overlay");
    modal.classList.add("hidden");
    overlay.classList.add("hidden");
    location.reload();
}

function infoClick() {
    $("#book-description").html(bookArray[bookCount].volumeInfo.description);
    $("#book-card").hide();
    $("#img-open-book").show();
    $("#book-card-open").css("display", "flex");
    $("#like-button").hide();
    $("#dislike-button").hide();
}

function closeBook() {
    $("#img-open-book").hide();
    $("#book-card-open").css("display", "none");
    $("#book-card").show();
    $("#like-button").show();
    $("#dislike-button").show();
}
