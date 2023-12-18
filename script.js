
// ----------------------INITIALIAZTION CURRENT DATE-------------------------
const actualDate = new Date()
let y = actualDate.getFullYear()
let m = actualDate.getMonth()
let d = actualDate.getDate()

let currentDate = new Date( y , m, d)
let yearText = currentDate.getFullYear()
let monthText = currentDate.toLocaleString('sk-SK', {month: 'long'})

let REGISTER = []
// --------------START FUNCTION-------------------
update()

async function update() {
    REGISTER = await fetchSheduled()
    const daysData = createDaysData(currentDate)
    const calendar = createCalendarPageView(daysData)
    createTable(calendar)
}


function createDaysData(currentDate) {
    const numberOfDaysInCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1 , 0).getDate()
    const days = []
    
    for (let i = 1; i < numberOfDaysInCurrentMonth + 1; i++) {
        days.push(createCell(currentDate, i))
    }
    return days
}

// -----------------------------CREATE OBJECT FOR DAY -------------------------------------------
function createCell(currentDate, dayDate) {
    currentDate.setDate(dayDate)
        return day = {
            year: currentDate.getFullYear(), 
            month: currentDate.getMonth() + 1,
            dayInWeek: (currentDate.getDay() + 6) % 7,
            date: currentDate.getDate(),
            people: getPeople(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
            vissible: true
        }
}

function getPeople(year, month, date ) { 
    const comparedDate = new Date(year, month, date)

    return REGISTER.filter(person => {
        const personFullDate = person.date.split('-');
        const parsedYear = parseInt(personFullDate[0]);
        const parseMonth = parseInt(personFullDate[1]) - 1
        const parsedDate = parseInt(personFullDate[2])
        const personDate = new Date(parsedYear, parseMonth, parsedDate);
        
      return personDate.getTime() === comparedDate.getTime()
    })
  }
  
function createCalendarPageView(daysData) {
    const daysTotal = daysData.length - 1
    const weeksTotal = Math.ceil((daysTotal + 1) / 7)
    const weekCells = []
    let daysInWeekCells= []
    let index = 0
    
    for (let week = 0; week < weeksTotal; week++) {
      daysInWeekCells = []
      for (let day = 0; day < 7; day++) {
        if(day === daysData[index]?.dayInWeek) {
          daysInWeekCells.push(daysData[index]);
          index++
        } else {
          daysInWeekCells.push(createEmptyCell());
        }
      }
      weekCells.push(daysInWeekCells)
    }
    return weekCells
  }

  function createEmptyCell() {
    return {
      year: 0, 
      month: 0,
      dayInWeek: 0,
      date: 0,
      people: [],
      vissible: false
    }
  }

// ----------------------------------------- TABLE BUILD FUNCTIONS -------------------------------------------
function createTable(calendar){
    const div = document.querySelector('#left-container')
    const table = document.createElement('table')
    table.appendChild(createTableNavBar())
    table.appendChild(createTableDaysHeader())
    createCalendarCells(calendar).forEach(tr => table.appendChild(tr))
    div.appendChild(table)
}

function createTableNavBar() {
    const tr = document.createElement('tr')

    let th = document.createElement('th')
    th.setAttribute('colspan','2')
    th.innerHTML = '<div onclick="changeMonth(-1)" class="arrow">&larr;</div>'
    tr.appendChild(th)

    th = document.createElement('th')
    th.setAttribute('colspan','3')
    th.setAttribute('class','nav-bar-year')
    th.textContent = `${monthText.toUpperCase()} ${yearText}`
    tr.appendChild(th)

    th = document.createElement('th')
    th.setAttribute('colspan','3')
    th.innerHTML = '<div onclick="changeMonth(1)" class="arrow">&rarr;</div>'
    tr.appendChild(th)
    return tr
}

function createTableDaysHeader() {
    const days = ["PO", "UT", "ST", "ŠT", "PI", "SO", "NE"]
    const tr = document.createElement('tr')
    days.forEach(day => {
        th = document.createElement('th')
        th.textContent = day
        tr.appendChild(th)
    })
    return tr
}

// --------------------------------CELL BUILD FUNCTIONS--------------------------------------------------------
function createCalendarCells(calendar) {
    const cells = []

    for(let week of calendar) {
        const tr = document.createElement('tr')

        for(let day of week) {
            const people = createDayPeopleList(day.people)
            const td = document.createElement('td')

            if(day.vissible) {
                const divCell = document.createElement('div')
                divCell.setAttribute('class', 'cell')

                const div = document.createElement('div')
                div.setAttribute('class', 'cell-date')
                div.textContent = day.date
                divCell.appendChild(div)

                divCell.appendChild(people)
                td.appendChild(divCell)
            }
            tr.appendChild(td)
        }
        cells.push(tr)
    } 
    return cells
}

function createDayPeopleList(people) {
    const sortedPeopleByTime = people.sort((a, b) => {
        if(a.time < b.time) return -1;
        if(a.time > b.time) return 1;
        return 0;
    })

    const ul = document.createElement('ul')
    ul.setAttribute('class', 'cell-list')

    sortedPeopleByTime.forEach(person => {
        const li = document.createElement('li')
        li.classList.add('unselected')
        li.addEventListener('click',(e) => {
            getSheduledPersonData(person)
            unselectPerson();
            const parent = e.target.closest('li')
            parent.classList.replace('unselected', 'selected');
            console.log(parent)
        })
        let div = document.createElement('div')
        div.textContent = person?.time
        li.appendChild(div)

        div = document.createElement('div')
        div.textContent = person?.name
        li.appendChild(div)
        ul.appendChild(li)
    })
    return ul
}

// --------------------------------MONTH CHANGE FUNCTIONS--------------------------------------------------------
function changeMonth(num) {
    const table = document.querySelector('table').remove()
    m += num
    currentDate = new Date( y , m, d)
    yearText = currentDate.getFullYear()
    monthText = currentDate.toLocaleString('sk-SK', {month: 'long'})
    update()
}

// -------------------------- SERVICES FUNCTIONS ----------------------------------------------------------------
document.querySelector('#register-form').addEventListener('submit', formSubmit)
document.querySelector('#delete-form').addEventListener('submit',  deleteFormSubmit)
document.querySelector('#cancel').addEventListener('click', (e) => {
    e.preventDefault()
    unselectPerson()
    clearFormular()
})

async function formSubmit(e) {
    e.preventDefault()
    const values = []
    const inputs = document.querySelector('#register-form').querySelectorAll('input[type="text"], input[type="date"], input[type="time"], textarea, input[type="hidden"]')

    inputs.forEach(input => values.push(input.value))
    const body = {
        name: values[0], 
        date: values[1], 
        time: values[2], 
        note: values[3],
        id: values[4],
    }
    
    try {
        const response = await fetch('register_handle.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
            })
        const data = await response.json()
        showMessage(data.message, inputs)
    } catch (err) {
        console.error(err)
    }
}

