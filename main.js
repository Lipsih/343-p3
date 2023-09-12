const searchView = document.getElementById("search-view");
const characterView = document.getElementById("character-view");

const searchField = document.getElementById("search-field");
const nextPageBtn = document.getElementById("next-page");
const prevPageBtn = document.getElementById("prev-page");
const pageCount = document.getElementById("page-num");
const characterList = document.getElementById("character-list");

const closeCharacterBtn = document.getElementById("close-character");
const characterImage = document.getElementById("character-img");
const characterFacts = document.getElementById("character-facts");

const swAPI = 'https://swapi.dev/api/people/';
const imgAPI = 'https://starwars-visualguide.com/assets/img/characters/';

const characterCache = [];
let pageNumber = 1;
let selectedCharacterId = 1;

searchField.addEventListener("input", function() {
    const searchValue = searchField.value;
    if (searchValue === undefined || searchValue.length === 0) {
        setPage(pageNumber);
    } else {
        displayCharacters(characterCache.filter(c => c.name.toLowerCase().includes(searchValue.toLowerCase())).splice(0, 10));
    }
});

nextPageBtn.addEventListener("click", function() {
    setPage(pageNumber + 1);
  });
  
  prevPageBtn.addEventListener("click", function() {
    setPage(pageNumber - 1);
  });

  closeCharacterBtn.addEventListener("click", function() {
    closeCharacter();
  });
  
  function getImage(num, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', `https://starwars-visualguide.com/assets/img/characters/${num}.jpg`, true);
    xhr.responseType = 'blob';

    xhr.onload = function(e) {
        if (this.status == 200) {
            // Create a new <img> element and set its source to the downloaded image
            var imageUrl = URL.createObjectURL(this.response);
            callback(imageUrl);
        } else {
            var imageUrl = "404"
            callback(imageUrl);
        }
    };

    xhr.send();
    }

  function getCharacters(startPage, getAll) {
    return new Promise((res, rej) => {
        let dataList = [];
        function getPage(pageNumber) {
            const xhr = new XMLHttpRequest();
      
            xhr.onreadystatechange = function() {
              if (this.readyState === 4 && this.status === 200) {
                const data = JSON.parse(this.responseText);
                dataList.push(...data.results);
      
                if (data.next && getAll) {
                  const nextPageNumber = pageNumber + 1;
                  getPage(nextPageNumber);
                } else {
                    res(dataList);
                }
              } 
            };
      
            const url = `${swAPI}?page=${pageNumber}`;
            xhr.open("GET", url);
            xhr.send();
          }
          getPage(startPage);
    });
}

function displayCharacters(characters) {
    characterList.innerHTML = "";
    characters.forEach(c => {
        const row = document.createElement("tr");
        const nameField = document.createElement("td");
        nameField.innerText = c.name;
        const genderField = document.createElement("td");
        genderField.innerText = c.gender;
        genderField.classList.add("hide-on-mobile");
        const bornField = document.createElement("td");
        bornField.innerText = c.birth_year;
        bornField.classList.add("hide-on-mobile");
        row.appendChild(nameField);
        row.appendChild(genderField);
        row.appendChild(bornField);

        row.addEventListener("click", function() {
            viewCharacter(c);
        });
        

        characterList.appendChild(row);
    });
}

function setPage(pageNum) {
    if (pageNum < 1 || pageNum > 9) {
        pageNumber = 1;
        pageCount.innerText = pageNumber;
        prevPageBtn.disabled = true;
        displayCharacters(getCharactersAtPage(1));
        return;
    }

    pageNumber = pageNum;
    displayCharacters(getCharactersAtPage(pageNumber));

    if (getCharactersAtPage(pageNumber + 1).length == 0) {
        nextPageBtn.disabled = true;
    } else if (getCharactersAtPage(pageNumber - 1) == 0) {
        prevPageBtn.disabled = true;
    } else {
        nextPageBtn.disabled = false;
        prevPageBtn.disabled = false;
    }
    pageCount.innerText = pageNumber;
}

function getCharactersAtPage(p) {
    let startIndex = (p - 1) * 10;
    let endIndex = startIndex + 10;

    if (startIndex > characterCache.length)
        return [];
    if (endIndex > characterCache.length) {
        endIndex = characterCache.length;
    }
    return characterCache.slice(startIndex, endIndex);
}

function viewCharacter(c) {
    characterView.classList.remove("hidden");
    searchView.classList.add("hidden");
    let imageNum = characterCache.indexOf(c) + 1
    if(imageNum < 17) {
        getImage(imageNum, function(imageUrl) {
            characterImage.setAttribute("src", imageUrl);
        });
    } else {
        getImage(imageNum + 1, function(imageUrl) {
            characterImage.setAttribute("src", imageUrl);
        });
    }
    
    for (var key in c) {
        if (c.hasOwnProperty(key)) {
            var listItem = document.createElement("li");
            listItem.innerHTML = "<strong>" + key + ":</strong> " + c[key];
            characterFacts.appendChild(listItem);
        }
    }
}

function closeCharacter() {
    searchView.classList.remove("hidden");
    characterView.classList.add("hidden");
    characterImage.setAttribute("src", "");
    characterFacts.innerHTML = "";
}
getCharacters(1, true).then(d => {
    characterCache.push(...d);
    setPage(pageNumber);
});
