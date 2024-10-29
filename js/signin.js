document.getElementById('signin-form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    // Send the data to the server
    const response = await fetch('http://localhost:5000/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    // Handle the server response
    const data = await response.json();

    if (response.ok) {
      // If sign-in is successful, store the token and redirect to home.html
      localStorage.setItem('token', data.token);
      window.location.href = '..\\pages\\submit.html';
    } else {
      // Display an error message if sign-in fails
      document.getElementById('error-message').textContent = data.message;
    }
  } catch (error) {
    // Display an error message if there is a problem connecting to the server
    document.getElementById('error-message').textContent = 'Error: Unable to connect to the server';
    console.error('Error:', error);
  }
});
