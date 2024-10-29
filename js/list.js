document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.querySelector('#data-list tbody');
    const searchInput = document.querySelector('#search');
    const modal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-form');
    const saveButton = document.getElementById('save-btn');
    const cancelButton = document.getElementById('cancel-btn');
    window.allData = [

    ];
    let currentEditingRow = null;

    // Fetch data from the server
    async function fetchData() {
        try {
            const response = await fetch('http://localhost:5000/data');
            const data = await response.json();
            allData = data; // Store the fetched data
            renderTable(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    // Render the table with given data
    function renderTable(data) {
        tableBody.innerHTML = ''; // Clear existing rows
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.sub_family}</td>
                <td>${item.brand}</td>
                <td>${item.model}</td>
                <td>${item.code_onee}</td>
                <td>${item.serial_number}</td>
                <td>${item.m_a}</td>
                <td>${item.name_function}</td>
                <td>${item.entity}</td>
                <td>${item.remarks}</td>
                <td>
                    <a href="#" class="edit-row" data-id="${item._id}" title="Modify"><i class="fas fa-edit"></i></a>
                    <a href="#" class="delete-row" data-id="${item._id}" title="Delete"><i class="fas fa-trash-alt"></i></a>
                </td>
            `;
            tableBody.appendChild(row);
        });

        document.querySelectorAll('.edit-row').forEach(button => {
            button.addEventListener('click', handleModify);
        });

        document.querySelectorAll('.delete-row').forEach(button => {
            button.addEventListener('click', handleDelete);
        });
    }

    // Handle Modify button click to open the modal
    function handleModify(event) {
        event.preventDefault();
        currentEditingRow = event.target.closest('tr'); // Store the current row being edited
        const id = event.target.getAttribute('data-id'); // Get the MongoDB _id

        // Clear the form and populate with current row data
        editForm.innerHTML = '';
        currentEditingRow.querySelectorAll('td:not(:first-child):not(:last-child)').forEach((cell, index) => {
            const label = document.querySelectorAll('th')[index + 1].innerText; // Adjust index to match the correct header
            const input = document.createElement('input');
            input.type = 'text';
            input.name = label.replace(/ & /g, '').toLowerCase().split(' ').join('_');
            if (input.name !== 'remarque') input.required = true;
            input.value = cell.innerText;

            // Wrap label and input in a div
            const wrapper = document.createElement('div');
            wrapper.appendChild(document.createTextNode(`${label}: `));
            wrapper.appendChild(input);
            editForm.appendChild(wrapper);
        });

        modal.style.display = 'block'; // Show the modal
    }

    // Handle Save button click
    saveButton.addEventListener('click', function (event) {
        event.preventDefault();

        // Trigger form validation
        if (editForm.checkValidity()) {
            const updatedData = {};
            new FormData(editForm).forEach((value, key) => {
                updatedData[key] = value;
            });

            const id = currentEditingRow.querySelector('.edit-row').getAttribute('data-id');

            // Mapping French keys to English keys
            const mappedData = {
                id: updatedData['id'],
                sub_family: updatedData['sous_famille'],
                brand: updatedData['marque'],
                model: updatedData['modèle'],
                code_onee: updatedData['code_onee'],
                serial_number: updatedData['n/s'],
                name_function: updatedData['nomprénom'],
                remarks: updatedData['remarque'],
                entity: updatedData['entité'],
                m_a: updatedData['matricule_affectataire'],
            };

            // Send the updated data to the server
            fetch(`http://localhost:5000/data/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(mappedData),
            })
                .then(response => {
                    if (response.ok) {
                        // Update the table row with the new data
                        currentEditingRow.querySelectorAll('td:not(:last-child)').forEach((cell, index) => {
                            const thKey = document.querySelectorAll('th')[index].getAttribute('data-key');
                            const mappedKey = Object.keys(mappedData)[index];
                            if (mappedKey) {
                                cell.innerText = mappedData[mappedKey] || cell.innerText;
                            }
                        });

                        modal.style.display = 'none'; // Hide the modal
                        location.reload();
                    } else {
                        console.error('Failed to update data on the server');
                    }
                })
                .catch(error => {
                    console.error('Error updating data:', error);
                });
        } else {
            editForm.reportValidity(); // This will show validation errors
        }
    });


    // Handle Cancel button click
    cancelButton.addEventListener('click', function () {
        modal.style.display = 'none'; // Hide the modal
    });

    // Handle Delete button click
    async function handleDelete(event) {
        event.preventDefault();
        const id = event.target.closest('.delete-row').getAttribute('data-id');

        try {
            const response = await fetch(`http://localhost:5000/data/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                const deletedIndex = allData.findIndex(item => item._id === id);
                if (deletedIndex !== -1) {
                    // Remove the deleted item from the array
                    allData.splice(deletedIndex, 1);

                    // Decrement IDs for all subsequent rows
                    for (let i = deletedIndex; i < allData.length; i++) {
                        allData[i].id -= 1;
                    }

                    // Send the updated IDs to the server
                    for (let i = deletedIndex; i < allData.length; i++) {
                        await fetch(`http://localhost:5000/data/${allData[i]._id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ id: allData[i].id }),
                        });
                    }

                    // Re-render the table with updated data
                    renderTable(allData);
                }
            } else {
                console.error('Failed to delete item');
            }
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    }

    // Add event listener to the search input
    searchInput.addEventListener('input', filterData);

    // Filter data based on search input
    const excludedFields = ['_id', '__v'];

    function filterData() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredData = allData.filter(item => {
            return Object.keys(item).some(key => {
                // Skip excluded fields
                if (excludedFields.includes(key)) return false;
                return item[key].toString().toLowerCase().includes(searchTerm);
            });
        });
        renderTable(filteredData);
    }

    // Fetch and render data on page load
    fetchData();
});
