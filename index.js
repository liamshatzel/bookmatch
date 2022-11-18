
let bookIndex = -1;
let startIndex = 0;
let APIKey = "AIzaSyDctVfRehy9hBTh9BkAlZ8k4R66Nj7kJSE";
function buttonClick() {
    getRequest(startIndex);
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

function getRequest(startIndex) {
    //ajax GET request
    let subject = $("#subject").val();
    let author = $("#author").val();
    let title = $("#title").val();

    let subjectQ1 = (subject ? "+subject:" + subject : "");
    let authorQ1 = (author ? "+inauthor:" + author : "");
    let titleQ1 = (title ? "+intitle:" + title : "");

    let url = "https://www.googleapis.com/books/v1/volumes?q=" + subjectQ1 + authorQ1 + titleQ1 + "&startIndex=" + startIndex + "&maxResults=40&printType=books&projection=full&key=" + APIKey;
    $.get(url, function (data) {
        console.log(data);
        if (data["totalItems"] == 0) {
            console.log("no items found");
        } else {
            const items = data["items"];
            getMoreBooks(subject, author, title, items);
            if (bookIndex < items.length) {
                bookIndex++;
            } else {
                startIndex += bookIndex;
                console.log("out of books");
                console.log(startIndex);
            }
        }
    });

}

async function getMoreBooks(subject, author, title, books) {

    let titleURL = "https://www.googleapis.com/books/v1/volumes?q=" + "intitle:" + title + "&startIndex=" + startIndex + "&maxResults=40&printType=books&projection=full&key=" + APIKey;
    const arr1 = await queryWrapper(titleURL);

    let authorURL = "https://www.googleapis.com/books/v1/volumes?q=" + "inauthor:" + author + "&startIndex=" + startIndex + "&maxResults=40&printType=books&projection=full&key=" + APIKey;
    const arr2 = await queryWrapper(authorURL);

    let subjectURL = "https://www.googleapis.com/books/v1/volumes?q=" + "subject:" + subject + "&startIndex=" + startIndex + "&maxResults=40&printType=books&projection=full&key=" + APIKey;
    const arr3 = await queryWrapper(subjectURL);

    let arr1Shuf = shuffle(arr1.items);
    let arr2Shuf = shuffle(arr2.items);
    let arr3Shuf = shuffle(arr3.items);
    let bigBooks = books.concat(arr1Shuf).concat(arr2Shuf).concat(arr3Shuf);

    for (let i = 0; i < bigBooks.length; i++) {
        outputBook(bigBooks[i]);
    }
}

async function queryWrapper(url) {
    const result = await fetch(url, {
        method: 'GET',
    }).then(
        response => {
            if (response) {
                console.log("something");
                //console.log(response.json());
                return response.json();
            }
        },
        rejection => {
            console.error(rejection.message);
        }
    );
    console.log("Hello World");
    return result;
}

function outputBook(book) {
    let imgLoc = book["volumeInfo"]["imageLinks"];
    var img = null;
    try {
        console.log("got here");
        img = imgLoc.thumbnail;
        $("#img-holder").append("<img src=" + img + ">")
        bookIndex++;
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