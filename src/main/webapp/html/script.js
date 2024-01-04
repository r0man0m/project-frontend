


let accountsCount = null;
let accountsPerPage = 3;
let accountsAmount = null;
let currentPageNumber = 0;
let beforePageNumber = 0;

const RACE_ARRAY = ['HUMAN', 'DWARF', 'ELF', 'GIANT', 'ORC', 'TROLL', 'HOBBIT'];
const PROFESSION_ARRAY = ['WARRIOR', 'ROGUE', 'SORCERER', 'CLERIC', 'PALADIN', 'NAZGUL', 'WARLOCK', 'DRUID'];
const BANNED_ARRAY = ['true', 'false'];

initCreateForm();
createDropDown();
fillTable(currentPageNumber,accountsPerPage);
updateCount();

function initCreateForm() {
  const $raceSelect = document.querySelector(`[data-create-select]`);
  const $professionSelect = document.querySelector(`[data-create-profession]`);

  $raceSelect.insertAdjacentHTML("afterbegin", createSelectOptions(RACE_ARRAY, RACE_ARRAY[0]));
  $professionSelect.insertAdjacentHTML("afterbegin", createSelectOptions(PROFESSION_ARRAY, PROFESSION_ARRAY[0]));
}

function fillTable(pageNumber, pageSize) {
  $.get(`http://localhost:8080/rest/players?pageNumber=${pageNumber}&pageSize=${pageSize}`, (players) =>{

    const $tableBody = $('.table-body')[0];
    let htmlRows = '';

      players.forEach(player =>{
        htmlRows += `
            <tr class="row" data-account-id = "${player.id}">
              <td class="cell">${player.id}</td>
              <td class="cell" data-account-name>${player.name}</td>
              <td class="cell" data-account-title>${player.title}</td>
              <td class="cell" data-account-race>${player.race}</td>
              <td class="cell" data-account-profession>${player.profession}</td>
              <td class="cell" data-account-level>${player.level}</td>
              <td class="cell" data-account-birthday>${new Date(player.birthday).toLocaleDateString('uk')}</td>
              <td class="cell" data-account-banned>${player.banned}</td>
              <td class="cell cell-auto">
                <button class="edit-button" value="${player.id}"><img class="etit-image" src="../img/edit.png" alt="edit"></button>
              </td>
              <td class="cell cell-auto">
                <button class="delete-button" value="${player.id}" data-button-id = "${player.id}"><img class="delete-image" src="../img/delete.png" alt="delete"></button>
              </td>
            </tr>
        `
      })
    Array.from($tableBody.children).forEach(row => row.remove());
    $tableBody.insertAdjacentHTML("beforeend", htmlRows);

    const deleteButtons = document.querySelectorAll('.delete-button');
    deleteButtons.forEach(button => button.addEventListener('click', removeAccount));

    const editButtons = document.querySelectorAll('.edit-button');
    editButtons.forEach(button => button.addEventListener('click', editAccountHandler));
  })

}
function updateCount() {
  $.get('/rest/players/count', (count)=>{
    accountsCount = count;
    updatePaginationButtons();
  })
}

function updatePaginationButtons() {
  accountsAmount = accountsCount ? Math.ceil(accountsCount / accountsPerPage): 0;
  const $buttonsContainer = $('.pagination-buttons')[0];
  const childButtonsLength = $buttonsContainer.children.length;
  let buttonsHTML = ``;
    for (let i = 1; i <= accountsAmount; i++) {
      buttonsHTML += `
        <button value="${i - 1}">${i}</button>
      `
    }
    if(childButtonsLength !== 0) {
      Array.from($buttonsContainer.children).forEach(node => node.remove());
    }
  $buttonsContainer.insertAdjacentHTML("beforeend", buttonsHTML);
    Array.from($buttonsContainer.children).forEach(button => button.addEventListener('click', onPageChange));
    setButtonActive(currentPageNumber);
}

function createDropDown() {
  const $dropDownSelector = document.querySelector('.accounts-per-page-class');
  const selectOptions = createSelectOptions([3,5,10,20], 3);
  $dropDownSelector.addEventListener('change', onAccountsHandler);
  $dropDownSelector.insertAdjacentHTML("afterbegin", selectOptions);
}


function onAccountsHandler(e) {
  accountsPerPage = e.currentTarget.value;
  fillTable(currentPageNumber,accountsPerPage);
  updatePaginationButtons();
}