async function deleteFormSubmit(e) {
    e.preventDefault()

    const id = document.querySelector('#delete-id')
    const name = document.querySelector('#delete-name')
    const date = document.querySelector('#delete-datum')
    const time = document.querySelector('#delete-cas')
    const button = document.querySelector('#delete-button')

    const body = {
        id: id.value,
        name: name.value, 
        date: date.value, 
        time: time.value, 
        button: button.value
    }
    try {
        const response = await fetch('register_handle.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
            })
        const data = await response.json()
        showMessage(data.message)
    } catch (err) {
        console.error(err)
    }
}


function showMessage(message) {
    const div = document.querySelector('#message')
    div.innerText = message
    div.style.color = message === "Rezervácia vytvorená" || message === "Rezervácia zmenená" ? 'green' : 'red'
    div.style.display = 'block';
    if(message === "Rezervácia vytvorená" || message === "Rezervácia vymazaná" || message === "Rezervácia zmenená") {
        clearFormular();
        clearTable()
        update()
    }
    setTimeout(() => div.style.display = 'none', 3000)
}

async function fetchSheduled() {
    try {
        const response = await fetch('register.json')
        const register = await response.json()
        return register
    } catch (err) {
        console.error(err)
    }
}

function clearTable() {
    document.querySelector('#left-container').querySelector('table').remove()
 }

function unselectPerson() {
    document.querySelectorAll('.selected').forEach(li => li.classList.replace('selected','unselected'))
} 

function getSheduledPersonData(person) {
    document.querySelectorAll('.name').forEach(input => input.value = person.name)
    document.querySelectorAll('.datum').forEach(input => input.value = person.date)
    document.querySelectorAll('.cas').forEach(input => input.value = person.time)
    document.querySelector('#poznamka').value = person.note
    document.querySelectorAll('.id').forEach(input => input.value = person.id)
    document.querySelector('#submit').value = "Zmena rezervácie"
    document.querySelector('#actions').innerText = "Zmena rezervácie"
 }

 function clearFormular() {
    document.querySelectorAll('.name').forEach(input => input.value = '')
    document.querySelectorAll('.datum').forEach(input => input.value = '')
    document.querySelectorAll('.cas').forEach(input => input.value = '')
    document.querySelector('#poznamka').value = ''
    document.querySelectorAll('.id').forEach(input => input.value = '')
    document.querySelector('#submit').value = "Potvrdenie rezervácie"
    document.querySelector('#actions').innerText = "Vytvorenie rezervácie"
 }
