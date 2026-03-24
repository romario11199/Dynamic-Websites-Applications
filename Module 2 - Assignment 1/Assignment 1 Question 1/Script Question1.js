let employeesData = [];

function addToLog(message) {
    const logDisplay = document.getElementById('logDisplay');
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.textContent = `> ${message}`;
    logDisplay.appendChild(logEntry);
    logDisplay.scrollTop = logDisplay.scrollHeight;
}

function clearLog() {
    const logDisplay = document.getElementById('logDisplay');
    logDisplay.innerHTML = '<div class="log-entry">Waiting for operations...</div>';
}

async function fetchEmployees() {
    try {
        addToLog('Fetching employee data from Employees Question1.json...');
        
        const response = await fetch('Employees Question1.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        employeesData = data.employees;
        
        addToLog(`Successfully fetched ${employeesData.length} employees`);
        
        performArrayOperations(employeesData);
        
        displaySortedEmployees(employeesData);
        
    } catch (error) {
        addToLog(`Error fetching data: ${error.message}`);
        console.error('Error fetching employees:', error);
        
        document.getElementById('demo').innerHTML = 
            `<div style="color: red; padding: 10px; background: #ffeeee; border-radius: 4px;">
                Error loading employees: ${error.message}
            </div>`;
    }
}

function performArrayOperations(employees) {
    addToLog('Performing array operations...');
    
    const fullNames = employees.map(({ firstName, lastName }) => `${firstName} ${lastName}`);
    addToLog('Full Names (map with destructuring):');
    fullNames.forEach(name => addToLog(`   - ${name}`));
    console.log('Full Names:', fullNames);

    const totalSalary = employees.reduce((acc, { salary }) => acc + salary, 0);
    addToLog(`Total Salary (reduce): $${totalSalary.toLocaleString()}`);
    
    document.getElementById('totalSalary').textContent = 
        `Total Salary: $${totalSalary.toLocaleString()}`;
    
    console.log('Total Salary:', totalSalary);

    const highEarners = employees.filter(({ salary }) => salary > 55000);
    addToLog('High Earners (>$55,000) (filter):');
    highEarners.forEach(({ firstName, lastName, salary }) => 
        addToLog(`   - ${firstName} ${lastName}: $${salary.toLocaleString()}`)
    );
    console.log('High Earners (>$55,000):', highEarners);

    const sortedByAge = [...employees].sort((a, b) => a.age - b.age);
    addToLog('Employees sorted by age (ascending):');
    sortedByAge.forEach(({ firstName, lastName, age }) => 
        addToLog(`   - ${firstName} ${lastName}: ${age} years old`)
    );
    console.log('Sorted by Age:', sortedByAge);

    return sortedByAge;
}

function displaySortedEmployees(employees) {
    const sortedEmployees = [...employees].sort((a, b) => a.age - b.age);
    
    const demoDiv = document.getElementById('demo');

    if (sortedEmployees.length === 0) {
        demoDiv.innerHTML = '<h3>Employee Roster (Sorted by Age)</h3><p>No employees found.</p>';
        return;
    }
    
    const ul = document.createElement('ul');
    ul.className = 'employee-list';
    
    sortedEmployees.forEach(({ firstName, lastName, age, department, salary }) => {
        const li = document.createElement('li');
        li.className = 'employee-item';
        li.innerHTML = `
            <div>
                <span class="employee-info">${firstName} ${lastName}</span>
                <span class="employee-dept"> (${department})</span>
            </div>
            <div>
                <span class="employee-info">Age: ${age}</span> | 
                <span class="employee-salary">$${salary.toLocaleString()}</span>
            </div>
        `;
        ul.appendChild(li);
    });
    
    demoDiv.innerHTML = '<h3>Employee Roster (Sorted by Age)</h3>';
    demoDiv.appendChild(ul);
}

function saveToLocalStorage() {
    try {
        const sortedEmployees = [...employeesData].sort((a, b) => a.age - b.age);
        
        const employeesJSON = JSON.stringify(sortedEmployees);
        localStorage.setItem('sortedEmployees', employeesJSON);
        
        addToLog('Saved sorted employees to localStorage');
        alert('Data saved to localStorage successfully!');
    } catch (error) {
        addToLog(`Error saving to localStorage: ${error.message}`);
        alert('Error saving to localStorage');
    }
}

function getFromLocalStorage() {
    try {
        const storedData = localStorage.getItem('sortedEmployees');
        
        if (storedData) {
            const employees = JSON.parse(storedData);
            employeesData = employees;
            addToLog(`Retrieved from localStorage: ${employees.length} employees`);
            
            displaySortedEmployees(employeesData);
            
            employees.forEach(({ firstName, lastName, age, salary }) => {
                addToLog(`   - ${firstName} ${lastName}: Age ${age}, $${salary}`);
            });
            
            alert('Data retrieved from localStorage successfully!');
        } else {
            addToLog('No data found in localStorage');
            alert('No data found in localStorage');
        }
    } catch (error) {
        addToLog(`Error reading from localStorage: ${error.message}`);
        alert('Error reading from localStorage');
    }
}

function removeFromLocalStorage() {
    try {
        localStorage.removeItem('sortedEmployees');
        addToLog('Removed employees data from localStorage');
        alert('Data removed from localStorage successfully!');
    } catch (error) {
        addToLog(`Error removing from localStorage: ${error.message}`);
        alert('Error removing from localStorage');
    }
}

function clearLocalStorage() {
    try {
        localStorage.clear();
        addToLog('Cleared all localStorage data');
        alert('All localStorage data cleared successfully!');
    } catch (error) {
        addToLog(`Error clearing localStorage: ${error.message}`);
        alert('Error clearing localStorage');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    clearLog();
    fetchEmployees();
});