function onPageChange(e) {
  beforePageNumber = currentPageNumber;
  currentPageNumber = e.currentTarget.value;
  fillTable(currentPageNumber, accountsPerPage);
  console.log('onPageChange')
  resetActiveButton(beforePageNumber);
  setButtonActive(currentPageNumber);
}
function setButtonActive(activePageButtonIndex = 0) {
  const $buttonsContainer = document.querySelector('.pagination-buttons');
  const $targetButton = Array.from($buttonsContainer.children)[activePageButtonIndex];
  console.log("Set")
  $targetButton.classList.add("active-pagination-button");
}
function resetActiveButton(beforePageNumber) {
  const $buttonsContainer = document.querySelector('.pagination-buttons');
  const $targetButton = Array.from($buttonsContainer.children)[beforePageNumber];
  console.log('remove class')
  $targetButton.classList.remove("active-pagination-button");
}

function createAccount() {
  const data = {
    name: $(`[data-create-name]`).val(),
    title: $(`[data-create-title]`).val(),
    race: $(`[data-create-select]`).val(),
    profession: $(`[data-create-profession]`).val(),
    level: $(`[data-create-level]`).val(),
    birthday: new Date($(`[data-create-birthday]`).val()).getTime(),
    banned: $(`[data-create-banned]`).val() === `on`,
  }

  $.ajax({
    url: `rest/players/`,
    type: 'POST',
    data: JSON.stringify(data),
    dataType: "json",
    contentType: "application/json",
    success: function () {
      updateCount();
      fillTable(currentPageNumber, accountsPerPage);
    }
  })

}
function removeAccount(e) {
  const accountId = e.currentTarget.value;
  $.ajax({
    url: `/rest/players/${accountId}`,
    type: 'DELETE',
    success: function () {
      updateCount();
      fillTable(currentPageNumber, accountsPerPage);
    }
  });
  console.log('Delete ' + accountId);
}

function updateAccount({accountId, data}) {
  $.ajax({
    url: `rest/players/${accountId}`,
    type: 'POST',
    data: JSON.stringify(data),
    dataType: "json",
    contentType: "application/json",
    success: function () {
      updateCount();
      fillTable(currentPageNumber, accountsPerPage);
    }
  })
}
function editAccountHandler(e) {
  const accountId = e.currentTarget.value;
  const $currentRow = document.querySelector(`.row[data-account-id ='${accountId}']`);
  const $currentRemoveButton = document.querySelector(`.delete-button[data-button-id = '${accountId}']`);
  const $currentImage = $currentRow.querySelector('.edit-button img');

  
  const $currentName = $currentRow.querySelector(`[data-account-name]`);
  const $currentTitle = $currentRow.querySelector('[data-account-title]');
  const $currentRace = $currentRow.querySelector('[data-account-race]');
  const $currentProfession = $currentRow.querySelector('[data-account-profession]');
  const $currentBanned = $currentRow.querySelector('[data-account-banned]');

  $currentImage.src = "../img/save.png";
  $currentImage.addEventListener('click', ()=>{
    const params = {
      accountId: accountId,
      data: {
        name: $currentName.childNodes[0].getAttribute('data-value'),
        title: $currentTitle.childNodes[0].getAttribute('data-value'),
        race: $currentRace.childNodes[0].getAttribute('data-value'),
        profession: $currentProfession.childNodes[0].getAttribute('data-value'),
        banned: $currentBanned.childNodes[0].getAttribute('data-value')
      }
    }
    updateAccount(params);

  })
  $currentRemoveButton.classList.add('hidden');


  $currentName.childNodes[0].replaceWith(createInput($currentName.innerHTML));
  $currentTitle.childNodes[0].replaceWith(createInput($currentTitle.innerHTML));
  $currentRace.childNodes[0].replaceWith(createSelect(RACE_ARRAY, $currentRace.innerHTML));
  $currentProfession.childNodes[0].replaceWith(createSelect(PROFESSION_ARRAY, $currentProfession.innerHTML));
  $currentBanned.childNodes[0].replaceWith(createSelect(BANNED_ARRAY, $currentBanned.innerHTML));
}
function createInput(value) {
  const $htmlInputElement = document.createElement('input');
  $htmlInputElement.setAttribute('type', `text`);
  $htmlInputElement.setAttribute('value', value);
  $htmlInputElement.setAttribute('data-value', value);

  $htmlInputElement.addEventListener('input', e =>{
    $htmlInputElement.setAttribute('data-value', `${e.currentTarget.value}`)
  })
  return $htmlInputElement
}
function createSelectOptions(optionArray, defaultValue) {
  let optionHTML = ``;
  optionArray.forEach(option=>{
    optionHTML += `
      <option ${defaultValue === option && 'selected'} value="${option}">${option}</option>`

    console.log("Create option");
  })
  return optionHTML;
}
function createSelect(optionsArray, defaultValue) {
    const $options = createSelectOptions(optionsArray, defaultValue);
    const $selectElement = document.createElement('select');
    $selectElement.insertAdjacentHTML("afterbegin", $options);
    $selectElement.setAttribute('data-value', defaultValue);
    $selectElement.addEventListener('change', e =>{
        $selectElement.setAttribute('data-value', e.currentTarget.value)
    });
  return $selectElement;
}

