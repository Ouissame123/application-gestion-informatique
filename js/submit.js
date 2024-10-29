document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('#electronForm');

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const formData = new FormData(form);
        const data = {};

        // Populate data object from form inputs
        formData.forEach((value, key) => {
            data[key] = value;
        });

        try {
            // Fetch the last inserted ID from the server
            const idResponse = await fetch('http://localhost:5000/last-id');
            const lastIdData = await idResponse.json();

            // Generate the new ID
            const newId = lastIdData.lastId + 1;
            data.id = newId; // Add the new ID to the data object

            console.log('Sending data with new ID:', data); // Log the data to be sent

            // Send the data to the server
            const response = await fetch('http://localhost:5000/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                notification.textContent = 'Data submitted successfully with ID: ' + newId;
                notification.style.display = 'block';
                setTimeout(() => {
                    notification.style.display = 'none';
                }, 5000);

                form.reset();
            } else {
                const errorMessage = await response.text();
                alert('Error submitting data: ' + errorMessage);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error submitting data.');
        }
    });
});
